import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Typography from '../../components/core/Typography';
import CustomAlert from '../../components/core/CustomAlert';
import CustomInput from '../../components/forms/CustomInput';
import CustomButton from '../../components/forms/CustomButton';
import { spacing, colors } from '../../theme/theme';
import { User } from 'lucide-react-native';
import { useSendOtpMutation } from '../../services/authApi';
import { Alert, ActivityIndicator } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  const [sendOtp, { isLoading }] = useSendOtpMutation();

  const handleSendOtp = async () => {
    if (!identifier) {
      Alert.alert('Error', 'Please enter your email or mobile');
      return;
    }
    
    try {
      const response = await sendOtp({ identifier }).unwrap();
      if (response.data && response.data.devOtp) {
        setGeneratedOtp(response.data.devOtp);
        setAlertVisible(true);
      } else {
        navigation.navigate('Otp', { identifier });
      }
    } catch (error) {
      Alert.alert('Error', error?.data?.error || error?.message || 'Failed to send OTP');
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.bottomHalf}
      >
        <Typography variant="h1" style={styles.title}>Welcome Back</Typography>
        
        <CustomInput
          // label="Email or Mobile Number"
          placeholder="Enter email or mobile number"
          value={identifier}
          onChangeText={setIdentifier}
          keyboardType="default"
          autoCapitalize="none"
          leftIcon={<User size={20} color={colors.textMuted} />}
        />

        <View style={styles.buttonContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <CustomButton 
              title="Send OTP" 
              onPress={handleSendOtp} 
              variant="primary"
            />
          )}
        </View>
      </KeyboardAvoidingView>

      <CustomAlert 
        visible={alertVisible}
        title="SMS Received"
        message={`FameU: Your OTP is ${generatedOtp}. Do not share it.`}
        onClose={() => setAlertVisible(false)}
        buttons={[
          {
            text: "Auto Fill",
            onPress: () => {
              setAlertVisible(false);
              navigation.navigate('Otp', { autoFillOtp: generatedOtp, identifier });
            }
          }
        ]}
      />
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
    paddingTop: spacing.xxl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  buttonContainer: {
    marginTop: spacing.xl,
  }
});

export default LoginScreen;
