import AsyncStorage from '@react-native-async-storage/async-storage';
import { TransactionsState } from '../store/transactionsSlice';
import { CategoryBudgetsState } from '../store/categoryBudgetsSlice';
import { Settings } from '../store/settingsSlice';

const STORAGE_KEYS = {
  TRANSACTIONS: '@transactions',
  CATEGORY_BUDGETS: '@category_budgets',
  SETTINGS: '@settings',
};

export const storage = {
  async saveTransactions(transactions: TransactionsState) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  },

  async loadTransactions(): Promise<TransactionsState | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : { items: [], loading: false, error: null };
    } catch (error) {
      console.error('Error loading transactions:', error);
      return { items: [], loading: false, error: null };
    }
  },

  async saveCategoryBudgets(budgets: CategoryBudgetsState) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CATEGORY_BUDGETS,
        JSON.stringify(budgets)
      );
    } catch (error) {
      console.error('Error saving category budgets:', error);
    }
  },

  async loadCategoryBudgets(): Promise<CategoryBudgetsState | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_BUDGETS);
      return data ? JSON.parse(data) : { budgets: {} };
    } catch (error) {
      console.error('Error loading category budgets:', error);
      return { budgets: {} };
    }
  },

  async saveSettings(settings: Settings) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },

  async loadSettings(): Promise<Settings | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading settings:', error);
      return null;
    }
  },

  async clearAll() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
}; 