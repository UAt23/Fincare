import { configureStore, Middleware } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import transactionsReducer from './transactionsSlice';
import categoryBudgetsReducer from './categoryBudgetsSlice';
import budgetReducer from './budgetSlice';
import { storage } from '../services/storage';

// Middleware to save state changes to AsyncStorage
const persistenceMiddleware: Middleware = store => next => action => {
  const result = next(action);
  const state = store.getState();

  // Save specific slices when they change
  if (action.type.startsWith('transactions/')) {
    storage.saveTransactions(state.transactions);
  }
  if (action.type.startsWith('categoryBudgets/')) {
    storage.saveCategoryBudgets(state.categoryBudgets);
  }
  if (action.type.startsWith('settings/')) {
    storage.saveSettings(state.settings);
  }

  return result;
};

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    transactions: transactionsReducer,
    categoryBudgets: categoryBudgetsReducer,
    budget: budgetReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),
});

// Load persisted data when the app starts
export const loadPersistedState = async () => {
  const [transactions, categoryBudgets, settings] = await Promise.all([
    storage.loadTransactions(),
    storage.loadCategoryBudgets(),
    storage.loadSettings(),
  ]);

  if (transactions) {
    store.dispatch({ type: 'transactions/setState', payload: transactions });
  }
  if (categoryBudgets) {
    store.dispatch({ type: 'categoryBudgets/setState', payload: categoryBudgets });
  }
  if (settings) {
    store.dispatch({ type: 'settings/setState', payload: settings });
  }
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 