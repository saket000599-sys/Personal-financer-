import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Repeat,
  Tag,
  Loader2,
  Zap,
  Check,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { categorizeExpenseWithAi } from '../services/api';
import { DEFAULT_CATEGORIES } from '../data/initialData';

interface QuickAddExpenseProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  existingCategories?: string[];
}

export const QuickAddExpense: React.FC<QuickAddExpenseProps> = ({
  onAddTransaction,
  existingCategories = DEFAULT_CATEGORIES,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [isRecurring, setIsRecurring] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // AI Categorization states
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [aiPredictedCategory, setAiPredictedCategory] = useState<string | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger AI auto-categorization when description has > 3 chars
  useEffect(() => {
    if (type === 'income') {
      setSelectedCategory('Income');
      setAiConfidence(0.99);
      return;
    }

    if (description.trim().length < 3) {
      setAiPredictedCategory(null);
      setAiConfidence(null);
      setAiReasoning(null);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsCategorizing(true);
      try {
        const result = await categorizeExpenseWithAi(
          description,
          amount ? parseFloat(amount) : undefined,
          undefined,
          existingCategories
        );

        if (result && result.category) {
          setSelectedCategory(result.category);
          setAiPredictedCategory(result.category);
          setAiConfidence(result.confidence);
          setIsRecurring(result.isRecurring);
          if (result.tags && result.tags.length > 0) {
            setTags((prev) => Array.from(new Set([...prev, ...result.tags])));
          }
          if (result.reasoning) {
            setAiReasoning(result.reasoning);
          }
        }
      } catch (err) {
        console.error('Error during auto-categorize:', err);
      } finally {
        setIsCategorizing(false);
      }
    }, 450);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [description, amount, type, existingCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    onAddTransaction({
      description: description.trim(),
      amount: numAmount,
      type,
      category: type === 'income' ? 'Income' : selectedCategory,
      date,
      isRecurring,
      tags: tags.filter(Boolean),
      aiConfidence: aiConfidence ?? 0.85,
    });

    // Reset inputs
    setDescription('');
    setAmount('');
    setTags([]);
    setIsRecurring(false);
    setAiPredictedCategory(null);
    setAiConfidence(null);
    setAiReasoning(null);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim().toLowerCase()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tToRemove: string) => {
    setTags(tags.filter((t) => t !== tToRemove));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/40 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Quick Add & ML Auto-Categorizer
            </h2>
            <p className="text-xs text-slate-400">
              Natural description parsing with real-time category detection
            </p>
          </div>
        </div>

        {/* Type Selector Tabs */}
        <div className="flex items-center p-1 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-bold">
          <button
            type="button"
            id="type-btn-expense"
            onClick={() => {
              setType('expense');
              setSelectedCategory('Groceries');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            Expense
          </button>
          <button
            type="button"
            id="type-btn-income"
            onClick={() => {
              setType('income');
              setSelectedCategory('Income');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            Income
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Description Input */}
          <div className="md:col-span-5 relative">
            <input
              id="input-tx-description"
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Whole Foods Market, Netflix, Shell Gas..."
              className="w-full pl-3.5 pr-8 py-2.5 text-xs sm:text-sm text-white bg-slate-950/70 border border-slate-800 rounded-2xl focus:bg-slate-950 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors placeholder-slate-500"
            />
            {isCategorizing && (
              <div className="absolute right-3 top-3 text-emerald-400 animate-spin">
                <Loader2 className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="md:col-span-2 relative">
            <span className="absolute left-3 top-2.5 text-xs sm:text-sm text-emerald-400 font-bold">$</span>
            <input
              id="input-tx-amount"
              type="number"
              step="0.01"
              required
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-950/70 border border-slate-800 rounded-2xl focus:bg-slate-950 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors placeholder-slate-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            {type === 'expense' ? (
              <select
                id="select-tx-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm text-white bg-slate-950/70 border border-slate-800 rounded-2xl focus:bg-slate-950 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {existingCategories
                  .filter((c) => c !== 'Income')
                  .map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {cat}
                    </option>
                  ))}
              </select>
            ) : (
              <input
                type="text"
                disabled
                value="Income"
                className="w-full px-3 py-2.5 text-xs sm:text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl font-bold"
              />
            )}
          </div>

          {/* Date Picker */}
          <div className="md:col-span-2">
            <input
              id="input-tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-2.5 py-2.5 text-xs text-slate-300 bg-slate-950/70 border border-slate-800 rounded-2xl focus:bg-slate-950 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Live ML Prediction Banner & Meta Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* AI Prediction Badge */}
            {aiPredictedCategory && type === 'expense' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  ML Match: <strong className="text-white font-bold">{aiPredictedCategory}</strong>
                </span>
                {aiConfidence && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-[10px] font-black text-emerald-300">
                    {Math.round(aiConfidence * 100)}%
                  </span>
                )}
              </div>
            )}

            {/* Recurring Subscription Checkbox */}
            <label className="inline-flex items-center gap-2 text-xs text-slate-400 font-medium cursor-pointer hover:text-white select-none">
              <input
                id="checkbox-is-recurring"
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-800"
              />
              <Repeat className="w-3.5 h-3.5 text-slate-500" />
              <span>Recurring Subscription</span>
            </label>

            {/* Tags preview */}
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-slate-400 hover:text-white ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}

            {/* Inline Add Tag */}
            <div className="inline-flex items-center gap-1 text-slate-500">
              <Tag className="w-3 h-3 text-slate-500" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="+ tag"
                className="text-xs bg-transparent border-b border-dashed border-slate-700 focus:outline-none focus:border-emerald-400 text-slate-300 placeholder-slate-600 w-20 py-0.5"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="btn-submit-quick-add"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-md shadow-emerald-500/20 ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </form>
    </div>
  );
};
