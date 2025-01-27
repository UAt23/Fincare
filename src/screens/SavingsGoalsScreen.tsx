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
  addSavingsGoal, 
  removeSavingsGoal 
} from '../store/budgetSlice';
import { calculateSavingsProgress } from '../utils/budgetUtils';
import { colors } from '../theme/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

export default function SavingsGoalsScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { savingsGoals } = useAppSelector(state => state.budget);
  const { currency } = useAppSelector(state => state.settings);
  
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    category: '',
    targetDate: new Date()
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) {
      Alert.alert('Incomplete Information', 'Please fill in all required fields');
      return;
    }

    dispatch(addSavingsGoal({
      ...newGoal,
      targetDate: new Date(newGoal.targetDate).toISOString(),
    }));

    // Reset form
    setNewGoal({
      name: '',
      targetAmount: '',
      currentAmount: '',
      category: '',
      targetDate: new Date()
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
        <Text style={styles.headerTitle}>Savings Goals</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Add New Goal Form */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Create New Goal</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Goal Name</Text>
          <TextInput 
            style={styles.input}
            value={newGoal.name}
            onChangeText={(text) => setNewGoal(prev => ({ ...prev, name: text }))}
            placeholder="Enter goal name"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Target Amount</Text>
          <View style={styles.amountInput}>
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <TextInput 
              style={styles.input}
              value={newGoal.targetAmount}
              onChangeText={(text) => setNewGoal(prev => ({ ...prev, targetAmount: text }))}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Progress (Optional)</Text>
          <View style={styles.amountInput}>
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <TextInput 
              style={styles.input}
              value={newGoal.currentAmount}
              onChangeText={(text) => setNewGoal(prev => ({ ...prev, currentAmount: text }))}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Target Date</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDate(newGoal.targetDate)}
            </Text>
            <Ionicons name="calendar" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={newGoal.targetDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setNewGoal(prev => ({ ...prev, targetDate: selectedDate }));
              }
            }}
          />
        )}

        <TouchableOpacity 
          style={[
            styles.addButton,
            (!newGoal.name || !newGoal.targetAmount) && styles.disabledButton
          ]}
          onPress={handleAddGoal}
          disabled={!newGoal.name || !newGoal.targetAmount}
        >
          <Text style={styles.addButtonText}>Create Goal</Text>
        </TouchableOpacity>
      </View>

      {/* Goals List */}
      {savingsGoals.length > 0 && (
        <View style={styles.goalsList}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          {savingsGoals.map((goal) => {
            const progress = calculateSavingsProgress(goal.currentAmount, goal.targetAmount);
            
            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalName}>{goal.name}</Text>
                  <TouchableOpacity 
                    onPress={() => dispatch(removeSavingsGoal(goal.id))}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBar,
                        { width: `${Math.min(progress, 100)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{progress.toFixed(1)}%</Text>
                </View>

                <View style={styles.goalDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Current</Text>
                    <Text style={styles.detailAmount}>
                      {currency.symbol}{goal.currentAmount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Target</Text>
                    <Text style={styles.detailAmount}>
                      {currency.symbol}{goal.targetAmount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Due Date</Text>
                    <Text style={styles.detailDate}>
                      {formatDate(goal.targetDate)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
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
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: colors.textPrimary,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 8,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: colors.textTertiary,
  },
  goalsList: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: colors.textPrimary,
  },
  goalCard: {
    backgroundColor: colors.cardLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  deleteButton: {
    padding: 5,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'right',
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  detailDate: {
    fontSize: 14,
    color: colors.textPrimary,
  },
}); 