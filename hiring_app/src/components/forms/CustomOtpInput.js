import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme/theme';

const CustomOtpInput = ({ length = 4, onComplete, initialCode }) => {
  const [code, setCode] = useState(
    initialCode ? initialCode.split('').slice(0, length) : Array(length).fill('')
  );
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < length - 1) {
      inputs.current[index + 1].focus();
    }
    
    if (newCode.every(digit => digit !== '') && onComplete) {
      onComplete(newCode.join(''));
    } else if (onComplete) {
      onComplete(newCode.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => inputs.current[index] = ref}
          style={[styles.input, digit && styles.inputFilled]}
          keyboardType="numeric"
          maxLength={1}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginVertical: spacing.xl,
  },
  input: {
    width: 56,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    textAlign: 'center',
    fontSize: typography.h2.fontSize,
    fontFamily: typography.fontFamily,
    color: colors.textMain,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputFilled: {
    borderColor: colors.primary,
    borderWidth: 2,
  }
});

export default CustomOtpInput;
