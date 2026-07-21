import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths, isBefore, isAfter, isSameDay } from 'date-fns';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PREDEFINED_OPTIONS = [
  'Next 7 Days',
  'Next 14 Days',
  'Next 30 Days',
  'Weekends Only',
  'Weekdays Only',
  'Anytime',
  'Currently Unavailable'
];

export default function DateRangePicker({ value, onSelect, placeholder, style }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('options'); // 'options' or 'calendar'
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  const startWeekday = startOfMonth(currentMonth).getDay();
  const paddingDays = Array.from({ length: startWeekday }).map(() => null);
  const calendarDays = [...paddingDays, ...daysInMonth];

  const handleOpen = () => {
    setViewMode('options');
    setStartDate(null);
    setEndDate(null);
    setModalVisible(true);
  };

  const handleSelectOption = (option) => {
    onSelect(option);
    setModalVisible(false);
  };

  const handleDayPress = (date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (isBefore(date, startDate)) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  const handleConfirmRange = () => {
    if (startDate && endDate) {
      const formatted = `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
      onSelect(formatted);
      setModalVisible(false);
    } else if (startDate) {
      const formatted = `${format(startDate, 'MMM d, yyyy')}`;
      onSelect(formatted);
      setModalVisible(false);
    }
  };

  const isDateInRange = (date) => {
    if (!startDate || !endDate) return false;
    return (isAfter(date, startDate) || isSameDay(date, startDate)) && 
           (isBefore(date, endDate) || isSameDay(date, endDate));
  };

  return (
    <View style={style}>
      <TouchableOpacity style={styles.trigger} activeOpacity={0.7} onPress={handleOpen}>
        <Text style={[styles.triggerText, !value && { color: colors.textMutedLight }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Icon name="calendar-outline" size={20} color={colors.textMutedLight} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.dragHandle} />
            
            {viewMode === 'options' ? (
              <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                {PREDEFINED_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.optionItem}
                    onPress={() => handleSelectOption(option)}
                  >
                    <Text style={[styles.optionText, value === option && styles.optionTextSelected]}>
                      {option}
                    </Text>
                    {value === option && <Icon name="checkmark" size={24} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity
                  style={styles.customOptionItem}
                  onPress={() => setViewMode('calendar')}
                >
                  <Text style={styles.customOptionText}>Select Custom Date Range...</Text>
                  <Icon name="chevron-forward" size={20} color={colors.primary} />
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={styles.calendarContainer}>
                <View style={styles.calendarHeaderRow}>
                  <TouchableOpacity onPress={() => setViewMode('options')} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={colors.textMainLight} />
                  </TouchableOpacity>
                  <Text style={styles.calendarTitle}>Custom Range</Text>
                  <TouchableOpacity 
                    style={[styles.confirmBtnTop, (!startDate) && { opacity: 0.5 }]} 
                    onPress={handleConfirmRange}
                    disabled={!startDate}
                  >
                    <Text style={styles.confirmBtnTextTop}>Confirm</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.header}>
                  <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <Icon name="chevron-back" size={24} color={colors.textMainLight} />
                  </TouchableOpacity>
                  <Text style={styles.monthText}>{format(currentMonth, 'MMMM yyyy')}</Text>
                  <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <Icon name="chevron-forward" size={24} color={colors.textMainLight} />
                  </TouchableOpacity>
                </View>

                <View style={styles.weekdays}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <Text key={day} style={styles.weekdayText}>{day}</Text>
                  ))}
                </View>

                <View style={styles.daysGrid}>
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <View key={`pad-${index}`} style={styles.dayCell} />;
                    }
                    
                    const isSelected = startDate && isSameDay(date, startDate) || endDate && isSameDay(date, endDate);
                    const inRange = isDateInRange(date);
                    
                    return (
                      <TouchableOpacity
                        key={date.toString()}
                        style={[
                          styles.dayCell, 
                          inRange && styles.dayCellInRange,
                          isSelected && styles.dayCellSelected
                        ]}
                        onPress={() => handleDayPress(date)}
                      >
                        <Text style={[
                          styles.dayText, 
                          isSelected && styles.dayTextSelected,
                          inRange && !isSelected && styles.dayTextInRange
                        ]}>
                          {format(date, 'd')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
  },
  triggerText: {
    ...typography.body,
    color: colors.textMainLight,
    flex: 1,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.8,
    minHeight: 400,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  optionsList: {
    flexGrow: 0,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    ...typography.body,
    color: colors.textMainLight,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  customOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    marginTop: 10,
  },
  customOptionText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Calendar Styles
  calendarContainer: {
    flex: 1,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    padding: 5,
  },
  calendarTitle: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMainLight,
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: {
    ...typography.caption,
    color: colors.textMutedLight,
    width: 32,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%', // 100% / 7
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  dayCellInRange: {
    backgroundColor: `${colors.primary}20`, // 20% opacity primary color
  },
  dayText: {
    ...typography.body,
    color: colors.textMainLight,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dayTextInRange: {
    color: colors.primary,
  },
  confirmBtnTop: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  confirmBtnTextTop: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
