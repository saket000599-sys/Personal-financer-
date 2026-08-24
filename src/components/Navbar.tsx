import React, { useState } from 'react';
import {
  Sparkles,
  DollarSign,
  Download,
  UploadCloud,
  FileText,
  RotateCcw,
  PlusCircle,
  Calendar,
} from 'lucide-react';

interface NavbarProps {
  currentMonth: string;
  onChangeMonth: (month: string) => void;
  monthlyIncome: number;
  onUpdateIncome: (newIncome: number) => void;
  onOpenReportModal: () => void;
  onOpenBatchImportModal: () => void;
  onResetData: () => void;
  onOpenAddGoalModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMonth,
  onChangeMonth,
  monthlyIncome,
  onUpdateIncome,
  onOpenReportModal,
  onOpenBatchImportModal,
  onResetData,
  onOpenAddGoalModal,
}) => {
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState(monthlyIncome.toString());

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempIncome);
    if (!isNaN(val) && val >= 0) {
      onUpdateIncome(val);
      setIsEditingIncome(false);
    }
  };

  // Generate last 6 months for dropdown
  const monthOptions = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const val = d.toISOString().slice(0, 7); // YYYY-MM
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    return { val, label };
  });

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo and App Title - Bento Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="w-5 h-5 border-2 border-slate-950 rounded-xs rotate-45 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  FinTrack ML
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Bento Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Personal ML Categorization & Budgeting System
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Month Selector */}
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-emerald-400 absolute left-3 pointer-events-none" />
              <select
                id="select-active-month"
                value={currentMonth}
                onChange={(e) => onChangeMonth(e.target.value)}
                className="pl-9 pr-7 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-inner"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.val} value={opt.val} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Income Quick-set */}
            {isEditingIncome ? (
              <form onSubmit={handleSaveIncome} className="flex items-center gap-1.5">
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-emerald-400 font-bold">$</span>
                  <input
                    type="number"
                    value={tempIncome}
                    onChange={(e) => setTempIncome(e.target.value)}
                    className="w-24 pl-6 pr-2 py-1.5 text-xs font-bold text-white bg-slate-900 border border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Monthly"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-2.5 py-1.5 text-xs font-bold bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 transition-colors"
                >
                  Save
                </button>
              </form>
            ) : (
              <button
                id="btn-edit-income"
                onClick={() => {
                  setTempIncome(monthlyIncome.toString());
                  setIsEditingIncome(true);
                }}
                title="Click to adjust monthly expected income"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 rounded-xl transition-all"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Inflow: <strong className="text-white">${monthlyIncome.toLocaleString()}</strong>/mo
                </span>
              </button>
            )}

            {/* Goal Creation Button */}
            <button
              id="btn-add-goal-top"
              onClick={onOpenAddGoalModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-sm shadow-emerald-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Goal</span>
            </button>

            {/* Reset Seed Data */}
            <button
              id="btn-reset-demo-data"
              onClick={onResetData}
              title="Reset to fresh demo transactions & goals"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
