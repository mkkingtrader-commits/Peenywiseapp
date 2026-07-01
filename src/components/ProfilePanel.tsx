import React, { useState } from "react";
import { UserProfile, Expense, SavingsGoal } from "../types";
import { User, Mail, DollarSign, Download, Trash2, Sun, Moon, SwitchCamera, Check } from "lucide-react";

interface ProfilePanelProps {
  profile: UserProfile;
  onChangeProfile: (updates: Partial<UserProfile>) => void;
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  onClearHistory: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

// Preset profiles for simulated login area
const PRESET_PROFILES = [
  { name: "John (Professional)", email: "john.pro@gmail.com", monthlyIncome: 6500, currency: "$" },
  { name: "Sarah (Freelancer)", email: "sarah.writes@gmail.com", monthlyIncome: 4200, currency: "€" },
  { name: "Alex (Student)", email: "alex.learns@edu.org", monthlyIncome: 1200, currency: "£" }
];

export default function ProfilePanel({
  profile,
  onChangeProfile,
  expenses,
  savingsGoals,
  onClearHistory,
  theme,
  onToggleTheme,
}: ProfilePanelProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [income, setIncome] = useState(profile.monthlyIncome.toString());
  const [currency, setCurrency] = useState(profile.currency);
  
  const [isSaved, setIsSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeProfile({
      name,
      email,
      monthlyIncome: parseFloat(income) || 0,
      currency,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSimulatedLogin = (preset: typeof PRESET_PROFILES[0]) => {
    setName(preset.name);
    setEmail(preset.email);
    setIncome(preset.monthlyIncome.toString());
    setCurrency(preset.currency);
    onChangeProfile({
      name: preset.name,
      email: preset.email,
      monthlyIncome: preset.monthlyIncome,
      currency: preset.currency
    });
  };

  // Export and Download financial data as JSON
  const handleDownloadBackup = () => {
    const backupData = {
      profile,
      expenses,
      savingsGoals,
      exportedAt: new Date().toISOString(),
      app: "SmartSpend AI Personal Finance"
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smartspend_financial_report_${profile.name.replace(/\s+/g, "_").toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-natural-dark-card rounded-3xl p-6 border border-natural-secondary dark:border-natural-dark-border shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center mb-5" id="profile-panel-header">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-natural-secondary dark:bg-natural-dark-bg/60 text-natural-primary dark:text-natural-dark-text">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-natural-text dark:text-natural-dark-text">Profile &amp; Settings</h2>
            <p className="text-xs text-natural-muted dark:text-natural-subtle">Manage user accounts, switch themes, and export reports</p>
          </div>
        </div>

        {/* Brightness/Darkness Theme Selector */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 bg-natural-secondary dark:bg-natural-dark-bg hover:opacity-90 text-natural-text dark:text-natural-dark-text rounded-xl transition-all cursor-pointer flex items-center justify-center border border-natural-secondary dark:border-natural-dark-border"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Theme`}
          id="btn-theme-toggle"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>

      {/* Simulated Switch Profile / Login Area */}
      <div className="mb-5 p-4 rounded-2xl bg-natural-bg/50 dark:bg-natural-dark-bg/40 border border-natural-secondary/60 dark:border-natural-dark-border/40" id="preset-login-tray">
        <span className="text-[10px] font-bold text-natural-subtle dark:text-natural-muted uppercase tracking-wider block mb-2">Simulate Personal Profile Login:</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESET_PROFILES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSimulatedLogin(preset)}
              className="flex items-center justify-between p-2.5 text-left text-xs font-semibold rounded-xl border border-natural-secondary dark:border-natural-dark-border hover:border-natural-primary text-natural-text dark:text-natural-dark-text hover:text-natural-primary bg-white dark:bg-natural-dark-card transition-all cursor-pointer"
              id={`preset-login-${idx}`}
            >
              <div className="truncate max-w-[80%]">
                <p className="font-bold truncate text-natural-text dark:text-natural-dark-text">{preset.name.split(" ")[0]}</p>
                <p className="text-[10px] text-natural-muted dark:text-natural-subtle truncate">{preset.email}</p>
              </div>
              <span className="text-natural-primary dark:text-natural-dark-text font-bold">{preset.currency}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Editing Form */}
      <form onSubmit={handleSaveProfile} className="space-y-4 mb-6" id="profile-edit-form">
        <h3 className="text-xs font-bold text-natural-muted dark:text-natural-subtle uppercase tracking-wider border-b border-natural-secondary dark:border-natural-dark-border pb-1.5">Configure Active Profile</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-natural-muted dark:text-natural-subtle mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-natural-primary" /> Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-natural-bg/40 dark:bg-natural-dark-bg border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-natural-muted dark:text-natural-subtle mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3 text-natural-primary" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-natural-bg/40 dark:bg-natural-dark-bg border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-natural-muted dark:text-natural-subtle mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-natural-primary" /> Monthly Income Limit
            </label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              required
              min="1"
              className="w-full px-3 py-2 text-xs rounded-xl bg-natural-bg/40 dark:bg-natural-dark-bg border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-natural-muted dark:text-natural-subtle mb-1">
              Preferred Currency Sign
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-natural-bg/40 dark:bg-natural-dark-bg border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text"
            >
              <option value="$">USD ($)</option>
              <option value="€">EUR (€)</option>
              <option value="£">GBP (£)</option>
              <option value="₹">INR (₹)</option>
              <option value="¥">JPY/CNY (¥)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-natural-primary hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-natural-primary/10 cursor-pointer flex items-center justify-center gap-1"
          id="btn-save-profile"
        >
          {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
          {isSaved ? "Profile Configurations Saved!" : "Save Profile Details"}
        </button>
      </form>

      {/* Download and Clear History area */}
      <div className="space-y-3 pt-4 border-t border-natural-secondary dark:border-natural-dark-border" id="data-management-actions">
        <h3 className="text-xs font-bold text-natural-muted dark:text-natural-subtle uppercase tracking-wider">Report &amp; Data Operations</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-natural-secondary dark:bg-natural-dark-bg hover:opacity-90 text-natural-text dark:text-natural-dark-text text-xs font-bold rounded-xl transition-all cursor-pointer border border-natural-secondary dark:border-natural-dark-border"
            id="btn-download-backup"
          >
            <Download className="w-3.5 h-3.5 text-natural-primary dark:text-natural-dark-text" />
            Download report (.JSON)
          </button>

          {confirmClear ? (
            <div className="flex gap-1.5" id="clear-confirm-dialog">
              <button
                onClick={() => {
                  onClearHistory();
                  setConfirmClear(false);
                }}
                className="flex-1 py-2.5 bg-red-650 hover:bg-red-750 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center font-bold"
              >
                Yes, Delete All
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3.5 py-2.5 bg-natural-secondary dark:bg-natural-dark-bg text-natural-text dark:text-natural-dark-text text-xs font-bold rounded-xl transition-colors cursor-pointer border border-natural-secondary dark:border-natural-dark-border"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/25 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-bold rounded-xl transition-all cursor-pointer border border-red-200/50 dark:border-red-900/40"
              id="btn-clear-history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
