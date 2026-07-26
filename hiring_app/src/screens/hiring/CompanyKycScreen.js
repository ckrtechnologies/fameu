import { showError, showSuccess } from '../../utils/toast';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image , RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick, types, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/Ionicons';

import { typography, spacing, globalStyles } from '../../theme/theme';
import { useUploadKycDocsMutation, useGetCompanyProfileQuery } from '../../services/hiringApi';
import { useTheme } from '../../theme/ThemeProvider';
import { useSelector } from 'react-redux';
import { uploadFileWithProgress } from '../../utils/uploadUtils';
import ProgressBar from '../../components/core/ProgressBar';
export default function CompanyKycScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { data: profileResponse , isFetching, refetch} = useGetCompanyProfileQuery()
  const profile = profileResponse?.data;
  
  const [isReKyc, setIsReKyc] = useState(false);
  const token = useSelector(state => state.auth.token);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [docs, setDocs] = useState({
    aadhaar: null,
    pan: null,
    company_reg: null,
    gst: null,
    selfie: null,
  });

  const handleSelectDocument = async (key) => {
    try {
      const res = await pick({
        type: [types.images, types.pdf],
      });
      const file = res[0];
      
      setDocs((prev) => ({
        ...prev,
        [key]: {
          uri: file.uri,
          type: file.type || 'application/octet-stream',
          name: file.name || `${key}`,
        }
      }));
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        // User cancelled the picker
      } else {
        showError('Error', 'Failed to pick document');
      }
    }
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

    const hasIdentityDoc = docs.aadhaar || docs.passport || docs.voter_id || docs.driving_license;
    
    if (!hasIdentityDoc || !docs.pan || !docs.selfie) {
      showError('', 'You must provide at least one Identity Document (Aadhaar, Passport, Voter ID, or DL) along with PAN and Selfie.');
      return;
    }

    const formData = new FormData();
    formData.append('hiringId', profile.id);

    Object.keys(docs).forEach((key) => {
      if (docs[key]) {
        formData.append(key, docs[key]);
      }
    });

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await uploadFileWithProgress('/hiring_app/company/kyc', formData, (progress) => {
        setUploadProgress(progress);
      }, token);
      
      showSuccess('', 'KYC documents submitted successfully. Our team will review them shortly.');
      setTimeout(() => {
        navigation.navigate('Tabs', { screen: 'Dashboard' });
      }, 1000);
    } catch (error) {
      showError('', error?.message || 'Failed to submit KYC documents.');
    } finally {
      setIsUploading(false);
    }
  };

  const DocumentPicker = ({ label, docKey, required = true }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
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
      {(profile?.verification_status === 'approved' || profile?.verification_status === 'pending' || profile?.is_verified) && !isReKyc ? (
        <View style={[styles.center, { flex: 1, padding: spacing.xl }]}>
          <Icon 
            name={(profile?.verification_status === 'approved' || profile?.is_verified) ? 'checkmark-circle' : 'time'} 
            size={80} 
            color={(profile?.verification_status === 'approved' || profile?.is_verified) ? colors.success : colors.warning} 
          />
          <Text style={[styles.title, { marginTop: spacing.l, textAlign: 'center' }]}>
            KYC {(profile?.verification_status === 'approved' || profile?.is_verified) ? 'Approved' : 'Pending'}
          </Text>
          <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: spacing.xl }]}>
            {(profile?.verification_status === 'approved' || profile?.is_verified) 
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

        <DocumentPicker label="Aadhaar Card (Front & Back merged)" docKey="aadhaar" required={false} />
        <DocumentPicker label="Passport" docKey="passport" required={false} />
        <DocumentPicker label="Voter ID" docKey="voter_id" required={false} />
        <DocumentPicker label="Driving License" docKey="driving_license" required={false} />
        <DocumentPicker label="Company PAN Card" docKey="pan" />
        <DocumentPicker label="Company Registration Certificate" docKey="company_reg" required={false} />
        <DocumentPicker label="GST Certificate" docKey="gst" required={false} />
        <DocumentPicker label="Selfie of Authorized Person" docKey="selfie" />

      </ScrollView>

          <View style={styles.footer}>
            {isUploading && <ProgressBar progress={uploadProgress} />}
            <TouchableOpacity 
              style={[globalStyles.primaryButton, isUploading && { marginTop: spacing.m }]} 
              onPress={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? (
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

const getStyles = (colors) => StyleSheet.create({
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
