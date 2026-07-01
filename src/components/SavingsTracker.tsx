import React, { useState } from "react";
import { SavingsGoal } from "../types";
import { PiggyBank, Plus, TrendingUp, Calendar, Trash2, DollarSign } from "lucide-react";

interface SavingsTrackerProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, "id">) => void;
  onUpdateGoalProgress: (id: string, amountToAdd: number) => void;
  onDeleteGoal: (id: string) => void;
  currency: string;
}

export default function SavingsTracker({
  goals,
  onAddGoal,
  onUpdateGoalProgress,
  onDeleteGoal,
  currency,
}: SavingsTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentSaved, setCurrentSaved] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const [contributionAmounts, setContributionAmounts] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) return;

    onAddGoal({
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentSaved: currentSaved ? parseFloat(currentSaved) : 0,
      targetDate: targetDate || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split("T")[0],
    });

    setName("");
    setTargetAmount("");
    setCurrentSaved("");
    setTargetDate("");
    setShowAddForm(false);
  };

  const handleContribute = (goalId: string) => {
    const amtStr = contributionAmounts[goalId];
    if (!amtStr || isNaN(Number(amtStr)) || Number(amtStr) <= 0) return;

    onUpdateGoalProgress(goalId, parseFloat(amtStr));
    setContributionAmounts((prev) => ({ ...prev, [goalId]: "" }));
  };

  return (
    <div className="bg-white dark:bg-natural-dark-card rounded-3xl p-6 border border-natural-secondary dark:border-natural-dark-border shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center mb-5" id="savings-tracker-header">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-natural-secondary dark:bg-natural-dark-bg/60 text-natural-primary dark:text-natural-dark-text">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-natural-text dark:text-natural-dark-text">Savings &amp; Wealth Milestones</h2>
            <p className="text-xs text-natural-muted dark:text-natural-subtle">Track targets, log contributions, and see active goal progress</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-natural-secondary dark:bg-natural-dark-bg hover:opacity-90 text-natural-text dark:text-natural-dark-text rounded-xl transition-all cursor-pointer border border-natural-secondary dark:border-natural-dark-border"
          id="btn-toggle-add-goal"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add New Goal Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-2xl bg-natural-bg/50 dark:bg-natural-dark-bg/40 border border-natural-secondary dark:border-natural-dark-border space-y-3" id="add-goal-form">
          <h3 className="text-xs font-bold text-natural-muted dark:text-natural-subtle uppercase tracking-wider">Configure New Savings Target</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-natural-muted dark:text-natural-subtle mb-1">Goal Name</label>
              <input
                type="text"
                placeholder="e.g. Europe Trip, Emergency Buffer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-natural-dark-card border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text placeholder-natural-subtle dark:placeholder-natural-muted"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-natural-muted dark:text-natural-subtle mb-1">Target Amount ({currency})</label>
              <input
                type="number"
                placeholder="2000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                min="1"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-natural-dark-card border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text placeholder-natural-subtle dark:placeholder-natural-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-natural-muted dark:text-natural-subtle mb-1">Initial Savings ({currency} - Optional)</label>
              <input
                type="number"
                placeholder="500"
                value={currentSaved}
                onChange={(e) => setCurrentSaved(e.target.value)}
                min="0"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-natural-dark-card border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text placeholder-natural-subtle dark:placeholder-natural-muted"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-natural-muted dark:text-natural-subtle mb-1">Target Deadline (Optional)</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-natural-dark-card border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-natural-secondary hover:opacity-90 dark:bg-natural-dark-bg text-natural-text dark:text-natural-dark-text rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-bold bg-natural-primary hover:opacity-95 text-white rounded-lg shadow-sm shadow-natural-primary/15 cursor-pointer"
            >
              Add Target
            </button>
          </div>
        </form>
      )}

      {/* Savings Targets Grid */}
      {goals.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-natural-secondary dark:border-natural-dark-border rounded-2xl" id="savings-tracker-empty">
          <PiggyBank className="w-10 h-10 text-natural-subtle mx-auto mb-3 animate-bounce" />
          <p className="text-sm font-semibold text-natural-text dark:text-natural-dark-text">Set your first savings goal!</p>
          <p className="text-xs text-natural-muted dark:text-natural-subtle mt-1">Achieve your financial dreams by mapping and logging your progress systematically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="savings-goals-grid">
          {goals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.currentSaved / goal.targetAmount) * 100)) || 0;
            const remaining = Math.max(0, goal.targetAmount - goal.currentSaved);

            return (
              <div
                key={goal.id}
                className="p-4 rounded-2xl border border-natural-secondary dark:border-natural-dark-border bg-natural-bg/30 dark:bg-natural-dark-bg/35 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xs font-bold text-natural-text dark:text-natural-dark-text">{goal.name}</h3>
                      <p className="text-[10px] text-natural-muted dark:text-natural-subtle flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Target: {new Date(goal.targetDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-natural-subtle hover:text-red-650 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Remove Target"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-natural-muted dark:text-natural-subtle">
                        {currency}{goal.currentSaved.toLocaleString()} of {currency}{goal.targetAmount.toLocaleString()}
                      </span>
                      <span className="text-natural-primary dark:text-natural-dark-text">{percentage}%</span>
                    </div>

                    <div className="w-full h-2 bg-natural-secondary dark:bg-natural-dark-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-natural-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Contribution Field */}
                <div className="flex gap-2 pt-2 border-t border-natural-secondary/50 dark:border-natural-dark-border/40 mt-auto">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-natural-subtle">{currency}</span>
                    <input
                      type="number"
                      placeholder="Add Savings"
                      value={contributionAmounts[goal.id] || ""}
                      onChange={(e) =>
                        setContributionAmounts((prev) => ({ ...prev, [goal.id]: e.target.value }))
                      }
                      className="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl bg-white dark:bg-natural-dark-card border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text placeholder-natural-subtle dark:placeholder-natural-muted"
                    />
                  </div>
                  <button
                    onClick={() => handleContribute(goal.id)}
                    disabled={!contributionAmounts[goal.id]}
                    className="px-3 py-1.5 bg-natural-primary hover:opacity-95 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <TrendingUp className="w-3 h-3" />
                    Save
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
