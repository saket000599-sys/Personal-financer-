import { Transaction, FinanceGoal, CategoryBudget } from '../types';

export const DEFAULT_CATEGORIES: string[] = [
  'Groceries',
  'Dining Out',
  'Housing',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Health & Fitness',
  'Shopping',
  'Travel',
  'Personal Care',
  'Education',
  'Financial & Investments',
  'Income',
  'General',
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Housing': '#3B82F6', // blue
  'Groceries': '#10B981', // emerald
  'Dining Out': '#F59E0B', // amber
  'Transportation': '#8B5CF6', // violet
  'Utilities': '#06B6D4', // cyan
  'Entertainment': '#EC4899', // pink
  'Health & Fitness': '#14B8A6', // teal
  'Shopping': '#F97316', // orange
  'Travel': '#6366F1', // indigo
  'Personal Care': '#A855F7', // purple
  'Education': '#EAB308', // yellow
  'Financial & Investments': '#22C55E', // green
  'Income': '#16A34A', // dark green
  'General': '#64748B', // slate
};

export const INITIAL_BUDGETS: CategoryBudget[] = [
  { category: 'Housing', allocatedAmount: 1600, color: '#3B82F6', icon: 'Home' },
  { category: 'Groceries', allocatedAmount: 550, color: '#10B981', icon: 'ShoppingCart' },
  { category: 'Dining Out', allocatedAmount: 320, color: '#F59E0B', icon: 'Utensils' },
  { category: 'Transportation', allocatedAmount: 260, color: '#8B5CF6', icon: 'Car' },
  { category: 'Utilities', allocatedAmount: 220, color: '#06B6D4', icon: 'Zap' },
  { category: 'Entertainment', allocatedAmount: 180, color: '#EC4899', icon: 'Tv' },
  { category: 'Health & Fitness', allocatedAmount: 140, color: '#14B8A6', icon: 'Activity' },
  { category: 'Shopping', allocatedAmount: 250, color: '#F97316', icon: 'ShoppingBag' },
  { category: 'Personal Care', allocatedAmount: 100, color: '#A855F7', icon: 'Smile' },
];

export const INITIAL_GOALS: FinanceGoal[] = [
  {
    id: 'goal-1',
    title: 'Emergency Reserve Fund (6 Months)',
    category: 'Emergency',
    targetAmount: 18000,
    currentAmount: 14250,
    targetDate: '2026-12-31',
    monthlyContribution: 650,
    color: '#10B981',
    notes: 'Safe cushion in high-yield savings account for peace of mind.',
    createdAt: '2026-01-10',
  },
  {
    id: 'goal-2',
    title: 'Japan Autumn Trip',
    category: 'Travel',
    targetAmount: 4500,
    currentAmount: 3100,
    targetDate: '2026-10-15',
    monthlyContribution: 350,
    color: '#6366F1',
    notes: 'Flights to Tokyo & Kyoto, culinary tours and ryokan stays.',
    createdAt: '2026-02-01',
  },
  {
    id: 'goal-3',
    title: 'New EV Car Down Payment',
    category: 'Major Purchase',
    targetAmount: 10000,
    currentAmount: 4800,
    targetDate: '2027-03-01',
    monthlyContribution: 400,
    color: '#3B82F6',
    notes: 'Down payment to keep monthly loan under $250.',
    createdAt: '2026-01-15',
  },
  {
    id: 'goal-4',
    title: 'Roth IRA Max 2026',
    category: 'Investment',
    targetAmount: 7000,
    currentAmount: 5250,
    targetDate: '2026-12-31',
    monthlyContribution: 350,
    color: '#8B5CF6',
    notes: 'Max out annual contribution into total market index funds.',
    createdAt: '2026-01-01',
  },
];

// Helper to generate dynamic dates relative to current date
function getRelativeDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Income
  {
    id: 'tx-inc-1',
    description: 'Bi-weekly Tech Payroll Deposit',
    amount: 3250.00,
    type: 'income',
    category: 'Income',
    date: getRelativeDate(2),
    isRecurring: true,
    tags: ['salary', 'direct-deposit'],
    aiConfidence: 0.99,
  },
  {
    id: 'tx-inc-2',
    description: 'Bi-weekly Tech Payroll Deposit',
    amount: 3250.00,
    type: 'income',
    category: 'Income',
    date: getRelativeDate(16),
    isRecurring: true,
    tags: ['salary', 'direct-deposit'],
    aiConfidence: 0.99,
  },
  {
    id: 'tx-inc-3',
    description: 'Freelance UI Design Milestone',
    amount: 680.00,
    type: 'income',
    category: 'Income',
    date: getRelativeDate(9),
    isRecurring: false,
    tags: ['side-hustle', 'freelance'],
    aiConfidence: 0.95,
  },

  // Housing & Utilities
  {
    id: 'tx-exp-1',
    description: 'Beacon Hill Apartment Monthly Rent',
    amount: 1550.00,
    type: 'expense',
    category: 'Housing',
    date: getRelativeDate(22),
    isRecurring: true,
    tags: ['rent', 'housing', 'fixed'],
    aiConfidence: 0.98,
  },
  {
    id: 'tx-exp-2',
    description: 'Eversource Electric & Gas Utility',
    amount: 118.45,
    type: 'expense',
    category: 'Utilities',
    date: getRelativeDate(18),
    isRecurring: true,
    tags: ['electric', 'utilities'],
    aiConfidence: 0.96,
  },
  {
    id: 'tx-exp-3',
    description: 'Verizon Fios Gigabit Fiber Internet',
    amount: 69.99,
    type: 'expense',
    category: 'Utilities',
    date: getRelativeDate(12),
    isRecurring: true,
    tags: ['internet', 'subscription'],
    aiConfidence: 0.97,
  },

  // Groceries
  {
    id: 'tx-exp-4',
    description: 'Trader Joe\'s Organic Produce & Pantry',
    amount: 114.20,
    type: 'expense',
    category: 'Groceries',
    date: getRelativeDate(1),
    isRecurring: false,
    tags: ['groceries', 'food'],
    aiConfidence: 0.99,
  },
  {
    id: 'tx-exp-5',
    description: 'Whole Foods Market Weekly Stockup',
    amount: 142.60,
    type: 'expense',
    category: 'Groceries',
    date: getRelativeDate(8),
    isRecurring: false,
    tags: ['groceries', 'organic'],
    aiConfidence: 0.98,
  },
  {
    id: 'tx-exp-6',
    description: 'Costco Wholesale Bulk Essentials',
    amount: 168.90,
    type: 'expense',
    category: 'Groceries',
    date: getRelativeDate(15),
    isRecurring: false,
    tags: ['groceries', 'household'],
    aiConfidence: 0.94,
  },

  // Dining Out
  {
    id: 'tx-exp-7',
    description: 'Blue Bottle Artisanal Coffee & Pastry',
    amount: 14.50,
    type: 'expense',
    category: 'Dining Out',
    date: getRelativeDate(1),
    isRecurring: false,
    tags: ['coffee', 'cafe'],
    aiConfidence: 0.96,
  },
  {
    id: 'tx-exp-8',
    description: 'Chipotle Mexican Grill Bowl + Guac',
    amount: 16.85,
    type: 'expense',
    category: 'Dining Out',
    date: getRelativeDate(3),
    isRecurring: false,
    tags: ['lunch', 'fast-casual'],
    aiConfidence: 0.97,
  },
  {
    id: 'tx-exp-9',
    description: 'Oishii Sushi & Omakase Weekend Dinner',
    amount: 98.40,
    type: 'expense',
    category: 'Dining Out',
    date: getRelativeDate(6),
    isRecurring: false,
    tags: ['dinner', 'weekend'],
    aiConfidence: 0.95,
  },
  {
    id: 'tx-exp-10',
    description: 'DoorDash - Thai Basil Curry Delivery',
    amount: 42.10,
    type: 'expense',
    category: 'Dining Out',
    date: getRelativeDate(11),
    isRecurring: false,
    tags: ['delivery', 'takeout'],
    aiConfidence: 0.98,
  },

  // Transportation
  {
    id: 'tx-exp-11',
    description: 'Chevron Fuel Station Supreme Unleaded',
    amount: 54.30,
    type: 'expense',
    category: 'Transportation',
    date: getRelativeDate(4),
    isRecurring: false,
    tags: ['gas', 'fuel'],
    aiConfidence: 0.98,
  },
  {
    id: 'tx-exp-12',
    description: 'Uber Ride to Downtown Tech Meetup',
    amount: 24.80,
    type: 'expense',
    category: 'Transportation',
    date: getRelativeDate(10),
    isRecurring: false,
    tags: ['rideshare', 'transit'],
    aiConfidence: 0.97,
  },
  {
    id: 'tx-exp-13',
    description: 'MBTA Metro Pass Monthly Reload',
    amount: 90.00,
    type: 'expense',
    category: 'Transportation',
    date: getRelativeDate(20),
    isRecurring: true,
    tags: ['subway', 'transit'],
    aiConfidence: 0.95,
  },

  // Entertainment & Subscriptions
  {
    id: 'tx-exp-14',
    description: 'Netflix 4K Ultra HD Family Plan',
    amount: 22.99,
    type: 'expense',
    category: 'Entertainment',
    date: getRelativeDate(5),
    isRecurring: true,
    tags: ['subscription', 'streaming'],
    aiConfidence: 0.99,
  },
  {
    id: 'tx-exp-15',
    description: 'Spotify Premium Duo Music',
    amount: 14.99,
    type: 'expense',
    category: 'Entertainment',
    date: getRelativeDate(14),
    isRecurring: true,
    tags: ['subscription', 'music'],
    aiConfidence: 0.99,
  },
  {
    id: 'tx-exp-16',
    description: 'AMC IMAX Movie Tickets & Popcorn',
    amount: 38.50,
    type: 'expense',
    category: 'Entertainment',
    date: getRelativeDate(7),
    isRecurring: false,
    tags: ['cinema', 'leisure'],
    aiConfidence: 0.96,
  },

  // Health & Fitness
  {
    id: 'tx-exp-17',
    description: 'Equinox / Local Climbing Gym Membership',
    amount: 85.00,
    type: 'expense',
    category: 'Health & Fitness',
    date: getRelativeDate(17),
    isRecurring: true,
    tags: ['gym', 'fitness', 'monthly'],
    aiConfidence: 0.98,
  },
  {
    id: 'tx-exp-18',
    description: 'CVS Pharmacy Vitamins & Electrolytes',
    amount: 29.40,
    type: 'expense',
    category: 'Health & Fitness',
    date: getRelativeDate(13),
    isRecurring: false,
    tags: ['health', 'supplements'],
    aiConfidence: 0.95,
  },

  // Shopping
  {
    id: 'tx-exp-19',
    description: 'Amazon.com Ergonomic Wrist Rest & Desk Mat',
    amount: 48.75,
    type: 'expense',
    category: 'Shopping',
    date: getRelativeDate(4),
    isRecurring: false,
    tags: ['workspace', 'shopping'],
    aiConfidence: 0.93,
  },
  {
    id: 'tx-exp-20',
    description: 'Uniqlo AIRism Summer T-shirts',
    amount: 62.20,
    type: 'expense',
    category: 'Shopping',
    date: getRelativeDate(19),
    isRecurring: false,
    tags: ['clothing', 'apparel'],
    aiConfidence: 0.94,
  },
];
