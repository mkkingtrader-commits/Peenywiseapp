import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Expense, CATEGORY_COLORS } from "../types";
import { CreditCard, PieChart as PieIcon, BarChart3, TrendingUp } from "lucide-react";

interface SpendChartsProps {
  expenses: Expense[];
  currency: string;
  monthlyIncome: number;
}

export default function SpendCharts({ expenses, currency, monthlyIncome }: SpendChartsProps) {
  const [activeTab, setActiveTab] = useState<"category" | "daily" | "monthly">("category");

  // 1. Process Category Data
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach((exp) => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
        color: CATEGORY_COLORS[name] || "#6B7280",
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // 2. Process Daily / Weekly Data of the current month
  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    
    // Default last 7 days of spending
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    last7Days.forEach(day => {
      days[day] = 0;
    });

    expenses.forEach((exp) => {
      // Only group by date if it falls in the last 7 days
      if (days[exp.date] !== undefined) {
        days[exp.date] += exp.amount;
      } else {
        // If they have historical items, we can optionally track them, but let's stick to last 7 days for readable Bar chart
        const expDateStr = exp.date;
        const diffTime = Math.abs(new Date().getTime() - new Date(expDateStr).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          days[expDateStr] = (days[expDateStr] || 0) + exp.amount;
        }
      }
    });

    return Object.entries(days)
      .map(([date, amount]) => {
        // Format date to short readable string e.g. "Jun 28"
        const d = new Date(date);
        const formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
        return {
          rawDate: date,
          date: formattedDate,
          amount: parseFloat(amount.toFixed(2)),
        };
      })
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate));
  }, [expenses]);

  // 3. Process Monthly Trend Data (group by month)
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    
    // Pre-populate last 6 months
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    }).reverse();

    last6Months.forEach(m => {
      months[m] = 0;
    });

    expenses.forEach((exp) => {
      const d = new Date(exp.date);
      const mLabel = d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
      if (months[mLabel] !== undefined) {
        months[mLabel] += exp.amount;
      }
    });

    return Object.entries(months).map(([month, amount]) => ({
      month,
      spending: parseFloat(amount.toFixed(2)),
      limit: monthlyIncome,
    }));
  }, [expenses, monthlyIncome]);

  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  return (
    <div className="bg-white dark:bg-natural-dark-card rounded-3xl p-6 border border-natural-secondary dark:border-natural-dark-border shadow-sm transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6" id="spend-charts-header">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-natural-text dark:text-natural-dark-text flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-natural-primary" />
            Financial Analytics
          </h2>
          <p className="text-sm text-natural-muted dark:text-natural-subtle">
            Graphical insights into your spending patterns and category distributions
          </p>
        </div>

        {/* Chart View Toggle Controls */}
        <div className="flex bg-natural-secondary/60 dark:bg-natural-dark-bg/60 p-1 rounded-xl w-full sm:w-auto border border-natural-secondary/80 dark:border-natural-dark-border/40">
          <button
            onClick={() => setActiveTab("category")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "category"
                ? "bg-white dark:bg-natural-dark-card text-natural-text dark:text-natural-dark-text shadow-xs border border-natural-secondary/40 dark:border-natural-dark-border"
                : "text-natural-muted hover:text-natural-text dark:text-natural-subtle dark:hover:text-natural-dark-text"
            }`}
            id="btn-chart-category"
          >
            <PieIcon className="w-3.5 h-3.5" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab("daily")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "daily"
                ? "bg-white dark:bg-natural-dark-card text-natural-text dark:text-natural-dark-text shadow-xs border border-natural-secondary/40 dark:border-natural-dark-border"
                : "text-natural-muted hover:text-natural-text dark:text-natural-subtle dark:hover:text-natural-dark-text"
            }`}
            id="btn-chart-daily"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Daily Track
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "monthly"
                ? "bg-white dark:bg-natural-dark-card text-natural-text dark:text-natural-dark-text shadow-xs border border-natural-secondary/40 dark:border-natural-dark-border"
                : "text-natural-muted hover:text-natural-text dark:text-natural-subtle dark:hover:text-natural-dark-text"
            }`}
            id="btn-chart-monthly"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Monthly Trend
          </button>
        </div>
      </div>

      <div className="h-72 w-full flex items-center justify-center" id="chart-stage">
        {expenses.length === 0 ? (
          <div className="text-center p-8">
            <PieIcon className="w-12 h-12 text-natural-subtle mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-medium text-natural-text dark:text-natural-dark-text">No data available for charting</p>
            <p className="text-xs text-natural-muted mt-1">Add some expenses to generate active data visualizers.</p>
          </div>
        ) : activeTab === "category" ? (
          categoryData.length === 0 ? (
            <div className="text-natural-muted text-sm">Processing category data...</div>
          ) : (
            <div className="w-full h-full flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${currency}${parseFloat(value).toLocaleString()}`, "AmountSpent"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #EBE7DF",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.03)",
                        backgroundColor: "#F7F5F0",
                        color: "#3D352E"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend with percent indicator */}
              <div className="w-full md:w-1/2 max-h-full overflow-y-auto pr-2 flex flex-col gap-2">
                {categoryData.slice(0, 5).map((entry, index) => {
                  const percentage = totalExpense > 0 ? ((entry.value / totalExpense) * 100).toFixed(0) : "0";
                  return (
                    <div key={index} className="flex items-center justify-between p-2 rounded-xl hover:bg-natural-secondary/40 dark:hover:bg-natural-dark-bg/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs font-semibold text-natural-text dark:text-natural-dark-text">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-natural-text dark:text-natural-dark-text">{currency}{entry.value.toLocaleString()}</span>
                        <span className="text-[10px] text-natural-muted dark:text-natural-subtle ml-1.5">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
                {categoryData.length > 5 && (
                  <p className="text-[10px] text-center text-natural-muted dark:text-natural-subtle italic">
                    + {categoryData.length - 5} more categories
                  </p>
                )}
              </div>
            </div>
          )
        ) : activeTab === "daily" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#A3978E" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#A3978E" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${currency}${value}`} />
              <Tooltip
                formatter={(value: any) => [`${currency}${value}`, "Spend"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #EBE7DF",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.03)",
                  backgroundColor: "#F7F5F0",
                  color: "#3D352E"
                }}
              />
              <Bar dataKey="amount" fill="#846C5B" radius={[6, 6, 0, 0]} maxBarSize={45}>
                {dailyData.map((entry, index) => {
                  // highlight today differently
                  const todayStr = new Date().toISOString().split("T")[0];
                  const isToday = entry.rawDate === todayStr;
                  return <Cell key={`cell-${index}`} fill={isToday ? "#846C5B" : "#D4CFC7"} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#A3978E" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#A3978E" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${currency}${value}`} />
              <Tooltip
                formatter={(value: any) => [`${currency}${value}`, "Spends"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #EBE7DF",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.03)",
                  backgroundColor: "#F7F5F0",
                  color: "#3D352E"
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12, color: "#3D352E" }} />
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#846C5B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#846C5B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8FA88B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8FA88B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area type="monotone" name="Monthly Spends" dataKey="spending" stroke="#846C5B" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
              <Area type="monotone" name="Monthly Income Limit" dataKey="limit" stroke="#8FA88B" strokeWidth={1} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorIncome)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
