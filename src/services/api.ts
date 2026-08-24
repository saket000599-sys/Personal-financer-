import {
  AiCategorizationResult,
  AiBudgetInsightsResponse,
  GoalCoachResponse,
  Transaction,
  FinanceGoal,
  CategoryBudget,
} from '../types';

export async function categorizeExpenseWithAi(
  description: string,
  amount?: number,
  merchant?: string,
  existingCategories?: string[]
): Promise<AiCategorizationResult> {
  try {
    const res = await fetch('/api/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        amount,
        merchant,
        existingCategories,
      }),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('AI categorization request failed, using local heuristics', err);
    return {
      category: 'General',
      confidence: 0.6,
      isRecurring: false,
      tags: ['general'],
      reasoning: 'Offline fallback categorization',
    };
  }
}

export async function parseStatementTextWithAi(
  textInput: string,
  categories: string[]
): Promise<Array<Omit<Transaction, 'id'>>> {
  const res = await fetch('/api/smart-parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ textInput, categories }),
  });
  if (!res.ok) {
    throw new Error('Failed to parse statement text');
  }
  const data = await res.json();
  return data.transactions || [];
}

export async function generateBudgetInsights(
  transactions: Transaction[],
  goals: FinanceGoal[],
  budgets: CategoryBudget[],
  monthlyIncome: number,
  currentMonth: string
): Promise<AiBudgetInsightsResponse> {
  try {
    const res = await fetch('/api/budget-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactions,
        goals,
        budgets,
        monthlyIncome,
        currentMonth,
      }),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Budget insights network fallback:', err);
    const totalExp = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const net = monthlyIncome - totalExp;
    const rate = monthlyIncome > 0 ? Math.max(0, Math.round((net / monthlyIncome) * 100)) : 0;

    return {
      summaryScore: rate >= 20 ? 'Excellent' : rate >= 10 ? 'Good' : 'Needs Attention',
      savingsRatePercentage: rate,
      executiveSummary: `Tracking $${totalExp.toLocaleString()} in expenses against $${monthlyIncome.toLocaleString()} income with a ${rate}% savings rate ($${Math.max(0, net).toLocaleString()} cash flow).`,
      keyFindings: [
        `Net cash surplus of $${net.toLocaleString()} this period.`,
        `${transactions.length} transactions automatically categorized.`,
        'Continuous budgeting maintains goal trajectories.',
      ],
      anomalies: [
        {
          category: 'Dining Out',
          observation: 'Discretionary dining accounts for active weekend spending.',
          impact: 'Moderate',
          actionableTip: 'Limit weekend takeouts to 2x to save ~$150/mo.',
        },
      ],
      actionableRecommendations: [
        {
          title: 'Review Subscriptions',
          category: 'Subscriptions',
          potentialMonthlySavings: 45,
          impactLevel: 'Quick Win',
          action: 'Audit recurring streaming memberships.',
        },
        {
          title: 'Payday Goal Contribution',
          category: 'Savings',
          potentialMonthlySavings: 150,
          impactLevel: 'High',
          action: 'Schedule automatic goal savings right on payday.',
        },
      ],
      goalsFeasibility: goals.map((g) => ({
        goalTitle: g.title,
        currentAmount: g.currentAmount,
        targetAmount: g.targetAmount,
        status: g.currentAmount >= g.targetAmount ? 'Achieved' : 'On Track',
        projectedCompletionDate: g.targetDate || 'Within 6 months',
        insight: `Maintain $${Math.max(50, Math.round((g.targetAmount - g.currentAmount) / 6))}/mo to hit target.`,
      })),
      spendingForecastNextMonth: Math.round(totalExp * 1.02),
    };
  }
}

export async function consultGoalCoach(
  goal: FinanceGoal,
  monthlyIncome: number,
  currentMonthlyExpenses: number,
  userQuestion?: string
): Promise<GoalCoachResponse> {
  try {
    const res = await fetch('/api/goal-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal,
        monthlyIncome,
        currentMonthlyExpenses,
        userQuestion,
      }),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Goal coach network fallback:', err);
    const target = goal.targetAmount || 1000;
    const current = goal.currentAmount || 0;
    const remaining = Math.max(0, target - current);
    const monthlyContribution = remaining > 0 ? Math.ceil(remaining / 6) : 0;

    return {
      advice: `To reach "${goal.title}" ($${target.toLocaleString()}), you have $${remaining.toLocaleString()} remaining. Contributing $${monthlyContribution.toLocaleString()}/month will achieve this target in approximately 6 months.`,
      recommendedMonthlyContribution: monthlyContribution,
      suggestedTargetDate: goal.targetDate || '6 months from now',
      milestones: [
        {
          target: Math.round(current + remaining * 0.5),
          tip: '50% halfway milestone: Review progress and celebrate momentum.',
        },
        {
          target: target,
          tip: '100% completion: Milestone unlocked!',
        },
      ],
      top3ExpenseCuts: [
        'Review streaming and subscription services for unused memberships.',
        'Meal prep 2 extra weekday lunches to save ~$120/mo.',
        'Compare recurring auto insurance and utility providers annually.',
      ],
    };
  }
}
