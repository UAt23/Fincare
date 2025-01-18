import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { categoryIcons } from '../utils/categories';
import { useState } from 'react';
import MonthPicker from '../components/MonthPicker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { updateCategoryBudget } from '../store/categoryBudgetsSlice';

export default function CategoryBudgetsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { currency } = useAppSelector(state => state.settings);
  const allBudgets = useAppSelector(state => state.categoryBudgets.budgets);
  const transactions = useAppSelector(state => state.transactions.items);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const monthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;

  // Get all unique categories from all transactions
  const allCategories = [...new Set(transactions.map(t => t.category))].sort();

  // Filter transactions for selected month
  const monthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return (
      transactionDate.getMonth() === selectedMonth.getMonth() &&
      transactionDate.getFullYear() === selectedMonth.getFullYear()
    );
  });

  // Get categories that have transactions in the selected month
  const activeCategories = [...new Set(monthTransactions.map(t => t.category))];

  // Initialize budgets for categories with transactions if they don't exist
  activeCategories.forEach(category => {
    if (!allBudgets[category]?.some(b => b.month === monthKey)) {
      dispatch(updateCategoryBudget({
        category,
        budget: 0,
        month: monthKey,
      }));
    }
  });

  // Calculate spending for each category
  const categorySpending = allCategories.reduce((acc, category) => {
    const spending = monthTransactions
      .filter(t => t.category === category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyBudgets = allBudgets[category] || [];
    const budget = monthlyBudgets.find(b => b.month === monthKey)?.amount || 0;
    
    acc[category] = {
      spending,
      budget,
      percentage: budget > 0 ? (spending / budget) * 100 : 0,
      hasTransactions: activeCategories.includes(category),
    };
    
    return acc;
  }, {} as Record<string, { 
    spending: number; 
    budget: number; 
    percentage: number;
    hasTransactions: boolean;
  }>);

  const handleCategoryPress = (category: string) => {
    navigation.navigate('CategoryBudget', {
      category,
      onSave: (newBudget: number) => {
        dispatch(updateCategoryBudget({
          category,
          budget: newBudget,
          month: monthKey,
        }));
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MonthPicker
          value={selectedMonth}
          onChange={setSelectedMonth}
        />
      </View>

      <View style={styles.categoriesList}>
        {allCategories.map(category => {
          const data = categorySpending[category];
          const icon = categoryIcons[category] || 'cart-outline';

          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryItem,
                !data.hasTransactions && styles.inactiveCategory
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryIcon}>
                    <Ionicons name={icon} size={20} color={colors.textLight} />
                  </View>
                  <View>
                    <Text style={styles.categoryName}>{category}</Text>
                    <Text style={styles.budgetText}>
                      Budget: {currency.symbol}{data.budget.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View style={styles.amountContainer}>
                  <Text style={styles.spendingAmount}>
                    {currency.symbol}{data.spending.toFixed(2)}
                  </Text>
                  <Text style={[
                    styles.percentageText,
                    { color: data.percentage > 90 ? colors.error : colors.success }
                  ]}>
                    {data.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View 
                  style={[
                    styles.progressBar,
                    { 
                      width: `${Math.min(data.percentage, 100)}%`,
                      backgroundColor: data.percentage > 90 ? colors.error : colors.primary 
                    }
                  ]} 
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
  },
  categoriesList: {
    padding: 20,
    gap: 12,
  },
  categoryItem: {
    backgroundColor: colors.cardLight,
    borderRadius: 12,
    padding: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  budgetText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  spendingAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  inactiveCategory: {
    opacity: 0.6,
  },
}); 