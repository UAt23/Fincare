import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CategoryBudget {
  amount: number;
  month: string; // Format: 'YYYY-MM'
}

interface CategoryBudgetsState {
  budgets: Record<string, CategoryBudget[]>; // category -> array of monthly budgets
}

const initialState: CategoryBudgetsState = {
  budgets: {},
};

const categoryBudgetsSlice = createSlice({
  name: 'categoryBudgets',
  initialState,
  reducers: {
    updateCategoryBudget(
      state,
      action: PayloadAction<{
        category: string;
        budget: number;
        month: string;
      }>
    ) {
      const { category, budget, month } = action.payload;
      
      if (!state.budgets[category]) {
        state.budgets[category] = [];
      }
      
      const existingBudgetIndex = state.budgets[category].findIndex(
        b => b.month === month
      );
      
      if (existingBudgetIndex >= 0) {
        state.budgets[category][existingBudgetIndex].amount = budget;
      } else {
        state.budgets[category].push({ amount: budget, month });
      }
    },
    setState: (state, action: PayloadAction<CategoryBudgetsState>) => {
      return action.payload;
    },
  },
});

export const { updateCategoryBudget } = categoryBudgetsSlice.actions;
export default categoryBudgetsSlice.reducer;

// Helper function to get budget for a specific month
export const getBudgetForMonth = (
  budgets: CategoryBudget[],
  month: string
): number => {
  const budget = budgets.find(b => b.month === month);
  return budget?.amount || 0;
}; 