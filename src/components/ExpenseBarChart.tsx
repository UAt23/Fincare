import { View, Text, StyleSheet, Animated, TouchableOpacity, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { useMemo, useEffect, useRef, useState } from 'react';

type DataPoint = {
  value: number;
  label: string;
  date: Date;
};

type Props = {
  data: DataPoint[];
  maxValue: number;
  height?: number;
  period: 'week' | 'month';
  currency: Currency;
};

type TooltipData = {
  value: number;
  x: number;
  y: number;
};

export default function ExpenseBarChart({ data, maxValue, height = 100, period, currency }: Props) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const tooltipAnim = useRef(new Animated.Value(0)).current;
  
  // Create initial animations
  const barAnimations = useMemo(() => 
    data.map(() => new Animated.Value(0)), 
    [data.length]
  );
  
  const gridAnimations = useMemo(() => 
    [0, 25, 50, 75, 100].map(() => new Animated.Value(0)),
    []
  );
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animate when data changes
  useEffect(() => {
    // Reset animations
    barAnimations.forEach(anim => anim.setValue(0));
    gridAnimations.forEach(anim => anim.setValue(0));

    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Animate grid lines and bars together
      Animated.parallel([
        ...gridAnimations.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            damping: 15,
            stiffness: 100,
          })
        ),
        ...barAnimations.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            damping: 15,
            stiffness: 100,
          })
        ),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [data, period, barAnimations, gridAnimations]);

  const normalizedData = useMemo(() => {
    const maxVal = Math.max(maxValue, 0.01);
    return data.map(point => ({
      ...point,
      percentage: (point.value / maxVal) * 100,
    }));
  }, [data, maxValue]);

  const shouldShowLabel = (index: number) => {
    if (period === 'week') return true;
    return index % 3 === 0;
  };

  const renderLabel = (label: string, index: number) => {
    if (period === 'week') {
      return label;
    }
    // For month view, show dots for all days and numbers for every 5th day
    return index % 5 === 0 ? label : '•';
  };

  const showTooltip = (value: number, x: number, y: number) => {
    setTooltip({ value, x, y });
    Animated.spring(tooltipAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 100,
    }).start();
  };

  const hideTooltip = () => {
    Animated.timing(tooltipAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setTooltip(null));
  };

  return (
    <Animated.View style={[styles.container, { height, opacity: fadeAnim }]}>
      {/* Grid lines */}
      <View style={styles.gridContainer}>
        {[0, 25, 50, 75, 100].map((percent, index) => (
          <Animated.View 
            key={percent} 
            style={[
              styles.gridLine,
              { 
                bottom: `${percent}%`,
                opacity: gridAnimations[index],
                transform: [{
                  scaleX: gridAnimations[index]
                }]
              }
            ]} 
          />
        ))}
      </View>

      {/* Bars */}
      <View style={styles.barsContainer}>
        {normalizedData.map((point, index) => (
          <View 
            key={index} 
            style={[
              styles.barWrapper,
              period === 'month' && styles.monthBarWrapper
            ]}
          >
            <Pressable
              onPressIn={() => showTooltip(point.value, index, point.percentage)}
              onPressOut={hideTooltip}
              style={[
                styles.barContainer,
                { 
                  height: `${point.percentage}%`,
                  width: period === 'month' ? '40%' : '60%'
                }
              ]}
            >
              <Animated.View 
                style={[
                  styles.bar, 
                  { 
                    backgroundColor: colors.chart.primary,
                    transform: [{
                      scaleY: barAnimations[index]
                    }],
                    transformOrigin: 'bottom',
                  }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.barHighlight,
                  {
                    opacity: Animated.subtract(1, barAnimations[index])
                  }
                ]}
              />
            </Pressable>
            <Animated.Text 
              style={[
                styles.label,
                period === 'month' && styles.monthLabel,
                { opacity: barAnimations[index] }
              ]}
            >
              {renderLabel(point.label, index)}
            </Animated.Text>
          </View>
        ))}
      </View>

      {/* Tooltip */}
      {tooltip && (
        <Animated.View 
          style={[
            styles.tooltip,
            {
              left: `${(tooltip.x / (period === 'month' ? 30 : 7)) * 100}%`,
              bottom: `${tooltip.y}%`,
              transform: [
                { scale: tooltipAnim },
                { translateY: tooltipAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0]
                })}
              ],
              opacity: tooltipAnim
            }
          ]}
        >
          <Text style={styles.tooltipText}>
            {currency.symbol}{tooltip.value.toFixed(2)}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.chart.secondary,
    opacity: 0.3,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 20, // Space for labels
  },
  barWrapper: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barContainer: {
    position: 'relative',
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    borderRadius: 4,
  },
  label: {
    position: 'absolute',
    bottom: -20,
    fontSize: 10,
    color: colors.textLight,
    opacity: 0.7,
    minWidth: 20,
    textAlign: 'center',
  },
  monthLabel: {
    fontSize: 8,
    minWidth: 10,
  },
  monthBarWrapper: {
    paddingHorizontal: 0.5,
  },
  barHighlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.textLight,
    opacity: 0.2,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    transform: [{ translateX: -25 }], // Center the tooltip
  },
  tooltipText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
}); 