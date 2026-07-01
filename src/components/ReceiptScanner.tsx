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
    <div className="bg-white dark:bg-natural-dark-card rounded-3xl p-6 border border-natural-secondary dark:border-natural-dark-border shadow-sm transition-all duration-300">
      <div className="flex items-center gap-2.5 mb-5" id="scanner-title-sec">
        <div className="p-2 rounded-xl bg-natural-secondary dark:bg-natural-dark-bg/60 text-natural-primary dark:text-natural-dark-text">
          <Camera className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-natural-text dark:text-natural-dark-text flex items-center gap-1.5">
            AI Smart Receipt Scanner
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-natural-secondary text-natural-primary dark:bg-natural-dark-bg dark:text-natural-dark-text border border-natural-secondary dark:border-natural-dark-border">
              <Sparkles className="w-2.5 h-2.5 text-natural-primary" />
              Vision
            </span>
          </h2>
          <p className="text-xs text-natural-muted dark:text-natural-subtle">
            Upload, drag, or capture a receipt image to auto-populate transaction details.
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
            ? "border-natural-primary bg-natural-primary/5 dark:bg-natural-dark-bg/20"
            : "border-natural-secondary dark:border-natural-dark-border hover:border-natural-primary dark:hover:border-natural-primary hover:bg-natural-bg/20 dark:hover:bg-natural-dark-bg/25"
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
            <Loader2 className="w-8 h-8 text-natural-primary animate-spin" />
            <p className="text-sm font-semibold text-natural-text dark:text-natural-dark-text">Reading Receipt via Gemini Vision...</p>
            <p className="text-xs text-natural-muted dark:text-natural-subtle">Extracting merchant, items, dates, and category totals...</p>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center justify-center gap-2">
            <div className="p-3 bg-natural-secondary dark:bg-natural-dark-bg text-natural-muted dark:text-natural-dark-text rounded-full mb-1">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-natural-text dark:text-natural-dark-text">
              Drag and drop your receipt here, or <span className="text-natural-primary hover:underline">browse files</span>
            </p>
            <p className="text-[11px] text-natural-muted dark:text-natural-subtle">Supports PNG, JPG, WEBP formats up to 10MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl flex items-center gap-2 text-red-700 dark:text-red-400 text-xs font-semibold" id="scanner-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/40 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold" id="scanner-success">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>Transaction successfully scanned, verified, and logged!</span>
        </div>
      )}

      {/* Demo Quick Try Buttons */}
      {!parsedExpense && !loading && (
        <div className="mt-4" id="sample-receipts-area">
          <p className="text-[10px] font-bold text-natural-muted dark:text-natural-subtle uppercase tracking-wider mb-2">No receipt image? Try a template:</p>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_RECEIPTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample)}
                className="flex items-center gap-1.5 justify-center px-2.5 py-2 text-[11px] font-bold rounded-xl border border-natural-secondary dark:border-natural-dark-border hover:border-natural-primary dark:hover:border-natural-primary text-natural-text dark:text-natural-dark-text hover:text-natural-primary bg-natural-bg/50 dark:bg-natural-dark-bg hover:bg-natural-secondary/50 transition-all cursor-pointer"
                id={`sample-receipt-${idx}`}
              >
                <FileText className="w-3 h-3 text-natural-primary" />
                {sample.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Verification Review Interface */}
      {parsedExpense && (
        <div className="mt-5 p-4 rounded-2xl bg-natural-bg/40 dark:bg-natural-dark-bg border border-natural-secondary dark:border-natural-dark-border animate-fade-in" id="receipt-review-card">
          <div className="flex justify-between items-start mb-3 border-b border-natural-secondary dark:border-natural-dark-border pb-2">
            <div>
              <span className="text-[9px] font-bold uppercase bg-natural-secondary dark:bg-natural-dark-bg/80 text-natural-primary dark:text-natural-dark-text px-2 py-0.5 rounded-md border border-natural-secondary">
                Verify Scanned Details
              </span>
              <h3 className="text-sm font-bold text-natural-text dark:text-natural-dark-text mt-1">{parsedExpense.merchant}</h3>
              <p className="text-[10px] text-natural-muted dark:text-natural-subtle">{parsedExpense.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-extrabold text-natural-primary dark:text-natural-dark-text">
                {currency}{parsedExpense.amount.toFixed(2)}
              </p>
              <p className="text-[10px] text-natural-muted dark:text-natural-subtle">{parsedExpense.category}</p>
            </div>
          </div>

          {/* Items List */}
          {parsedExpense.items && parsedExpense.items.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto mb-3 pr-1" id="scanned-items-list">
              {parsedExpense.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex justify-between text-[11px] text-natural-text dark:text-natural-dark-text hover:bg-natural-secondary/40 p-1 rounded transition-colors">
                  <span className="truncate max-w-[75%]">{item.name}</span>
                  <span className="font-semibold">{currency}{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Verification Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleApproveExpense}
              className="flex-1 py-2 bg-natural-primary hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-natural-primary/10 cursor-pointer"
              id="btn-approve-scanned"
            >
              Verify &amp; Log Spends
            </button>
            <button
              onClick={() => setParsedExpense(null)}
              className="px-3.5 py-2 bg-natural-secondary dark:bg-natural-dark-bg text-natural-text dark:text-natural-dark-text text-xs font-bold rounded-xl transition-colors cursor-pointer border border-natural-secondary dark:border-natural-dark-border"
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
