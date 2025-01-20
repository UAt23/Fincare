import { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { addTransaction } from '../store/transactionsSlice';
import { addCategory, addStore, setCurrency } from '../store/settingsSlice';
import Dropdown from '../components/Dropdown';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CURRENCIES } from '../types/common';
import DateTimePicker from '@react-native-community/datetimepicker';

type RootStackParamList = {
  Entry: undefined;
  MainTabs: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Entry'>;
};

export default function EntryScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { categories, stores, currency } = useAppSelector(state => state.settings);
  
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    store: '',
    note: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      
      const amount = parseFloat(formData.amount);
      if (!amount || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      
      if (!formData.store) {
        setError('Please select a store/source');
        return;
      }
      
      if (!formData.category) {
        setError('Please select a category');
        return;
      }

      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);

      await dispatch(addTransaction({
        type: formData.type as 'income' | 'expense',
        amount,
        category: formData.category,
        store: formData.store,
        note: formData.note.trim(),
        originalAmount: amount,
        originalCurrency: selectedCurrency,
        currency: currency,
        date: selectedDate.toISOString(),
      })).unwrap();
      
      navigation.goBack();
    } catch (err) {
      setError('Failed to create transaction. Please try again.');
    }
  };

  // Convert currencies to options format
  const currencyOptions = CURRENCIES.map(curr => ({
    label: `${curr.code} ${curr.name}`,
    value: curr.code,
    extraData: curr,
  }));

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Transaction</Text>
      </View>

      <ScrollView style={styles.content}>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[
              styles.typeButton, 
              formData.type === 'expense' && styles.typeButtonActive
            ]}
            onPress={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
          >
            <Text style={[
              styles.typeButtonText,
              formData.type === 'expense' && styles.typeButtonTextActive
            ]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.typeButton, 
              formData.type === 'income' && styles.typeButtonActive
            ]}
            onPress={() => setFormData(prev => ({ ...prev, type: 'income' }))}
          >
            <Text style={[
              styles.typeButtonText,
              formData.type === 'income' && styles.typeButtonTextActive
            ]}>Income</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountInput}>
            <Dropdown
              label="Currency"
              value={selectedCurrency.code}
              options={currencyOptions}
              onChange={(code) => {
                const newCurrency = CURRENCIES.find(c => c.code === code);
                if (newCurrency) {
                  setSelectedCurrency(newCurrency);
                }
              }}
              compact
              renderOption={(option) => (
                <View style={styles.currencyOption}>
                  <Text style={styles.currencyCode}>
                    {option.extraData.symbol} {option.value}
                  </Text>
                  <Text style={styles.currencyName}>
                    {option.extraData.name}
                  </Text>
                </View>
              )}
              placeholder={selectedCurrency.symbol}
            />
            <TextInput
              style={[styles.input, styles.amountInputField]}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              value={formData.amount}
              onChangeText={(amount) => setFormData(prev => ({ ...prev, amount }))}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <Ionicons name="calendar-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        <Dropdown
          label="Store/Source"
          value={formData.store}
          options={stores}
          onChange={(store) => setFormData(prev => ({ ...prev, store }))}
          placeholder="Select store or income source"
          canAdd
          onAddNew={(newStore) => dispatch(addStore(newStore))}
        />

        <Dropdown
          label="Category"
          value={formData.category}
          options={categories}
          onChange={(category) => setFormData(prev => ({ ...prev, category }))}
          placeholder="Select category"
          canAdd
          onAddNew={(newCategory) => dispatch(addCategory(newCategory))}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="Add note"
            placeholderTextColor={colors.textTertiary}
            multiline
            value={formData.note}
            onChangeText={(note) => setFormData(prev => ({ ...prev, note }))}
          />
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.submitButton, !formData.amount && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!formData.amount}
      >
        <Text style={styles.submitButtonText}>Add Transaction</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginTop: 44, // for status bar
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    position: 'absolute',
    left: 8,
    padding: 12,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  skipButtonText: {
    fontSize: 17,
    color: colors.primary,
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: colors.cardLight,
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  typeButtonTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  noteInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.textPrimary,
    marginRight: 8,
  },
  amountInputField: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 16,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 8,
  },
  currencyName: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.input,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
}); 