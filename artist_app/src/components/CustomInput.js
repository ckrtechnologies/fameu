import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme/theme';

const CustomInput = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
  disabled = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMutedLight}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.body.fontSize,
    color: colors.textMainLight,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.textMutedLight,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.s,
    height: 48,
    justifyContent: 'center',
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputDisabled: {
    backgroundColor: '#E2E8F0',
  },
  input: {
    fontFamily: typography.fontFamily,
    fontSize: typography.body.fontSize,
    color: colors.textMainLight,
    height: '100%',
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.caption.fontSize,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});

export default CustomInput;
