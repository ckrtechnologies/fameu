import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, TextInput } from 'react-native';
import Icon from '../icons';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/theme';

export default function BottomSheetSelect({ value, options, onSelect, placeholder, style, multiSelect = false, searchable = false }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (option) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(option)) {
        onSelect(currentValues.filter(v => v !== option));
      } else {
        onSelect([...currentValues, option]);
      }
    } else {
      // Toggle off if already selected
      if (value === option) {
        onSelect('');
      } else {
        onSelect(option);
      }
      setModalVisible(false);
    }
  };

  const handleClear = () => {
    onSelect(multiSelect ? [] : '');
  };

  const isSelected = (item) => {
    if (multiSelect) {
      return Array.isArray(value) && value.includes(item);
    }
    return value === item;
  };

  const getTriggerText = () => {
    if (multiSelect) {
      return Array.isArray(value) && value.length > 0 ? value.join(', ') : placeholder;
    }
    return value || placeholder;
  };

  const hasValue = multiSelect ? Array.isArray(value) && value.length > 0 : !!value;

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;
    return options.filter(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchable, searchQuery]);

  return (
    <View style={style}>
      <TouchableOpacity 
        style={styles.trigger}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.triggerText, !hasValue && { color: colors.textMutedLight }]} numberOfLines={1}>
          {getTriggerText()}
        </Text>
        <Icon name="chevron-forward" size={16} color={colors.textMutedLight} style={{ transform: [{ rotate: '90deg' }] }} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{placeholder}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {hasValue && (
                  <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                    <Text style={styles.clearBtnText}>Clear</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Icon name="close" size={22} color={colors.textMainLight} />
                </TouchableOpacity>
              </View>
            </View>
            {searchable && (
              <View style={styles.searchContainer}>
                <Icon name="link" size={18} color={colors.textMutedLight} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor={colors.textMutedLight}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            )}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.optionRow, isSelected(item) && styles.optionRowSelected]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[styles.optionText, isSelected(item) && styles.optionTextSelected]}>
                    {item}
                  </Text>
                  {isSelected(item) && (
                    <View style={styles.checkBadge}>
                      <Icon name="play" size={12} color={colors.primary} style={{ transform: [{ rotate: '-90deg' }] }} />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
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
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  triggerText: {
    ...typography.body,
    color: colors.textMainLight,
    flex: 1,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.surfaceLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sheetTitle: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    ...typography.body,
    color: colors.textMainLight,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  optionRowSelected: {
    backgroundColor: colors.primary + '10',
  },
  optionText: {
    ...typography.body,
    color: colors.textMainLight,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
