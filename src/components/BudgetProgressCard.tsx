import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { colors } from '../theme/colors';

type Props = {
  spent: number;
  limit: number;
  currency: Currency;
};

const BudgetProgressCard = ({ spent, limit, currency }: Props) => {
  const percentage = Math.min((spent / limit) * 100, 100);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: percentage,
      useNativeDriver: false,
      friction: 8,
      tension: 20,
    }).start();
  }, [percentage]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Budget</Text>
      
      <View style={styles.amountContainer}>
        <Text style={styles.spent}>
          {currency.symbol}{spent.toFixed(2)}
        </Text>
        <Text style={styles.limit}>
          of {currency.symbol}{limit.toFixed(2)}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            { 
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              }),
              backgroundColor: percentage > 90 ? colors.error : colors.primary 
            }
          ]} 
        />
      </View>

      <Text style={styles.remaining}>
        {percentage > 100 
          ? `${(percentage - 100).toFixed(1)}% over budget`
          : `${(100 - percentage).toFixed(1)}% remaining`
        }
      </Text>
    </View>
  );
};

export default BudgetProgressCard;

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  spent: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textLight,
  },
  limit: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.textLight,
    opacity: 0.7,
  },
  progressContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  remaining: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.7,
    textAlign: 'right',
  },
}); 