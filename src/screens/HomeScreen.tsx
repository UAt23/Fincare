import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { fetchTransactions, fetchAllTransactions } from '../store/transactionsSlice';
import TransactionsList from '../components/TransactionsList';
import { useNavigation } from '@react-navigation/native';
import { calculateIncomeAllocation, calculateMonthlyNeeded, calculateMonthlyAmount } from '../utils/budgetUtils';

// Quick access feature card component
const FeatureCard = ({ 
  icon, 
  title, 
  onPress 
}: { 
  icon: string, 
  title: string, 
  onPress: () => void 
}) => (
  <TouchableOpacity 
    style={styles.featureCard} 
    onPress={onPress}
  >
    <View style={styles.featureCardContent}>
      <View style={styles.featureIconContainer}>
        <Ionicons 
          name={icon} 
          size={32} 
          color={colors.primary} 
        />
      </View>
      <Text style={styles.featureCardText}>{title}</Text>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { items: transactions = [], loading } = useAppSelector((state) => state.transactions);
  const navigation = useNavigation();
  const { currency } = useAppSelector(state => state.settings);
  const { incomeAllocations, savingsGoals, recurringTransactions } = useAppSelector(state => state.budget);

  useEffect(() => {
    // Fetch all transactions for accurate statistics
    dispatch(fetchAllTransactions());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchAllTransactions());
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const greetingMessage = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Let's start your day with your finances in check!";
    if (hour < 18) return "Hope you're having a great day managing your expenses!";
    return "Time to review your daily spending!";
  }, []);

  // Calculate quick stats from all transactions
  const stats = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayExpenses = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' && 
          txDate.getDate() === today.getDate() &&
          txDate.getMonth() === today.getMonth() &&
          txDate.getFullYear() === today.getFullYear();
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const yesterdayExpenses = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' && 
          txDate.getDate() === yesterday.getDate() &&
          txDate.getMonth() === yesterday.getMonth() &&
          txDate.getFullYear() === yesterday.getFullYear();
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthExpenses = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' && 
          txDate.getMonth() === today.getMonth() &&
          txDate.getFullYear() === today.getFullYear();
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { todayExpenses, yesterdayExpenses, monthExpenses };
  }, [transactions]);

  // Get only recent transactions for the list
  const recentTransactions = useMemo(() => {
    return [...transactions] // Create a new array before sorting
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Calculate monthly recurring expenses/income
  const monthlyRecurring = useMemo(() => {
    return recurringTransactions.reduce(
      (acc, transaction) => {
        const monthlyAmount = calculateMonthlyAmount(transaction.amount, transaction.frequency);
        if (transaction.type === 'income') {
          acc.income += monthlyAmount;
        } else {
          acc.expenses += monthlyAmount;
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );
  }, [recurringTransactions]);

  // Calculate savings progress
  const savingsProgress = useMemo(() => {
    return savingsGoals.map(goal => ({
      ...goal,
      progress: (goal.currentAmount / goal.targetAmount) * 100,
      monthlyNeeded: calculateMonthlyNeeded(goal.targetAmount, goal.currentAmount, goal.targetDate)
    }));
  }, [savingsGoals]);

  const handleRecurringTransaction = (data: any) => {
    const monthlyAmount = calculateMonthlyAmount(data.amount, data.frequency);
    // Rest of your transaction handling code...
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <View style={styles.profileContainer}>
            <View style={styles.profileIcon}>
              <Ionicons 
                name="person" 
                size={32} 
                color={colors.card}
              />
            </View>
            <View style={styles.profileStatus} />
          </View>
          <View style={styles.greetingText}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>Priscilla</Text>
            <Text style={styles.message}>{greetingMessage}</Text>
          </View>
        </View>
      </View>

      {/* New Feature Quick Access Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresSectionTitle}>Financial Tools</Text>
        <View style={styles.featuresGrid}>
          <FeatureCard 
            icon="wallet" 
            title="Income Allocation" 
            onPress={() => navigation.navigate('IncomeAllocation')}
          />
          <FeatureCard 
            icon="trophy" 
            title="Savings Goals" 
            onPress={() => navigation.navigate('SavingsGoals')}
          />
          <FeatureCard 
            icon="repeat" 
            title="Recurring Transactions" 
            onPress={() => navigation.navigate('RecurringTransactions')}
          />
        </View>
      </View>

      <View style={styles.quickStats}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statLabel}>Today's Expenses</Text>
          <Text style={styles.statAmount}>
            {currency.symbol}{stats.todayExpenses.toFixed(2)}
          </Text>
          <Text style={styles.statCompare}>
          {currency.symbol}{Math.abs(stats.todayExpenses - stats.yesterdayExpenses)}
          {stats.todayExpenses > stats.yesterdayExpenses ? ' higher' : ' lower'}
          </Text>
          <Text style={styles.statCompare}>
            than yesterday
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Month Total Expenses</Text>
          <Text style={[styles.statAmount, { color: colors.textLight }]}>
            {currency.symbol}{stats.monthExpenses.toFixed(2)}
          </Text>
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Financial Insights Section */}
      {(incomeAllocations.length > 0 || savingsGoals.length > 0 || recurringTransactions.length > 0) && (
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Financial Insights</Text>
          
          {/* Income Allocation Summary */}
          {incomeAllocations.length > 0 && (
            <TouchableOpacity 
              style={styles.insightCard}
              onPress={() => navigation.navigate('IncomeAllocation')}
            >
              <View style={styles.insightHeader}>
                <Ionicons name="pie-chart" size={24} color={colors.primary} />
                <Text style={styles.insightTitle}>Income Allocation</Text>
              </View>
              <Text style={styles.insightDescription}>
                Your income is allocated across {incomeAllocations.length} categories
              </Text>
            </TouchableOpacity>
          )}

          {/* Savings Goals Progress */}
          {savingsProgress.length > 0 && (
            <TouchableOpacity 
              style={styles.insightCard}
              onPress={() => navigation.navigate('SavingsGoals')}
            >
              <View style={styles.insightHeader}>
                <Ionicons name="trophy" size={24} color={colors.primary} />
                <Text style={styles.insightTitle}>Savings Goals</Text>
              </View>
              <View style={styles.savingsPreview}>
                {savingsProgress.slice(0, 2).map(goal => {
                  const targetDate = new Date(goal.targetDate);
                  return (
                  <View key={goal.id} style={styles.savingsGoalItem}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(goal.progress, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{goal.progress.toFixed(1)}%</Text>
                  </View>
                  );
                })}
                {savingsProgress.length > 2 && (
                  <Text style={styles.moreGoalsText}>
                    +{savingsProgress.length - 2} more goals
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Recurring Transactions Summary */}
          {recurringTransactions.length > 0 && (
            <TouchableOpacity 
              style={styles.insightCard}
              onPress={() => navigation.navigate('RecurringTransactions')}
            >
              <View style={styles.insightHeader}>
                <Ionicons name="repeat" size={24} color={colors.primary} />
                <Text style={styles.insightTitle}>Monthly Recurring</Text>
              </View>
              <View style={styles.recurringPreview}>
                <View style={styles.recurringItem}>
                  <Text style={styles.recurringLabel}>Income</Text>
                  <Text style={[styles.recurringAmount, styles.incomeText]}>
                    +{currency.symbol}{monthlyRecurring.income.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.recurringItem}>
                  <Text style={styles.recurringLabel}>Expenses</Text>
                  <Text style={[styles.recurringAmount, styles.expenseText]}>
                    -{currency.symbol}{monthlyRecurring.expenses.toFixed(2)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.transactionsContainer}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Add empty state when transactions array is empty */}
        {(!transactions || transactions.length === 0) && (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Transactions</Text>
            <Text style={styles.emptyStateText}>
              You don't have any transactions for this month
            </Text>
          </View>
        )}

        <TransactionsList 
          transactions={recentTransactions}
          onItemPress={(transaction) => {
            console.log('Transaction pressed:', transaction);
          }}
        />
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
    paddingTop: 40,
    backgroundColor: colors.cardMedium,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileStatus: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.card,
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginVertical: 4,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  transactionsContainer: {
    paddingHorizontal: 20,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  viewAllButton: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  transactionsList: {
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethod: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  date: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  quickStats: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 8,
  },
  statCompare: {
    fontSize: 13,
    color: colors.textLight,
  },
  viewDetailsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: '500',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  featuresSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: colors.textPrimary,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: colors.cardLight,
    borderColor: colors.cardMedium,
    borderWidth: 4,
    borderRadius: 12,
    width: '30%',
    padding: 12,
    alignItems: 'center',
  },
  featureCardContent: {
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureCardText: {
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 5,
  },
  insightsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: colors.textPrimary,
  },
  insightCard: {
    backgroundColor: colors.cardLight,
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: colors.textPrimary,
  },
  insightDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  savingsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savingsGoalItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressBar: {
    width: 100,
    height: 10,
    backgroundColor: colors.cardMidLight,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  moreGoalsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recurringPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recurringItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recurringLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  recurringAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  incomeText: {
    color: colors.success,
  },
  expenseText: {
    color: colors.error,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
}); 