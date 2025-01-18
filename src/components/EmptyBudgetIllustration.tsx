import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function EmptyBudgetIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Ionicons 
          name="wallet-outline" 
          size={64} 
          color={colors.primary} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 