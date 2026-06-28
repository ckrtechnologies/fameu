import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { useSendOtpMutation } from '../../services/authApi';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');
  
  const [sendOtp, { isLoading }] = useSendOtpMutation();

  const handleLogin = async () => {
    if (!identifier.trim()) {
      Alert.alert('Error', 'Please enter your email or mobile number.');
      return;
    }
    try {
      const response = await sendOtp({ identifier }).unwrap();
      navigation.navigate('Otp', { identifier, devOtp: response?.data?.devOtp });
    } catch (err) {
      Alert.alert('Login Failed', err?.data?.error?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in seamlessly with a one-time password.</Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            label="Email or Mobile"
            placeholder="Enter your email or mobile"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomButton 
            title="Send OTP" 
            onPress={handleLogin} 
            loading={isLoading}
            style={styles.loginBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.textMainLight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMutedLight,
  },
  form: {
    marginBottom: spacing.xxl,
  },
  loginBtn: {
    marginTop: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.textMutedLight,
  },
  signupText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
});
