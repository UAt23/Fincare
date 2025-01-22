import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { useState, useMemo } from 'react';
import MonthPicker from '../components/MonthPicker';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { addMockData } from '../store/transactionsSlice';

type TimeFrame = 'week' | 'month' | 'year';

export default function AnalyticsScreen() {
  const dispatch = useAppDispatch();
  const { currency } = useAppSelector(state => state.settings);
  const { items: transactions = [] } = useAppSelector(state => state.transactions);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month');

  // Filter transactions for selected month
  const monthTransactions = (transactions || []).filter(t => {
    const transactionDate = new Date(t.date);
    return (
      transactionDate.getMonth() === selectedMonth.getMonth() &&
      transactionDate.getFullYear() === selectedMonth.getFullYear()
    );
  });

  // Calculate monthly stats
  const monthlyStats = {
    income: (monthTransactions || [])
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    expense: (monthTransactions || [])
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  const savings = monthlyStats.income - monthlyStats.expense;
  const savingsPercentage = monthlyStats.income > 0 
    ? (savings / monthlyStats.income) * 100 
    : 0;

  const getDateRangeData = (date: Date, frame: TimeFrame) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    let startDate: Date;
    let labels: string[];
    let dataPoints: number[];

    switch (frame) {
      case 'week':
        // Get the start of the week
        startDate = new Date(date);
        startDate.setDate(date.getDate() - date.getDay());
        labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dataPoints = new Array(7).fill(0);

        (transactions || [])
          .filter(t => {
            const txDate = new Date(t.date);
            return txDate >= startDate && 
                   txDate < new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          })
          .forEach(t => {
            const txDate = new Date(t.date);
            const dayIndex = txDate.getDay();
            if (t.type === 'expense') {
              dataPoints[dayIndex] += t.amount;
            }
          });
        break;

      case 'month':
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
        dataPoints = new Array(5).fill(0);

        (transactions || [])
          .filter(t => {
            const txDate = new Date(t.date);
            return txDate.getMonth() === month && txDate.getFullYear() === year;
          })
          .forEach(t => {
            const txDate = new Date(t.date);
            const weekIndex = Math.floor(txDate.getDate() / 7);
            if (t.type === 'expense') {
              dataPoints[weekIndex] += t.amount;
            }
          });
        break;

      case 'year':
        labels = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        dataPoints = new Array(12).fill(0);

        (transactions || [])
          .filter(t => {
            const txDate = new Date(t.date);
            return txDate.getFullYear() === year;
          })
          .forEach(t => {
            const txDate = new Date(t.date);
            if (t.type === 'expense') {
              dataPoints[txDate.getMonth()] += t.amount;
            }
          });
        break;
    }

    return { labels, dataPoints };
  };

  const chartData = useMemo(() => 
    getDateRangeData(selectedMonth, timeFrame),
    [selectedMonth, timeFrame, transactions]
  );

  const handleGenerateMockData = () => {
    dispatch(addMockData(selectedMonth));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </View>

      {/* Time Frame Selector */}
      <View style={styles.timeFrameSelector}>
        {(['week', 'month', 'year'] as TimeFrame[]).map(frame => (
          <TouchableOpacity
            key={frame}
            style={[
              styles.timeFrameButton,
              timeFrame === frame && styles.timeFrameButtonActive
            ]}
            onPress={() => setTimeFrame(frame)}
          >
            <Text style={[
              styles.timeFrameText,
              timeFrame === frame && styles.timeFrameTextActive
            ]}>
              {frame.charAt(0).toUpperCase() + frame.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart Section */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Spending Overview</Text>
        {chartData.dataPoints.every(point => point === 0) ? (
          <View style={styles.noDataContainer}>
            <Ionicons 
              name="analytics-outline" 
              size={48} 
              color={colors.textTertiary} 
            />
            <Text style={styles.noDataText}>
              No transactions found for this {timeFrame}
            </Text>
            <Text style={styles.noDataSubtext}>
              Add some transactions to see your spending analytics
            </Text>
            <TouchableOpacity
              style={styles.mockDataButton}
              onPress={handleGenerateMockData}
            >
              <Text style={styles.mockDataButtonText}>
                Generate Sample Data
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <LineChart
            data={{
              labels: chartData.labels,
              datasets: [{
                data: chartData.dataPoints.length > 0 ? chartData.dataPoints : [0]
              }]
            }}
            width={Dimensions.get('window').width - 48}
            height={220}
            yAxisLabel={currency.symbol}
            chartConfig={{
              backgroundColor: colors.background,
              backgroundGradientFrom: colors.background,
              backgroundGradientTo: colors.background,
              decimalPlaces: 0,
              color: (opacity = 1) => colors.primary + opacity.toString(16).padStart(2, '0'),
              labelColor: () => colors.textSecondary,
              propsForBackgroundLines: {
                strokeDasharray: '6',
                stroke: colors.border,
                strokeWidth: 1,
              },
              propsForLabels: {
                fontSize: 12,
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: colors.primary,
                fill: colors.background,
              }
            }}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={true}
          />
        )}
      </View>

      <View style={styles.overviewSection}>
        <Text style={styles.sectionTitle}>Monthly Overview</Text>
        <View style={styles.overviewCards}>
          <View style={styles.overviewCard}>
            <View style={[styles.cardIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="arrow-down" size={20} color={colors.success} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Income</Text>
              <Text style={styles.cardAmount}>
                {currency.symbol}{monthlyStats.income.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.overviewCard}>
            <View style={[styles.cardIcon, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="arrow-up" size={20} color={colors.error} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Expenses</Text>
              <Text style={styles.cardAmount}>
                {currency.symbol}{monthlyStats.expense.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.overviewCard}>
            <View style={[styles.cardIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="wallet" size={20} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Savings</Text>
              <Text style={styles.cardAmount}>
                {currency.symbol}{savings.toFixed(2)}
              </Text>
              <Text style={styles.savingsPercentage}>
                {savingsPercentage.toFixed(1)}% of income
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* We'll add more sections here */}
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
  },
  overviewSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  overviewCards: {
    gap: 12,
  },
  overviewCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  savingsPercentage: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timeFrameSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: colors.cardLight,
    borderRadius: 12,
    padding: 4,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  timeFrameButtonActive: {
    backgroundColor: colors.background,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeFrameText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  timeFrameTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  chartSection: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  chart: {
    marginRight: -32,
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardLight,
    borderRadius: 16,
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
    textAlign: 'center',
  },
  mockDataButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  mockDataButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
}); 