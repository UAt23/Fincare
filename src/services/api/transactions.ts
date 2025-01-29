import { Transaction, CreateTransactionDTO } from '../../types/transaction';
import { Currency, DEFAULT_CURRENCY } from '../../types/common';
import { generateId } from '../../utils/id';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_TRANSACTIONS: Transaction[] = [];
const STORAGE_KEY = '@transactions';

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

export const addTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    // Get existing transactions
    const existingTransactions = await getTransactions();
    
    // Add new transaction
    const updatedTransactions = [...existingTransactions, transaction];
    
    // Save to local storage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const storedTransactions = await AsyncStorage.getItem(STORAGE_KEY);
    return storedTransactions ? JSON.parse(storedTransactions) : [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

export const clearTransactions = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing transactions:', error);
    throw error;
  }
}; 