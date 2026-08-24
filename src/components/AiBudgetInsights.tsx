import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  Transaction,
  FinanceGoal,
  CategoryBudget,
  AiBudgetInsightsResponse,
} from '../types';
import { generateBudgetInsights } from '../services/api';

interface AiBudgetInsightsProps {
  transactions: Transaction[];
  goals: FinanceGoal[];
  budgets: CategoryBudget[];
  monthlyIncome: number;
  currentMonth: string;
}

export const AiBudgetInsights: React.FC<AiBudgetInsightsProps> = ({
  transactions,
  goals,
  budgets,
  monthlyIncome,
  currentMonth,
}) => {
  const [insights, setInsights] = useState<AiBudgetInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateBudgetInsights(
        transactions,
        goals,
        budgets,
        monthlyIncome,
        currentMonth
      );
      setInsights(data);
    } catch (err: any) {
      console.error('Error loading budget insights:', err);
      setError(err.message || 'Unable to generate budget insights');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [transactions.length, goals.length, monthlyIncome]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/40 flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              AI Financial Intelligence
            </h2>
            <p className="text-xs text-slate-400">
              Autonomous budget audit & savings opportunities
            </p>
          </div>
        </div>

        <button
          id="btn-refresh-insights"
          onClick={fetchInsights}
          disabled={isLoading}
          title="Re-run ML budget model"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Analyzing...' : 'Audit'}</span>
        </button>
      </div>

      {/* Content Body */}
      {isLoading && !insights ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold">Running multi-factor cash flow heuristics...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <div className="font-bold">Analysis Interrupted</div>
            <div>{error}</div>
          </div>
        </div>
      ) : insights ? (
        <div className="space-y-4">
          {/* Executive Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400">
                Health Score: {insights.summaryScore}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {insights.savingsRatePercentage}% Savings Velocity
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {insights.executiveSummary}
            </p>
          </div>

          {/* Actionable Recommendations Bento List */}
          {insights.actionableRecommendations && insights.actionableRecommendations.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Actionable Savings Steps
              </span>
              <div className="space-y-2">
                {insights.actionableRecommendations.slice(0, 2).map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{rec.title}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {rec.category}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{rec.action}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-xs font-black text-emerald-400">
                        +${rec.potentialMonthlySavings}/mo
                      </div>
                      <span className="text-[9px] font-bold text-indigo-400 uppercase">
                        {rec.impactLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spending Spikes & Anomalies */}
          {insights.anomalies && insights.anomalies.length > 0 && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Detected Velocity Anomaly: {insights.anomalies[0].category}</span>
              </div>
              <p className="text-amber-200/90 text-[11px]">
                {insights.anomalies[0].observation} {insights.anomalies[0].actionableTip}
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-500" />
          Refreshed in real-time
        </span>
        <span className="text-emerald-400 font-bold">100% Client-Safe API</span>
      </div>
    </div>
  );
};
