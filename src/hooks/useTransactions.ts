import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types/transaction';
import { getTransactions, addTransaction } from '../services/api/transactions';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getTransactions();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addNewTransaction = async (transaction: Transaction) => {
    try {
      await addTransaction(transaction);
      await fetchTransactions(); // Refresh the list after adding
    } catch (err) {
      setError('Failed to add transaction');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    refreshTransactions: fetchTransactions,
    addTransaction: addNewTransaction,
  };
}; 