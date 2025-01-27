import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  BudgetState, 
  IncomeAllocation, 
  SavingsGoal, 
  RecurringTransaction 
} from '../types/budget';
import { generateId } from '../utils/id';

const initialState: BudgetState = {
  incomeAllocations: [],
  savingsGoals: [],
  recurringTransactions: [],
  categoryBudgets: {},
};

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    // Income Allocation Actions
    addIncomeAllocation: (state, action: PayloadAction<{ 
      category: string; 
      amount: number;
      percentage: number;
    }>) => {
      const { category, amount, percentage } = action.payload;

      // Update category budgets
      if (!state.categoryBudgets[category]) {
        state.categoryBudgets[category] = 0;
      }
      state.categoryBudgets[category] += amount;

      // Add allocation
      state.incomeAllocations.push({
        id: generateId(),
        category,
        amount,
        percentage
      });
    },
    updateIncomeAllocation: (state, action: PayloadAction<IncomeAllocation>) => {
      const index = state.incomeAllocations.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.incomeAllocations[index] = action.payload;
      }
    },
    removeIncomeAllocation: (state, action: PayloadAction<string>) => {
      state.incomeAllocations = state.incomeAllocations.filter(a => a.id !== action.payload);
    },

    // Savings Goal Actions
    addSavingsGoal: (state, action: PayloadAction<Omit<SavingsGoal, 'id'>>) => {
      state.savingsGoals.push({
        id: generateId(),
        ...action.payload,
      });
    },
    updateSavingsGoal: (state, action: PayloadAction<SavingsGoal>) => {
      const index = state.savingsGoals.findIndex(g => g.id === action.payload.id);
      if (index !== -1) {
        state.savingsGoals[index] = action.payload;
      }
    },
    removeSavingsGoal: (state, action: PayloadAction<string>) => {
      state.savingsGoals = state.savingsGoals.filter(g => g.id !== action.payload);
    },

    // Recurring Transaction Actions
    addRecurringTransaction: (state, action: PayloadAction<Omit<RecurringTransaction, 'id'>>) => {
      const transaction = {
        ...action.payload,
        id: generateId(),
        startDate: new Date(action.payload.startDate).toISOString(),
        endDate: action.payload.endDate ? new Date(action.payload.endDate).toISOString() : undefined,
      };
      state.recurringTransactions.push(transaction);
    },
    updateRecurringTransaction: (state, action: PayloadAction<RecurringTransaction>) => {
      const index = state.recurringTransactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.recurringTransactions[index] = {
          ...action.payload,
          startDate: new Date(action.payload.startDate).toISOString(),
          endDate: action.payload.endDate ? new Date(action.payload.endDate).toISOString() : undefined,
        };
      }
    },
    removeRecurringTransaction: (state, action: PayloadAction<string>) => {
      state.recurringTransactions = state.recurringTransactions.filter(t => t.id !== action.payload);
    },
  },
});

export const {
  addIncomeAllocation,
  updateIncomeAllocation,
  removeIncomeAllocation,
  addSavingsGoal,
  updateSavingsGoal,
  removeSavingsGoal,
  addRecurringTransaction,
  updateRecurringTransaction,
  removeRecurringTransaction,
} = budgetSlice.actions;

export default budgetSlice.reducer; 