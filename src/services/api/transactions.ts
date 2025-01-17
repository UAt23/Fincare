import { Transaction, CreateTransactionDTO } from '../../types/transaction';
import { CURRENCIES } from '../../types/common';

const DEFAULT_CURRENCY = CURRENCIES[0]; // USD

// Mock data
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    store: 'Nike Store',
    amount: 274.00,
    category: 'Shopping',
    date: '09 April',
    icon: '👕',
    originalAmount: 274.00,
    originalCurrency: DEFAULT_CURRENCY,
  },
  {
    id: '2',
    type: 'expense',
    store: 'Apple Store',
    amount: 92.00,
    category: 'Electronics',
    date: '08 April',
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
    date: '07 April',
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
    date: '05 April',
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
    date: '05 April',
    icon: '🛒',
    originalAmount: 156.50,
    originalCurrency: DEFAULT_CURRENCY,
  }
];

class TransactionService {
  private static instance: TransactionService;
  private transactions: Transaction[] = MOCK_TRANSACTIONS;

  private constructor() {}

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  async getRecentTransactions(limit: number = 5): Promise<Transaction[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.transactions.slice(0, limit);
  }

  async createTransaction(data: CreateTransactionDTO & { 
    originalAmount: number;
    originalCurrency: typeof CURRENCIES[number];
  }): Promise<Transaction> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { 
        day: '2-digit',
        month: 'long'
      }),
      ...data,
    };

    this.transactions.unshift(newTransaction);
    return newTransaction;
  }
}

export const transactionService = TransactionService.getInstance(); 