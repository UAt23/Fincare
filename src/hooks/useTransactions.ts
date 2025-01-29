import { useState, useEffect, useCallback } from 'react';
import { Transaction, CreateTransactionDTO } from '../types/transaction';
import { transactionService } from '../services/api/transactions';

export function useTransactions(limit?: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = limit 
        ? await transactionService.getRecentTransactions(limit)
        : await transactionService.getAllTransactions();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const addTransaction = async (data: CreateTransactionDTO) => {
    try {
      const newTransaction = await transactionService.createTransaction(data);
      await loadTransactions(); // Refresh the list after adding
      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      throw err;
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    error,
    refresh: loadTransactions,
    addTransaction,
  };
} 