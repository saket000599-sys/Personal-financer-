import React, { useState } from 'react';
import { X, Target, DollarSign, Calendar, Tag, Sparkles } from 'lucide-react';
import { FinanceGoal } from '../types';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: Omit<FinanceGoal, 'id' | 'createdAt'>) => void;
}

const GOAL_CATEGORIES = [
  'Emergency',
  'Travel',
  'Major Purchase',
  'Investment',
  'Debt Payoff',
  'Retirement',
  'Real Estate',
  'Education',
  'Personal Milestone',
];

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  onAddGoal,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [category, setCategory] = useState('Emergency');
  const [targetDate, setTargetDate] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const initialSaved = parseFloat(currentAmount) || 0;
    const monthly = parseFloat(monthlyContribution) || Math.ceil((target - initialSaved) / 12) || 100;

    if (!title.trim() || isNaN(target) || target <= 0) return;

    onAddGoal({
      title: title.trim(),
      category,
      targetAmount: target,
      currentAmount: initialSaved,
      targetDate: targetDate || '',
      monthlyContribution: monthly,
      color: '#10B981',
      notes: notes.trim(),
    });

    // Reset & close
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate('');
    setMonthlyContribution('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Create Personal Finance Goal
              </h3>
              <p className="text-xs text-slate-400">
                Define savings target and automated timeline
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Goal Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 6-Month Emergency Reserve, Japan Vacation, Down Payment"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-white bg-slate-950/70 border border-slate-800 rounded-2xl focus:border-emerald-500 focus:outline-none placeholder-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Amount ($)
              </label>
              <input
                type="number"
                required
                step="1"
                min="1"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="10000"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-950/70 border border-slate-800 rounded-2xl focus:border-emerald-500 focus:outline-none placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Starting Saved ($)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-950/70 border border-slate-800 rounded-2xl focus:border-emerald-500 focus:outline-none placeholder-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-white bg-slate-950/70 border border-slate-800 rounded-2xl focus:border-emerald-500 focus:outline-none"
              >
                {GOAL_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Deadline
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-white bg-slate-950/70 border border-slate-800 rounded-2xl focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Monthly Auto-Deposit Contribution ($/mo)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              placeholder="e.g. 350"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-white bg-slate-950/70 border border-slate-800 rounded-2xl focus:border-emerald-500 focus:outline-none placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Personal Notes / Strategy
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why this goal matters and milestone notes..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm text-white bg-slate-950/70 border border-slate-800 rounded-2xl focus:border-emerald-500 focus:outline-none placeholder-slate-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-md shadow-emerald-500/20"
            >
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
