import { Transaction, CreateTransactionDTO } from '../../types/transaction';
import { CURRENCIES } from '../../types/common';
import { generateId } from '../../utils/id';

const DEFAULT_CURRENCY = CURRENCIES[0]; // USD

// Mock data with ISO date strings
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    store: 'Nike Store',
    amount: 274.00,
    category: 'Shopping',
    date: new Date('2024-01-09').toISOString(),
    originalAmount: 274.00,
    originalCurrency: DEFAULT_CURRENCY,
    currency: DEFAULT_CURRENCY,
  },
  {
    id: '2',
    type: 'expense',
    store: 'Apple Store',
    amount: 92.00,
    category: 'Electronics',
    date: new Date('2024-01-08').toISOString(),
    icon: '📱',
    originalAmount: 92.00,
    originalCurrency: DEFAULT_CURRENCY,
  },
  {
    id: '3',
    type: 'expense',
    store: 'Uber',
    amount: 34.00,
    category: 'Transport',
    date: new Date('2024-01-07').toISOString(),
    icon: '🚗',
    originalAmount: 34.00,
    originalCurrency: DEFAULT_CURRENCY,
  },
  {
    id: '4',
    type: 'income',
    store: 'Salary',
    amount: 5000.00,
    category: 'Income',
    date: new Date('2024-01-05').toISOString(),
    icon: '💰',
    originalAmount: 5000.00,
    originalCurrency: DEFAULT_CURRENCY,
  },
  {
    id: '5',
    type: 'expense',
    store: 'Grocery Store',
    amount: 156.50,
    category: 'Food',
    date: new Date('2024-01-05').toISOString(),
    icon: '🛒',
    originalAmount: 156.50,
    originalCurrency: DEFAULT_CURRENCY,
  }
];

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
    // Return a slice of the mock transactions for demonstration
    return MOCK_TRANSACTIONS.slice(0, limit);
  },
}; 