import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Platform,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { 
  addRecurringTransaction, 
  removeRecurringTransaction 
} from '../store/budgetSlice';
import { colors } from '../theme/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import Dropdown from '../components/Dropdown';
import { DEFAULT_CATEGORIES } from '../utils/categories';

const FREQUENCIES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

export default function RecurringTransactionsScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { recurringTransactions } = useAppSelector(state => state.budget);
  const { currency } = useAppSelector(state => state.settings);
  
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: new Date(),
    endDate: undefined as Date | undefined
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleAddTransaction = () => {
    if (!newTransaction.amount || !newTransaction.category) {
      Alert.alert('Incomplete Information', 'Please fill in all required fields');
      return;
    }

    dispatch(addRecurringTransaction({
      ...newTransaction,
      amount: Number(newTransaction.amount)
    }));

    // Reset form
    setNewTransaction({
      type: 'expense',
      amount: '',
      category: '',
      frequency: 'monthly',
      startDate: new Date(),
      endDate: undefined
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        <Text style={styles.headerTitle}>Recurring Transactions</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Add New Transaction Form */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Create New Recurring Transaction</Text>
        
        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[
              styles.typeButton,
              newTransaction.type === 'expense' && styles.activeTypeButton
            ]}
            onPress={() => setNewTransaction(prev => ({ ...prev, type: 'expense' }))}
          >
            <Text style={[
              styles.typeButtonText,
              newTransaction.type === 'expense' && styles.activeTypeButtonText
            ]}>
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.typeButton,
              newTransaction.type === 'income' && styles.activeTypeButton
            ]}
            onPress={() => setNewTransaction(prev => ({ ...prev, type: 'income' }))}
          >
            <Text style={[
              styles.typeButtonText,
              newTransaction.type === 'income' && styles.activeTypeButtonText
            ]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountInput}>
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <TextInput 
              style={styles.input}
              value={newTransaction.amount}
              onChangeText={(text) => setNewTransaction(prev => ({ ...prev, amount: text }))}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <Dropdown
            label="Select Category"
            options={DEFAULT_CATEGORIES.map(cat => ({ label: cat, value: cat }))}
            selectedValue={newTransaction.category}
            onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Frequency</Text>
          <Dropdown
            label="Select Frequency"
            options={FREQUENCIES}
            selectedValue={newTransaction.frequency}
            onValueChange={(value) => setNewTransaction(prev => ({ 
              ...prev, 
              frequency: value as 'daily' | 'weekly' | 'monthly' | 'yearly'
            }))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDate(newTransaction.startDate)}
            </Text>
            <Ionicons name="calendar" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {showStartDatePicker && (
          <DateTimePicker
            value={newTransaction.startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setNewTransaction(prev => ({ ...prev, startDate: selectedDate }));
              }
            }}
          />
        )}

        <TouchableOpacity 
          style={[
            styles.addButton,
            (!newTransaction.amount || !newTransaction.category) && styles.disabledButton
          ]}
          onPress={handleAddTransaction}
          disabled={!newTransaction.amount || !newTransaction.category}
        >
          <Text style={styles.addButtonText}>Create Recurring Transaction</Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      {recurringTransactions.length > 0 && (
        <View style={styles.transactionsList}>
          <Text style={styles.sectionTitle}>Active Recurring Transactions</Text>
          {recurringTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View>
                  <Text style={styles.transactionCategory}>
                    {transaction.category}
                  </Text>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'income' ? colors.success : colors.error }
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {currency.symbol}{transaction.amount.toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => dispatch(removeRecurringTransaction(transaction.id))}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.transactionDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Frequency</Text>
                  <Text style={styles.detailText}>
                    {transaction.frequency.charAt(0).toUpperCase() + 
                     transaction.frequency.slice(1)}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Start Date</Text>
                  <Text style={styles.detailText}>
                    {formatDate(new Date(transaction.startDate))}
                  </Text>
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
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerPlaceholder: {
    width: 24,
  },
  formCard: {
    backgroundColor: colors.cardLight,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.background,
    padding: 4,
    borderRadius: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTypeButton: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  activeTypeButtonText: {
    color: colors.textLight,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  addButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  transactionsList: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  transactionCard: {
    backgroundColor: colors.cardLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 10,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
}); 