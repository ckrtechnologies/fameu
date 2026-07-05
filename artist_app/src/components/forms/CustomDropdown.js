import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme/theme';
import Typography from '../core/Typography';

const CustomDropdown = ({ 
  label, 
  options = [], 
  selectedValue, 
  onSelect, 
  placeholder = "Select an option" 
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(opt => opt.value === selectedValue);

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
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.optionItem, item.value === selectedValue && styles.selectedOption]}
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
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

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  label: {
    color: colors.textMutedDark,
    marginBottom: spacing.xs,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 8,
    backgroundColor: colors.card,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.s,
  },
  dropdownText: {
    color: colors.textMainDark,
  },
  placeholderText: {
    color: colors.textMutedDark,
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
    borderColor: colors.borderDark,
    overflow: 'hidden',
  },
  optionItem: {
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  selectedOption: {
    backgroundColor: colors.backgroundDark,
  },
  optionText: {
    color: colors.textMainDark,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: 'bold',
  }
});

export default CustomDropdown;
