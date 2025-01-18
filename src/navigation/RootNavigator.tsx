import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import EntryScreen from '../screens/EntryScreen';
import CategoryDetailsScreen from '../screens/CategoryDetailsScreen';
import CategoryBudgetScreen from '../screens/CategoryBudgetScreen';
import AllExpensesScreen from '../screens/AllExpensesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CurrencyScreen from '../screens/CurrencyScreen';
import CategoryBudgetsScreen from '../screens/CategoryBudgetsScreen';

export type RootStackParamList = {
  Main: undefined;
  Entry: undefined;
  CategoryDetails: {
    category: string;
    transactions: Transaction[];
    budget: number;
  };
  CategoryBudget: {
    category: string;
    onSave?: (budget: number) => void;
  };
  AllExpenses: {
    categories: Record<string, { total: number; budget: number }>;
    month: Date;
  };
  Profile: undefined;
  Currency: undefined;
  CategoryBudgets: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Entry" component={EntryScreen} />
      <Stack.Screen 
        name="CategoryDetails" 
        component={CategoryDetailsScreen}
        options={{
          headerShown: true,
          title: 'Category Details',
        }}
      />
      <Stack.Screen 
        name="CategoryBudget" 
        component={CategoryBudgetScreen}
        options={{
          headerShown: true,
          title: 'Edit Budget',
        }}
      />
      <Stack.Screen 
        name="AllExpenses" 
        component={AllExpensesScreen}
        options={{
          headerShown: true,
          title: 'All Expenses',
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: 'Profile',
        }}
      />
      <Stack.Screen 
        name="Currency" 
        component={CurrencyScreen}
        options={{
          headerShown: true,
          title: 'Currency',
        }}
      />
      <Stack.Screen 
        name="CategoryBudgets" 
        component={CategoryBudgetsScreen}
        options={{
          headerShown: true,
          title: 'Category Budgets',
        }}
      />
    </Stack.Navigator>
  );
} 