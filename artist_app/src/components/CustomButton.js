import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing } from '../theme/theme';

const CustomButton = ({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.textMutedLight;
    if (variant === 'secondary') return colors.backgroundLight;
    if (variant === 'ghost') return 'transparent';
    return colors.primary; // primary default
  };

  const getTextColor = () => {
    if (disabled) return colors.textMainDark;
    if (variant === 'secondary' || variant === 'ghost') return colors.primary;
    return colors.textMainDark;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        variant === 'secondary' && styles.secondaryBorder,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    fontFamily: typography.fontFamily,
    fontSize: typography.body.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
});

export default CustomButton;
