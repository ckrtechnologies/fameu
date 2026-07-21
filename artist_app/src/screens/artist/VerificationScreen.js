import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ShieldCheck, Clock, FileText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import { GlobalAlert } from '../../components/core/GlobalAlert';
import { useGetProfileQuery, useRequestVerificationMutation } from '../../services/profileApi';

export default function VerificationScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const { data: profileResponse, isLoading: profileLoading } = useGetProfileQuery();
  const [requestVerification, { isLoading: isSubmitting }] = useRequestVerificationMutation();

  const [documentUrl, setDocumentUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState('');

  const profile = profileResponse?.data;
  const isVerified = profile?.is_verified;
  const verificationStatus = profile?.verification_status || 'unverified';

  const handleSubmit = async () => {
    if (!socialLinks.trim()) {
      GlobalAlert.show('Error', 'Please provide a social media link for identity verification.');
      return;
    }
    try {
      await requestVerification({ documentUrl, socialLinks }).unwrap();
      GlobalAlert.show('Success', 'Your verification request has been submitted successfully.');
    } catch (err) {
      GlobalAlert.show('Error', err.data?.error || err.error || 'Failed to submit verification request.');
    }
  };

  const renderContent = () => {
    if (profileLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (isVerified || verificationStatus === 'approved') {
      return (
        <View style={styles.centerContainer}>
          <ShieldCheck size={80} color={colors.primary} style={{ marginBottom: spacing.l }} />
          <Typography variant="h2" style={{ color: colors.textMainLight, marginBottom: spacing.m, textAlign: 'center' }}>You are Verified!</Typography>
          <Typography variant="body" style={{ color: colors.textMutedLight, textAlign: 'center', paddingHorizontal: spacing.xl }}>
            Your profile has the verified badge. You stand out to hiring managers and get priority in search results.
          </Typography>
        </View>
      );
    }

    if (verificationStatus === 'pending') {
      return (
        <View style={styles.centerContainer}>
          <Clock size={80} color={colors.warning || '#F59E0B'} style={{ marginBottom: spacing.l }} />
          <Typography variant="h2" style={{ color: colors.textMainLight, marginBottom: spacing.m, textAlign: 'center' }}>Application Under Review</Typography>
          <Typography variant="body" style={{ color: colors.textMutedLight, textAlign: 'center', paddingHorizontal: spacing.xl }}>
            We have received your verification request. Our team is currently reviewing your profile and documents. We will notify you once a decision is made.
          </Typography>
        </View>
      );
    }

    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.infoSection}>
            <FileText size={48} color={colors.primary} style={{ marginBottom: spacing.m }} />
            <Typography variant="h2" style={{ color: colors.textMainLight, marginBottom: spacing.s }}>Get Verified</Typography>
            <Typography variant="body" style={{ color: colors.textMutedLight, marginBottom: spacing.xl }}>
              Apply for the blue tick! A verified badge shows casting directors that your profile is authentic.
            </Typography>
          </View>

          <View style={styles.formGroup}>
            <Typography variant="label" style={styles.label}>Government ID / Portfolio Link (Optional)</Typography>
            <TextInput
              style={styles.input}
              placeholder="Google Drive link, Portfolio URL, etc."
              placeholderTextColor={colors.textMutedLight}
              value={documentUrl}
              onChangeText={setDocumentUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Typography variant="label" style={styles.label}>Primary Social Media Link *</Typography>
            <TextInput
              style={styles.input}
              placeholder="Instagram, YouTube, or Facebook link"
              placeholderTextColor={colors.textMutedLight}
              value={socialLinks}
              onChangeText={setSocialLinks}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Typography variant="button" style={styles.submitButtonText}>Submit Application</Typography>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={colors.textMainLight} size={24} />
        </TouchableOpacity>
        <Typography variant="h3" style={styles.headerTitle}>Verification</Typography>
        <View style={{ width: 40 }} />
      </View>
      
      {renderContent()}
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontWeight: '600',
    color: colors.textMainLight,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  scrollContainer: {
    padding: spacing.xl,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  formGroup: {
    marginBottom: spacing.l,
  },
  label: {
    ...typography.label,
    color: colors.textMutedLight,
    marginBottom: spacing.xs,
  },
  input: {
    height: 50,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: spacing.m,
    color: colors.textMainLight,
    ...typography.body,
  },
  submitButton: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  }
});
