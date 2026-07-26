import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, Modal, FlatList, StyleSheet, TextInput } from 'react-native';
import { spacing } from '../../theme/theme';
import Typography from '../core/Typography';
import { useTheme } from '../../theme/ThemeProvider';

const CustomDropdown = ({ 
  label, 
  options = [], 
  selectedValue, 
  onSelect, 
  placeholder = "Select an option",
  searchable = false
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find(opt => opt.value === selectedValue);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;
    return options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchable, searchQuery]);

  return (
    <View style={styles.container}>
      {label && <Typography variant="caption" style={styles.label}>{label}</Typography>}
      <TouchableOpacity 
        style={styles.dropdownButton} 
        onPress={() => setModalVisible(true)}
      >
        <Typography style={[styles.dropdownText, !selectedOption && styles.placeholderText]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Typography>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => { setModalVisible(false); setSearchQuery(''); }}>
          <View style={styles.modalContent}>
            {searchable && (
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={colors.textMutedDark}
              />
            )}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.optionItem, item.value === selectedValue && styles.selectedOption]}
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <Typography style={[styles.optionText, item.value === selectedValue && styles.selectedOptionText]}>
                    {item.label}
                  </Typography>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  label: {
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    backgroundColor: colors.card,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.s,
  },
  dropdownText: {
    color: colors.textMain,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  searchInput: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: spacing.m,
    color: colors.textMain,
  },
  optionItem: {
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  selectedOption: {
    backgroundColor: colors.backgroundDark,
  },
  optionText: {
    color: colors.textMain,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: 'bold',
  }
});

export default CustomDropdown;
