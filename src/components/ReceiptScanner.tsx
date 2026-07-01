import { useState, useRef, DragEvent } from "react";
import { Camera, Upload, Sparkles, Loader2, AlertCircle, Check, FileText } from "lucide-react";
import { Expense } from "../types";

interface ReceiptScannerProps {
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  currency: string;
}

// Interactive sample receipts for testing
const SAMPLE_RECEIPTS = [
  {
    name: "Target Superstore",
    category: "Groceries",
    amount: 54.20,
    merchant: "Target Superstore",
    date: new Date().toISOString().split("T")[0],
    items: [
      { name: "Organic Strawberries", price: 4.99 },
      { name: "Whole Milk 1Gal", price: 3.49 },
      { name: "Sourdough Bread", price: 4.50 },
      { name: "Paper Towels 6pk", price: 12.99 },
      { name: "Fresh Salmon Fillet", price: 18.99 },
      { name: "Greek Yogurt 32oz", price: 5.25 },
      { name: "Sales Tax", price: 3.99 }
    ]
  },
  {
    name: "Shell Fuel Station",
    category: "Transport",
    amount: 42.50,
    merchant: "Shell Oil Corp",
    date: new Date().toISOString().split("T")[0],
    items: [
      { name: "Unleaded Fuel Regular 12.5 G", price: 39.50 },
      { name: "Premium Car Wash", price: 3.00 }
    ]
  },
  {
    name: "Olive Garden Bistro",
    category: "Dining Out",
    amount: 68.40,
    merchant: "Olive Garden Bistro #409",
    date: new Date().toISOString().split("T")[0],
    items: [
      { name: "Tour of Italy", price: 21.99 },
      { name: "Chicken Alfredo", price: 19.99 },
      { name: "Warm Breadsticks", price: 0.00 },
      { name: "Cabernet Sauvignon Glass", price: 9.50 },
      { name: "Tiramisu Dessert", price: 8.50 },
      { name: "Service Tax & Gratuity", price: 8.42 }
    ]
  }
];

export default function ReceiptScanner({ onAddExpense, currency }: ReceiptScannerProps) {
  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Scanned details review area
  const [parsedExpense, setParsedExpense] = useState<{
    merchant: string;
    date: string;
    amount: number;
    category: string;
    items: { name: string; price: number }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, or WEBP).");
      return;
    }

    setLoading(true);
    setError(null);
    setParsedExpense(null);
    setSuccess(false);

    try {
      const base64 = await fileToBase64(file);
      // Strip metadata from base64 string
      const base64Clean = base64.split(",")[1];

      const response = await fetch("/api/parse-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Clean,
          mimeType: file.type
        })
      });

      if (!response.ok) {
        throw new Error("Unable to parse receipt. Please verify image clarity.");
      }

      const data = await response.json();
      setParsedExpense({
        merchant: data.merchant || "Unknown Merchant",
        date: data.date || new Date().toISOString().split("T")[0],
        amount: parseFloat(data.amount) || 0,
        category: data.category || "Other",
        items: data.items || []
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to scan receipt image.");
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Drag and drop event handlers
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await processImageFile(files[0]);
    }
  };

  const handleFileInputChange = async () => {
    const files = fileInputRef.current?.files;
    if (files && files[0]) {
      await processImageFile(files[0]);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_RECEIPTS[0]) => {
    setParsedExpense({
      merchant: sample.merchant,
      date: sample.date,
      amount: sample.amount,
      category: sample.category,
      items: sample.items
    });
    setError(null);
    setSuccess(false);
  };

  const handleApproveExpense = () => {
    if (!parsedExpense) return;

    onAddExpense({
      amount: parsedExpense.amount,
      description: parsedExpense.merchant,
      category: parsedExpense.category,
      date: parsedExpense.date
    });

    setParsedExpense(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-bg-card dark:bg-dark-bg-card rounded-2xl p-5 border border-border-card dark:border-dark-border shadow-[0_2px_12px_rgba(43,35,32,0.06)] hover:shadow-[0_4px_20px_rgba(43,35,32,0.1)] transition-all duration-300">
      <div className="flex items-center gap-3 mb-5" id="scanner-title-sec">
        <div className="p-2.5 rounded-xl bg-bg-card-alt dark:bg-dark-bg-app text-accent-coral border border-border-soft dark:border-dark-border flex-shrink-0">
          <Camera className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-text-primary dark:text-dark-text-primary flex items-center gap-2 font-display">
            AI Smart Receipt Scanner
            <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-accent-coral/10 text-accent-coral border border-accent-coral/15">
              <Sparkles className="w-2.5 h-2.5 text-accent-coral" />
              Vision
            </span>
          </h2>
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
            Upload or select a receipt image to auto-populate transaction logs
          </p>
        </div>
      </div>

      {/* Drag & Drop Stage */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-accent-coral bg-bg-card-alt/80 dark:bg-dark-bg-app/80"
            : "border-border-card dark:border-dark-border hover:border-accent-coral dark:hover:border-accent-coral hover:bg-bg-card-alt/30 dark:hover:bg-dark-bg-app/20"
        }`}
        id="drag-and-drop-container"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          className="hidden"
          id="scanner-file-picker"
        />

        {loading ? (
          <div className="py-4 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-accent-coral animate-spin" />
            <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary">Reading Receipt via Gemini Vision...</p>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Extracting merchant, items, and category totals...</p>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center justify-center gap-2">
            <div className="p-3 bg-bg-card-alt dark:bg-dark-bg-app text-accent-coral rounded-full mb-1 border border-border-soft dark:border-dark-border">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary">
              Drag and drop your receipt here, or <span className="text-accent-coral hover:underline">browse files</span>
            </p>
            <p className="text-[11px] text-text-secondary dark:text-dark-text-secondary">Supports PNG, JPG, WEBP formats up to 10MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/40 rounded-xl flex items-center gap-2 text-accent-pink text-xs font-semibold" id="scanner-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-accent-pink" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-accent-green/10 dark:bg-accent-green/20 border border-accent-green/15 rounded-xl flex items-center gap-2 text-accent-green text-xs font-semibold" id="scanner-success">
          <Check className="w-4 h-4 flex-shrink-0 text-accent-green" />
          <span>Transaction successfully scanned, verified, and logged!</span>
        </div>
      )}

      {/* Demo Quick Try Buttons */}
      {!parsedExpense && !loading && (
        <div className="mt-4" id="sample-receipts-area">
          <p className="text-[10px] font-black text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mb-2.5">No receipt image? Try a sample template:</p>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_RECEIPTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample)}
                className="flex items-center gap-1.5 justify-center px-2.5 py-2 text-[11px] font-bold rounded-xl border border-border-soft dark:border-dark-border hover:border-accent-coral dark:hover:border-accent-coral text-text-primary dark:text-dark-text-primary hover:text-accent-coral bg-bg-card-alt/40 dark:bg-dark-bg-card/40 hover:bg-white dark:hover:bg-dark-bg-app transition-all cursor-pointer hover:scale-[1.02]"
                id={`sample-receipt-${idx}`}
              >
                <FileText className="w-3.5 h-3.5 text-accent-coral" />
                {sample.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Verification Review Interface */}
      {parsedExpense && (
        <div className="mt-5 p-4 rounded-xl bg-bg-card-alt/50 dark:bg-dark-bg-app border border-border-soft dark:border-dark-border animate-fade-in" id="receipt-review-card">
          <div className="flex justify-between items-start mb-3 border-b border-border-soft dark:border-dark-border pb-2">
            <div>
              <span className="text-[9px] font-bold uppercase bg-accent-coral/10 text-accent-coral px-2.5 py-0.5 rounded-full border border-accent-coral/15 inline-block">
                Verify Scanned Details
              </span>
              <h3 className="text-xs font-extrabold text-text-primary dark:text-dark-text-primary mt-2">{parsedExpense.merchant}</h3>
              <p className="text-[10px] text-text-secondary dark:text-dark-text-secondary font-semibold mt-0.5">{parsedExpense.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-accent-coral font-display">
                {currency}{parsedExpense.amount.toFixed(2)}
              </p>
              <p className="text-[10px] text-text-secondary dark:text-dark-text-secondary font-semibold">{parsedExpense.category}</p>
            </div>
          </div>

          {/* Items List */}
          {parsedExpense.items && parsedExpense.items.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto mb-3 pr-1" id="scanned-items-list">
              {parsedExpense.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex justify-between text-[11px] text-text-primary dark:text-dark-text-primary hover:bg-bg-card-alt p-1 rounded-lg transition-colors">
                  <span className="truncate max-w-[75%] font-medium">{item.name}</span>
                  <span className="font-bold">{currency}{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Verification Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleApproveExpense}
              className="flex-1 py-2 bg-accent-gradient hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-accent-coral/10 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              id="btn-approve-scanned"
            >
              Verify &amp; Log Spends
            </button>
            <button
              onClick={() => setParsedExpense(null)}
              className="px-4 py-2 bg-bg-app hover:bg-border-soft dark:bg-dark-bg-app text-text-primary dark:text-dark-text-primary text-xs font-bold rounded-xl transition-colors cursor-pointer border border-border-soft dark:border-dark-border"
              id="btn-cancel-scanned"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
