import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { setCurrency } from '../store/settingsSlice';
import { convertTransactionAmounts } from '../store/transactionsSlice';
import Dropdown from '../components/Dropdown';
import { CURRENCIES } from '../types/common';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function SettingsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { categories, stores, currency } = useAppSelector(state => state.settings);

  const handleCurrencyChange = (code: string) => {
    const newCurrency = CURRENCIES.find(c => c.code === code);
    if (newCurrency) {
      dispatch(setCurrency(newCurrency));
      dispatch(convertTransactionAmounts(newCurrency));
    }
  };

  const currencyOptions = CURRENCIES.map(curr => ({
    label: `${curr.code} ${curr.name}`,
    value: curr.code,
    extraData: curr,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.settingItem}>
            <Dropdown
              label="Default Currency"
              value={currency.code}
              options={currencyOptions}
              onChange={handleCurrencyChange}
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
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Manage Categories</Text>
              <Text style={styles.settingValue}>{categories.length} categories</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stores</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Manage Stores</Text>
              <Text style={styles.settingValue}>{stores.length} stores</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: 44,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.cardLight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  settingValue: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 2,
  },
  backButton: {
    position: 'absolute',
    left: 8,
    padding: 12,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.cardLight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  currencyCode: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  currencyName: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 2,
  },
}); 