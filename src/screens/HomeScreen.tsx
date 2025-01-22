import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { fetchTransactions, fetchAllTransactions } from '../store/transactionsSlice';
import TransactionsList from '../components/TransactionsList';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { items: transactions = [], loading } = useAppSelector((state) => state.transactions);
  const navigation = useNavigation();
  const { currency } = useAppSelector(state => state.settings);

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
                color={colors.textLight}
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

      <View style={styles.quickStats}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statLabel}>Today's Expenses</Text>
          <Text style={styles.statAmount}>
            {currency.symbol}{stats.todayExpenses.toFixed(2)}
          </Text>
          <Text style={styles.statCompare}>
            {Math.abs(stats.todayExpenses - stats.yesterdayExpenses)}
          </Text>
          <Text style={styles.statCompare}>
            {stats.todayExpenses > stats.yesterdayExpenses ? 'higher' : 'lower'} than yesterday
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Month Total</Text>
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

      <View style={styles.transactionsContainer}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>

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
    backgroundColor: colors.primary,
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
}); 