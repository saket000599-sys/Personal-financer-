import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  Target,
  Calendar,
  DollarSign,
  Scissors,
  CheckCircle2,
  Send,
  HelpCircle,
} from 'lucide-react';
import { FinanceGoal, GoalCoachResponse } from '../types';
import { consultGoalCoach } from '../services/api';

interface GoalDetailCoachModalProps {
  goal: FinanceGoal | null;
  isOpen: boolean;
  onClose: () => void;
  monthlyIncome: number;
  currentMonthlyExpenses: number;
}

export const GoalDetailCoachModal: React.FC<GoalDetailCoachModalProps> = ({
  goal,
  isOpen,
  onClose,
  monthlyIncome,
  currentMonthlyExpenses,
}) => {
  const [coachData, setCoachData] = useState<GoalCoachResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isAskingFollowup, setIsAskingFollowup] = useState(false);

  useEffect(() => {
    if (isOpen && goal) {
      fetchAdvice();
    } else {
      setCoachData(null);
      setCustomQuestion('');
    }
  }, [isOpen, goal]);

  const fetchAdvice = async (question?: string) => {
    if (!goal) return;
    if (question) {
      setIsAskingFollowup(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await consultGoalCoach(goal, monthlyIncome, currentMonthlyExpenses, question);
      setCoachData(res);
    } catch (err) {
      console.error('Error fetching goal coach data:', err);
    } finally {
      setIsLoading(false);
      setIsAskingFollowup(false);
    }
  };

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  AI Goal Strategy Coach
                </h3>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {goal.category}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pacing roadmap for &ldquo;{goal.title}&rdquo;
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Quick Goal Summary Banner */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Target</span>
              <div className="text-lg font-black text-white">${goal.targetAmount.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Saved</span>
              <div className="text-lg font-black text-emerald-400">${goal.currentAmount.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Remaining</span>
              <div className="text-lg font-black text-indigo-400">${remaining.toLocaleString()}</div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-xs font-semibold">Generating customized financial optimization strategy...</p>
            </div>
          ) : coachData ? (
            <>
              {/* Core Advice */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  Tailored Action Plan
                </h4>
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs sm:text-sm text-indigo-200 leading-relaxed font-medium">
                  {coachData.advice}
                </div>
              </div>

              {/* Monthly Contribution Guideline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Suggested Savings / Month</span>
                  <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-1">
                    ${coachData.recommendedMonthlyContribution}
                    <span className="text-xs text-slate-500 font-normal">/mo</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Projected Completion</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {coachData.suggestedTargetDate || goal.targetDate || 'On Schedule'}
                  </div>
                </div>
              </div>

              {/* Milestone Roadmap */}
              {coachData.milestones && coachData.milestones.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Milestone Checkpoints
                  </h4>
                  <div className="space-y-2">
                    {coachData.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex items-start gap-3 text-xs"
                      >
                        <div className="px-2.5 py-1 rounded-xl bg-slate-800 font-black text-emerald-400 shrink-0 border border-slate-700">
                          ${m.target.toLocaleString()}
                        </div>
                        <p className="text-slate-300 pt-0.5 font-medium">{m.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top 3 Expense Cuts Suggestions */}
              {coachData.top3ExpenseCuts && coachData.top3ExpenseCuts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-rose-400" />
                    Recommended Expense Trims
                  </h4>
                  <div className="space-y-1.5">
                    {coachData.top3ExpenseCuts.map((cut, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 flex items-center gap-2.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                        <span className="font-medium">{cut}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up question */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  Ask AI Coach a Custom Question
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="e.g. How can I reach this 2 months faster?"
                    className="flex-1 px-3.5 py-2.5 text-xs text-white bg-slate-950/70 border border-slate-800 rounded-2xl focus:border-emerald-500 focus:outline-none placeholder-slate-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customQuestion.trim()) {
                        e.preventDefault();
                        fetchAdvice(customQuestion.trim());
                      }
                    }}
                  />
                  <button
                    onClick={() => customQuestion.trim() && fetchAdvice(customQuestion.trim())}
                    disabled={isAskingFollowup || !customQuestion.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-2xl transition-all"
                  >
                    {isAskingFollowup ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Ask</span>
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl"
          >
            Close Coach
          </button>
        </div>
      </div>
    </div>
  );
};
