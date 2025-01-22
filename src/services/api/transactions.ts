import { Transaction, CreateTransactionDTO } from '../../types/transaction';
import { Currency, DEFAULT_CURRENCY } from '../../types/common';
import { generateId } from '../../utils/id';
import { mockedMyTransactions } from '../../utils/mockedMy';

// Mock data with proper typing and structure
const MOCK_TRANSACTIONS: Transaction[] = mockedMyTransactions;

export const transactionService = {
  async createTransaction(data: CreateTransactionDTO & {
    currency: Currency,
    originalAmount: number,
    originalCurrency: Currency,
    date: string
  }): Promise<Transaction> {
    const transactionDate = new Date(data.date);
    
    return {
      id: generateId(),
      type: data.type,
      amount: data.amount,
      category: data.category,
      store: data.store,
      note: data.note || '',
      date: transactionDate.toISOString(),
      currency: data.currency,
      originalAmount: data.originalAmount,
      originalCurrency: data.originalCurrency,
    };
  },

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    // Create a new array before sorting
    const sortedTransactions = [...MOCK_TRANSACTIONS]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedTransactions.slice(0, limit);
  },

  async getAllTransactions(): Promise<Transaction[]> {
    // Create a new array before sorting
    return [...MOCK_TRANSACTIONS]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
}; 