import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useState, useRef } from 'react';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

export default function MonthPicker({ value, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(value.getFullYear());
  const yearAnimation = useRef(new Animated.Value(1)).current;

  const handlePrevMonth = () => {
    const newDate = new Date(value);
    newDate.setMonth(value.getMonth() - 1);
    onChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(value);
    newDate.setMonth(value.getMonth() + 1);
    onChange(newDate);
  };

  const handlePrevYear = () => {
    Animated.sequence([
      Animated.timing(yearAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(yearAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    Animated.sequence([
      Animated.timing(yearAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(yearAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    setSelectedYear(prev => prev + 1);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    onChange(today);
    setShowPicker(false);
  };

  const monthName = value.toLocaleString('default', { month: 'long' });
  const year = value.getFullYear();

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(selectedYear, i, 1);
    return {
      label: date.toLocaleString('default', { month: 'long' }),
      value: date,
    };
  });

  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={() => setShowPicker(true)}
      >
        <TouchableOpacity 
          onPress={handlePrevMonth}
          style={styles.button}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textTertiary} />
        </TouchableOpacity>

        <View style={styles.dateContainer}>
          <Text style={styles.date}>{monthName} {year}</Text>
        </View>

        <TouchableOpacity 
          onPress={handleNextMonth}
          style={styles.button}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.yearSelector}>
              <TouchableOpacity onPress={handlePrevYear}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <Animated.Text 
                style={[
                  styles.yearText,
                  { opacity: yearAnimation }
                ]}
              >
                {selectedYear}
              </Animated.Text>
              <TouchableOpacity onPress={handleNextYear}>
                <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.todayButton}
              onPress={handleToday}
            >
              <Ionicons name="today-outline" size={20} color={colors.primary} />
              <Text style={styles.todayText}>Today</Text>
            </TouchableOpacity>

            <FlatList
              data={months}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => {
                const isSelected = 
                  item.label === monthName && 
                  selectedYear === value.getFullYear();
                
                return (
                  <TouchableOpacity
                    style={[
                      styles.monthItem,
                      isSelected && styles.selectedMonth
                    ]}
                    onPress={() => {
                      onChange(item.value);
                      setShowPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.monthText,
                      isSelected && styles.selectedMonthText
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardMidLight,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    padding: 8,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    width: '80%',
    maxHeight: '70%',
    padding: 16,
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLigth,
  },
  monthItem: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedMonth: {
    backgroundColor: colors.primary,
  },
  monthText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  selectedMonthText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  todayText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
}); 