export type BudgetType = 'monthly' | 'savings' | 'yearly';

export type BudgetCategory = {
  id: string;
  name: string;
  limit: number;
  spent: number;
  color: string;
};

export type Budget = {
  id: string;
  name: string;
  type: BudgetType;
  startDate: string;
  endDate: string;
  categories: BudgetCategory[];
  totalLimit: number;
  currency: Currency;
};

export interface IncomeAllocation {
  id: string;
  category: string;
  amount: number;
  percentage: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
}

export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
}

export interface BudgetState {
  incomeAllocations: IncomeAllocation[];
  savingsGoals: SavingsGoal[];
  recurringTransactions: RecurringTransaction[];
} 