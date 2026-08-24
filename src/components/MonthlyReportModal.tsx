import React from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  PieChart,
  ShieldCheck,
} from 'lucide-react';
import { Transaction, FinanceGoal, CategoryBudget } from '../types';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  goals: FinanceGoal[];
  budgets: CategoryBudget[];
  monthlyIncome: number;
  currentMonth: string;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  goals,
  budgets,
  monthlyIncome,
  currentMonth,
}) => {
  if (!isOpen) return null;

  const expenseTx = transactions.filter((t) => t.type === 'expense');
  const incomeTx = transactions.filter((t) => t.type === 'income');

  const totalExpense = expenseTx.reduce((acc, t) => acc + t.amount, 0);
  const actualIncome = incomeTx.reduce((acc, t) => acc + t.amount, 0);
  const effectiveIncome = actualIncome > 0 ? actualIncome : monthlyIncome;
  const netSavings = effectiveIncome - totalExpense;
  const savingsRate = effectiveIncome > 0 ? Math.round((netSavings / effectiveIncome) * 100) : 0;

  // Category aggregations
  const categoryMap: Record<string, number> = {};
  expenseTx.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(categoryMap)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-3xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Monthly Financial Audit & Performance Statement
              </h3>
              <p className="text-xs text-slate-400">
                Period: {currentMonth} • Generated via FinTrack ML
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Statement Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-200">
          {/* Statement Header for Print */}
          <div className="border-b border-slate-800 pb-4 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">FinTrack Intelligence</span>
              <h2 className="text-2xl font-black text-white mt-1">Statement of Cash Flows & Goals</h2>
              <p className="text-xs text-slate-400">Statement Period: {currentMonth}-01 to {currentMonth}-28/31</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {savingsRate >= 20 ? 'Grade A+: High Surplus' : 'Grade B: Moderate Surplus'}
              </span>
            </div>
          </div>

          {/* Key Summary 4-Column Bento Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Income</span>
              <div className="text-lg font-black text-white mt-1">
                ${effectiveIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Outflow</span>
              <div className="text-lg font-black text-rose-400 mt-1">
                ${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Net Surplus</span>
              <div className="text-lg font-black text-emerald-400 mt-1">
                ${netSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Savings Rate</span>
              <div className="text-lg font-black text-indigo-400 mt-1">
                {savingsRate}%
              </div>
            </div>
          </div>

          {/* Category Spending Breakdown Table */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Categorical Expense Distribution
            </h4>
            <div className="border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80 bg-slate-950/40 text-xs">
              <div className="grid grid-cols-12 p-3 font-bold text-slate-400 bg-slate-950/80 uppercase tracking-wider text-[10px]">
                <div className="col-span-6">Category</div>
                <div className="col-span-3 text-right">Amount</div>
                <div className="col-span-3 text-right">% of Total</div>
              </div>
              {sortedCategories.map((c) => (
                <div key={c.category} className="grid grid-cols-12 p-3 items-center">
                  <div className="col-span-6 font-bold text-white">{c.category}</div>
                  <div className="col-span-3 text-right font-black text-slate-300">
                    ${c.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="col-span-3 text-right font-bold text-emerald-400">
                    {c.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals Pacing Overview */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Financial Goals Trajectory
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goals.map((g) => {
                const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                return (
                  <div key={g.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">{g.title}</span>
                      <span className="text-emerald-400">{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>${g.currentAmount.toLocaleString()} saved</span>
                      <span>Target: ${g.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-800 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
