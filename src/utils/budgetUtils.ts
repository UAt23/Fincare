import { IncomeAllocation } from '../types/budget';

export function calculateIncomeAllocation(
  totalIncome: number, 
  allocations: IncomeAllocation[]
): IncomeAllocation[] {
  // Validate total percentage
  const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);
  
  if (totalPercentage > 100) {
    throw new Error('Total allocation percentage cannot exceed 100%');
  }

  // Calculate amounts for each allocation
  return allocations.map(allocation => ({
    ...allocation,
    amount: (totalIncome * allocation.percentage) / 100
  }));
}

export function calculateSavingsProgress(
  currentAmount: number, 
  targetAmount: number
): number {
  return (currentAmount / targetAmount) * 100;
}

export function predictBudgetAdjustment(
  historicalTransactions: any[], 
  currentBudget: number, 
  category: string
): { 
  suggestedBudget: number, 
  percentageChange: number 
} {
  const categoryTransactions = historicalTransactions
    .filter(t => t.category === category);

  const averageSpending = categoryTransactions.reduce((sum, t) => sum + t.amount, 0) / 
    (categoryTransactions.length || 1);

  const percentageChange = ((averageSpending - currentBudget) / currentBudget) * 100;
  
  return {
    suggestedBudget: averageSpending,
    percentageChange
  };
}

/**
 * Calculates the monthly amount for a recurring transaction
 * @param amount The base amount of the transaction
 * @param frequency The frequency of the transaction (weekly, monthly, yearly)
 * @returns The calculated monthly amount
 */
export const calculateMonthlyAmount = (amount: number, frequency: 'weekly' | 'monthly' | 'yearly'): number => {
  switch (frequency) {
    case 'weekly':
      return amount * 52 / 12; // Convert weekly to monthly (52 weeks / 12 months)
    case 'monthly':
      return amount;
    case 'yearly':
      return amount / 12; // Convert yearly to monthly
    default:
      return amount;
  }
};

export const calculateMonthlyNeeded = (
  targetAmount: number, 
  currentAmount: number, 
  targetDate: Date
): number => {
  const today = new Date();
  const monthsRemaining = (
    (targetDate.getFullYear() - today.getFullYear()) * 12 + 
    (targetDate.getMonth() - today.getMonth())
  );

  if (monthsRemaining <= 0) return 0;

  const remainingAmount = targetAmount - currentAmount;
  return remainingAmount / monthsRemaining;
};

export const getBudgetForMonth = (budgets, month) => {
    console.log('Getting budget for month:', { budgets, month });
    const budget = budgets.find(b => b.month === month || b.month.startsWith(month));
    console.log('Found budget:', budget);
    return budget ? budget.amount : 0;
}; 