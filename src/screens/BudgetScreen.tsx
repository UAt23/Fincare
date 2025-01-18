import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { useAppSelector } from '../hooks/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import BudgetProgressCard from '../components/BudgetProgressCard';
import BudgetCategoryList from '../components/BudgetCategoryList';
import EmptyBudgetIllustration from '../components/EmptyBudgetIllustration';

const BudgetScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currency } = useAppSelector(state => state.settings);
  const budget = useAppSelector(state => state.budget);
  
  const handleAddBudget = () => {
    navigation.navigate('CreateBudget');
  };

  if (!budget) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget</Text>
        </View>
        <View style={styles.loadingState}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  if (!budget.activeBudget) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget</Text>
        </View>
        
        <View style={styles.emptyState}>
          <EmptyBudgetIllustration />
          <Text style={styles.emptyStateTitle}>No Budget Set</Text>
          <Text style={styles.emptyStateText}>
            Create a budget to track your expenses and save money effectively
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleAddBudget}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.textLight} />
            <Text style={styles.createButtonText}>Create New Budget</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddBudget}
        >
          <Ionicons name="add" size={24} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <BudgetProgressCard 
        spent={budget.activeBudget.spent || 0}
        limit={budget.activeBudget.totalLimit}
        currency={currency}
      />
      
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <BudgetCategoryList categories={budget.activeBudget.categories} />
      </View>
    </ScrollView>
  );
};

export default BudgetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
}); 