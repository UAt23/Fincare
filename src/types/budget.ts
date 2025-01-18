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