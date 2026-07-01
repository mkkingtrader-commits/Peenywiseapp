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

// Color mapping for categories to keep the design beautiful and consistent
export const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "#10B981", // Emerald
  "Dining Out": "#F59E0B", // Amber
  Transport: "#3B82F6", // Blue
  Utilities: "#EF4444", // Red
  Entertainment: "#8B5CF6", // Purple
  Shopping: "#EC4899", // Pink
  Healthcare: "#14B8A6", // Teal
  "Personal Care": "#6366F1", // Indigo
  Education: "#F97316", // Orange
  Other: "#6B7280", // Gray
};
