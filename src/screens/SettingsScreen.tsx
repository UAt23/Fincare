import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type SettingItem = {
  icon: string;
  label: string;
  onPress: () => void;
  showArrow?: boolean;
};

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const settingItems: SettingItem[] = [
    {
      icon: 'person-outline',
      label: 'Profile',
      onPress: () => navigation.navigate('Profile'),
      showArrow: true,
    },
    {
      icon: 'wallet-outline',
      label: 'Category Budgets',
      onPress: () => navigation.navigate('CategoryBudgets'),
      showArrow: true,
    },
    {
      icon: 'card-outline',
      label: 'Currency',
      onPress: () => navigation.navigate('Currency'),
      showArrow: true,
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => {},
      showArrow: true,
    },
    {
      icon: 'moon-outline',
      label: 'Dark Mode',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      onPress: () => {},
      showArrow: true,
    },
    {
      icon: 'information-circle-outline',
      label: 'About',
      onPress: () => {},
      showArrow: true,
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.label}
      style={styles.settingItem}
      onPress={item.onPress}
    >
      <View style={styles.settingContent}>
        <Ionicons name={item.icon as any} size={24} color={colors.textPrimary} />
        <Text style={styles.settingLabel}>{item.label}</Text>
      </View>
      {item.showArrow && (
        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoLetter}>F</Text>
            <View style={styles.logoCoin}>
              <View style={styles.logoCoinCurve} />
            </View>
          </View>
          <Text style={styles.title}>Fincare</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </View>

      <View style={styles.settingsList}>
        {settingItems.map(renderSettingItem)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    overflow: 'visible',
  },
  logoLetter: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.textLight,
    marginLeft: -4,
  },
  logoCoin: {
    position: 'absolute',
    bottom: -8,
    right: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCoinCurve: {
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: colors.card,
    borderRadius: 20,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    transform: [
      { rotate: '45deg' },
      { translateX: -2 },
      { translateY: 2 },
    ],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  settingsList: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
}); 