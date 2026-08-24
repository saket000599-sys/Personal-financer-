import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewStats } from './components/OverviewStats';
import { QuickAddExpense } from './components/QuickAddExpense';
import { SpendingCharts } from './components/SpendingCharts';
import { BudgetManager } from './components/BudgetManager';
import { GoalsSection } from './components/GoalsSection';
import { TransactionsList } from './components/TransactionsList';
import { AiBudgetInsights } from './components/AiBudgetInsights';
import { AddGoalModal } from './components/AddGoalModal';
import { GoalDetailCoachModal } from './components/GoalDetailCoachModal';
import { SmartBatchImportModal } from './components/SmartBatchImportModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { Transaction, FinanceGoal, CategoryBudget } from './types';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_GOALS,
  INITIAL_BUDGETS,
  DEFAULT_CATEGORIES,
} from './data/initialData';
import { Sparkles, FileText, UploadCloud, PlusCircle } from 'lucide-react';

const STORAGE_KEYS = {
  TRANSACTIONS: 'fintrack_ml_transactions_v2',
  GOALS: 'fintrack_ml_goals_v2',
  BUDGETS: 'fintrack_ml_budgets_v2',
  MONTHLY_INCOME: 'fintrack_ml_income_v2',
};

export default function App() {
  // 1. Core State
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    return new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  });

  const [monthlyIncome, setMonthlyIncome] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MONTHLY_INCOME);
    return saved ? parseFloat(saved) : 6850;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved transactions', e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [goals, setGoals] = useState<FinanceGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved goals', e);
      }
    }
    return INITIAL_GOALS;
  });

  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved budgets', e);
      }
    }
    return INITIAL_BUDGETS;
  });

  // Modals state
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [coachingGoal, setCoachingGoal] = useState<FinanceGoal | null>(null);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'goals' | 'transactions'>('dashboard');

  // 2. Persistence Synchronization
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MONTHLY_INCOME, monthlyIncome.toString());
  }, [monthlyIncome]);

  // 3. Transactions Handlers
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTransactionCategory = (id: string, newCategory: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, category: newCategory } : t))
    );
  };

  const handleBatchImportTransactions = (imported: Array<Omit<Transaction, 'id'>>) => {
    const createdList: Transaction[] = imported.map((item, idx) => ({
      ...item,
      id: `tx-imp-${Date.now()}-${idx}`,
    }));
    setTransactions((prev) => [...createdList, ...prev]);
  };

  // 4. Goals Handlers
  const handleAddGoal = (newGoal: Omit<FinanceGoal, 'id' | 'createdAt'>) => {
    const g: FinanceGoal = {
      ...newGoal,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setGoals((prev) => [...prev, g]);
  };

  const handleUpdateGoal = (id: string, updates: Partial<FinanceGoal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // 5. Budget Handlers
  const handleUpdateBudget = (category: string, newAmount: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, allocatedAmount: newAmount } : b))
    );
  };

  const handleApply503020Rule = () => {
    // 50% Needs, 30% Wants, 20% Savings
    const needsTotal = monthlyIncome * 0.5;
    const wantsTotal = monthlyIncome * 0.3;

    // Distribute among needs & wants categories
    const updated = budgets.map((b) => {
      if (b.category === 'Housing') return { ...b, allocatedAmount: Math.round(needsTotal * 0.6) };
      if (b.category === 'Groceries') return { ...b, allocatedAmount: Math.round(needsTotal * 0.22) };
      if (b.category === 'Utilities') return { ...b, allocatedAmount: Math.round(needsTotal * 0.1) };
      if (b.category === 'Transportation') return { ...b, allocatedAmount: Math.round(needsTotal * 0.08) };
      if (b.category === 'Dining Out') return { ...b, allocatedAmount: Math.round(wantsTotal * 0.4) };
      if (b.category === 'Entertainment') return { ...b, allocatedAmount: Math.round(wantsTotal * 0.25) };
      if (b.category === 'Shopping') return { ...b, allocatedAmount: Math.round(wantsTotal * 0.2) };
      if (b.category === 'Personal Care') return { ...b, allocatedAmount: Math.round(wantsTotal * 0.15) };
      return b;
    });

    setBudgets(updated);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all transactions and goals to default demo portfolio?')) {
      setTransactions(INITIAL_TRANSACTIONS);
      setGoals(INITIAL_GOALS);
      setBudgets(INITIAL_BUDGETS);
      setMonthlyIncome(6850);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.GOALS);
      localStorage.removeItem(STORAGE_KEYS.BUDGETS);
      localStorage.removeItem(STORAGE_KEYS.MONTHLY_INCOME);
    }
  };

  // Filtered transactions for active month
  const currentMonthTransactions = transactions.filter((t) =>
    t.date.startsWith(currentMonth)
  );
  // Fallback to all if user selects month with no data
  const displayedTransactions =
    currentMonthTransactions.length > 0 ? currentMonthTransactions : transactions;

  const currentMonthlyExpenses = displayedTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Bento Header Bar */}
      <Navbar
        currentMonth={currentMonth}
        onChangeMonth={setCurrentMonth}
        monthlyIncome={monthlyIncome}
        onUpdateIncome={setMonthlyIncome}
        onOpenReportModal={() => setIsReportOpen(true)}
        onOpenBatchImportModal={() => setIsBatchImportOpen(true)}
        onResetData={handleResetData}
        onOpenAddGoalModal={() => setIsAddGoalOpen(true)}
      />

      {/* Main Bento Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs Pill Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Overview Bento
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Analytics & Budgets
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'goals'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Goals & AI Coach ({goals.length})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Activity Feed ({transactions.length})
            </button>
          </div>

          <div className="flex items-center gap-2 pr-1">
            <button
              onClick={() => setIsBatchImportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded-xl transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Statement AI</span>
            </button>
            <button
              onClick={() => setIsReportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Report</span>
            </button>
          </div>
        </div>

        {/* Dashboard Bento Master View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Bento Metrics Block */}
            <OverviewStats
              transactions={displayedTransactions}
              monthlyIncome={monthlyIncome}
              goals={goals}
            />

            {/* Middle Bento Grid: AI Spotlight & Quick Add */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Quick Add Transaction & ML Categorizer (7 Cols) */}
              <div className="lg:col-span-7">
                <QuickAddExpense
                  onAddTransaction={handleAddTransaction}
                  existingCategories={DEFAULT_CATEGORIES}
                />
              </div>

              {/* Right Column: AI Machine Learning Intelligence & Recommendations (5 Cols) */}
              <div className="lg:col-span-5">
                <AiBudgetInsights
                  transactions={displayedTransactions}
                  goals={goals}
                  budgets={budgets}
                  monthlyIncome={monthlyIncome}
                  currentMonth={currentMonth}
                />
              </div>
            </div>

            {/* Bottom Bento Grid: Analytics & Budget Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <SpendingCharts
                  transactions={displayedTransactions}
                  budgets={budgets}
                />
              </div>
              <div className="lg:col-span-5">
                <BudgetManager
                  budgets={budgets}
                  transactions={displayedTransactions}
                  monthlyIncome={monthlyIncome}
                  onUpdateBudget={handleUpdateBudget}
                  onApply503020Rule={handleApply503020Rule}
                />
              </div>
            </div>

            {/* Goals Bento Highlight Section */}
            <GoalsSection
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
              onOpenCoachForGoal={(g) => setCoachingGoal(g)}
              onOpenNewGoalModal={() => setIsAddGoalOpen(true)}
            />

            {/* Full Transactions Log */}
            <TransactionsList
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onUpdateTransactionCategory={handleUpdateTransactionCategory}
            />
          </div>
        )}

        {/* Dedicated Tab: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <SpendingCharts
              transactions={displayedTransactions}
              budgets={budgets}
            />
            <BudgetManager
              budgets={budgets}
              transactions={displayedTransactions}
              monthlyIncome={monthlyIncome}
              onUpdateBudget={handleUpdateBudget}
              onApply503020Rule={handleApply503020Rule}
            />
          </div>
        )}

        {/* Dedicated Tab: Goals */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <GoalsSection
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
              onOpenCoachForGoal={(g) => setCoachingGoal(g)}
              onOpenNewGoalModal={() => setIsAddGoalOpen(true)}
            />
          </div>
        )}

        {/* Dedicated Tab: Transactions */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <QuickAddExpense
              onAddTransaction={handleAddTransaction}
              existingCategories={DEFAULT_CATEGORIES}
            />
            <TransactionsList
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onUpdateTransactionCategory={handleUpdateTransactionCategory}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="font-semibold text-slate-400">FinTrack ML Bento Engine</span>
            <span>• Continuous Real-Time Personal Finance Intelligence</span>
          </div>
          <span>Automatic Gemini 2.5/3.7 categorization • 50/30/20 Rule compliance</span>
        </div>
      </footer>

      {/* Modals */}
      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onAddGoal={handleAddGoal}
      />

      <GoalDetailCoachModal
        goal={coachingGoal}
        isOpen={!!coachingGoal}
        onClose={() => setCoachingGoal(null)}
        monthlyIncome={monthlyIncome}
        currentMonthlyExpenses={currentMonthlyExpenses}
      />

      <SmartBatchImportModal
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        onImportTransactions={handleBatchImportTransactions}
        existingCategories={DEFAULT_CATEGORIES}
      />

      <MonthlyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        transactions={displayedTransactions}
        goals={goals}
        budgets={budgets}
        monthlyIncome={monthlyIncome}
        currentMonth={currentMonth}
      />
    </div>
  );
}
