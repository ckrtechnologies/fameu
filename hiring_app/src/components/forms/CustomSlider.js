import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../theme/theme';
import Typography from '../core/Typography';
import { useTheme } from '../../theme/ThemeProvider';

const CustomSlider = ({ label, value = 50, min = 0, max = 100 }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Typography variant="caption" style={styles.label}>{label}</Typography>
          <Typography variant="caption" style={styles.valueText}>{value}</Typography>
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
        <View style={[styles.thumb, { left: `${percentage}%` }]} />
      </View>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.textMutedDark,
  },
  valueText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  track: {
    height: 4,
    backgroundColor: colors.borderDark,
    borderRadius: 2,
    justifyContent: 'center',
    marginVertical: spacing.s,
  },
  fill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    marginLeft: -10, // center the thumb
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  }
});

export default CustomSlider;
