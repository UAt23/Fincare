import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { useAppSelector } from '../hooks/useAppStore';
import { categoryIcons } from '../utils/categories';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  route: {
    params: {
      categories: Record<string, { total: number; budget: number }>;
      month: Date;
    };
  };
};

export default function AllExpensesScreen({ route }: Props) {
  const { categories, month } = route.params;
  const { currency } = useAppSelector(state => state.settings);

  const totalBudget = Object.values(categories).reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = Object.values(categories).reduce((sum, cat) => sum + cat.total, 0);
  const monthName = month.toLocaleString('default', { month: 'long' });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Overview</Text>
        <Text style={styles.subtitle}>{monthName} {month.getFullYear()}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Budget</Text>
          <Text style={styles.summaryValue}>
            {currency.symbol}{totalBudget.toFixed(2)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryValue}>
            {currency.symbol}{totalSpent.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        {Object.entries(categories)
          .sort(([, a], [, b]) => b.total - a.total)
          .map(([category, data]) => {
            const percentage = Math.min((data.total / data.budget) * 100, 100);
            const icon = categoryIcons[category] || 'cart-outline';

            return (
              <View key={category} style={styles.categoryCard}>
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
              </View>
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
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.cardLight,
    borderRadius: 16,
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  categoriesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: colors.cardLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  // ... rest of the styles from CategoryDetailsScreen
}); 