import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/theme';

export default function ValidatedURLInput({ value, onChangeText, placeholder, style, platform = 'any' }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const getValidationState = () => {
    if (!value) return 'empty';
    let isValid = false;
    
    try {
      const url = new URL(value);
      if (platform === 'youtube') {
        isValid = url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');
      } else if (platform === 'instagram') {
        isValid = url.hostname.includes('instagram.com');
      } else {
        isValid = url.protocol === 'http:' || url.protocol === 'https:';
      }
    } catch {
      isValid = false;
    }
    
    return isValid ? 'valid' : 'invalid';
  };

  const state = getValidationState();

  return (
    <View style={[
      styles.container,
      state === 'valid' && styles.validBorder,
      state === 'invalid' && styles.invalidBorder,
      style
    ]}>
      <Icon 
        name="link-outline" 
        size={20} 
        color={colors.textMutedLight} 
        style={styles.icon} 
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textMutedLight}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        keyboardType="url"
      />
      {state === 'valid' && (
        <Icon name="checkmark-circle" size={20} color={colors.success || '#4CAF50'} />
      )}
      {state === 'invalid' && (
        <Icon name="warning" size={20} color={colors.error || '#FF3B30'} />
      )}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  validBorder: {
    borderColor: colors.success || '#4CAF50',
    backgroundColor: '#F1F8F1',
  },
  invalidBorder: {
    borderColor: colors.error || '#FF3B30',
    backgroundColor: '#FFF1F0',
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.textMainLight,
    marginLeft: 8,
  },
  icon: {
    marginRight: 4,
  }
});
