import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Budget, BudgetCategory } from '../types/budget';

interface BudgetState {
  activeBudget: Budget | null;
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  activeBudget: null,
  loading: false,
  error: null,
};

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudget: (state, action: PayloadAction<Budget>) => {
      state.activeBudget = action.payload;
    },
    updateBudgetCategory: (state, action: PayloadAction<BudgetCategory>) => {
      if (state.activeBudget) {
        const index = state.activeBudget.categories.findIndex(
          cat => cat.id === action.payload.id
        );
        if (index !== -1) {
          state.activeBudget.categories[index] = action.payload;
        }
      }
    },
    addBudgetCategory: (state, action: PayloadAction<BudgetCategory>) => {
      if (state.activeBudget) {
        state.activeBudget.categories.push(action.payload);
      }
    },
    removeBudgetCategory: (state, action: PayloadAction<string>) => {
      if (state.activeBudget) {
        state.activeBudget.categories = state.activeBudget.categories.filter(
          cat => cat.id !== action.payload
        );
      }
    },
    updateBudgetLimit: (state, action: PayloadAction<number>) => {
      if (state.activeBudget) {
        state.activeBudget.totalLimit = action.payload;
      }
    },
  },
});

export const {
  setBudget,
  updateBudgetCategory,
  addBudgetCategory,
  removeBudgetCategory,
  updateBudgetLimit,
} = budgetSlice.actions;

export default budgetSlice.reducer; 