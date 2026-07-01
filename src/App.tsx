import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Expense, SavingsGoal, UserProfile } from "./types";
import SpendCharts from "./components/SpendCharts";
import BudgetCoach from "./components/BudgetCoach";
import ReceiptScanner from "./components/ReceiptScanner";
import SavingsTracker from "./components/SavingsTracker";
import ExpenseList from "./components/ExpenseList";
import ProfilePanel from "./components/ProfilePanel";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Sparkles,
  PieChart as PieIcon,
  HelpCircle,
  Clock,
  Briefcase
} from "lucide-react";

// Mock data to pre-populate on initial boot
const DEFAULT_EXPENSES: Expense[] = [
  { id: "e1", amount: 1200.00, description: "Monthly Apartment Lease", category: "Utilities", date: new Date().toISOString().split("T")[0] },
  { id: "e2", amount: 145.20, description: "Whole Foods Weekly Groceries", category: "Groceries", date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0] },
  { id: "e3", amount: 78.40, description: "Olive Garden Dinner", category: "Dining Out", date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split("T")[0] },
  { id: "e4", amount: 45.00, description: "Shell Fuel Refill", category: "Transport", date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString().split("T")[0] },
  { id: "e5", amount: 89.99, description: "Mechanical Office Keyboard", category: "Shopping", date: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString().split("T")[0] },
  { id: "e6", amount: 15.00, description: "Spotify Family Subscription", category: "Entertainment", date: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString().split("T")[0] },
  { id: "e7", amount: 35.00, description: "Prescription Medicines", category: "Healthcare", date: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString().split("T")[0] }
];

const DEFAULT_GOALS: SavingsGoal[] = [
  { id: "g1", name: "Emergency Safe Fund", targetAmount: 5000, currentSaved: 1500, targetDate: "2500-12-31" },
  { id: "g2", name: "Europe Summer Trip", targetAmount: 3000, currentSaved: 400, targetDate: "2027-06-01" }
];

const DEFAULT_PROFILE: UserProfile = {
  name: "John (Professional)",
  email: "john.pro@gmail.com",
  monthlyIncome: 6500,
  currency: "$"
};

export default function App() {
  // 1. Global State Management with LocalStorage persistence
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("smartspend_profile");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem("smartspend_expenses");
    return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem("smartspend_savings_goals");
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("smartspend_theme");
    return (saved as "light" | "dark") || "light";
  });

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem("smartspend_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("smartspend_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("smartspend_savings_goals", JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem("smartspend_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // 2. Calculated KPI Metrics for the Summary Section
  const totalSpend = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const remainingBudget = useMemo(() => {
    return Math.max(0, profile.monthlyIncome - totalSpend);
  }, [profile.monthlyIncome, totalSpend]);

  const totalSavedSoFar = useMemo(() => {
    return savingsGoals.reduce((sum, goal) => sum + goal.currentSaved, 0);
  }, [savingsGoals]);

  const spendPercentage = useMemo(() => {
    const pct = (totalSpend / profile.monthlyIncome) * 100;
    return Math.min(100, Math.round(pct));
  }, [totalSpend, profile.monthlyIncome]);

  // 3. State update functions
  const handleAddExpense = (newExp: Omit<Expense, "id">) => {
    const expWithId: Expense = {
      ...newExp,
      id: Math.random().toString(36).substring(2, 9),
    };
    setExpenses((prev) => [expWithId, ...prev]);
  };

  const handleEditExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...updated } : exp))
    );
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleAddGoal = (newGoal: Omit<SavingsGoal, "id">) => {
    const goalWithId: SavingsGoal = {
      ...newGoal,
      id: Math.random().toString(36).substring(2, 9),
    };
    setSavingsGoals((prev) => [...prev, goalWithId]);
  };

  const handleUpdateGoalProgress = (id: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, currentSaved: Math.min(g.targetAmount, g.currentSaved + amount) } : g
      )
    );
  };

  const handleDeleteGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleClearHistory = () => {
    setExpenses([]);
    setSavingsGoals([]);
    localStorage.removeItem("smartspend_expenses");
    localStorage.removeItem("smartspend_savings_goals");
  };

  return (
    <div className="min-h-screen bg-bg-app dark:bg-dark-bg-app text-text-primary dark:text-dark-text-primary font-sans transition-colors duration-300">
      {/* Decorative Top Accent Line with Warm Coral Gradient */}
      <div className="h-1.5 bg-accent-gradient w-full" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Executive Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-border-soft dark:border-dark-border" id="executive-header">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center justify-center p-2 rounded-2xl bg-bg-card-alt dark:bg-dark-bg-card border border-border-soft dark:border-dark-border text-accent-coral shadow-sm">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-accent-coral">
                PennyWise Smart Wealth Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary dark:text-dark-text-primary font-display">
              Welcome back, {profile.name.split(" ")[0]}!
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary dark:text-dark-text-secondary mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-accent-coral" />
              Real-time expense logs sync: <span className="font-bold text-text-primary dark:text-dark-text-primary">{profile.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-5 py-3 bg-accent-gradient text-white rounded-2xl shadow-md shadow-accent-coral/20 text-right">
              <span className="text-[10px] text-white/80 uppercase font-extrabold tracking-wider block mb-0.5">Monthly Income Limit</span>
              <span className="text-base sm:text-lg font-extrabold flex items-center gap-1.5 justify-end font-display">
                <Briefcase className="w-4 h-4 text-white" />
                {profile.currency}{profile.monthlyIncome.toLocaleString()}
              </span>
            </div>
          </div>
        </header>

        {/* ------------------------------------------------------------------------- */}
        {/* BENTO SUMMARY SECTION */}
        {/* ------------------------------------------------------------------------- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="bento-summary-area">
          
          {/* Card 1: Spends vs income */}
          <div className="p-5 rounded-2xl bg-bg-card dark:bg-dark-bg-card border-l-4 border-l-accent-coral border-y border-r border-border-card dark:border-dark-border shadow-[0_2px_12px_rgba(43,35,32,0.06)] hover:shadow-[0_6px_20px_rgba(43,35,32,0.12)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-text-secondary dark:text-dark-text-secondary font-bold uppercase tracking-wider block mb-1">
                  Accumulated Spends
                </span>
                <h3 className="text-2xl font-black text-text-primary dark:text-dark-text-primary font-display">
                  {profile.currency}{totalSpend.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-bg-card-alt dark:bg-dark-bg-card text-accent-coral border border-border-soft dark:border-dark-border">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-text-secondary dark:text-dark-text-secondary">Total Allowance spent:</span>
                <span className={spendPercentage > 85 ? "text-accent-coral font-black" : "text-text-primary dark:text-dark-text-primary"}>
                  {spendPercentage}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-bg-app dark:bg-dark-bg-app rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-accent-gradient"
                  style={{ width: `${spendPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Remaining budget */}
          <div className="p-5 rounded-2xl bg-bg-card dark:bg-dark-bg-card border-l-4 border-l-accent-green border-y border-r border-border-card dark:border-dark-border shadow-[0_2px_12px_rgba(43,35,32,0.06)] hover:shadow-[0_6px_20px_rgba(43,35,32,0.12)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-text-secondary dark:text-dark-text-secondary font-bold uppercase tracking-wider block mb-1">
                  Surplus Reserve
                </span>
                <h3 className={`text-2xl font-black font-display ${
                  remainingBudget === 0 ? "text-accent-coral" : "text-accent-green"
                }`}>
                  {profile.currency}{remainingBudget.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-accent-green/10 text-accent-green">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <p className="text-[11px] text-text-secondary dark:text-dark-text-secondary mt-4 leading-relaxed">
              {remainingBudget === 0 ? (
                <span className="text-accent-coral font-bold">⚠️ Warning: You have reached your monthly income ceiling!</span>
              ) : (
                <>You have <span className="font-bold text-text-primary dark:text-dark-text-primary">{profile.currency}{remainingBudget.toLocaleString()}</span> left before exceeding your designated budget allowance.</>
              )}
            </p>
          </div>

          {/* Card 3: Savings Accumulations */}
          <div className="p-5 rounded-2xl bg-bg-card dark:bg-dark-bg-card border-l-4 border-l-accent-purple border-y border-r border-border-card dark:border-dark-border shadow-[0_2px_12px_rgba(43,35,32,0.06)] hover:shadow-[0_6px_20px_rgba(43,35,32,0.12)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-text-secondary dark:text-dark-text-secondary font-bold uppercase tracking-wider block mb-1">
                  Wealth Targets Savings
                </span>
                <h3 className="text-2xl font-black text-accent-purple dark:text-accent-purple font-display">
                  {profile.currency}{totalSavedSoFar.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-accent-purple/10 text-accent-purple">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            </div>

            <p className="text-[11px] text-text-secondary dark:text-dark-text-secondary mt-4 flex items-center gap-1.5">
              <span className="font-extrabold text-accent-green">+{savingsGoals.length}</span> active savings vaults logged and tracking progress.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* INTERACTIVE WORKSPACE BENTO GRID */}
        {/* ------------------------------------------------------------------------- */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-workspace">
          
          {/* LEFT WING (Analytics, Logs & Tables - 2 Columns) */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            
            {/* Visualizer section */}
            <section id="workspace-charts" className="order-1">
              <SpendCharts
                expenses={expenses}
                currency={profile.currency}
                monthlyIncome={profile.monthlyIncome}
              />
            </section>

            {/* Manual List logging and filtering section */}
            <section id="workspace-transaction-history" className="order-2">
              <ExpenseList
                expenses={expenses}
                currency={profile.currency}
                onAddExpense={handleAddExpense}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            </section>
          </div>

          {/* RIGHT WING (AI Coach Chatbot, Vision Scanner, Savings & Profile - 1 Column) */}
          <div className="lg:col-span-1 space-y-6 flex flex-col">
            
            {/* AI Coach section */}
            <section id="workspace-ai-coach" className="order-1 h-[450px]">
              <BudgetCoach
                expenses={expenses}
                savingsGoals={savingsGoals}
                currency={profile.currency}
              />
            </section>

            {/* Smart Receipt Scanner section */}
            <section id="workspace-scanner" className="order-2">
              <ReceiptScanner
                onAddExpense={handleAddExpense}
                currency={profile.currency}
              />
            </section>

            {/* Savings goals tracker section */}
            <section id="workspace-savings-milestones" className="order-3">
              <SavingsTracker
                goals={savingsGoals}
                currency={profile.currency}
                onAddGoal={handleAddGoal}
                onUpdateGoalProgress={handleUpdateGoalProgress}
                onDeleteGoal={handleDeleteGoal}
              />
            </section>

            {/* Personal profile settings section */}
            <section id="workspace-user-profile" className="order-4">
              <ProfilePanel
                profile={profile}
                onChangeProfile={setProfile}
                expenses={expenses}
                savingsGoals={savingsGoals}
                onClearHistory={handleClearHistory}
                theme={theme}
                onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
              />
            </section>
          </div>
        </main>

        {/* Elegant Institutional Footer */}
        <footer className="pt-8 border-t border-border-soft dark:border-dark-border text-center text-[11px] font-medium text-text-muted dark:text-dark-text-muted space-y-2">
          <p>© 2026 PennyWise AI Personal Finance Engines. Powered securely by Gemini 3.5 Models.</p>
          <p className="px-6 max-w-xl mx-auto leading-relaxed">
            Note on Architecture: Implemented securely using a full-stack Node.js + Express backend to shield AI API gateway keys completely from browser inspections.
          </p>
        </footer>
      </div>
    </div>
  );
}
