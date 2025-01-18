import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { setCurrency } from '../store/settingsSlice';
import { Ionicons } from '@expo/vector-icons';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
];

export default function CurrencyScreen() {
  const dispatch = useAppDispatch();
  const currentCurrency = useAppSelector(state => state.settings.currency);

  const handleCurrencySelect = (currency: typeof currencies[0]) => {
    dispatch(setCurrency(currency));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.list}>
        {currencies.map(currency => (
          <TouchableOpacity
            key={currency.code}
            style={styles.currencyItem}
            onPress={() => handleCurrencySelect(currency)}
          >
            <View style={styles.currencyInfo}>
              <Text style={styles.currencySymbol}>{currency.symbol}</Text>
              <View>
                <Text style={styles.currencyName}>{currency.name}</Text>
                <Text style={styles.currencyCode}>{currency.code}</Text>
              </View>
            </View>
            {currentCurrency.code === currency.code && (
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={colors.primary} 
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 20,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.cardLight,
    marginBottom: 12,
    borderRadius: 12,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 13,
    color: colors.textSecondary,
  },
}); 