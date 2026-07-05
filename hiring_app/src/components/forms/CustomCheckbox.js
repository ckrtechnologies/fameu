import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme/theme';
import Typography from '../core/Typography';

const CustomCheckbox = ({ label, checked, onChange, style }) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={() => onChange(!checked)} activeOpacity={0.8}>
      <View style={[styles.box, checked && styles.checkedBox]}>
        {checked && <View style={styles.checkmark} />}
      </View>
      {label && <Typography style={styles.label}>{label}</Typography>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  box: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.borderDark,
    borderRadius: 6,
    marginRight: spacing.s,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  label: {
    color: colors.textMainDark,
  }
});

export default CustomCheckbox;
