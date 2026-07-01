import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Expense, SavingsGoal, ChatMessage } from "../types";
import { Send, Bot, User, Sparkles, Loader2, RefreshCw, AlertCircle } from "lucide-react";

interface BudgetCoachProps {
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  currency: string;
}

export default function BudgetCoach({ expenses, savingsGoals, currency }: BudgetCoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("smartspend_chat_history");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: "welcome",
        role: "assistant",
        content: `👋 Hello there! I am **SmartSpend AI**, your personal budget advisor and financial coach.

I've automatically connected to your current transaction logs and active savings goals. Ask me anything, or try some of these topics:
- **Analyze my spends**: I'll review where your money is going and highlight optimization opportunities.
- **Save on categories**: Let's find practical ways to cut back on groceries, dining out, or shopping.
- **Design a budget**: I can draw up a customized 50/30/20 or custom envelope budget tailored to your monthly income.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("smartspend_chat_history", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          // Exclude the system welcome message to avoid confusing Gemini
          history: messages.filter((m) => m.id !== "welcome").map((m) => ({
            role: m.role,
            content: m.content,
          })),
          expenses,
          savingsGoals,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to the Financial Coach service.");
      }

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: data.text || "I was unable to formulate a response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear your conversation history with SmartSpend AI?")) {
      const initialWelcome: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `👋 Hello there! I am **SmartSpend AI**, your personal budget advisor and financial coach.

I've automatically connected to your current transaction logs and active savings goals. Ask me anything, or try some of these topics:
- **Analyze my spends**: I'll review where your money is going and highlight optimization opportunities.
- **Save on categories**: Let's find practical ways to cut back on groceries, dining out, or shopping.
- **Design a budget**: I can draw up a customized 50/30/20 or custom envelope budget tailored to your monthly income.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([initialWelcome]);
      setError(null);
    }
  };

  const suggestions = [
    { label: "Analyze my Spends", prompt: "Please analyze my current spending history and tell me where I am spending the most and how to optimize it." },
    { label: "50/30/20 Budget Plan", prompt: "Create a customized 50/30/20 budget recommendation based on my current income and spending habits." },
    { label: "Tips to Save Money", prompt: "Give me 5 simple, creative and practical habits to reduce my daily miscellaneous spending." },
    { label: "Goal Saving Strategy", prompt: "I want to reach my active savings goals faster. What are the best methods to squeeze more savings out of my current budget?" }
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-natural-dark-card rounded-3xl border border-natural-secondary dark:border-natural-dark-border shadow-sm overflow-hidden transition-all duration-300">
      {/* Coach Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-natural-secondary dark:border-natural-dark-border bg-natural-bg/50 dark:bg-natural-dark-bg/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-natural-secondary dark:bg-natural-dark-bg/60 text-natural-primary dark:text-natural-dark-text">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              SmartSpend Financial Coach
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                <Sparkles className="w-2.5 h-2.5" />
                Live AI
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Active context: {expenses.length} spends logged</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-1 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Reset Coach Memory"
          id="btn-clear-coach"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Memory
        </button>
      </div>

      {/* Chat Messages Stage */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0" id="chat-messages-container">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === "user" 
                  ? "bg-natural-secondary dark:bg-natural-dark-bg text-natural-text dark:text-natural-dark-text"
                  : "bg-natural-secondary dark:bg-natural-dark-bg text-natural-primary dark:text-natural-dark-text"
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col gap-1">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-natural-primary text-white rounded-tr-none"
                    : "bg-natural-bg/60 dark:bg-natural-dark-bg text-natural-text dark:text-natural-dark-text rounded-tl-none border border-natural-secondary dark:border-natural-dark-border"
                }`}>
                  {/* Handle basic markdown formatting (paragraphs, bolding, bullet lists) */}
                  <div className="space-y-2 whitespace-pre-wrap">
                    {msg.content.split("\n").map((line, lineIdx) => {
                      let processed = line;
                      
                      // Bold formatting **text**
                      if (processed.includes("**")) {
                        const parts = processed.split("**");
                        return (
                          <p key={lineIdx}>
                            {parts.map((part, partIdx) => 
                              partIdx % 2 === 1 ? <strong key={partIdx} className="font-bold">{part}</strong> : part
                            )}
                          </p>
                        );
                      }

                      // Bullet lists starting with - or *
                      if (processed.trim().startsWith("- ") || processed.trim().startsWith("* ")) {
                        const cleanLine = processed.trim().replace(/^[-*]\s+/, "");
                        return (
                          <ul key={lineIdx} className="list-disc pl-5 my-1">
                            <li>{cleanLine}</li>
                          </ul>
                        );
                      }

                      return <p key={lineIdx}>{processed}</p>;
                    })}
                  </div>
                </div>
                <span className={`text-[10px] text-zinc-400 dark:text-zinc-500 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  {msg.timestamp}
                </span>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 mr-auto max-w-[80%]"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-natural-secondary dark:bg-natural-dark-bg text-natural-primary dark:text-natural-dark-text flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="px-4 py-3 bg-natural-bg/60 dark:bg-natural-dark-bg rounded-2xl rounded-tl-none border border-natural-secondary dark:border-natural-dark-border flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-natural-primary dark:text-natural-dark-text animate-spin" />
                  <span className="text-xs font-semibold text-natural-muted dark:text-natural-dark-text/75">SmartSpend AI is formulating customized budget plans...</span>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-55/10 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 rounded-2xl flex items-center gap-2 text-red-700 dark:text-red-400 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button
                onClick={() => handleSendMessage(messages[messages.length - 1]?.content || "")}
                className="px-2.5 py-1 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                id="btn-retry-chat"
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length === 1 && (
        <div className="px-6 py-2 border-t border-natural-secondary dark:border-natural-dark-border overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2" id="quick-prompts-tray">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(sug.prompt)}
              className="inline-block text-xs font-semibold text-natural-muted dark:text-natural-subtle hover:text-natural-primary dark:hover:text-natural-dark-text bg-natural-secondary dark:bg-natural-dark-bg hover:bg-natural-secondary/60 dark:hover:bg-natural-dark-card px-3.5 py-2 rounded-xl transition-all border border-transparent hover:border-natural-border"
              id={`quick-prompt-${i}`}
            >
              {sug.label}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-4 border-t border-natural-secondary dark:border-natural-dark-border bg-natural-bg/50 dark:bg-natural-dark-bg/10 flex gap-2"
        id="chat-input-form"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask SmartSpend Coach: 'How can I save $200 on groceries?'"
          disabled={loading}
          className="flex-1 px-4.5 py-3 text-sm rounded-xl bg-white dark:bg-zinc-950 border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/20 focus:border-natural-primary text-natural-text dark:text-natural-dark-text placeholder-natural-subtle dark:placeholder-natural-muted transition-all disabled:opacity-50"
          id="chat-input-field"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 bg-natural-primary hover:opacity-90 text-white rounded-xl transition-all shadow-md shadow-natural-primary/10 hover:shadow-natural-primary/20 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          id="btn-chat-send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
