import { View, StyleSheet } from 'react-native';
import { useAppSelector } from '../hooks/useAppStore';
import TransactionsList from '../components/TransactionsList';
import { colors } from '../theme/colors';

export default function TransactionsScreen() {
  const { items: transactions } = useAppSelector((state) => state.transactions);

  return (
    <View style={styles.container}>
      <TransactionsList 
        transactions={transactions}
        onItemPress={(transaction) => {
          // Handle transaction details view
          console.log('Transaction pressed:', transaction);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
  },
}); 