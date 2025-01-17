import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './transactionsSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 