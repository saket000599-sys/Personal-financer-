export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  isRecurring?: boolean;
  tags?: string[];
  notes?: string;
  aiConfidence?: number;
  merchant?: string;
}

export interface FinanceGoal {
  id: string;
  title: string;
  category: string; // e.g. 'Emergency', 'Travel', 'Investment', 'Major Purchase', 'Debt Payoff'
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  monthlyContribution: number;
  iconName?: string;
  color?: string;
  notes?: string;
  createdAt: string;
}

export interface CategoryBudget {
  category: string;
  allocatedAmount: number;
  color: string;
  icon: string;
}

export interface AiCategorizationResult {
  category: string;
  confidence: number;
  isRecurring: boolean;
  tags: string[];
  reasoning?: string;
}

export interface AiAnomaly {
  category: string;
  observation: string;
  impact: 'High' | 'Moderate' | 'Low';
  actionableTip: string;
}

export interface AiRecommendation {
  title: string;
  category: string;
  potentialMonthlySavings: number;
  impactLevel: 'High' | 'Medium' | 'Quick Win';
  action: string;
}

export interface GoalFeasibility {
  goalTitle: string;
  currentAmount?: number;
  targetAmount?: number;
  status: 'Ahead of Schedule' | 'On Track' | 'At Risk' | 'Achieved';
  projectedCompletionDate: string;
  insight: string;
}

export interface AiBudgetInsightsResponse {
  summaryScore: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  savingsRatePercentage: number;
  executiveSummary: string;
  keyFindings: string[];
  anomalies: AiAnomaly[];
  actionableRecommendations: AiRecommendation[];
  goalsFeasibility: GoalFeasibility[];
  spendingForecastNextMonth: number;
}

export interface GoalCoachResponse {
  advice: string;
  recommendedMonthlyContribution: number;
  suggestedTargetDate?: string;
  milestones: Array<{
    target: number;
    tip: string;
  }>;
  top3ExpenseCuts: string[];
}
