import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper to execute Gemini with fallback models and retry on 503/transient errors
async function generateWithGeminiFallback(ai: GoogleGenAI, prompt: string, responseSchema?: any) {
  const models = ["gemini-3.7-flash", "gemini-2.5-flash"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const config: any = {
        responseMimeType: "application/json",
      };
      if (responseSchema) {
        config.responseSchema = responseSchema;
      }
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });
      if (response.text) {
        return JSON.parse(response.text);
      }
    } catch (err: any) {
      console.warn(`Gemini model ${model} request failed:`, err?.message || err);
      lastError = err;
      // Continue to try the next model on 503 / 429 / etc.
      continue;
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

function calculateDeterministicBudgetInsights(
  transactions: any[] = [],
  goals: any[] = [],
  budgets: any[] = [],
  monthlyIncome: number = 5000,
  _currentMonth?: string
) {
  const expenseTransactions = transactions.filter((t) => t.type === "expense");
  const totalExpenses = expenseTransactions.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0
  );
  const totalIncome = monthlyIncome || 5000;
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Category totals
  const categoryTotals: Record<string, number> = {};
  expenseTransactions.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0] ? sortedCategories[0][0] : "General";
  const topCategoryAmount = sortedCategories[0] ? sortedCategories[0][1] : 0;

  // Overbudget detection
  const overBudgetItems: string[] = [];
  budgets.forEach((b: any) => {
    const spent = categoryTotals[b.category] || 0;
    if (spent > b.allocatedAmount) {
      overBudgetItems.push(`${b.category} ($${Math.round(spent)} vs $${b.allocatedAmount} cap)`);
    }
  });

  const score =
    savingsRate >= 20 ? "Excellent" : savingsRate >= 10 ? "Good" : savingsRate >= 0 ? "Fair" : "Needs Attention";

  const anomalies: Array<{
    category: string;
    observation: string;
    impact: string;
    actionableTip: string;
  }> = [];

  if (overBudgetItems.length > 0) {
    anomalies.push({
      category: topCategory,
      observation: `${overBudgetItems.join(", ")} exceeded planned monthly allocations.`,
      impact: "High",
      actionableTip: `Trim discretionary purchases in ${topCategory} for the remainder of this cycle to restore buffer.`,
    });
  } else if (topCategoryAmount > 0) {
    anomalies.push({
      category: topCategory,
      observation: `${topCategory} accounts for ${Math.round((topCategoryAmount / Math.max(1, totalExpenses)) * 100)}% of total monthly expenses ($${Math.round(topCategoryAmount)}).`,
      impact: topCategoryAmount > totalExpenses * 0.4 ? "High" : "Moderate",
      actionableTip: `Compare prices or substitute frequent ${topCategory.toLowerCase()} expenses to save ~$${Math.round(topCategoryAmount * 0.15)} monthly.`,
    });
  }

  // Actionable recommendations
  const actionableRecommendations = [
    {
      title: "Consolidate Recurring Subscriptions",
      category: "Subscriptions",
      potentialMonthlySavings: 45,
      impactLevel: "Quick Win",
      action: "Review recurring streaming and SaaS memberships to eliminate unused subscriptions.",
    },
    {
      title: `Optimize ${topCategory} Outflows`,
      category: topCategory,
      potentialMonthlySavings: Math.max(30, Math.round(topCategoryAmount * 0.1)),
      impactLevel: "Medium",
      action: `Set a weekly discretionary limit of $${Math.round((topCategoryAmount * 0.8) / 4)} for ${topCategory}.`,
    },
    {
      title: "Automate Payday Savings Transfer",
      category: "Savings",
      potentialMonthlySavings: Math.max(100, Math.round(totalIncome * 0.05)),
      impactLevel: "High",
      action: "Configure an automatic transfer of 10% on payday before discretionary spending occurs.",
    },
  ];

  // Feasibility of goals
  const goalsFeasibility = goals.map((g: any) => {
    const remaining = Math.max(0, (g.targetAmount || 1000) - (g.currentAmount || 0));
    const isAchieved = (g.currentAmount || 0) >= (g.targetAmount || 1000);
    const monthsNeeded = netSavings > 0 ? Math.ceil(remaining / Math.max(50, netSavings * 0.4)) : 12;

    return {
      goalTitle: g.title,
      currentAmount: g.currentAmount || 0,
      targetAmount: g.targetAmount || 1000,
      status: isAchieved
        ? "Achieved"
        : netSavings > 500
        ? "Ahead of Schedule"
        : netSavings > 0
        ? "On Track"
        : "At Risk",
      projectedCompletionDate: isAchieved
        ? "Achieved"
        : g.targetDate
        ? g.targetDate
        : `Within ${monthsNeeded} months`,
      insight: isAchieved
        ? "Goal achieved! Ready to reallocate contributions to next milestone."
        : `Allocating $${Math.round(remaining / Math.max(1, monthsNeeded))}/mo will achieve this milestone comfortably.`,
    };
  });

  return {
    summaryScore: score,
    savingsRatePercentage: Math.max(0, savingsRate),
    executiveSummary: `Monthly expenses are tracked at $${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} against $${totalIncome.toLocaleString()} income, yielding a ${savingsRate}% net savings rate ($${netSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })} cash flow).`,
    keyFindings: [
      `Net discretionary cash flow is $${netSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })} with ${expenseTransactions.length} tracked transactions.`,
      `Top spending area is ${topCategory} ($${topCategoryAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}).`,
      overBudgetItems.length > 0
        ? `Over-budget warning: ${overBudgetItems.join(", ")}.`
        : "All active categories are pacing within targeted budget envelopes.",
    ],
    anomalies,
    actionableRecommendations,
    goalsFeasibility,
    spendingForecastNextMonth: Math.round(totalExpenses * 1.03),
  };
}

function calculateDeterministicGoalCoach(
  goal: any,
  monthlyIncome: number = 5000,
  currentMonthlyExpenses: number = 3000,
  _userQuestion?: string
) {
  const target = goal?.targetAmount || 1000;
  const current = goal?.currentAmount || 0;
  const remaining = Math.max(0, target - current);
  const netSavings = Math.max(0, monthlyIncome - currentMonthlyExpenses);
  const recommendedMonthlyContribution = remaining > 0 ? Math.min(remaining, Math.max(50, Math.round(netSavings * 0.35 || remaining / 6))) : 0;
  const estimatedMonths = recommendedMonthlyContribution > 0 ? Math.ceil(remaining / recommendedMonthlyContribution) : 0;

  return {
    advice: `To reach your goal of "${goal?.title || 'Financial Goal'}" ($${target.toLocaleString()}), you currently have $${current.toLocaleString()} saved with $${remaining.toLocaleString()} remaining. Contributing $${recommendedMonthlyContribution.toLocaleString()}/month from your estimated $${netSavings.toLocaleString()} monthly cashflow will get you to completion in approx ${estimatedMonths} months.`,
    recommendedMonthlyContribution,
    suggestedTargetDate: goal?.targetDate || `${estimatedMonths} months from now`,
    milestones: [
      {
        target: Math.round(current + remaining * 0.33),
        tip: "1/3 Milestone: Lock in momentum by celebrating with a zero-cost reward.",
      },
      {
        target: Math.round(current + remaining * 0.66),
        tip: "2/3 Milestone: Accelerate the finish line using any tax returns, cashbacks, or bonuses.",
      },
      {
        target: target,
        tip: "Final Target: Goal accomplished! Reinvest monthly contribution into your next priority.",
      },
    ],
    top3ExpenseCuts: [
      "Review recurring app and streaming subscriptions to save ~$30–$50/mo.",
      "Cap dining out to 2x weekly and meal-prep mid-week lunches for ~$150/mo savings.",
      "Shop supermarket sales or switch brand labels for grocery staples to save ~$80/mo.",
    ],
  };
}

// Rule-based heuristic fallback for offline or quick categorization
const CATEGORY_KEYWORDS: Record<string, { category: string; icon: string }> = {
  "grocery": { category: "Groceries", icon: "ShoppingCart" },
  "trader joe": { category: "Groceries", icon: "ShoppingCart" },
  "whole foods": { category: "Groceries", icon: "ShoppingCart" },
  "kroger": { category: "Groceries", icon: "ShoppingCart" },
  "safeway": { category: "Groceries", icon: "ShoppingCart" },
  "supermarket": { category: "Groceries", icon: "ShoppingCart" },
  "walmart": { category: "Groceries", icon: "ShoppingCart" },
  "target": { category: "Shopping", icon: "ShoppingBag" },
  "restaurant": { category: "Dining Out", icon: "Utensils" },
  "cafe": { category: "Dining Out", icon: "Coffee" },
  "starbucks": { category: "Dining Out", icon: "Coffee" },
  "mcdonald": { category: "Dining Out", icon: "Utensils" },
  "chipotle": { category: "Dining Out", icon: "Utensils" },
  "doordash": { category: "Dining Out", icon: "Utensils" },
  "uber eats": { category: "Dining Out", icon: "Utensils" },
  "grubhub": { category: "Dining Out", icon: "Utensils" },
  "uber": { category: "Transportation", icon: "Car" },
  "lyft": { category: "Transportation", icon: "Car" },
  "gas": { category: "Transportation", icon: "Fuel" },
  "chevron": { category: "Transportation", icon: "Fuel" },
  "shell": { category: "Transportation", icon: "Fuel" },
  "subway": { category: "Transportation", icon: "Train" },
  "transit": { category: "Transportation", icon: "Bus" },
  "airline": { category: "Travel", icon: "Plane" },
  "flight": { category: "Travel", icon: "Plane" },
  "hotel": { category: "Travel", icon: "Hotel" },
  "airbnb": { category: "Travel", icon: "Home" },
  "netflix": { category: "Entertainment", icon: "Tv" },
  "spotify": { category: "Entertainment", icon: "Music" },
  "hulu": { category: "Entertainment", icon: "Tv" },
  "cinema": { category: "Entertainment", icon: "Film" },
  "amc": { category: "Entertainment", icon: "Film" },
  "gym": { category: "Health & Fitness", icon: "Activity" },
  "fitness": { category: "Health & Fitness", icon: "Activity" },
  "pharmacy": { category: "Health & Fitness", icon: "HeartPulse" },
  "cvs": { category: "Health & Fitness", icon: "HeartPulse" },
  "walgreens": { category: "Health & Fitness", icon: "HeartPulse" },
  "electric": { category: "Utilities", icon: "Zap" },
  "water": { category: "Utilities", icon: "Droplet" },
  "internet": { category: "Utilities", icon: "Wifi" },
  "wifi": { category: "Utilities", icon: "Wifi" },
  "att": { category: "Utilities", icon: "Phone" },
  "verizon": { category: "Utilities", icon: "Phone" },
  "rent": { category: "Housing", icon: "Home" },
  "mortgage": { category: "Housing", icon: "Home" },
  "amazon": { category: "Shopping", icon: "ShoppingBag" },
  "apple": { category: "Electronics", icon: "Laptop" },
  "steam": { category: "Entertainment", icon: "Gamepad" },
  "salary": { category: "Income", icon: "DollarSign" },
  "payroll": { category: "Income", icon: "DollarSign" },
  "freelance": { category: "Income", icon: "Briefcase" },
  "dividend": { category: "Investment", icon: "TrendingUp" },
};

function ruleBasedCategorize(description: string): { category: string; confidence: number; isRecurring: boolean; tags: string[] } {
  const lower = description.toLowerCase();
  for (const [kw, info] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(kw)) {
      const isSub = ["netflix", "spotify", "hulu", "gym", "internet", "att", "verizon", "rent", "mortgage"].some(s => lower.includes(s));
      return {
        category: info.category,
        confidence: 0.85,
        isRecurring: isSub,
        tags: [kw, info.category.toLowerCase().replace(/\s+/g, "-")],
      };
    }
  }
  return {
    category: "General",
    confidence: 0.5,
    isRecurring: false,
    tags: ["uncategorized"],
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", aiConfigured: !!process.env.GEMINI_API_KEY });
  });

  // 1. Automatic Machine Learning Expense Categorizer
  app.post("/api/categorize", async (req, res) => {
    try {
      const { description, amount, date, merchant, existingCategories } = req.body;
      if (!description && !merchant) {
        return res.status(400).json({ error: "Description or merchant name is required." });
      }

      const inputDesc = (merchant ? `${merchant} - ` : "") + (description || "");
      const ai = getGeminiClient();

      if (!ai) {
        const fallback = ruleBasedCategorize(inputDesc);
        return res.json(fallback);
      }

      const availableCategories = (existingCategories && existingCategories.length > 0)
        ? existingCategories
        : [
            "Groceries",
            "Dining Out",
            "Housing",
            "Transportation",
            "Utilities",
            "Entertainment",
            "Health & Fitness",
            "Shopping",
            "Travel",
            "Personal Care",
            "Education",
            "Financial & Investments",
            "Income",
            "General"
          ];

      const prompt = `Classify this financial transaction into the most accurate category.
Transaction details:
- Raw Description/Merchant: "${inputDesc}"
- Amount: $${amount || "unknown"}
- Date: ${date || "current month"}

Candidate categories: ${availableCategories.join(", ")}.
Also determine if this looks like a recurring subscription/bill (e.g. monthly services, utilities, memberships, rent), give a confidence score (0.0 to 1.0), and suggest 2-3 relevant tags.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "Selected best matching category name" },
          confidence: { type: Type.NUMBER, description: "Confidence score between 0.0 and 1.0" },
          isRecurring: { type: Type.BOOLEAN, description: "True if likely a recurring monthly expense or subscription" },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2-3 short search tags"
          },
          reasoning: { type: Type.STRING, description: "Brief 1-sentence classification rationale" }
        },
        required: ["category", "confidence", "isRecurring", "tags"]
      };

      try {
        const parsed = await generateWithGeminiFallback(ai, prompt, schema);
        return res.json(parsed);
      } catch (genErr) {
        console.warn("Gemini categorize fallback triggered:", genErr);
        const fallback = ruleBasedCategorize(inputDesc);
        return res.json({ ...fallback, fallback: true });
      }
    } catch (err: any) {
      console.error("Error in /api/categorize:", err);
      const fallback = ruleBasedCategorize(req.body.description || req.body.merchant || "General");
      res.json({ ...fallback, fallback: true });
    }
  });

  // 2. Smart Natural Language & Receipt/Statement Text Parser
  app.post("/api/smart-parse", async (req, res) => {
    const { textInput, categories } = req.body;
    if (!textInput || typeof textInput !== "string") {
      return res.status(400).json({ error: "textInput is required" });
    }

    // Helper regex fallback
    const runRegexFallback = () => {
      const lines = textInput.split(/\r?\n/).filter(Boolean);
      const parsedItems = lines.map((line, idx) => {
        const matchAmount = line.match(/\$?([0-9]+(?:\.[0-9]{2})?)/);
        const amount = matchAmount ? parseFloat(matchAmount[1]) : 25.0;
        const cleanDesc = line.replace(/\$?([0-9]+(?:\.[0-9]{2})?)/, "").trim() || `Transaction #${idx + 1}`;
        const cat = ruleBasedCategorize(cleanDesc);
        return {
          description: cleanDesc,
          amount,
          type: "expense",
          category: cat.category,
          date: new Date().toISOString().split("T")[0],
          isRecurring: cat.isRecurring,
          tags: cat.tags,
        };
      });
      return { transactions: parsedItems };
    };

    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.json(runRegexFallback());
      }

      const prompt = `You are a machine learning personal financial transaction extractor.
Extract all individual financial transactions, receipts, or statement entries from the provided user input text.
Standardize dates to YYYY-MM-DD (assume current year if omitted).
For each transaction, determine:
- description (merchant or item name)
- amount (positive number)
- type ('expense' or 'income')
- category (Choose best from: ${categories ? categories.join(", ") : "Groceries, Dining Out, Housing, Transportation, Utilities, Entertainment, Health & Fitness, Shopping, Travel, Personal Care, Education, Investments, Income, General"})
- date (YYYY-MM-DD)
- isRecurring (boolean: subscriptions, recurring rent, monthly bills)
- tags (list of 2-3 tags)

Input text:
"""
${textInput}
"""`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          transactions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                type: { type: Type.STRING, description: "'expense' or 'income'" },
                category: { type: Type.STRING },
                date: { type: Type.STRING, description: "YYYY-MM-DD" },
                isRecurring: { type: Type.BOOLEAN },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["description", "amount", "type", "category", "date", "isRecurring"],
            },
          },
        },
        required: ["transactions"],
      };

      try {
        const parsed = await generateWithGeminiFallback(ai, prompt, schema);
        return res.json(parsed);
      } catch (genErr) {
        console.warn("Gemini smart-parse fallback triggered:", genErr);
        return res.json(runRegexFallback());
      }
    } catch (err: any) {
      console.error("Error in /api/smart-parse:", err);
      return res.json(runRegexFallback());
    }
  });

  // 3. Actionable Budgeting Insights & Comprehensive Spending Report Generator
  app.post("/api/budget-insights", async (req, res) => {
    const { transactions, goals, budgets, monthlyIncome, currentMonth } = req.body;
    try {
      const ai = getGeminiClient();

      if (!ai) {
        const defaultInsights = calculateDeterministicBudgetInsights(
          transactions,
          goals,
          budgets,
          monthlyIncome,
          currentMonth
        );
        return res.json(defaultInsights);
      }

      const prompt = `You are a certified financial planner and machine learning budgeting advisor.
Analyze the following user financial data for the month (${currentMonth || "current"}):

Monthly Income: $${monthlyIncome || 0}
Total Tracked Transactions (${(transactions || []).length} items):
${JSON.stringify(transactions || [])}

Category Budgets:
${JSON.stringify(budgets || [])}

Personal Finance Goals:
${JSON.stringify(goals || [])}

Perform deep analytical calculation:
1. Determine exact spending patterns, top expense categories, and monthly net savings rate.
2. Identify any anomalies or spending spikes (categories exceeding budget or rising sharply).
3. Evaluate goal feasibility (time to hit target given current surplus, recommended monthly contribution).
4. Provide 3-4 concrete, highly actionable money-saving recommendations with estimated dollar savings.
5. Provide a realistic spending forecast for next month based on historical trajectory.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          summaryScore: { type: Type.STRING, description: "'Excellent' | 'Good' | 'Fair' | 'Needs Attention'" },
          savingsRatePercentage: { type: Type.NUMBER, description: "Calculated savings percentage (e.g. 24)" },
          executiveSummary: { type: Type.STRING, description: "2-3 concise, professional overview sentences" },
          keyFindings: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 key empirical takeaways from their financial data"
          },
          anomalies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                observation: { type: Type.STRING },
                impact: { type: Type.STRING, description: "'High' | 'Moderate' | 'Low'" },
                actionableTip: { type: Type.STRING }
              },
              required: ["category", "observation", "impact", "actionableTip"]
            }
          },
          actionableRecommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                potentialMonthlySavings: { type: Type.NUMBER, description: "Estimated monthly dollars saved" },
                impactLevel: { type: Type.STRING, description: "'High' | 'Medium' | 'Quick Win'" },
                action: { type: Type.STRING, description: "Exact step the user can take" }
              },
              required: ["title", "category", "potentialMonthlySavings", "impactLevel", "action"]
            }
          },
          goalsFeasibility: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                goalTitle: { type: Type.STRING },
                currentAmount: { type: Type.NUMBER },
                targetAmount: { type: Type.NUMBER },
                status: { type: Type.STRING, description: "'Ahead of Schedule' | 'On Track' | 'At Risk' | 'Achieved'" },
                projectedCompletionDate: { type: Type.STRING },
                insight: { type: Type.STRING }
              },
              required: ["goalTitle", "status", "projectedCompletionDate", "insight"]
            }
          },
          spendingForecastNextMonth: { type: Type.NUMBER, description: "Predicted next month total spending" }
        },
        required: [
          "summaryScore",
          "savingsRatePercentage",
          "executiveSummary",
          "keyFindings",
          "anomalies",
          "actionableRecommendations",
          "goalsFeasibility",
          "spendingForecastNextMonth"
        ]
      };

      try {
        const parsed = await generateWithGeminiFallback(ai, prompt, schema);
        return res.json(parsed);
      } catch (genErr) {
        console.warn("Gemini budget-insights model error, using rich deterministic engine:", genErr);
        const fallbackInsights = calculateDeterministicBudgetInsights(
          transactions,
          goals,
          budgets,
          monthlyIncome,
          currentMonth
        );
        return res.json(fallbackInsights);
      }
    } catch (err: any) {
      console.error("Error in /api/budget-insights:", err);
      const fallbackInsights = calculateDeterministicBudgetInsights(
        transactions,
        goals,
        budgets,
        monthlyIncome,
        currentMonth
      );
      res.json(fallbackInsights);
    }
  });

  // 4. Financial Goal Strategy Coach & Advisor
  app.post("/api/goal-coach", async (req, res) => {
    const { goal, monthlyIncome, currentMonthlyExpenses, userQuestion } = req.body;
    try {
      const ai = getGeminiClient();

      if (!ai) {
        const fallback = calculateDeterministicGoalCoach(
          goal,
          monthlyIncome,
          currentMonthlyExpenses,
          userQuestion
        );
        return res.json(fallback);
      }

      const prompt = `You are a supportive, mathematically rigorous personal finance advisor.
Goal Details:
- Title: "${goal?.title}"
- Target Amount: $${goal?.targetAmount}
- Current Saved: $${goal?.currentAmount}
- Target Date: ${goal?.targetDate || "Not set"}
- Monthly Income: $${monthlyIncome || 0}
- Current Monthly Spending: $${currentMonthlyExpenses || 0}

User Question/Prompt: "${userQuestion || "Give me a tailored strategy to achieve this goal efficiently."}"

Provide a structured, encouraging, and actionable response with milestones and exact monthly contribution guidance.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          advice: { type: Type.STRING, description: "Clear, conversational financial coaching breakdown" },
          recommendedMonthlyContribution: { type: Type.NUMBER, description: "Optimal suggested monthly savings amount" },
          suggestedTargetDate: { type: Type.STRING, description: "Realistic target completion date" },
          milestones: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                target: { type: Type.NUMBER },
                tip: { type: Type.STRING }
              },
              required: ["target", "tip"]
            }
          },
          top3ExpenseCuts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 specific places in typical budgets to free up cash for this goal"
          }
        },
        required: ["advice", "recommendedMonthlyContribution", "milestones", "top3ExpenseCuts"]
      };

      try {
        const parsed = await generateWithGeminiFallback(ai, prompt, schema);
        return res.json(parsed);
      } catch (genErr) {
        console.warn("Gemini goal coach model error, falling back to deterministic calculations:", genErr);
        const fallback = calculateDeterministicGoalCoach(
          goal,
          monthlyIncome,
          currentMonthlyExpenses,
          userQuestion
        );
        return res.json(fallback);
      }
    } catch (err: any) {
      console.error("Error in /api/goal-coach:", err);
      const fallback = calculateDeterministicGoalCoach(
        goal,
        monthlyIncome,
        currentMonthlyExpenses,
        userQuestion
      );
      res.json(fallback);
    }
  });

  // Vite middleware setup for SPA
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Financial tracker server listening on port ${PORT}`);
  });
}

startServer();
