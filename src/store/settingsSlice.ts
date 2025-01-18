import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Currency, CURRENCIES, DEFAULT_CURRENCY } from '../types/common';

export interface Settings {
  categories: Array<{
    label: string;
    value: string;
  }>;
  stores: Array<{
    label: string;
    value: string;
  }>;
  currency: Currency;
}

const initialState: Settings = {
  categories: [
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Transport', value: 'Transport' },
    { label: 'Food', value: 'Food' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Entertainment', value: 'Entertainment' },
    { label: 'Health', value: 'Health' },
    { label: 'Education', value: 'Education' },
    { label: 'Bills', value: 'Bills' },
    { label: 'Salary', value: 'Salary' },
    { label: 'Other', value: 'Other' },
  ],
  stores: [
    { label: 'Nike Store', value: 'Nike Store' },
    { label: 'Apple Store', value: 'Apple Store' },
    { label: 'Uber', value: 'Uber' },
    { label: 'Grocery Store', value: 'Grocery Store' },
  ],
  currency: DEFAULT_CURRENCY,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    addCategory: (state, action: PayloadAction<string>) => {
      state.categories.push({
        label: action.payload,
        value: action.payload,
      });
    },
    addStore: (state, action: PayloadAction<string>) => {
      state.stores.push({
        label: action.payload,
        value: action.payload,
      });
    },
    setCurrency: (state, action: PayloadAction<Currency>) => {
      state.currency = action.payload;
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(cat => cat.value !== action.payload);
    },
    deleteStore: (state, action: PayloadAction<string>) => {
      state.stores = state.stores.filter(store => store.value !== action.payload);
    },
    setState: (state, action: PayloadAction<Settings>) => {
      return action.payload;
    },
  },
});

export const { addCategory, addStore, setCurrency, deleteCategory, deleteStore, setState } = settingsSlice.actions;
export default settingsSlice.reducer; 