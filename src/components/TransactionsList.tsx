import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { Transaction } from '../types/transaction';
import { colors } from '../theme/colors';
import TransactionIcon from './TransactionIcon';
import { formatAmount } from '../utils/currency';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { convertTransactionAmounts } from '../store/transactionsSlice';

type Props = {
  transactions: Transaction[];
  onItemPress?: (transaction: Transaction) => void;
  limit?: number;
};

export default function TransactionsList({ transactions, onItemPress, limit }: Props) {
  const { currency } = useAppSelector(state => state.settings);
  const dispatch = useAppDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (transactions.length > 0 && transactions[0].originalCurrency) {
      dispatch(convertTransactionAmounts(currency));
    }
  }, [currency, dispatch]);

  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  const renderAmount = (transaction: Transaction) => {
    const isOriginalDifferent = transaction.originalCurrency?.code !== currency.code;
    const mainAmount = isOriginalDifferent 
      ? formatAmount(transaction.amount, currency)
      : formatAmount(transaction.originalAmount, transaction.originalCurrency);

    return (
      <View style={styles.amountContainer}>
        <Text style={[
          styles.amount,
          { color: transaction.type === 'income' ? colors.chart.green : colors.textPrimary }
        ]}>
          {transaction.type === 'income' ? '+' : '-'}
          {isOriginalDifferent 
            ? `${transaction.originalCurrency.symbol}${transaction.originalAmount.toFixed(2)}`
            : mainAmount
          }
        </Text>
        {isOriginalDifferent && (
          <Text style={styles.convertedAmount}>
            {`${currency.symbol}${transaction.amount.toFixed(2)}`}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {displayTransactions.map((transaction, index) => (
        <Animated.View
          key={transaction.id}
          style={[
            styles.itemContainer,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.transactionItem}
            onPress={() => onItemPress?.(transaction)}
            activeOpacity={0.7}
          >
            <TransactionIcon 
              category={transaction.category}
              type={transaction.type}
            />
            <View style={styles.transactionInfo}>
              <View style={styles.transactionMain}>
                <Text style={styles.storeName}>{transaction.store}</Text>
                {renderAmount(transaction)}
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.category}>{transaction.category}</Text>
                <Text style={styles.date}>{transaction.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 16,
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
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  convertedAmount: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  date: {
    fontSize: 13,
    color: colors.textTertiary,
  },
}); 