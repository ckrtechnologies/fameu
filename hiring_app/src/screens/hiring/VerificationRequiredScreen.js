import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { colors, typography, spacing, globalStyles } from '../../theme/theme';
import CustomButton from '../../components/forms/CustomButton';
import { useGetCompanyProfileQuery } from '../../services/hiringApi';

export default function VerificationRequiredScreen({ navigation }) {
  const { data: profileResponse } = useGetCompanyProfileQuery();
  const verificationStatus = profileResponse?.data?.verification_status || 'unverified';
  const insets = useSafeAreaInsets();

  const isPending = verificationStatus === 'pending';

  return (
    <View style={[globalStyles.container, styles.center, { padding: spacing.xl }]}>
      <TouchableOpacity 
        style={[styles.closeButton, { top: insets.top + spacing.m }]} 
        onPress={() => navigation.goBack()}
      >
        <X size={24} color={colors.textMainLight} />
      </TouchableOpacity>
      <Icon 
        name={isPending ? "time-outline" : "lock-closed-outline"} 
        size={80} 
        color={isPending ? colors.primary : colors.warning} 
        style={{ marginBottom: spacing.l }}
      />
      
      <Text style={[typography.h2, { textAlign: 'center', marginBottom: spacing.m, color: colors.textMainLight }]}>
        {isPending ? 'Verification Under Review' : 'Verification Required'}
      </Text>
      
      <Text style={[typography.body1, { textAlign: 'center', color: colors.textMutedLight, marginBottom: spacing.xl }]}>
        {isPending 
          ? 'Your KYC documents have been submitted and are currently being reviewed by our team. We will notify you once your account is fully verified.'
          : 'You must complete your KYC verification to access this feature. We require standard documentation to ensure a safe environment for all talents.'}
      </Text>
      
      {!isPending && (
        <TouchableOpacity 
          style={[globalStyles.primaryButton, { width: '100%' }]}
          onPress={() => navigation.navigate('Drawer', { screen: 'CompanyKyc' })}
        >
          <Text style={globalStyles.primaryButtonText}>Complete KYC Verification</Text>
        </TouchableOpacity>
      )}
      

    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: spacing.l,
    zIndex: 10,
    padding: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }
});
