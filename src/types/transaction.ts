import { Currency } from './common';

export type TransactionType = 'income' | 'expense';

export interface CreateTransactionDTO {
  type: TransactionType;
  amount: number;
  category: string;
  store: string;
  note?: string;
}

export interface Transaction extends {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  originalAmount: number;
  currency: Currency;
  originalCurrency: Currency;
  category: string;
  store: string;
  note?: string;
  date: string;
} 