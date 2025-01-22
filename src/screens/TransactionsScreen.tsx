import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { colors } from '../theme/colors';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import TransactionsList from '../components/TransactionsList';
import { useState, useEffect, useMemo } from 'react';
import MonthPicker from '../components/MonthPicker';
import { categoryIcons } from '../utils/categories';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { fetchTransactions, fetchAllTransactions } from '../store/transactionsSlice';
import Dropdown from '../components/Dropdown';
import ExpenseBarChart from '../components/ExpenseBarChart';

type Period = 'week' | 'month';

export default function TransactionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { items: transactions = [], loading } = useAppSelector((state) => state.transactions);
  const { currency } = useAppSelector(state => state.settings);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const allBudgets = useAppSelector(state => state.categoryBudgets.budgets);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

  useEffect(() => {
    dispatch(fetchAllTransactions());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchAllTransactions());
  };

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof transactions } = {};
    
    (transactions || []).forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(transaction);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, transactions]) => ({
        month,
        transactions: transactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      }));
  }, [transactions]);

  const monthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;

  // Filter transactions for selected month
  const monthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return (
      transactionDate.getMonth() === selectedMonth.getMonth() &&
      transactionDate.getFullYear() === selectedMonth.getFullYear()
    );
  });

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category for selected month
  const expensesByCategory = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      if (!acc[t.category]) {
        const categoryBudgets = allBudgets[t.category] || [];
        const budget = categoryBudgets.find(b => b.month === monthKey)?.amount || 0;
        acc[t.category] = { total: 0, budget };
      }
      acc[t.category].total += t.amount;
      return acc;
    }, {} as Record<string, { total: number; budget: number }>);

  const { totalExpenses: periodTotalExpenses, chartData } = useMemo(() => {
    const now = new Date(selectedMonth);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDate = now.getDate();
    const currentDay = now.getDay();

    const getDateRange = () => {
      if (selectedPeriod === 'week') {
        const startDate = new Date(currentYear, currentMonth, currentDate - currentDay);
        const endDate = new Date(currentYear, currentMonth, currentDate + (6 - currentDay));
        return { startDate, endDate };
      } else {
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);
        return { startDate, endDate };
      }
    };

    const { startDate, endDate } = getDateRange();

    const filteredTransactions = monthTransactions.filter(t => {
      const txDate = new Date(t.date);
      return (
        t.type === 'expense' &&
        txDate >= startDate &&
        txDate <= endDate
      );
    });

    const total = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const generateChartData = () => {
      if (selectedPeriod === 'week') {
        return Array(7).fill(0).map((_, index) => {
          const day = new Date(startDate);
          day.setDate(startDate.getDate() + index);
          
          const dayExpenses = filteredTransactions
            .filter(t => {
              const txDate = new Date(t.date);
              return (
                txDate.getFullYear() === day.getFullYear() &&
                txDate.getMonth() === day.getMonth() &&
                txDate.getDate() === day.getDate()
              );
            })
            .reduce((sum, t) => sum + Number(t.amount), 0);

          return {
            value: dayExpenses,
            label: day.toLocaleDateString('en-US', { weekday: 'short' }),
            date: day,
          };
        });
      } else {
        const daysInMonth = endDate.getDate();
        return Array(daysInMonth).fill(0).map((_, index) => {
          const day = new Date(currentYear, currentMonth, index + 1);
          
          const dayExpenses = filteredTransactions
            .filter(t => {
              const txDate = new Date(t.date);
              return (
                txDate.getFullYear() === day.getFullYear() &&
                txDate.getMonth() === day.getMonth() &&
                txDate.getDate() === day.getDate()
              );
            })
            .reduce((sum, t) => sum + Number(t.amount), 0);

          return {
            value: dayExpenses,
            label: String(index + 1),
            date: day,
          };
        });
      }
    };

    return {
      totalExpenses: total,
      chartData: generateChartData(),
    };
  }, [monthTransactions, selectedPeriod, selectedMonth]);

  const periodOptions = [
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
  ];

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color={colors.textTertiary} />
      <Text style={styles.emptyStateTitle}>No Transactions</Text>
      <Text style={styles.emptyStateText}>
        You don't have any transactions for this month
      </Text>
    </View>
  );

  const renderExpenseItem = ([category, data]: [string, { total: number; budget: number }]) => {
    const percentage = Math.min((data.total / (data.budget || 1)) * 100, 100);
    const icon = categoryIcons[category] || 'cart-outline';
    
    const handleCategoryPress = () => {
      navigation.navigate('CategoryDetails', {
        category,
        transactions: monthTransactions.filter(t => t.category === category),
        budget: data.budget,
      });
    };
    
    return (
      <TouchableOpacity 
        key={category} 
        style={styles.categoryItem}
        onPress={handleCategoryPress}
        activeOpacity={0.7}
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
            <Text style={styles.categoryAmount}>
              {currency.symbol}{data.total.toFixed(2)}
            </Text>
            <Text style={[
              styles.percentageText,
              { color: percentage > 90 ? colors.error : colors.success }
            ]}>
              {percentage.toFixed(1)}%
            </Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar,
              { 
                width: `${percentage}%`,
                backgroundColor: percentage > 90 ? colors.error : colors.primary 
              }
            ]} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  const handleViewAllExpenses = () => {
    navigation.navigate('AllExpenses', {
      categories: expensesByCategory,
      month: selectedMonth,
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={loading} 
          onRefresh={onRefresh}
        />
      }
    >
      <View style={styles.header}>
        <MonthPicker 
          value={selectedMonth}
          onChange={setSelectedMonth}
        />
      </View>

      <View style={styles.outcomeCard}>
        <Text style={styles.outcomeLabel}>Total Expenses</Text>
        <Text style={styles.outcomeAmount}>
          {currency.symbol}{periodTotalExpenses.toFixed(2)}
        </Text>
        <View style={styles.chart}>
          <ExpenseBarChart 
            data={chartData}
            maxValue={Math.max(...chartData.map(d => d.value), 1)}
            height={120}
            period={selectedPeriod}
            currency={currency}
          />
        </View>
        <View style={styles.periodSelector}>
          <Dropdown
            value={selectedPeriod}
            options={periodOptions}
            onChange={(value) => setSelectedPeriod(value as Period)}
            compact
            isDark
            placeholder="This Month"
          />
        </View>
      </View>

      <View style={styles.summaryCards}>
        <View style={[styles.summaryCard, { backgroundColor: colors.success }]}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={styles.summaryAmount}>
            {currency.symbol}{totalIncome.toFixed(2)}
          </Text>
          <View style={styles.cardIcon}>
            <Ionicons name="card-outline" size={20} color={colors.textLight} />
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.error }]}>
          <Text style={styles.summaryLabel}>Total Expense</Text>
          <Text style={styles.summaryAmount}>
            {currency.symbol}{totalExpense.toFixed(2)}
          </Text>
          <View style={styles.cardIcon}>
            <Ionicons name="wallet-outline" size={20} color={colors.textLight} />
          </View>
        </View>
      </View>

      {monthTransactions.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <View style={styles.expensesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Expenses by Category</Text>
              <TouchableOpacity onPress={handleViewAllExpenses}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.expensesList}>
              {Object.entries(expensesByCategory).map(renderExpenseItem)}
            </View>
          </View>

          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transactions</Text>
              <Text style={styles.budgetText}>{monthTransactions.length} transactions</Text>
            </View>
            <TransactionsList 
              transactions={monthTransactions || []}
              onItemPress={(transaction) => {
                // Handle transaction press
              }}
            />
          </View>
        </>
      )}
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
    paddingTop: 40,
  },
  summaryCards: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    position: 'relative',
  },
  summaryLabel: {
    color: colors.textLight,
    fontSize: 14,
  },
  summaryAmount: {
    color: colors.textLight,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
  },
  cardIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  expensesSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  expensesList: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  viewAll: {
    color: colors.primary,
    fontSize: 14,
  },
  categoryItem: {
    backgroundColor: colors.background,
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
  categoryAmount: {
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
  transactionsSection: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  outcomeCard: {
    margin: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.card,
  },
  outcomeLabel: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.7,
  },
  outcomeAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: 8,
  },
  chart: {
    height: 120,
    marginTop: 20,
    marginBottom: 10,
  },
  periodSelector: {
    marginTop: 16,
  },
}); 