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
  type: 'income' | 'expense';
  category: string;
  date: string;
  note?: string;
} 