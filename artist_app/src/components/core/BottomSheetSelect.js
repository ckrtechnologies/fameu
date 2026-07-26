import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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
      onSelect(option);
      setModalVisible(false);
    }
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
        <Icon name="chevron-down" size={20} color={colors.textMutedLight} />
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
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Icon name="close" size={24} color={colors.textMainLight} />
              </TouchableOpacity>
            </View>
            {searchable && (
              <View style={styles.searchContainer}>
                <Icon name="search" size={20} color={colors.textMutedLight} style={styles.searchIcon} />
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
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.optionRow, isSelected(item) && styles.optionRowSelected]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[styles.optionText, isSelected(item) && styles.optionTextSelected]}>
                    {item}
                  </Text>
                  {isSelected(item) && <Icon name="checkmark" size={20} color={colors.primary} />}
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
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
  },
  triggerText: {
    ...typography.body,
    color: colors.textMainLight,
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
    maxHeight: '60%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sheetTitle: {
    ...typography.h3,
    color: colors.textMainLight,
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
  }
});
