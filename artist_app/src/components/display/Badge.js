import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme/theme';
import Typography from '../core/Typography';

const Badge = ({ label, variant = 'primary', style }) => {
  const getBackgroundColor = () => {
    switch(variant) {
      case 'primary': return colors.primary;
      case 'success': return colors.success;
      case 'danger': return colors.danger;
      case 'warning': return colors.warning;
      case 'neutral': return colors.borderDark;
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'primary' || variant === 'warning') return '#000000';
    return '#FFFFFF';
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }, style]}>
      <Typography variant="caption" style={[styles.text, { color: getTextColor() }]}>
        {label}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: 'bold',
  }
});

export default Badge;
