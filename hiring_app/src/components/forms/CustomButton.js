import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
import { spacing, shadows } from '../../theme/theme';
import Typography from '../core/Typography';
import { useTheme } from '../../theme/ThemeProvider';

const CustomButton = ({ 
  title, 
  onPress, 
  variant = 'primary', // primary, secondary, outline, ghost
  loading = false, 
  disabled = false, 
  style, 
  textStyle,
  icon,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const getBackgroundColor = () => {
    if (disabled) return colors.borderDark;
    switch(variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary || '#3B82F6';
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textMutedDark;
    switch(variant) {
      case 'primary': return colors.textMainDark; 
      case 'secondary': return colors.textMainDark;
      case 'outline': return colors.primary;
      case 'ghost': return colors.primary;
      default: return colors.textMainDark;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return colors.primary;
    return 'transparent';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        style
      ]} 
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Typography 
            variant="h3" 
            style={[styles.text, { color: getTextColor() }, textStyle]}
          >
            {title}
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (colors) => StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: spacing.l,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.s,
  },
  text: {
    fontWeight: '700',
  }
});

export default CustomButton;
