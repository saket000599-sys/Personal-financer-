import React, { useState } from 'react';
import {
  Sliders,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Scale,
} from 'lucide-react';
import { CategoryBudget, Transaction } from '../types';
import { CATEGORY_COLORS } from '../data/initialData';

interface BudgetManagerProps {
  budgets: CategoryBudget[];
  transactions: Transaction[];
  monthlyIncome: number;
  onUpdateBudget: (category: string, newAmount: number) => void;
  onApply503020Rule: () => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  budgets,
  transactions,
  monthlyIncome,
  onUpdateBudget,
  onApply503020Rule,
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editVal, setEditVal] = useState<string>('');

  // Calculate spent per category
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const spentMap: Record<string, number> = {};
  expenseTransactions.forEach((t) => {
    spentMap[t.category] = (spentMap[t.category] || 0) + t.amount;
  });

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);

  const startEdit = (b: CategoryBudget) => {
    setEditingCategory(b.category);
    setEditVal(b.allocatedAmount.toString());
  };

  const saveEdit = (category: string) => {
    const num = parseFloat(editVal);
    if (!isNaN(num) && num >= 0) {
      onUpdateBudget(category, num);
    }
    setEditingCategory(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/40 flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Category Budgets
            </h2>
            <p className="text-xs text-slate-400">
              Allocated: <strong className="text-white">${totalAllocated.toLocaleString()}</strong> of ${monthlyIncome.toLocaleString()}
            </p>
          </div>
        </div>

        <button
          id="btn-apply-503020-rule"
          onClick={onApply503020Rule}
          title="Auto-calculate allocations based on 50/30/20 principle"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-xs"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>50/30/20 Auto-Align</span>
        </button>
      </div>

      {/* Budget List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {budgets.map((b) => {
          const spent = spentMap[b.category] || 0;
          const remaining = b.allocatedAmount - spent;
          const percent = b.allocatedAmount > 0 ? Math.min(100, Math.round((spent / b.allocatedAmount) * 100)) : 0;
          const isOver = spent > b.allocatedAmount;

          return (
            <div
              key={b.category}
              className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[b.category] || '#64748B' }}
                  />
                  <span className="text-xs font-bold text-white">{b.category}</span>
                </div>

                {editingCategory === b.category ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      className="w-20 px-2 py-0.5 text-xs font-bold text-white bg-slate-900 border border-emerald-500 rounded-lg focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(b.category)}
                      className="px-2 py-0.5 text-xs font-bold bg-emerald-500 text-slate-950 rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(b)}
                    className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1"
                  >
                    <span>${b.allocatedAmount.toLocaleString()} cap</span>
                    <span className="text-[10px] text-emerald-400 font-bold">✎</span>
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : percent > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Spent: ${Math.round(spent).toLocaleString()} ({percent}%)</span>
                  <span className={isOver ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {isOver ? `Over by $${Math.round(Math.abs(remaining))}` : `$${Math.round(remaining)} remaining`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Guidance */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span>Click ✎ to customize limits</span>
        <span className="text-emerald-400 font-bold">Smart Cap Alerts Active</span>
      </div>
    </div>
  );
};
