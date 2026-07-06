import { showError, showSuccess } from '../../utils/toast';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image , RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors, typography, spacing, globalStyles } from '../../theme/theme';
import { useUploadKycDocsMutation, useGetCompanyProfileQuery } from '../../services/hiringApi';
export default function CompanyKycScreen({ navigation }) {
  const { data: profileResponse , isFetching, refetch} = useGetCompanyProfileQuery()
  const profile = profileResponse?.data;
  
  const [uploadDocs, { isLoading }] = useUploadKycDocsMutation();
  const [isReKyc, setIsReKyc] = useState(false);

  const [docs, setDocs] = useState({
    aadhaar: null,
    pan: null,
    company_reg: null,
    gst: null,
    selfie: null,
  });

  const handleSelectDocument = (key) => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.didCancel || !res.assets || res.assets.length === 0) return;
      const asset = res.assets[0];
      setDocs((prev) => ({
        ...prev,
        [key]: {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `${key}.jpg`,
        }
      }));
    });
  };

  const removeDocument = (key) => {
    setDocs((prev) => ({
      ...prev,
      [key]: null,
    }));
  };

  const handleSubmit = async () => {
    if (!profile?.id) {
      showError('', 'Please complete your Company Profile first before submitting KYC.');
      return;
    }

    // Validation
    if (!docs.aadhaar || !docs.pan || !docs.company_reg || !docs.selfie) {
      showError('', 'Aadhaar, PAN, Company Registration, and Selfie are mandatory.');
      return;
    }

    const formData = new FormData();
    formData.append('hiringId', profile.id);

    Object.keys(docs).forEach((key) => {
      if (docs[key]) {
        formData.append(key, docs[key]);
      }
    });

    try {
      await uploadDocs(formData).unwrap();
      showSuccess('', 'KYC documents submitted successfully. Our team will review them shortly.');
      setTimeout(() => {
        navigation.navigate('Tabs', { screen: 'Dashboard' });
      }, 1000);
    } catch (error) {
      showError('', error?.data?.error || 'Failed to submit KYC documents.');
    }
  };

  const DocumentPicker = ({ label, docKey, required = true }) => {
    const doc = docs[docKey];

    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>{label} {required ? '*' : '(Optional)'}</Text>
        
        {doc ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: doc.uri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeButton} onPress={() => removeDocument(docKey)}>
              <Icon name="close-circle" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadBox} onPress={() => handleSelectDocument(docKey)}>
            <Icon name="cloud-upload-outline" size={32} color={colors.primary} />
            <Text style={styles.uploadText}>Tap to upload</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      {(profile?.kyc_status === 'approved' || profile?.kyc_status === 'pending' || profile?.is_verified) && !isReKyc ? (
        <View style={[styles.center, { flex: 1, padding: spacing.xl }]}>
          <Icon 
            name={(profile?.kyc_status === 'approved' || profile?.is_verified) ? 'checkmark-circle' : 'time'} 
            size={80} 
            color={(profile?.kyc_status === 'approved' || profile?.is_verified) ? colors.success : colors.warning} 
          />
          <Text style={[styles.title, { marginTop: spacing.l, textAlign: 'center' }]}>
            KYC {(profile?.kyc_status === 'approved' || profile?.is_verified) ? 'Approved' : 'Pending'}
          </Text>
          <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: spacing.xl }]}>
            {(profile?.kyc_status === 'approved' || profile?.is_verified) 
              ? 'Your company KYC has been approved. You are ready to hire.' 
              : 'Your KYC documents are currently under review. Please wait for approval.'}
          </Text>
          <TouchableOpacity 
            style={[globalStyles.primaryButton, { width: '100%' }]} 
            onPress={() => setIsReKyc(true)}
          >
            <Text style={globalStyles.primaryButtonText}>Re-Submit KYC Documents</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}>
            <View style={styles.header}>
              <Text style={styles.title}>Submit KYC Documents</Text>
              <Text style={styles.subtitle}>To verify your company and start hiring on FameU, please provide the following documents. Ensure images are clear and readable.</Text>
            </View>

        <DocumentPicker label="Aadhaar Card (Front & Back merged)" docKey="aadhaar" />
        <DocumentPicker label="Company PAN Card" docKey="pan" />
        <DocumentPicker label="Company Registration Certificate" docKey="company_reg" />
        <DocumentPicker label="GST Certificate" docKey="gst" required={false} />
        <DocumentPicker label="Selfie of Authorized Person" docKey="selfie" />

      </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={globalStyles.primaryButton} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={globalStyles.primaryButtonText}>Submit Documents</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h2,
    color: colors.textMainLight,
    marginBottom: spacing.s,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textMutedLight,
    lineHeight: 20,
  },
  pickerContainer: {
    marginBottom: spacing.xl,
  },
  pickerLabel: {
    ...typography.body1,
    color: colors.textMainLight,
    fontWeight: '600',
    marginBottom: spacing.m,
  },
  uploadBox: {
    height: 120,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
  },
  uploadText: {
    ...typography.body2,
    color: colors.primary,
    marginTop: 8,
    fontWeight: '500',
  },
  previewContainer: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  }
});
