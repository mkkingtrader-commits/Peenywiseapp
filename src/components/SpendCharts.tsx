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
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

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
        color: CATEGORY_COLORS[name] || "#B3A79F",
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
      if (days[exp.date] !== undefined) {
        days[exp.date] += exp.amount;
      } else {
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
    <div className="bg-bg-card dark:bg-dark-bg-card rounded-2xl p-5 border border-border-card dark:border-dark-border shadow-[0_2px_12px_rgba(43,35,32,0.06)] hover:shadow-[0_4px_20px_rgba(43,35,32,0.1)] transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6" id="spend-charts-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-bg-card-alt dark:bg-dark-bg-app text-accent-coral border border-border-soft dark:border-dark-border">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-text-primary dark:text-dark-text-primary flex items-center gap-2 font-display">
              Financial Analytics
            </h2>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
              Graphical insights into your spending patterns and category distributions
            </p>
          </div>
        </div>

        {/* Tab switcher pill toggle with active state bg */}
        <div className="flex bg-bg-app dark:bg-dark-bg-app p-1 rounded-full border border-border-soft dark:border-dark-border w-full sm:w-auto relative">
          <button
            onClick={() => setActiveTab("category")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 cursor-pointer ${
              activeTab === "category"
                ? "bg-accent-gradient text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
            }`}
            id="btn-chart-category"
          >
            <PieIcon className="w-3.5 h-3.5" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab("daily")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 cursor-pointer ${
              activeTab === "daily"
                ? "bg-accent-gradient text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
            }`}
            id="btn-chart-daily"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Daily Track
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 cursor-pointer ${
              activeTab === "monthly"
                ? "bg-accent-gradient text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
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
            <div className="w-16 h-16 mx-auto mb-4 bg-bg-card-alt dark:bg-dark-bg-app rounded-full flex items-center justify-center text-accent-coral border border-border-soft dark:border-dark-border animate-pulse">
              <PieIcon className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary">No data available for charting</p>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1 max-w-xs mx-auto">
              Add some expenses to generate beautiful active data visualizers.
            </p>
          </div>
        ) : activeTab === "category" ? (
          categoryData.length === 0 ? (
            <div className="text-text-secondary dark:text-dark-text-secondary text-sm">Processing category data...</div>
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
                      {categoryData.map((entry, index) => {
                        const isHovered = hoveredCategory === entry.name;
                        const hasHoverSelection = hoveredCategory !== null;
                        const opacityVal = hasHoverSelection && !isHovered ? 0.4 : 1.0;
                        const scaleTransform = isHovered ? 2.5 : 0;
                        
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            opacity={opacityVal}
                            stroke={entry.color}
                            strokeWidth={scaleTransform}
                            style={{ 
                              transition: "all 0.20s ease-in-out",
                              filter: isHovered ? "drop-shadow(0px 0px 6px rgba(255, 138, 101, 0.4))" : "none"
                            }}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${currency}${parseFloat(value).toLocaleString()}`, "Amount Spent"]}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid #EFE2DA",
                        boxShadow: "0 4px 12px rgba(43,35,32,0.06)",
                        backgroundColor: "#FFFFFF",
                        color: "#2B2320",
                        fontFamily: "var(--font-sans)",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend with interactive highlight */}
              <div className="w-full md:w-1/2 max-h-full overflow-y-auto pr-2 flex flex-col gap-1.5">
                {categoryData.slice(0, 5).map((entry, index) => {
                  const percentage = totalExpense > 0 ? ((entry.value / totalExpense) * 100).toFixed(0) : "0";
                  const isHovered = hoveredCategory === entry.name;
                  return (
                    <div 
                      key={index} 
                      onMouseEnter={() => setHoveredCategory(entry.name)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                        isHovered 
                          ? "bg-bg-card-alt dark:bg-dark-bg-card border-l-4 border-l-accent-coral pl-3 shadow-xs" 
                          : "hover:bg-bg-app dark:hover:bg-dark-bg-app border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs font-bold text-text-primary dark:text-dark-text-primary">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-text-primary dark:text-dark-text-primary">{currency}{entry.value.toLocaleString()}</span>
                        <span className="text-[10px] text-text-secondary dark:text-dark-text-secondary ml-1.5">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
                {categoryData.length > 5 && (
                  <p className="text-[10px] text-center text-text-secondary dark:text-dark-text-secondary italic mt-1">
                    + {categoryData.length - 5} more categories
                  </p>
                )}
              </div>
            </div>
          )
        ) : activeTab === "daily" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#B3A79F" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#B3A79F" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${currency}${value}`} />
              <Tooltip
                formatter={(value: any) => [`${currency}${value}`, "Daily Spend"]}
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid #EFE2DA",
                  boxShadow: "0 4px 12px rgba(43,35,32,0.06)",
                  backgroundColor: "#FFFFFF",
                  color: "#2B2320",
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              />
              <Bar dataKey="amount" fill="#FF8A65" radius={[6, 6, 0, 0]} maxBarSize={45}>
                {dailyData.map((entry, index) => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  const isToday = entry.rawDate === todayStr;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isToday ? "url(#accentGrad)" : "#F0E4DC"} 
                      style={{ transition: "all 0.2s ease" }}
                    />
                  );
                })}
              </Bar>
              <defs>
                <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF8A65" />
                  <stop offset="100%" stopColor="#F4568C" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#B3A79F" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#B3A79F" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${currency}${value}`} />
              <Tooltip
                formatter={(value: any) => [`${currency}${value}`, "Monthly Spend"]}
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid #EFE2DA",
                  boxShadow: "0 4px 12px rgba(43,35,32,0.06)",
                  backgroundColor: "#FFFFFF",
                  color: "#2B2320",
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, fontWeight: "600" }} />
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF8A65" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF8A65" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF7D" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4CAF7D" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area type="monotone" name="Monthly Spends" dataKey="spending" stroke="#FF8A65" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpend)" />
              <Area type="monotone" name="Income limit" dataKey="limit" stroke="#4CAF7D" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorIncome)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
