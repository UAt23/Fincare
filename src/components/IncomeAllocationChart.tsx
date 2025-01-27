import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { colors } from '../theme/colors';
import { IncomeAllocation } from '../types/budget';

// Define a color palette for the chart segments
const chartColors = [
  '#7F3DFF', // Primary purple
  '#FF8A65', // Coral
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FFC107', // Amber
  '#9C27B0', // Purple
  '#00BCD4', // Cyan
  '#FF5252', // Red
  '#3F51B5', // Indigo
  '#009688', // Teal
  '#795548', // Brown
  '#607D8B', // Blue Grey
];

interface IncomeAllocationChartProps {
  allocations: IncomeAllocation[];
  totalIncome: number;
}

export default function IncomeAllocationChart({ 
  allocations, 
  totalIncome 
}: IncomeAllocationChartProps) {
  const chartData = allocations.map((allocation, index) => ({
    name: allocation.category,
    amount: allocation.amount || 0,
    percentage: allocation.percentage,
    color: chartColors[index % chartColors.length],
    legendFontColor: colors.textPrimary,
    legendFontSize: 12,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Income Allocation</Text>
      <PieChart
        data={chartData}
        width={300}
        height={200}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: () => colors.textPrimary,
        }}
        accessor="percentage"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
      <View style={styles.legendContainer}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={styles.legendColorAndLabel}>
              <View 
                style={[
                  styles.legendColor, 
                  { backgroundColor: item.color }
                ]} 
              />
              <Text style={styles.legendText}>
                {item.name}
              </Text>
            </View>
            <Text style={styles.legendPercentage}>
              {item.percentage}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  legendContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legendColorAndLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  legendPercentage: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
}); 