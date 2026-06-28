import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { useSendOtpMutation } from '../../services/authApi';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  
  const [sendOtp, { isLoading }] = useSendOtpMutation();

  const handleRegister = async () => {
    const identifier = mobile || email;
    if (!identifier.trim()) {
      Alert.alert('Error', 'Please enter your mobile number or email.');
      return;
    }
    
    try {
      const response = await sendOtp({ identifier }).unwrap();
      // Pass the collected info to OTP screen so we can update profile later if needed
      navigation.navigate('Otp', { identifier, name, email, mobile, devOtp: response?.data?.devOtp });
    } catch (err) {
      Alert.alert('Registration Failed', err?.data?.error?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Join Fameu</Text>
          <Text style={styles.subtitle}>Create your artist profile to start applying for top-tier auditions.</Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <CustomInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <CustomInput
            label="Mobile Number"
            placeholder="Enter your mobile number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />

          <CustomButton 
            title="Send OTP" 
            onPress={handleRegister} 
            loading={isLoading}
            style={styles.registerBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Log In</Text>
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
  registerBtn: {
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
  loginText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
});
