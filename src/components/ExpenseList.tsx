import React, { useState } from "react";
import { Expense, CATEGORIES, CATEGORY_COLORS } from "../types";
import { Search, Filter, Trash2, Edit2, Plus, Calendar, ArrowUpDown, ChevronDown } from "lucide-react";

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
      if (sortBy === "amount-asc") return a.amount - a.amount;
      return 0;
    });

  return (
    <div className="bg-white dark:bg-natural-dark-card rounded-3xl p-6 border border-natural-secondary dark:border-natural-dark-border shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center mb-5" id="expense-list-title-sec">
        <div>
          <h2 className="text-base font-bold text-natural-text dark:text-natural-dark-text">Expense Transaction History</h2>
          <p className="text-xs text-natural-muted dark:text-natural-subtle">Log new spends manually or search historical spends</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-natural-primary hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-natural-primary/10 cursor-pointer"
          id="btn-toggle-add-expense"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Expense
        </button>
      </div>

      {/* Add New Expense Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-2xl bg-natural-bg/50 dark:bg-natural-dark-bg/60 border border-natural-secondary dark:border-natural-dark-border space-y-3" id="add-expense-form">
          <h3 className="text-xs font-bold text-natural-muted dark:text-natural-subtle uppercase tracking-wider">Manual Spend Specification</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-natural-muted dark:text-natural-subtle mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g. Wholefoods Groceries, Uber ride"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-natural-dark-card border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text placeholder-natural-subtle dark:placeholder-natural-muted"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-natural-muted dark:text-natural-subtle mb-1">Amount ({currency})</label>
              <input
                type="number"
                step="0.01"
                placeholder="24.50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0.01"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-natural-dark-card border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text placeholder-natural-subtle dark:placeholder-natural-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-natural-muted dark:text-natural-subtle mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-natural-dark-card border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-natural-muted dark:text-natural-subtle mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-1.5 text-xs rounded-xl bg-white dark:bg-natural-dark-card border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text"
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
              Log Spent
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4" id="filters-panel">
        <div className="relative">
          <Search className="w-4 h-4 text-natural-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-natural-secondary/40 dark:bg-natural-dark-bg border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text"
          />
        </div>

        <div className="relative">
          <Filter className="w-4 h-4 text-natural-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-natural-secondary/40 dark:bg-natural-dark-bg border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text appearance-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-natural-subtle absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <ArrowUpDown className="w-4 h-4 text-natural-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-natural-secondary/40 dark:bg-natural-dark-bg border border-natural-secondary dark:border-natural-dark-border focus:outline-none focus:ring-2 focus:ring-natural-primary/15 focus:border-natural-primary text-natural-text dark:text-natural-dark-text appearance-none cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-natural-subtle absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Transaction Records List */}
      <div className="overflow-x-auto" id="transactions-records-stage">
        {filteredAndSortedExpenses.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-natural-secondary dark:border-natural-dark-border rounded-2xl">
            <Search className="w-8 h-8 text-natural-subtle mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-semibold text-natural-text dark:text-natural-dark-text">No matching transactions found</p>
            <p className="text-xs text-natural-muted mt-1">Try resetting filters or logging a new spend item.</p>
          </div>
        ) : (
          <table className="w-full min-w-[500px] text-left border-collapse">
            <thead>
              <tr className="border-b border-natural-secondary dark:border-natural-dark-border text-[10px] uppercase font-bold text-natural-muted dark:text-natural-subtle tracking-wider">
                <th className="py-3 px-4">Transaction Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedExpenses.map((exp) => {
                const isEditing = editingId === exp.id;
                const catColor = CATEGORY_COLORS[exp.category] || "#6B7280";

                return (
                  <tr
                    key={exp.id}
                    className="border-b border-natural-secondary dark:border-natural-dark-border hover:bg-natural-secondary/30 dark:hover:bg-natural-dark-bg/50 transition-colors"
                  >
                    {/* Description column */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="px-2 py-1 text-xs rounded bg-white dark:bg-natural-dark-card border border-natural-secondary dark:border-natural-dark-border text-natural-text dark:text-natural-dark-text w-full"
                        />
                      ) : (
                        <span className="text-xs font-bold text-natural-text dark:text-natural-dark-text">{exp.description}</span>
                      )}
                    </td>

                    {/* Category column */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="px-2 py-1 text-xs rounded bg-white dark:bg-natural-dark-card border border-natural-secondary dark:border-natural-dark-border text-natural-text dark:text-natural-dark-text"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: catColor }} />
                          <span className="text-xs font-semibold text-natural-muted dark:text-natural-subtle">{exp.category}</span>
                        </div>
                      )}
                    </td>

                    {/* Date column */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="px-2 py-1 text-xs rounded bg-white dark:bg-natural-dark-card border border-natural-secondary dark:border-natural-dark-border text-natural-text dark:text-natural-dark-text"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-natural-muted dark:text-natural-subtle">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{exp.date}</span>
                        </div>
                      )}
                    </td>

                    {/* Amount column */}
                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="px-2 py-1 text-xs rounded bg-white dark:bg-natural-dark-card border border-natural-secondary dark:border-natural-dark-border text-natural-text dark:text-natural-dark-text text-right w-24 inline-block"
                        />
                      ) : (
                        <span className="text-xs font-extrabold text-natural-text dark:text-natural-dark-text">
                          {currency}{exp.amount.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Actions column */}
                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(exp.id)}
                            className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded hover:bg-emerald-700 cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 bg-natural-secondary dark:bg-natural-dark-bg text-natural-text dark:text-natural-dark-text text-[10px] font-bold rounded hover:opacity-90 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleStartEdit(exp)}
                            className="text-natural-subtle hover:text-natural-primary p-1.5 rounded-lg hover:bg-natural-secondary dark:hover:bg-natural-dark-bg transition-colors cursor-pointer"
                            title="Edit row"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            className="text-natural-subtle hover:text-red-600 p-1.5 rounded-lg hover:bg-natural-secondary dark:hover:bg-natural-dark-bg transition-colors cursor-pointer"
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
