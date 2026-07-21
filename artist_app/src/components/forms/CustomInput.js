import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/theme';
import Typography from '../core/Typography';

const CustomInput = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
  disabled = false,
  labelStyle,
  inputContainerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Typography variant="caption" style={[styles.label, labelStyle]}>{label}</Typography>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
          inputContainerStyle,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Typography variant="caption" style={styles.errorText}>{error}</Typography>}
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  label: {
    color: colors.textMutedDark,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 8,
    backgroundColor: colors.card,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputDisabled: {
    backgroundColor: '#334155',
    opacity: 0.6,
  },
  leftIcon: {
    marginRight: spacing.s,
  },
  rightIcon: {
    marginLeft: spacing.s,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.textMain,
    fontFamily: 'Comic Sans MS',
    fontSize: 16,
  },
  errorText: {
    color: colors.danger,
    marginTop: spacing.xs,
  },
});

export default CustomInput;
