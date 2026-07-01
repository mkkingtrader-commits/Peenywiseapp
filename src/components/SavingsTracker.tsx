import React, { useState } from "react";
import { SavingsGoal } from "../types";
import { PiggyBank, Plus, TrendingUp, Calendar, Trash2, CheckCircle2 } from "lucide-react";

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
    <div className="bg-bg-card dark:bg-dark-bg-card rounded-2xl p-5 border border-border-card dark:border-dark-border shadow-[0_2px_12px_rgba(43,35,32,0.06)] hover:shadow-[0_4px_20px_rgba(43,35,32,0.1)] transition-all duration-300">
      <div className="flex justify-between items-center mb-5" id="savings-tracker-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-bg-card-alt dark:bg-dark-bg-app text-accent-coral border border-border-soft dark:border-dark-border flex-shrink-0">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-text-primary dark:text-dark-text-primary font-display">
              Savings &amp; Wealth Milestones
            </h2>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
              Track targets, log contributions, and see active goal progress
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2.5 bg-bg-app hover:bg-border-soft dark:bg-dark-bg-app text-text-primary dark:text-dark-text-primary rounded-xl transition-all cursor-pointer border border-border-soft dark:border-dark-border hover:scale-105 shadow-xs"
          id="btn-toggle-add-goal"
        >
          <Plus className="w-4 h-4 text-accent-coral" />
        </button>
      </div>

      {/* Add New Goal Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-xl bg-bg-card-alt/70 dark:bg-dark-bg-card/40 border border-border-soft dark:border-dark-border space-y-3" id="add-goal-form">
          <h3 className="text-xs font-black text-accent-coral uppercase tracking-wider">Configure New Savings Target</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary dark:text-dark-text-secondary mb-1">Goal Name</label>
              <input
                type="text"
                placeholder="e.g. Europe Trip, Emergency Buffer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/20 focus:border-accent-coral text-text-primary dark:text-dark-text-primary placeholder-text-muted transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-secondary dark:text-dark-text-secondary mb-1">Target Amount ({currency})</label>
              <input
                type="number"
                placeholder="2000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                min="1"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/20 focus:border-accent-coral text-text-primary dark:text-dark-text-primary placeholder-text-muted transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary dark:text-dark-text-secondary mb-1 flex items-center gap-1">Initial Savings ({currency} - Optional)</label>
              <input
                type="number"
                placeholder="500"
                value={currentSaved}
                onChange={(e) => setCurrentSaved(e.target.value)}
                min="0"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/20 focus:border-accent-coral text-text-primary dark:text-dark-text-primary placeholder-text-muted transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-secondary dark:text-dark-text-secondary mb-1">Target Deadline (Optional)</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-2 text-xs rounded-xl bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/20 focus:border-accent-coral text-text-primary dark:text-dark-text-primary transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-bg-app hover:bg-border-soft dark:bg-dark-bg-app text-text-primary dark:text-dark-text-primary border border-border-soft dark:border-dark-border rounded-lg cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-accent-gradient hover:opacity-90 text-white rounded-lg shadow-sm shadow-accent-coral/15 cursor-pointer transition-all"
            >
              Add Target
            </button>
          </div>
        </form>
      )}

      {/* Savings Targets Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-border-soft dark:border-dark-border rounded-xl bg-bg-app/20" id="savings-tracker-empty">
          <PiggyBank className="w-10 h-10 text-accent-coral mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary">Set your first savings goal!</p>
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1 max-w-xs mx-auto">Achieve your financial dreams by mapping and logging your progress systematically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="savings-goals-grid">
          {goals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.currentSaved / goal.targetAmount) * 100)) || 0;
            const isCompleted = percentage >= 100;

            return (
              <div
                key={goal.id}
                className="p-4 rounded-xl border border-border-soft dark:border-dark-border bg-bg-card-alt/45 dark:bg-dark-bg-card/45 flex flex-col justify-between hover:scale-[1.01] hover:border-accent-coral/20 transition-all duration-200 shadow-xs"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xs font-extrabold text-text-primary dark:text-dark-text-primary flex items-center gap-1.5">
                        {goal.name}
                        {isCompleted && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
                        )}
                      </h3>
                      <p className="text-[10px] text-text-secondary dark:text-dark-text-secondary font-semibold flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-accent-coral" />
                        Target: {new Date(goal.targetDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-text-secondary hover:text-accent-pink p-1.5 rounded-full hover:bg-bg-app dark:hover:bg-dark-bg-app transition-colors cursor-pointer hover:scale-105"
                      title="Remove Target"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-text-secondary dark:text-dark-text-secondary">
                        {currency}{goal.currentSaved.toLocaleString()} of {currency}{goal.targetAmount.toLocaleString()}
                      </span>
                      <span className="text-accent-coral font-black font-display">{percentage}%</span>
                    </div>

                    <div className="w-full h-2 bg-bg-app dark:bg-dark-bg-app rounded-full overflow-hidden border border-border-soft/60 dark:border-dark-border/40">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-accent-green' : 'bg-accent-gradient'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Contribution Field */}
                <div className="flex gap-2 pt-2 border-t border-border-soft/60 dark:border-dark-border/40 mt-auto">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-accent-coral">{currency}</span>
                    <input
                      type="number"
                      placeholder="Add Savings"
                      value={contributionAmounts[goal.id] || ""}
                      onChange={(e) =>
                        setContributionAmounts((prev) => ({ ...prev, [goal.id]: e.target.value }))
                      }
                      className="w-full pl-6 pr-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/20 focus:border-accent-coral text-text-primary dark:text-dark-text-primary placeholder-text-muted transition-all"
                    />
                  </div>
                  <button
                    onClick={() => handleContribute(goal.id)}
                    disabled={!contributionAmounts[goal.id]}
                    className="px-3.5 py-1.5 bg-accent-green hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer hover:scale-[1.02] shadow-xs"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
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
