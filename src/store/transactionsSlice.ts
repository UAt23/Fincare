import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, CreateTransactionDTO } from '../types/transaction';
import { transactionService } from '../services/api/transactions';
import { Currency } from '../types/common';
import { CurrencyService } from '../services/api/currency';
import { RootState } from '../store';
import { generateMockTransactions } from '../utils/mockData';
import { MOCK_TRANSACTIONS } from '../services/api/transactions';

interface TransactionsState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
  categories: any[]; // Assuming a simple structure for categories
}

const initialState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
  categories: [],
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (limit: number = 10) => {
    const response = await transactionService.getRecentTransactions(limit);
    return response;
  }
);

export const fetchAllTransactions = createAsyncThunk(
  'transactions/fetchAllTransactions',
  async () => {
    const response = await transactionService.getAllTransactions();
    return response;
  }
);

export const addTransaction = createAsyncThunk(
  'transactions/addTransaction',
  async (data: CreateTransactionDTO & { 
    currency: Currency,
    originalAmount: number,
    originalCurrency: Currency,
    date: string
  }) => {
    const response = await transactionService.createTransaction({
      ...data,
      date: data.date,
    });
    
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

export const addMockTransactions = createAsyncThunk(
  'transactions/addMockTransactions',
  async (date: Date) => {
    const mockTransactions = MOCK_TRANSACTIONS;
    return mockTransactions;
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<TransactionsState>) => {
      return action.payload;
    },
    addMockData: (state, action: PayloadAction<Date>) => {
      const mockTransactions = generateMockTransactions(action.payload);
      state.items = [...mockTransactions, ...state.items];
    },
    setIncomeAllocation: (state, action) => {
      const { categoryId, amount } = action.payload;
      const category = state.categories.find(cat => cat.id === categoryId);
      if (category) {
        console.log(category);
        category.budget += amount;
      }
    },
  },
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
      .addCase(fetchAllTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.items.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      })
      .addCase(convertTransactionAmounts.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { addMockData } = transactionsSlice.actions;
export default transactionsSlice.reducer; 