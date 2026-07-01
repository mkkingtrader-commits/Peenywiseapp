export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSaved: number;
  targetDate: string; // YYYY-MM-DD
}

export interface UserProfile {
  name: string;
  email: string;
  monthlyIncome: number;
  currency: string; // "$", "€", "£", "₹", "¥"
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export type ExpenseCategory =
  | "Groceries"
  | "Dining Out"
  | "Transport"
  | "Utilities"
  | "Entertainment"
  | "Shopping"
  | "Healthcare"
  | "Personal Care"
  | "Education"
  | "Other";

export const CATEGORIES: ExpenseCategory[] = [
  "Groceries",
  "Dining Out",
  "Transport",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Personal Care",
  "Education",
  "Other",
];

// Color mapping for categories to keep the design beautiful, consistent, and warm-toned
export const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "#4CAF7D", // accent-green (sage green)
  "Dining Out": "#FF8A65", // accent-coral
  Transport: "#5B8DEF", // accent-blue
  Utilities: "#E59480", // soft terracotta
  Entertainment: "#9B7FE8", // accent-purple
  Shopping: "#F4568C", // accent-pink
  Healthcare: "#71B7B9", // soft sage/teal
  "Personal Care": "#F4B740", // accent-yellow
  Education: "#C4A5DC", // soft lavender
  Other: "#B3A79F", // warm sand gray
};
