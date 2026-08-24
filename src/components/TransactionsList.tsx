import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowDownCircle,
  ArrowUpCircle,
  Repeat,
  Trash2,
  Download,
  Calendar,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { Transaction } from '../types';
import { DEFAULT_CATEGORIES, CATEGORY_COLORS } from '../data/initialData';

interface TransactionsListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onUpdateTransactionCategory: (id: string, newCategory: string) => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  onDeleteTransaction,
  onUpdateTransactionCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'expense' | 'income'>('ALL');
  const [recurringOnly, setRecurringOnly] = useState(false);

  // Filter pipeline
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesRecurring = !recurringOnly || t.isRecurring;

    return matchesSearch && matchesCategory && matchesType && matchesRecurring;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Description', 'Type', 'Category', 'Amount', 'Recurring', 'Tags'];
    const rows = filtered.map((t) => [
      t.id,
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.amount.toFixed(2),
      t.isRecurring ? 'Yes' : 'No',
      `"${(t.tags || []).join(';')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fintrack_statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/40 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            Transaction Ledger & Categorization Audit
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing {filtered.length} of {transactions.length} entries with ML tag tags
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700 transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search merchant, notes, #tags..."
            className="w-full pl-9 pr-3 py-2 text-xs text-white bg-slate-950/70 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 placeholder-slate-500"
          />
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs text-white bg-slate-950/70 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Categories</option>
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="sm:col-span-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full px-3 py-2 text-xs text-white bg-slate-950/70 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Flows</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>
        </div>

        {/* Recurring Filter Toggle */}
        <div className="sm:col-span-2 flex items-center justify-start sm:justify-end">
          <button
            onClick={() => setRecurringOnly(!recurringOnly)}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
              recurringOnly
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Recurring</span>
          </button>
        </div>
      </div>

      {/* Ledger Feed */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80 bg-slate-950/40">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium">
            No transactions match your active filters.
          </div>
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors"
            >
              {/* Left Details */}
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                    tx.type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <ArrowUpCircle className="w-4 h-4" />
                  ) : (
                    <ArrowDownCircle className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {tx.description}
                    </span>
                    {tx.isRecurring && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-500/30">
                        <Repeat className="w-2.5 h-2.5" />
                        Subscription
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {tx.date}
                    </span>
                    <span>•</span>

                    {/* Inline Category Switcher */}
                    <select
                      value={tx.category}
                      onChange={(e) => onUpdateTransactionCategory(tx.id, e.target.value)}
                      className="px-2 py-0.5 text-[11px] font-bold text-slate-300 bg-slate-900 border border-slate-700 rounded-lg hover:border-slate-600 focus:outline-none"
                    >
                      {DEFAULT_CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-slate-900 text-white">
                          {c}
                        </option>
                      ))}
                    </select>

                    {tx.tags && tx.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        {tx.tags.map((tg) => (
                          <span
                            key={tg}
                            className="px-1.5 py-0.2 rounded bg-slate-800/80 text-[10px] text-slate-400 font-semibold"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Amount & Delete */}
              <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                <div className="text-right">
                  <div
                    className={`text-sm sm:text-base font-black ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-white'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  {tx.aiConfidence && (
                    <div className="text-[10px] text-slate-500 font-semibold">
                      ML Confidence: {Math.round(tx.aiConfidence * 100)}%
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onDeleteTransaction(tx.id)}
                  title="Remove transaction"
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
