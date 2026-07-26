import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { spacing } from '../../theme/theme';
import Typography from '../core/Typography';
import { useTheme } from '../../theme/ThemeProvider';

const CustomRadio = ({ label, selected, onPress, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.outer, selected && styles.outerSelected]}>
        {selected && <View style={styles.inner} />}
      </View>
      {label && <Typography style={styles.label}>{label}</Typography>}
    </TouchableOpacity>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  outer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  outerSelected: {
    borderColor: colors.primary,
  },
  inner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.textMainDark,
  }
});

export default CustomRadio;
