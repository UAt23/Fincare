import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { fetchTransactions } from '../store/transactionsSlice';
import TransactionsList from '../components/TransactionsList';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { items: transactions, loading } = useAppSelector((state) => state.transactions);
  const navigation = useNavigation();
  const { currency } = useAppSelector(state => state.settings);

  useEffect(() => {
    dispatch(fetchTransactions(10));
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchTransactions(10));
  };

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof transactions } = {};
    
    transactions.forEach(transaction => {
      if (!groups[transaction.date]) {
        groups[transaction.date] = [];
      }
      groups[transaction.date].push(transaction);
    });

    return Object.entries(groups);
  }, [transactions]);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>Priscilla</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.outcomeCard}>
        <Text style={styles.outcomeLabel}>Total Expenses</Text>
        <Text style={styles.outcomeAmount}>
          {currency.symbol}{totalExpenses.toFixed(2)}
        </Text>
        <View style={styles.chart}>
          {/* Chart will be implemented later */}
        </View>
        <Text style={styles.periodLabel}>This Month</Text>
      </View>

      <View style={styles.transactionsContainer}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>

        <TransactionsList 
          transactions={transactions}
          limit={5}
          onItemPress={(transaction) => {
            // Handle transaction details view
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
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
  periodLabel: {
    fontSize: 12,
    color: colors.textLight,
    opacity: 0.7,
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
}); 