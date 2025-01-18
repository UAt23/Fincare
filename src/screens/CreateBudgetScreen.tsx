import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { colors } from '../theme/colors';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { setBudget } from '../store/budgetSlice';
import { generateId } from '../utils/id';
import Dropdown from '../components/Dropdown';
import { BudgetType } from '../types/budget';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateBudget'>;
};

const budgetTypes: { label: string; value: BudgetType }[] = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Savings', value: 'savings' },
];

const CreateBudgetScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const { currency } = useAppSelector(state => state.settings);
  
  const [name, setName] = useState('');
  const [type, setType] = useState<BudgetType>('monthly');
  const [limit, setLimit] = useState('');

  const handleCreate = () => {
    if (!name || !limit) return;

    const now = new Date();
    const budget = {
      id: generateId(),
      name,
      type,
      startDate: now.toISOString(),
      endDate: new Date(
        type === 'yearly' 
          ? now.getFullYear() + 1 
          : now.getFullYear(),
        type === 'monthly' ? now.getMonth() + 1 : 11,
        0
      ).toISOString(),
      categories: [],
      totalLimit: parseFloat(limit),
      currency,
    };

    dispatch(setBudget(budget));
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Budget Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Monthly Expenses"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Budget Type</Text>
          <Dropdown
            value={type}
            options={budgetTypes}
            onChange={(value) => setType(value as BudgetType)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Total Limit</Text>
          <TextInput
            style={styles.input}
            value={limit}
            onChangeText={setLimit}
            placeholder="0.00"
            keyboardType="decimal-pad"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.createButton,
            (!name || !limit) && styles.createButtonDisabled
          ]}
          onPress={handleCreate}
          disabled={!name || !limit}
        >
          <Text style={styles.createButtonText}>Create Budget</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateBudgetScreen; 