import React, { useState } from 'react';
import {
  Target,
  Plus,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  Trash2,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FinanceGoal } from '../types';

interface GoalsSectionProps {
  goals: FinanceGoal[];
  onAddGoal: (goal: Omit<FinanceGoal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (id: string, updates: Partial<FinanceGoal>) => void;
  onDeleteGoal: (id: string) => void;
  onOpenCoachForGoal: (goal: FinanceGoal) => void;
  onOpenNewGoalModal: () => void;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onOpenCoachForGoal,
  onOpenNewGoalModal,
}) => {
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('100');

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore if canvas-confetti is not loaded
    }
  };

  const handleDeposit = (goal: FinanceGoal) => {
    const amt = parseFloat(depositAmount);
    if (!isNaN(amt) && amt > 0) {
      const newAmount = goal.currentAmount + amt;
      onUpdateGoal(goal.id, { currentAmount: newAmount });
      setDepositGoalId(null);
      setDepositAmount('100');

      if (newAmount >= goal.targetAmount) {
        triggerCelebration();
      }
    }
  };

  const calculateMonthsRemaining = (targetDate: string) => {
    if (!targetDate) return null;
    const now = new Date();
    const target = new Date(targetDate);
    const diffMonths = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    return Math.max(0, diffMonths);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Personal Finance Goals Portfolio
            </h2>
            <p className="text-xs text-slate-400">
              Target milestones with autonomous AI savings pacing
            </p>
          </div>
        </div>

        <button
          id="btn-create-goal-section"
          onClick={onOpenNewGoalModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals Grid - 2 Column Bento Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const progressPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
          const monthsLeft = calculateMonthsRemaining(goal.targetDate);
          const isAchieved = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl shadow-black/40 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {goal.category}
                      </span>
                      {isAchieved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Achieved!
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mt-2">
                      {goal.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    title="Delete goal"
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress Numbers & Bar */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-white">
                        ${goal.currentAmount.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 font-medium ml-1.5">
                        / ${goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm font-black text-emerald-400">
                      {progressPercent}%
                    </span>
                  </div>

                  <div className="relative w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isAchieved ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Milestone checkpoints */}
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold px-0.5 uppercase tracking-wider">
                    <span className={progressPercent >= 25 ? 'text-slate-300' : ''}>25%</span>
                    <span className={progressPercent >= 50 ? 'text-slate-300' : ''}>50% Halfway</span>
                    <span className={progressPercent >= 75 ? 'text-slate-300' : ''}>75%</span>
                    <span className={progressPercent >= 100 ? 'text-emerald-400' : ''}>Goal Met</span>
                  </div>
                </div>

                {/* Meta Row */}
                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {monthsLeft !== null ? `${monthsLeft} mos remaining` : 'Flexible Target'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>${goal.monthlyContribution}/mo pacing</span>
                  </div>
                </div>

                {goal.notes && (
                  <p className="mt-2 text-xs text-slate-400 italic line-clamp-1 bg-slate-950/40 p-2 rounded-xl border border-slate-800/60">
                    &ldquo;{goal.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                {depositGoalId === goal.id ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1.5 text-xs text-emerald-400 font-bold">$</span>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full pl-6 pr-2 py-1 text-xs text-white bg-slate-950 border border-emerald-500 rounded-xl focus:outline-none"
                        placeholder="Amount"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => handleDeposit(goal)}
                      className="px-3 py-1 text-xs font-bold bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => setDepositGoalId(null)}
                      className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setDepositGoalId(goal.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-colors border border-slate-700"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Contribute</span>
                    </button>

                    <button
                      onClick={() => onOpenCoachForGoal(goal)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 rounded-xl transition-colors ml-auto shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>AI Coach Strategy</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
