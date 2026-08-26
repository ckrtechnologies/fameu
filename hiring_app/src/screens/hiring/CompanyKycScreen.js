import { showError, showSuccess } from '../../utils/toast';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick, types, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { Building2, AlertCircle, ShieldAlert } from 'lucide-react-native';

import { typography, spacing, globalStyles } from '../../theme/theme';
import { useUploadKycDocsMutation, useGetCompanyProfileQuery } from '../../services/hiringApi';
import { useTheme } from '../../theme/ThemeProvider';
import { useSelector } from 'react-redux';
import { uploadFileWithProgress } from '../../utils/uploadUtils';
import ProgressBar from '../../components/core/ProgressBar';

export default function CompanyKycScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { data: profileResponse, isFetching, refetch } = useGetCompanyProfileQuery();
  const profile = profileResponse?.data;

  const isProfileIncomplete = !isFetching && (!profile || !profile.company_name || !profile.company_type || !profile.description);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (isProfileIncomplete) {
      setShowProfileModal(true);
    }
  }, [isProfileIncomplete]);
  
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
    if (isProfileIncomplete) {
      setShowProfileModal(true);
      return;
    }

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
    if (isProfileIncomplete) {
      setShowProfileModal(true);
      return;
    }

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
          <TouchableOpacity 
            style={[styles.uploadBox, isProfileIncomplete && { opacity: 0.6 }]} 
            onPress={() => handleSelectDocument(docKey)}
          >
            <Icon name="cloud-upload-outline" size={32} color={colors.primary} />
            <Text style={styles.uploadText}>Tap to upload</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      {/* Profile Incomplete Modal Popup */}
      <Modal
        visible={showProfileModal && isProfileIncomplete}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowProfileModal(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBg}>
              <Building2 size={36} color={colors.primary} />
            </View>

            <Text style={styles.modalTitle}>Complete Profile First</Text>
            
            <Text style={styles.modalSubtitle}>
              To ensure smooth KYC verification, please complete your basic Company Profile (Name, Type, and About Info) before uploading documents.
            </Text>

            <View style={styles.modalChecklist}>
              <View style={styles.checklistItem}>
                <Icon 
                  name={profile?.company_name ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={profile?.company_name ? colors.success : colors.textMutedLight} 
                />
                <Text style={[styles.checklistText, profile?.company_name && styles.checklistCompleted]}>
                  Company Name
                </Text>
              </View>

              <View style={styles.checklistItem}>
                <Icon 
                  name={profile?.company_type ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={profile?.company_type ? colors.success : colors.textMutedLight} 
                />
                <Text style={[styles.checklistText, profile?.company_type && styles.checklistCompleted]}>
                  Company Type / Category
                </Text>
              </View>

              <View style={styles.checklistItem}>
                <Icon 
                  name={profile?.description ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={profile?.description ? colors.success : colors.textMutedLight} 
                />
                <Text style={[styles.checklistText, profile?.description && styles.checklistCompleted]}>
                  Company About / Bio
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[globalStyles.primaryButton, { width: '100%', marginBottom: spacing.m }]}
              onPress={() => {
                setShowProfileModal(false);
                navigation.navigate('EditCompanyProfile');
              }}
              activeOpacity={0.8}
            >
              <Text style={globalStyles.primaryButtonText}>Complete Profile Now</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalSecondaryButton}
              onPress={() => {
                setShowProfileModal(false);
                navigation.goBack();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.modalSecondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

            {isProfileIncomplete && (
              <TouchableOpacity 
                style={styles.warningBanner}
                onPress={() => navigation.navigate('EditCompanyProfile')}
                activeOpacity={0.8}
              >
                <View style={styles.warningIconBg}>
                  <AlertCircle size={20} color={colors.warning} />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.warningTitle}>Company Profile Incomplete</Text>
                  <Text style={styles.warningDesc}>Tap to fill in company details to enable KYC submission.</Text>
                </View>
                <View style={styles.warningButton}>
                  <Text style={styles.warningButtonText}>Complete</Text>
                </View>
              </TouchableOpacity>
            )}

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
              style={[
                globalStyles.primaryButton, 
                isUploading && { marginTop: spacing.m },
                isProfileIncomplete && { opacity: 0.6 }
              ]} 
              onPress={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={globalStyles.primaryButtonText}>
                  {isProfileIncomplete ? 'Complete Profile to Submit' : 'Submit Documents'}
                </Text>
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
    marginBottom: spacing.l,
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.l,
  },
  warningIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.warning + '25',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  warningTitle: {
    ...typography.body1,
    color: colors.warning,
    fontWeight: '700',
    fontSize: 14,
  },
  warningDesc: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginTop: 2,
  },
  warningButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.warning,
    borderRadius: 8,
  },
  warningButtonText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surfaceLight,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconBg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textMainLight,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  modalSubtitle: {
    ...typography.body2,
    color: colors.textMutedLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.l,
  },
  modalChecklist: {
    width: '100%',
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.xl,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checklistText: {
    ...typography.body2,
    color: colors.textMutedLight,
    marginLeft: spacing.s,
    fontWeight: '500',
  },
  checklistCompleted: {
    color: colors.textMainLight,
    fontWeight: '600',
  },
  modalSecondaryButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
  },
  modalSecondaryButtonText: {
    ...typography.body2,
    color: colors.textMutedLight,
    fontWeight: '600',
  }
});
