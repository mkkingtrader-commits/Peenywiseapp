import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Use a larger limit for receipt image uploads
app.use(express.json({ limit: "15mb" }));

// Initialize Gemini SDK lazily to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Using fallback mock responses.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------------------

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Financial Coach chatbot proxy
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, expenses, savingsGoals } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Graceful fallback for demo purposes if no key is configured
      return res.json({
        text: `**[Demo Mode - API Key not configured]**\n\nI am your AI Financial Coach! To get real-time tailored insights from Gemini, please add your **GEMINI_API_KEY** in the **Settings > Secrets** panel in AI Studio.\n\nHere is a general financial tip based on your query:\n* To reduce spending on categories like eating out or shopping, try the **24-Hour Rule**: wait 24 hours before making any non-essential purchase. You'll find that 50% of the time, the urge to buy passes!\n* Always aim to save at least **20%** of your income as an emergency buffer.`,
        demo: true
      });
    }

    const ai = getGeminiClient();

    // Create a context summary of the user's spending habits
    let spendSummary = "No expense data logged yet.";
    if (expenses && expenses.length > 0) {
      const totalSpend = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      const byCategory = expenses.reduce((acc: any, exp: any) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {});
      
      spendSummary = `The user has logged ${expenses.length} expenses totalling $${totalSpend.toFixed(2)}.
Breakdown by category:
${Object.entries(byCategory).map(([cat, amt]) => `- ${cat}: $${(amt as number).toFixed(2)}`).join("\n")}

Recent Spends:
${expenses.slice(-5).map((exp: any) => `- ${exp.date}: ${exp.description} (${exp.category}) - $${exp.amount.toFixed(2)}`).join("\n")}`;
    }

    let goalsSummary = "No active savings goals.";
    if (savingsGoals && savingsGoals.length > 0) {
      goalsSummary = `Active Savings Goals:
${savingsGoals.map((g: any) => `- ${g.name}: Target $${g.targetAmount}, Saved $${g.currentSaved} (Target date: ${g.targetDate})`).join("\n")}`;
    }

    // Format conversation history for Gemini
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    // Add current user prompt
    formattedHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    const systemInstruction = `You are "SmartSpend AI", an elite personal finance manager, expense tracking specialist, and wealth-building advisor with 15 years of experience.
Your goal is to guide the user in optimizing their spends, reducing unnecessary expense, setting realistic budgets, and achieving their savings goals.

Analyze the user's current spending profile:
[User Spend Profile]
${spendSummary}

[User Savings Goals]
${goalsSummary}

Guidelines:
1. Provide actionable, high-impact strategies to reduce spends.
2. Calculate potential savings if they cut back 10-20% on their highest spending categories.
3. Keep responses highly engaging, visually structured, and concise. Use tables, bullet points, and headers to make numbers easy to digest.
4. Give warm, expert, encouraging advice. Be professional yet approachable. Do not use overly complex academic jargon.
5. If the user asks about general savings techniques, explain concepts like the 50/30/20 rule, envelope budgeting, or compound interest.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in AI Chat API:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI response" });
  }
});

// Smart Receipt Scanner (extracts transaction details from base64 image data)
app.post("/api/parse-receipt", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image base64 data provided" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Simulated receipt parsing if key is missing
      return res.json({
        merchant: "Mock Bistro & Cafe",
        date: new Date().toISOString().split("T")[0],
        amount: 24.50,
        category: "Dining Out",
        items: [
          { name: "Avocado Sourdough Toast", price: 16.50 },
          { name: "Organic Cold Brew", price: 5.50 },
          { name: "Sales Tax", price: 2.50 }
        ],
        isMock: true,
        message: "Demo Mode: Configure GEMINI_API_KEY in Secrets to scan real receipt images."
      });
    }

    const ai = getGeminiClient();

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: imageBase64,
      },
    };

    const promptText = `Parse this receipt. Extract the Merchant Name, the Date (YYYY-MM-DD), the Total Amount, the primary Category, and individual line items.
If any details are fuzzy or missing, make your best professional guess. Ensure the total matches the sum of items if possible.
Map the Category to one of these:
- Groceries
- Dining Out
- Transport
- Utilities
- Entertainment
- Shopping
- Healthcare
- Personal Care
- Education
- Other`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [imagePart, { text: promptText }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING, description: "Name of the store or merchant" },
            date: { type: Type.STRING, description: "Date of transaction in YYYY-MM-DD format" },
            amount: { type: Type.NUMBER, description: "Total receipt transaction amount" },
            category: { type: Type.STRING, description: "Category of spend" },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Item description" },
                  price: { type: Type.NUMBER, description: "Item price or cost" }
                },
                required: ["name", "price"]
              },
              description: "List of items purchased"
            }
          },
          required: ["merchant", "amount", "category"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI Vision model");
    }

    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in Receipt Parser API:", error);
    res.status(500).json({ error: error.message || "Failed to analyze receipt image" });
  }
});

// -------------------------------------------------------------------------
// VITE AND STATIC SERVING MIDDLEWARE
// -------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite dev server middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static compiled assets in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartSpend API & Web server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
