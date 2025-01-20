import { Transaction } from '../types/transaction';

const mockCategories = [
  'Shopping',
  'Transport',
  'Food',
  'Electronics',
  'Entertainment',
  'Health',
  'Bills',
  'Salary',
];

const mockStores = [
  'Amazon',
  'Uber',
  'Grocery Store',
  'Netflix',
  'Apple Store',
  'Pharmacy',
  'Restaurant',
  'Cafe',
];

export const generateMockTransactions = (month: Date): Transaction[] => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  
  // Generate salary for the month
  const transactions: Transaction[] = [{
    id: 'salary-' + monthIndex,
    type: 'income',
    amount: 5000,
    date: new Date(year, monthIndex, 1).toISOString(),
    category: 'Salary',
    store: 'Company Inc',
    note: 'Monthly salary',
    currency: { code: 'USD', symbol: '$' },
    originalAmount: 5000,
    originalCurrency: { code: 'USD', symbol: '$' },
  }];

  // Generate 20-30 random expenses for the month
  const numTransactions = Math.floor(Math.random() * 11) + 20; // 20-30 transactions

  for (let i = 0; i < numTransactions; i++) {
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    const amount = Math.floor(Math.random() * 200) + 10; // Random amount between 10-210
    const category = mockCategories[Math.floor(Math.random() * (mockCategories.length - 1))]; // Exclude Salary
    const store = mockStores[Math.floor(Math.random() * mockStores.length)];

    transactions.push({
      id: `tx-${monthIndex}-${i}`,
      type: 'expense',
      amount,
      date: new Date(year, monthIndex, day).toISOString(),
      category,
      store,
      note: `Purchase at ${store}`,
      currency: { code: 'USD', symbol: '$' },
      originalAmount: amount,
      originalCurrency: { code: 'USD', symbol: '$' },
    });
  }

  // Sort by date
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}; 