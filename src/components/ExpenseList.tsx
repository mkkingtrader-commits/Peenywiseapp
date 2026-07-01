import React, { useState } from "react";
import { Expense, CATEGORIES, CATEGORY_COLORS } from "../types";
import { Search, Filter, Trash2, Edit2, Plus, Calendar, ArrowUpDown, ChevronDown, ListOrdered } from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  onEditExpense: (id: string, updatedExpense: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
  currency: string;
}

export default function ExpenseList({
  expenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  currency,
}: ExpenseListProps) {
  // Manual adding state
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("Groceries");
  const [editDate, setEditDate] = useState("");

  // Filters and sorts
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || !description.trim()) return;

    onAddExpense({
      amount: parseFloat(amount),
      description: description.trim(),
      category,
      date,
    });

    setAmount("");
    setDescription("");
    setCategory("Groceries");
    setDate(new Date().toISOString().split("T")[0]);
    setShowAddForm(false);
  };

  const handleStartEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setEditAmount(exp.amount.toString());
    setEditDescription(exp.description);
    setEditCategory(exp.category);
    setEditDate(exp.date);
  };

  const handleSaveEdit = (id: string) => {
    if (!editAmount || isNaN(Number(editAmount)) || Number(editAmount) <= 0 || !editDescription.trim()) return;

    onEditExpense(id, {
      amount: parseFloat(editAmount),
      description: editDescription.trim(),
      category: editCategory,
      date: editDate,
    });

    setEditingId(null);
  };

  // Filter and Sort Expenses
  const filteredAndSortedExpenses = expenses
    .filter((exp) => {
      const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "All" || exp.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") return b.date.localeCompare(a.date);
      if (sortBy === "date-asc") return a.date.localeCompare(b.date);
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

  return (
    <div className="bg-bg-card dark:bg-dark-bg-card rounded-2xl p-5 border border-border-card dark:border-dark-border shadow-[0_2px_12px_rgba(43,35,32,0.06)] hover:shadow-[0_4px_20px_rgba(43,35,32,0.1)] transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5" id="expense-list-title-sec">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-bg-card-alt dark:bg-dark-bg-app text-accent-coral border border-border-soft dark:border-dark-border">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-text-primary dark:text-dark-text-primary font-display">
              Expense Transaction History
            </h2>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
              Log new spends manually or search historical spends
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-accent-gradient hover:opacity-90 text-white text-xs font-bold rounded-full transition-all shadow-md shadow-accent-coral/20 cursor-pointer hover:shadow-accent-coral/30"
          id="btn-toggle-add-expense"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Expense
        </button>
      </div>

      {/* Add New Expense Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-xl bg-bg-card-alt dark:bg-dark-bg-card/40 border border-border-soft dark:border-dark-border space-y-3" id="add-expense-form">
          <h3 className="text-xs font-black text-accent-coral uppercase tracking-wider">Manual Spend Specification</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary dark:text-dark-text-secondary mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g. Wholefoods Groceries, Uber ride"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/20 focus:border-accent-coral text-text-primary dark:text-dark-text-primary placeholder-text-muted transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-secondary dark:text-dark-text-secondary mb-1">Amount ({currency})</label>
              <input
                type="number"
                step="0.01"
                placeholder="24.50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0.01"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/20 focus:border-accent-coral text-text-primary dark:text-dark-text-primary placeholder-text-muted transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary dark:text-dark-text-secondary mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/20 focus:border-accent-coral text-text-primary dark:text-dark-text-primary cursor-pointer transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-secondary dark:text-dark-text-secondary mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
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
              Log Spent
            </button>
          </div>
        </form>
      )}

      {/* Soft Pill Styling Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5" id="filters-panel">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-text-secondary dark:text-dark-text-secondary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-full bg-bg-app dark:bg-dark-bg-app border border-border-soft dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/25 focus:border-accent-coral text-text-primary dark:text-dark-text-primary placeholder-text-muted transition-all"
          />
        </div>

        <div className="relative">
          <Filter className="w-3.5 h-3.5 text-text-secondary dark:text-dark-text-secondary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 text-xs rounded-full bg-bg-app dark:bg-dark-bg-app border border-border-soft dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/25 focus:border-accent-coral text-text-primary dark:text-dark-text-primary appearance-none cursor-pointer transition-all"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-text-secondary dark:text-dark-text-secondary absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <ArrowUpDown className="w-3.5 h-3.5 text-text-secondary dark:text-dark-text-secondary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full pl-10 pr-8 py-2.5 text-xs rounded-full bg-bg-app dark:bg-dark-bg-app border border-border-soft dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/25 focus:border-accent-coral text-text-primary dark:text-dark-text-primary appearance-none cursor-pointer transition-all"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-text-secondary dark:text-dark-text-secondary absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Transaction Records List */}
      <div className="overflow-x-auto" id="transactions-records-stage">
        {filteredAndSortedExpenses.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-border-soft dark:border-dark-border rounded-xl bg-bg-app/20">
            <Search className="w-8 h-8 text-text-muted dark:text-dark-text-muted mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary">No matching transactions found</p>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">Try resetting filters or logging a new spend item.</p>
          </div>
        ) : (
          <table className="w-full min-w-[500px] text-left border-collapse">
            <thead>
              <tr className="border-b border-border-soft dark:border-dark-border text-[10px] uppercase font-bold text-text-secondary dark:text-dark-text-secondary tracking-wider">
                <th className="py-3 px-4 font-extrabold">Transaction Details</th>
                <th className="py-3 px-4 font-extrabold">Category</th>
                <th className="py-3 px-4 font-extrabold">Date</th>
                <th className="py-3 px-4 text-right font-extrabold">Amount</th>
                <th className="py-3 px-4 text-right font-extrabold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedExpenses.map((exp) => {
                const isEditing = editingId === exp.id;
                const catColor = CATEGORY_COLORS[exp.category] || "#B3A79F";

                return (
                  <tr
                    key={exp.id}
                    className="border-b border-border-soft/60 dark:border-dark-border/60 hover:bg-bg-card-alt/50 dark:hover:bg-dark-bg-card/40 transition-colors duration-150 group"
                  >
                    {/* Description column */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border text-text-primary dark:text-dark-text-primary w-full focus:outline-none focus:ring-2 focus:ring-accent-coral/20"
                        />
                      ) : (
                        <span className="text-xs font-bold text-text-primary dark:text-dark-text-primary group-hover:text-accent-coral transition-colors">{exp.description}</span>
                      )}
                    </td>

                    {/* Category column with Soft Dot */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border text-text-primary dark:text-dark-text-primary"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: catColor }} />
                          <span className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary">{exp.category}</span>
                        </div>
                      )}
                    </td>

                    {/* Date column */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border text-text-primary dark:text-dark-text-primary"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-dark-text-secondary">
                          <Calendar className="w-3.5 h-3.5 text-accent-coral flex-shrink-0" />
                          <span>{exp.date}</span>
                        </div>
                      )}
                    </td>

                    {/* Amount column */}
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-dark-bg-app border border-border-card dark:border-dark-border text-text-primary dark:text-dark-text-primary text-right w-24 inline-block focus:outline-none focus:ring-2 focus:ring-accent-coral/20"
                        />
                      ) : (
                        <span className="text-xs font-black text-text-primary dark:text-dark-text-primary font-display">
                          {currency}{exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>

                    {/* Actions column - Only appears on hover */}
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(exp.id)}
                            className="px-2.5 py-1 bg-accent-green text-white text-[10px] font-extrabold rounded hover:opacity-90 cursor-pointer transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 bg-bg-app dark:bg-dark-bg-app text-text-primary dark:text-dark-text-primary text-[10px] font-bold rounded hover:opacity-90 cursor-pointer transition-all border border-border-soft dark:border-dark-border"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleStartEdit(exp)}
                            className="text-text-secondary hover:text-accent-coral p-1.5 rounded-full hover:bg-bg-app dark:hover:bg-dark-bg-app transition-all cursor-pointer hover:scale-105"
                            title="Edit row"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            className="text-text-secondary hover:text-accent-pink p-1.5 rounded-full hover:bg-bg-app dark:hover:bg-dark-bg-app transition-all cursor-pointer hover:scale-105"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
