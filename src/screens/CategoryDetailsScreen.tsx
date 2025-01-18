import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { categoryIcons } from '../utils/categories';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import TransactionsList from '../components/TransactionsList';
import { Transaction } from '../types/transaction';
import { updateCategoryBudget } from '../store/categoryBudgetsSlice';

type Props = {
  route: {
    params: {
      category: string;
      transactions: Transaction[];
      budget: number;
    };
  };
  navigation: any;
};

export default function CategoryDetailsScreen({ route, navigation }: Props) {
  const { category, transactions } = route.params;
  const dispatch = useAppDispatch();
  const { currency } = useAppSelector(state => state.settings);
  const currentBudget = useAppSelector(state => 
    state.categoryBudgets.budgets[category] || route.params.budget
  );
  const icon = categoryIcons[category] || 'cart-outline';

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const percentage = Math.min((totalSpent / currentBudget) * 100, 100);

  const handleEditBudget = () => {
    navigation.navigate('CategoryBudget', { 
      category,
      onSave: (newBudget: number) => {
        dispatch(updateCategoryBudget({ category, budget: newBudget }));
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.categoryIcon}>
          <Ionicons name={icon} size={32} color={colors.textLight} />
        </View>
        <Text style={styles.categoryName}>{category}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Spent</Text>
          <Text style={styles.statValue}>
            {currency.symbol}{totalSpent.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.statCard}
          onPress={handleEditBudget}
          activeOpacity={0.7}
        >
          <Text style={styles.statLabel}>Budget</Text>
          <View style={styles.budgetValue}>
            <Text style={styles.statValue}>
              {currency.symbol}{currentBudget.toFixed(2)}
            </Text>
            <Ionicons name="pencil" size={16} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Budget Usage</Text>
          <Text 
            style={[
              styles.progressPercentage,
              { color: percentage > 90 ? colors.error : colors.success }
            ]}
          >
            {percentage.toFixed(1)}%
          </Text>
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
      </View>

      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Transactions</Text>
        <TransactionsList transactions={transactions} />
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
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  categoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardLight,
    padding: 16,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  budgetValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressSection: {
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  transactionsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
}); 