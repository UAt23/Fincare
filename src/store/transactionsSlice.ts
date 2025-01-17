import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, CreateTransactionDTO } from '../types/transaction';
import { transactionService } from '../services/api/transactions';
import { Currency } from '../types/common';
import { CurrencyService } from '../services/api/currency';
import { RootState } from '../store';

interface TransactionsState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (limit: number = 10) => {
    const response = await transactionService.getRecentTransactions(limit);
    return response;
  }
);

export const addTransaction = createAsyncThunk(
  'transactions/addTransaction',
  async (data: CreateTransactionDTO & { 
    currency: Currency,
    originalAmount: number,
    originalCurrency: Currency 
  }) => {
    const response = await transactionService.createTransaction(data);
    return response;
  }
);

export const convertTransactionAmounts = createAsyncThunk(
  'transactions/convert',
  async (newCurrency: Currency, { getState }) => {
    const state = getState() as RootState;
    const transactions = state.transactions.items;

    return transactions.map(transaction => {
      if (transaction.originalCurrency.code === newCurrency.code) {
        return {
          ...transaction,
          amount: transaction.originalAmount,
          currency: newCurrency,
        };
      }

      const convertedAmount = CurrencyService.convertAmount(
        transaction.originalAmount,
        transaction.originalCurrency,
        newCurrency
      );

      return {
        ...transaction,
        amount: convertedAmount,
        currency: newCurrency,
      };
    });
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(convertTransactionAmounts.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default transactionsSlice.reducer; 