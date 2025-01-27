import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { 
  addIncomeAllocation, 
  removeIncomeAllocation 
} from '../store/budgetSlice';
import { 
  calculateIncomeAllocation 
} from '../utils/budgetUtils';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { colors } from '../theme/colors';
import IncomeAllocationChart from '../components/IncomeAllocationChart';
import Dropdown from '../components/Dropdown';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function IncomeAllocationScreen() {
  const dispatch = useAppDispatch();
  const { incomeAllocations } = useAppSelector(state => state.budget);
  const { items: transactions } = useAppSelector(state => state.transactions);
  const { currency } = useAppSelector(state => state.settings);
  const navigation = useNavigation();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');

  // Detect monthly income (if any transactions exist)
  const monthlyIncome = useMemo(() => {
    const today = new Date();
    const incomeTransactions = transactions.filter(t => 
      t.type === 'income' && 
      new Date(t.date).getMonth() === today.getMonth() &&
      new Date(t.date).getFullYear() === today.getFullYear()
    );

    return incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  // Get categories from transactions or use default
  const incomeCategories = useMemo(() => {
    const transactionCategories = [...new Set(
      transactions
        .filter(t => t.type === 'expense')
        .map(t => t.category)
    )];

    // Combine and deduplicate
    return [...new Set([...DEFAULT_CATEGORIES, ...transactionCategories])];
  }, [transactions]);

  // Calculate percentage from amount
  const calculatePercentage = (amount: number) => {
    if (!monthlyIncome) return 0;
    return (amount / monthlyIncome) * 100;
  };

  const handleAddAllocation = () => {
    if (!selectedCategory || !selectedAmount) {
      Alert.alert('Incomplete Information', 'Please select a category and enter amount');
      return;
    }

    try {
      const amount = Number(selectedAmount);
      
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
        return;
      }

      const percentage = calculatePercentage(amount);
      const totalCurrentPercentage = incomeAllocations.reduce(
        (sum, a) => sum + a.percentage, 
        0
      );

      if (totalCurrentPercentage + percentage > 100) {
        Alert.alert('Exceeds Income', 'Total allocation cannot exceed 100% of income');
        return;
      }

      dispatch(addIncomeAllocation({ 
        category: selectedCategory, 
        amount,
        percentage
      }));

      // Only reset the amount input, keep the category selected
      setSelectedAmount('');
    } catch (error) {
      Alert.alert('Error', 'Invalid amount format');
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Income Allocation</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.incomeSection}>
        <Text style={styles.incomeLabel}>Monthly Income</Text>
        <Text style={styles.incomeAmount}>
          {currency.symbol}{(monthlyIncome || 0).toFixed(2)}
        </Text>
      </View>

      {incomeAllocations.length > 0 && (
        <View style={styles.chartContainer}>
          <IncomeAllocationChart 
            allocations={incomeAllocations}
            totalIncome={monthlyIncome || 0}
          />
        </View>
      )}

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>New Allocation</Text>
        
        <Dropdown
          label="Category"
          selectedValue={selectedCategory}
          options={incomeCategories.map(cat => ({ label: cat, value: cat }))}
          onValueChange={setSelectedCategory}
          placeholder="Select category"
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountInput}>
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <TextInput
              style={styles.input}
              value={selectedAmount}
              onChangeText={setSelectedAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
            />
            {selectedAmount && (
              <Text style={styles.percentageIndicator}>
                ({calculatePercentage(Number(selectedAmount)).toFixed(1)}%)
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.addButton,
            (!selectedCategory || !selectedAmount) && styles.disabledButton
          ]}
          onPress={handleAddAllocation}
          disabled={!selectedCategory || !selectedAmount}
        >
          <Text style={styles.addButtonText}>Add Allocation</Text>
        </TouchableOpacity>
      </View>

      {incomeAllocations.length > 0 && (
        <View style={styles.allocationsList}>
          <Text style={styles.sectionTitle}>Current Allocations</Text>
          {incomeAllocations.map((allocation) => (
            <View key={allocation.id} style={styles.allocationItem}>
              <View style={styles.allocationContent}>
                <Text style={styles.allocationCategory}>
                  {allocation.category}
                </Text>
                <View style={styles.allocationDetails}>
                  <Text style={styles.allocationAmount}>
                    {currency.symbol}{allocation.amount.toFixed(2)}
                    <Text style={styles.allocationPercentage}>
                      {` (${allocation.percentage.toFixed(1)}%)`}
                    </Text>
                  </Text>
                  <TouchableOpacity 
                    onPress={() => dispatch(removeIncomeAllocation(allocation.id))}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerPlaceholder: {
    flex: 1,
  },
  incomeSection: {
    marginBottom: 20,
  },
  incomeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  incomeAmount: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  chartContainer: {
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: colors.cardLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  percentageIndicator: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  addButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  allocationsList: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  allocationItem: {
    marginBottom: 10,
  },
  allocationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allocationCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  allocationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allocationAmount: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  allocationPercentage: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  deleteButton: {
    padding: 10,
  },
});