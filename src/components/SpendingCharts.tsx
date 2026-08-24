import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { Transaction, CategoryBudget } from '../types';
import { CATEGORY_COLORS } from '../data/initialData';

interface SpendingChartsProps {
  transactions: Transaction[];
  budgets: CategoryBudget[];
}

export const SpendingCharts: React.FC<SpendingChartsProps> = ({
  transactions,
  budgets,
}) => {
  const [chartType, setChartType] = useState<'donut' | 'budget_vs_actual' | 'velocity'>('donut');

  // Compute expenses by category
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  const categoryTotalsMap: Record<string, number> = {};
  expenseTransactions.forEach((t) => {
    categoryTotalsMap[t.category] = (categoryTotalsMap[t.category] || 0) + t.amount;
  });

  const categoryPieData = Object.entries(categoryTotalsMap)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: CATEGORY_COLORS[name] || '#64748B',
      percentage: totalExpense > 0 ? Math.round((value / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Budget vs Actual dataset
  const budgetVsActualData = budgets.map((b) => {
    const actual = categoryTotalsMap[b.category] || 0;
    return {
      category: b.category,
      Budgeted: b.allocatedAmount,
      Actual: Math.round(actual),
      isOver: actual > b.allocatedAmount,
    };
  });

  // Cumulative spending timeline dataset
  const sortedExpenses = [...expenseTransactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let cumulative = 0;
  const velocityDataMap: Record<string, number> = {};
  sortedExpenses.forEach((tx) => {
    const day = tx.date.slice(5); // MM-DD
    cumulative += tx.amount;
    velocityDataMap[day] = Math.round(cumulative);
  });

  const velocityData = Object.entries(velocityDataMap).map(([day, total]) => ({
    day,
    TotalSpent: total,
  }));

  // Custom Dark Tooltip
  const CustomDarkTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <div className="font-bold text-white">{label || payload[0]?.name}</div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span>{entry.name}:</span>
              <span className="font-bold text-white">${entry.value?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/40 space-y-4">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BarChart3 className="w-4 h-4" />
            </span>
            Spending Visualizer Suite
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time categorical allocation, variance & spending trajectory
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center p-1 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setChartType('donut')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              chartType === 'donut'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Breakdown
          </button>
          <button
            onClick={() => setChartType('budget_vs_actual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              chartType === 'budget_vs_actual'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Budget Variance
          </button>
          <button
            onClick={() => setChartType('velocity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              chartType === 'velocity'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Velocity
          </button>
        </div>
      </div>

      {/* Charts Display Stage */}
      <div className="pt-2">
        {chartType === 'donut' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Donut Chart */}
            <div className="md:col-span-6 h-64 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#020617"
                    strokeWidth={3}
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomDarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Donut Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Spent</span>
                <span className="text-xl font-black text-white">
                  ${totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Category breakdown pill list */}
            <div className="md:col-span-6 space-y-2 max-h-64 overflow-y-auto pr-1">
              {categoryPieData.slice(0, 6).map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-md shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-bold text-white">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">
                      ${cat.value.toLocaleString()}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-black text-emerald-400">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {chartType === 'budget_vs_actual' && (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActualData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="category"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomDarkTooltip />} />
                <Bar dataKey="Budgeted" fill="#334155" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Actual" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartType === 'velocity' && (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomDarkTooltip />} />
                <Area
                  type="monotone"
                  dataKey="TotalSpent"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#velocityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
