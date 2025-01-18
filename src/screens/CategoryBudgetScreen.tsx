import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { updateCategoryBudget } from '../store/categoryBudgetsSlice';
import { Ionicons } from '@expo/vector-icons';
import { categoryIcons } from '../utils/categories';
import MonthPicker from '../components/MonthPicker';

type Props = {
  route: {
    params: {
      category: string;
      onSave?: (budget: number) => void;
    };
  };
  navigation: any;
};

export default function CategoryBudgetScreen({ route, navigation }: Props) {
  const { category, onSave } = route.params;
  const dispatch = useAppDispatch();
  const { currency } = useAppSelector(state => state.settings);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const monthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
  
  const categoryBudgets = useAppSelector(state => state.categoryBudgets.budgets[category] || []);
  const currentBudget = categoryBudgets.find(b => b.month === monthKey)?.amount || 0;

  const [budget, setBudget] = useState(currentBudget.toString());
  const icon = categoryIcons[category] || 'cart-outline';

  const handleSave = () => {
    const budgetAmount = parseFloat(budget);
    if (!isNaN(budgetAmount)) {
      dispatch(updateCategoryBudget({
        category,
        budget: budgetAmount,
        month: monthKey,
      }));
      if (onSave) {
        onSave(budgetAmount);
      }
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.categoryIcon}>
          <Ionicons name={icon} size={24} color={colors.textLight} />
        </View>
        <Text style={styles.categoryName}>{category}</Text>
      </View>

      <MonthPicker
        value={selectedMonth}
        onChange={(date) => {
          setSelectedMonth(date);
          const newMonthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const newBudget = categoryBudgets.find(b => b.month === newMonthKey)?.amount || 0;
          setBudget(newBudget.toString());
        }}
      />

      <View style={styles.form}>
        <Text style={styles.label}>Monthly Budget</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>{currency.symbol}</Text>
          <TextInput
            style={styles.input}
            value={budget}
            onChangeText={setBudget}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save Budget</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  form: {
    backgroundColor: colors.cardLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 20,
    color: colors.textSecondary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: colors.textPrimary,
    padding: 12,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
}); 