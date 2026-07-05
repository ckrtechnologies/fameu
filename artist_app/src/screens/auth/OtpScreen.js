import { showError, showSuccess } from '../../utils/toast';
import React from 'react';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { View, StyleSheet, Platform, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Typography from '../../components/core/Typography';
import CustomButton from '../../components/forms/CustomButton';
import CustomOtpInput from '../../components/forms/CustomOtpInput';
import { spacing, colors } from '../../theme/theme';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { useVerifyOtpMutation } from '../../services/authApi';
import { Alert, ActivityIndicator } from 'react-native';
const OtpScreen = ({ route, navigation }) => {
  const autoFillOtp = route?.params?.autoFillOtp || '';
  const identifier = route?.params?.identifier || '';
  const [otpCode, setOtpCode] = React.useState(autoFillOtp);
  
  const dispatch = useDispatch();
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();

  const handleVerify = async () => {
    if (!otpCode || otpCode.length < 4) {
      showError('', 'Please enter the full 4-digit OTP');
      return;
    }
    
    try {
      const response = await verifyOtp({ identifier, otp: otpCode, role: 'artist' }).unwrap();
      if (response.data) {
        dispatch(setCredentials({ 
          user: response.data.user, 
          token: response.data.token 
        }));
      }
    } catch (error) {
      showError('', error?.data?.error || error?.message || 'Invalid OTP');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      {/* Top Half - Dark */}
      <View style={styles.topHalf}>
        <SafeAreaView edges={['top']} style={styles.safeAreaTop}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/images/logo.jpeg')} 
                style={styles.logoImage}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Bottom Half - Light */}
      <KeyboardAwareScrollView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.bottomHalf}
      >
        <Typography variant="h1" style={styles.title}>Verify OTP</Typography>
        <Typography variant="body" style={styles.subtitle}>
          Enter the 4-digit code sent to your phone
        </Typography>
        
        <CustomOtpInput 
          length={4} 
          initialCode={autoFillOtp} 
          onComplete={(code) => setOtpCode(code)} 
        />

        <View style={styles.buttonContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <CustomButton 
              title="Verify & Login" 
              onPress={handleVerify} 
              variant="primary"
            />
          )}
        </View>

        <View style={styles.footer}>
          <Typography variant="caption" style={styles.resendText}>
            Resend Code in 00:54
          </Typography>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHalf: {
    backgroundColor: '#0F172A', 
    height: '35%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
  },
  safeAreaTop: {
    flex: 1,
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    overflow: 'hidden',
  },
  logoImage: {
    width: 125,
    height: 125,
    resizeMode: 'contain',
  },
  bottomHalf: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
    marginBottom: spacing.l,
  },
  buttonContainer: {
    marginTop: spacing.l,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  resendText: {
    color: colors.primary,
    fontWeight: '700',
  }
});

export default OtpScreen;
