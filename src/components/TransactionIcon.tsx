import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  category: string;
  type: 'income' | 'expense';
  size?: number;
};

// Map of categories to icons
const CATEGORY_ICONS = {
  'Shopping': 'cart-outline',
  'Transport': 'car-outline',
  'Food': 'restaurant-outline',
  'Electronics': 'phone-portrait-outline',
  'Income': 'wallet-outline',
  'Salary': 'cash-outline',
  'Transfer': 'swap-horizontal-outline',
  'Entertainment': 'game-controller-outline',
  'Health': 'medical-outline',
  'Education': 'book-outline',
  'Bills': 'receipt-outline',
  'Other': 'card-outline',
} as const;

type IconName = typeof CATEGORY_ICONS[keyof typeof CATEGORY_ICONS];

export default function TransactionIcon({ category, type, size = 48 }: Props) {
  const iconName = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.Other;
  
  return (
    <View style={[
      styles.container,
      { 
        width: size,
        height: size,
        borderRadius: size / 4,
        backgroundColor: type === 'income' ? colors.chart.green : colors.cardLight,
      }
    ]}>
      <Ionicons 
        name={iconName}
        size={size * 0.5} 
        color={type === 'income' ? colors.textLight : colors.textPrimary} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 