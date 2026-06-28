import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { colors, typography, spacing } from '../../theme/theme';
import CustomButton from '../../components/CustomButton';
import { useVerifyOtpMutation, useSendOtpMutation, useSetRoleMutation } from '../../services/authApi';
import { setCredentials } from '../../store/slices/authSlice';

const OTP_LENGTH = 4;

export default function OtpScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const identifier = route.params?.identifier || '';
  const devOtpFromRoute = route.params?.devOtp;
  
  const name = route.params?.name;
  
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [localDevOtp, setLocalDevOtp] = useState(devOtpFromRoute);
  const inputRef = useRef(null);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [sendOtp] = useSendOtpMutation();
  const [setRole] = useSetRoleMutation();

  useEffect(() => {
    inputRef.current?.focus();
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    if (devOtpFromRoute) {
      // Small delay ensures the alert shows after navigation transition
      setTimeout(() => {
        Alert.alert(
          'DEV MODE OTP',
          `Your OTP is ${devOtpFromRoute}`,
          [
            { text: 'Dismiss', style: 'cancel' },
            { 
              text: 'Auto-fill', 
              onPress: () => setOtp(devOtpFromRoute.toString()) 
            }
          ]
        );
      }, 500);
    }

    return () => clearInterval(interval);
  }, [devOtpFromRoute]);

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) return;
    try {
      const response = await verifyOtp({ identifier, otp }).unwrap();
      const { token, user, isNewUser } = response.data;
      
      // Save token and user to global state (triggers AppNavigator to switch to Main Tabs)
      dispatch(setCredentials({ user, token }));

      // If new user, set their role to 'artist' in the backend
      if (isNewUser) {
        try {
           // We might need to handle this carefully since the apiSlice might not 
           // immediately have the token available if Keychain is slow. 
           // In a real app we'd dispatch a thunk or wait for state.
           // For now, we will assume it works or handle in a background sync.
           setRole({ role: 'artist' });
           // TODO: Call an updateProfile API here using `name` from route.params if provided
        } catch(e) {
           console.log("Failed to set role or profile", e);
        }
      }
    } catch (err) {
      Alert.alert('Verification Failed', err?.data?.error || 'Invalid OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      const response = await sendOtp({ identifier }).unwrap();
      if (response?.data?.devOtp) {
        setLocalDevOtp(response.data.devOtp);
        setTimeout(() => {
          Alert.alert(
            'DEV MODE OTP',
            `Your OTP is ${response.data.devOtp}`,
            [
              { text: 'Dismiss', style: 'cancel' },
              { text: 'Auto-fill', onPress: () => setOtp(response.data.devOtp.toString()) }
            ]
          );
        }, 500);
      }
      setTimer(30);
      setOtp('');
      inputRef.current?.focus();
    } catch (err) {
      Alert.alert('Error', err?.data?.error || 'Failed to resend OTP.');
    }
  };

  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < OTP_LENGTH; i++) {
      const char = otp[i];
      const isFocused = otp.length === i;
      boxes.push(
        <View key={i} style={[styles.box, isFocused && styles.boxFocused]}>
          <Text style={styles.boxText}>{char || ''}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Account</Text>
          <Text style={styles.subtitle}>Enter the {OTP_LENGTH}-digit code we sent to {identifier}</Text>
        </View>

        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => inputRef.current?.focus()} 
          style={styles.otpContainer}
        >
          {renderOtpBoxes()}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={(val) => {
              const cleaned = val.replace(/[^0-9]/g, '');
              if (cleaned.length <= OTP_LENGTH) {
                setOtp(cleaned);
              }
            }}
            keyboardType="number-pad"
            style={styles.hiddenInput}
            maxLength={OTP_LENGTH}
          />
        </TouchableOpacity>

        <CustomButton 
          title="Verify OTP" 
          onPress={handleVerify} 
          loading={isVerifying}
          disabled={otp.length !== OTP_LENGTH}
          style={styles.verifyBtn}
        />

        <View style={styles.resendContainer}>
          {timer > 0 ? (
            <Text style={styles.resendText}>Resend code in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendActionText}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* DEV MODE OTP MODAL */}


    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  content: {
    flex: 1,
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
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  box: {
    width: 60,
    height: 70,
    borderWidth: 1,
    borderColor: colors.textMutedLight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
  },
  boxFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + '10', // 10% opacity
  },
  boxText: {
    ...typography.h2,
    color: colors.textMainLight,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  verifyBtn: {
    marginBottom: spacing.xl,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    ...typography.body,
    color: colors.textMutedLight,
  },
  resendActionText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.m,
  },
  modalBody: {
    ...typography.body,
    color: colors.textMainLight,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  modalHighlight: {
    ...typography.h1,
    color: colors.textMainLight,
    fontWeight: 'bold',
  },
});
