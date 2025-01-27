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
    setCategoryBudget: (state, action: PayloadAction<{ category: string; amount: number }>) => {
      const { category, amount } = action.payload;
      console.log('Setting category budget:', { category, amount });
      
      // Get current month in YYYY-MM format
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      if (!state.budgets[category]) {
        state.budgets[category] = [];
      }

      // Find existing budget for current month
      const existingBudgetIndex = state.budgets[category].findIndex(
        b => b.month.startsWith(currentMonth)
      );
      
      if (existingBudgetIndex >= 0) {
        // Update existing budget
        state.budgets[category][existingBudgetIndex].amount += amount;
      } else {
        // Add new budget for current month
        state.budgets[category].push({ 
          amount, 
          month: currentMonth 
        });
      }

      // Log the updated budgets for debugging
      console.log('Updated budgets:', state.budgets[category]);
    },
  },
});

export const { updateCategoryBudget, setState, setCategoryBudget } = categoryBudgetsSlice.actions;
export default categoryBudgetsSlice.reducer;

// Helper function to get budget for a specific month
export const getBudgetForMonth = (
  budgets: CategoryBudget[],
  month: string
): number => {
  const budget = budgets.find(b => b.month === month);
  return budget?.amount || 0;
}; 