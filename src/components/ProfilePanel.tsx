import React, { useState } from "react";
import { UserProfile, Expense, SavingsGoal } from "../types";
import { User, Mail, DollarSign, Download, Trash2, Sun, Moon, Check, Key } from "lucide-react";

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
      app: "PennyWise AI Personal Finance"
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pennywise_financial_report_${profile.name.replace(/\s+/g, "_").toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-bg-card dark:bg-dark-bg-card rounded-2xl p-5 border border-border-card dark:border-dark-border shadow-[0_2px_12px_rgba(43,35,32,0.06)] hover:shadow-[0_4px_20px_rgba(43,35,32,0.1)] transition-all duration-300">
      <div className="flex justify-between items-center mb-5" id="profile-panel-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-bg-card-alt dark:bg-dark-bg-app text-accent-coral border border-border-soft dark:border-dark-border flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-text-primary dark:text-dark-text-primary font-display">
              Profile &amp; Settings
            </h2>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
              Manage profiles, toggle themes, and export reports
            </p>
          </div>
        </div>

        {/* Tactile Brightness/Darkness Theme Switcher */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 bg-bg-app hover:bg-border-soft dark:bg-dark-bg-app text-text-primary dark:text-dark-text-primary rounded-xl transition-all cursor-pointer flex items-center justify-center border border-border-soft dark:border-dark-border hover:scale-105 active:scale-95 shadow-xs"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Theme`}
          id="btn-theme-toggle"
        >
          {theme === "light" ? <Moon className="w-4 h-4 text-accent-coral" /> : <Sun className="w-4 h-4 text-accent-yellow" />}
        </button>
      </div>

      {/* Simulated Switch Profile / Login Area */}
      <div className="mb-5 p-4 rounded-xl bg-bg-card-alt/70 dark:bg-dark-bg-card/45 border border-border-soft dark:border-dark-border" id="preset-login-tray">
        <span className="text-[10px] font-black text-accent-coral uppercase tracking-wider block mb-2.5 flex items-center gap-1">
          <Key className="w-3.5 h-3.5" /> Simulate Profile Login:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESET_PROFILES.map((preset, idx) => {
            const isActive = profile.email === preset.email;
            return (
              <button
                key={idx}
                onClick={() => handleSimulatedLogin(preset)}
                className={`flex items-center justify-between p-2.5 text-left text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  isActive 
                    ? "border-accent-coral bg-white dark:bg-dark-bg-app text-accent-coral shadow-xs ring-2 ring-accent-coral/10" 
                    : "border-border-soft dark:border-dark-border hover:border-accent-coral/60 text-text-primary dark:text-dark-text-primary bg-white dark:bg-dark-bg-app hover:shadow-xs"
                }`}
                id={`preset-login-${idx}`}
              >
                <div className="truncate max-w-[80%]">
                  <p className="font-extrabold truncate">{preset.name.split(" ")[0]}</p>
                  <p className="text-[9px] text-text-secondary dark:text-dark-text-secondary font-semibold truncate mt-0.5">{preset.email}</p>
                </div>
                <span className={`font-black ${isActive ? "text-accent-coral" : "text-text-secondary"}`}>{preset.currency}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Editing Form */}
      <form onSubmit={handleSaveProfile} className="space-y-4 mb-5" id="profile-edit-form">
        <h3 className="text-xs font-black text-text-primary dark:text-dark-text-primary uppercase tracking-wider border-b border-border-soft dark:border-dark-border pb-1.5">Configure Active Profile</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-text-secondary dark:text-dark-text-secondary mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-accent-coral" /> Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/20 focus:border-accent-coral text-text-primary dark:text-dark-text-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-secondary dark:text-dark-text-secondary mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3 text-accent-coral" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/20 focus:border-accent-coral text-text-primary dark:text-dark-text-primary transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-text-secondary dark:text-dark-text-secondary mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-accent-coral" /> Monthly Income Limit
            </label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              required
              min="1"
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/20 focus:border-accent-coral text-text-primary dark:text-dark-text-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-secondary dark:text-dark-text-secondary mb-1">
              Preferred Currency Sign
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/20 focus:border-accent-coral text-text-primary dark:text-dark-text-primary cursor-pointer transition-all"
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
          className="w-full py-2.5 bg-accent-gradient hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-accent-coral/10 cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99]"
          id="btn-save-profile"
        >
          {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
          {isSaved ? "Profile Configurations Saved!" : "Save Profile Details"}
        </button>
      </form>

      {/* Download and Clear History area */}
      <div className="space-y-3 pt-4 border-t border-border-soft dark:border-dark-border" id="data-management-actions">
        <h3 className="text-xs font-black text-text-primary dark:text-dark-text-primary uppercase tracking-wider">Report &amp; Data Operations</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-bg-app hover:bg-border-soft dark:bg-dark-bg-app text-text-primary dark:text-dark-text-primary text-xs font-bold rounded-xl transition-all cursor-pointer border border-border-soft dark:border-dark-border hover:scale-[1.01] active:scale-[0.99]"
            id="btn-download-backup"
          >
            <Download className="w-3.5 h-3.5 text-accent-coral" />
            Download report (.JSON)
          </button>

          {confirmClear ? (
            <div className="flex gap-1.5" id="clear-confirm-dialog">
              <button
                onClick={() => {
                  onClearHistory();
                  setConfirmClear(false);
                }}
                className="flex-1 py-2.5 bg-accent-pink hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center hover:scale-[1.01] active:scale-[0.99]"
              >
                Yes, Delete All
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-4 py-2.5 bg-bg-app dark:bg-dark-bg-app text-text-primary dark:text-dark-text-primary text-xs font-bold rounded-xl transition-all cursor-pointer border border-border-soft dark:border-dark-border hover:scale-[1.01]"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-accent-pink text-xs font-bold rounded-xl transition-all cursor-pointer border border-red-100 dark:border-red-950 hover:scale-[1.01] active:scale-[0.99]"
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
