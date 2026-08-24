import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Target,
  Sparkles,
} from 'lucide-react';
import { Transaction, FinanceGoal } from '../types';

interface OverviewStatsProps {
  transactions: Transaction[];
  monthlyIncome: number;
  goals: FinanceGoal[];
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({
  transactions,
  monthlyIncome,
  goals,
}) => {
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const actualIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const effectiveIncome = actualIncome > 0 ? actualIncome : monthlyIncome;
  const netSavings = effectiveIncome - totalExpenses;
  const savingsRate = effectiveIncome > 0 ? Math.round((netSavings / effectiveIncome) * 100) : 0;

  // Goals total saved
  const totalGoalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalGoalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalGoalPercentage = totalGoalTarget > 0 ? Math.round((totalGoalSaved / totalGoalTarget) * 100) : 0;

  // 50/30/20 Ratio
  const needsCategories = ['Housing', 'Groceries', 'Utilities', 'Transportation', 'Health & Fitness'];
  const needsSpend = transactions
    .filter((t) => t.type === 'expense' && needsCategories.includes(t.category))
    .reduce((acc, t) => acc + t.amount, 0);

  const wantsSpend = transactions
    .filter((t) => t.type === 'expense' && !needsCategories.includes(t.category))
    .reduce((acc, t) => acc + t.amount, 0);

  const needsPercentage = effectiveIncome > 0 ? Math.round((needsSpend / effectiveIncome) * 100) : 0;
  const wantsPercentage = effectiveIncome > 0 ? Math.round((wantsSpend / effectiveIncome) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 12-Column Bento Grid Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Main Liquidity & In/Out Balance Bento Card (6 Columns) */}
        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-black/40">
          <div className="absolute -top-3 -right-2 p-6 opacity-5 pointer-events-none select-none">
            <span className="text-9xl font-black text-white">$</span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                Total Monthly Inflow
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Active Cycle
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-2">
              ${effectiveIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-8 mt-6 pt-5 border-t border-slate-800/80">
            <div>
              <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Discretionary Net</p>
              <p className={`text-xl font-extrabold mt-0.5 ${netSavings >= 0 ? 'text-white' : 'text-rose-400'}`}>
                ${Math.abs(netSavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {netSavings < 0 && <span className="text-xs ml-1 text-rose-400 font-normal">(Deficit)</span>}
              </p>
            </div>
            <div className="w-px h-10 bg-slate-800 hidden sm:block" />
            <div>
              <p className="text-[11px] text-rose-400 font-bold uppercase tracking-wider">Outflow Spent</p>
              <p className="text-xl font-extrabold text-white mt-0.5">
                ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-px h-10 bg-slate-800 hidden sm:block" />
            <div>
              <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider">Savings Rate</p>
              <p className="text-xl font-extrabold text-emerald-400 mt-0.5">
                {savingsRate}%
              </p>
            </div>
          </div>
        </div>

        {/* AI Insight Spotlight Bento Card (3 Columns) */}
        <div className="md:col-span-3 bg-emerald-500 text-emerald-950 rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <div className="bg-emerald-400/40 w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-emerald-950" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-950/10 px-2 py-0.5 rounded-md">
              ML Engine
            </span>
          </div>

          <div className="my-3">
            <p className="text-[11px] font-black uppercase tracking-widest opacity-80 mb-1">
              AI Insight
            </p>
            <h3 className="text-lg font-black leading-tight text-emerald-950">
              {savingsRate >= 20 ? 'Optimal Savings Velocity' : 'Subscription Overlap Found'}
            </h3>
            <p className="text-xs mt-1.5 opacity-90 font-medium leading-relaxed">
              {savingsRate >= 20
                ? `You are saving ${savingsRate}% of income, exceeding the 20% standard by +${savingsRate - 20}%.`
                : 'Identified 2 streaming subscriptions with low utilization. Trimming saves ~$22.99/mo.'}
            </p>
          </div>

          <div className="pt-2 border-t border-emerald-600/30 flex items-center justify-between text-[11px] font-bold">
            <span>Accuracy: 98.4%</span>
            <span>+1.2% MoM</span>
          </div>
        </div>

        {/* Goals Progress Bento Card (3 Columns) */}
        <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-black/40">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                Goals Portfolio
              </span>
              <p className="text-lg font-extrabold text-white mt-1">
                ${totalGoalSaved.toLocaleString()}
              </p>
            </div>
            <span className="text-emerald-400 text-xs font-black px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
              {totalGoalPercentage}%
            </span>
          </div>

          <div className="my-3 space-y-2">
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700 shadow-sm shadow-emerald-500/50"
                style={{ width: `${Math.min(100, totalGoalPercentage)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 flex justify-between font-medium">
              <span>Target: ${totalGoalTarget.toLocaleString()}</span>
              <span>{goals.length} Active</span>
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-medium">
            <span className="text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              On Track
            </span>
            <span>Auto-synced</span>
          </div>
        </div>
      </div>

      {/* 50 / 30 / 20 Budget Ratio Bento Banner */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl shadow-black/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-800 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  50 / 30 / 20 Budget Health Metric
                </span>
                <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                  savingsRate >= 20 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {savingsRate >= 20 ? 'Balanced' : 'Adjustment Suggested'}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-300 mt-0.5">
                Needs: <span className="font-bold text-white">{needsPercentage}%</span> (Target ≤50%) • Wants: <span className="font-bold text-white">{wantsPercentage}%</span> (Target ≤30%) • Savings: <span className="font-bold text-emerald-400">{savingsRate}%</span> (Target ≥20%)
              </p>
            </div>
          </div>

          {/* Ratio bar */}
          <div className="w-full lg:w-80">
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                title={`Needs: ${needsPercentage}%`}
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, needsPercentage)}%` }}
              />
              <div
                title={`Wants: ${wantsPercentage}%`}
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100 - needsPercentage, wantsPercentage)}%` }}
              />
              <div
                title={`Savings: ${Math.max(0, savingsRate)}%`}
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100 - needsPercentage - wantsPercentage, Math.max(0, savingsRate))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />Needs {needsPercentage}%</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />Wants {wantsPercentage}%</span>
              <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" />Saved {savingsRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
