import { useState, useEffect } from 'react';
import { Transaction, CreateTransactionDTO } from '../types/transaction';
import { transactionService } from '../services/api/transactions';

export function useTransactions(limit?: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getRecentTransactions(limit);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (data: CreateTransactionDTO) => {
    try {
      const newTransaction = await transactionService.createTransaction(data);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    refresh: loadTransactions,
    addTransaction,
  };
} 