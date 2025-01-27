import { Currency } from './common';

export type TransactionType = 'income' | 'expense';

export interface CreateTransactionDTO {
  type: TransactionType;
  amount: number;
  category: string;
  store: string;
  note?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
  store: string;
  currency: Currency;
  originalAmount: number;
  originalCurrency: Currency;
} 