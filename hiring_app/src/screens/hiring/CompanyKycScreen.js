import { showError, showSuccess } from '../../utils/toast';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, RefreshControl, Modal, Platform, PermissionsAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick, types, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import { launchCamera } from 'react-native-image-picker';
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

  const isProfileIncomplete = !isFetching && (
    !profile ||
    !profile.company_name ||
    !profile.company_type ||
    !profile.description ||
    !profile.logo_url
  );

  let profileScore = 0;
  if (profile?.company_name) profileScore += 25;
  if (profile?.company_type) profileScore += 25;
  if (profile?.description) profileScore += 25;
  if (profile?.logo_url) profileScore += 25;

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
    pan: null,
    driving_license: null,
    gst: null,
    company_reg: null,
    aadhaar: null,
    passport: null,
    voter_id: null,
    selfie: null,
  });

  const captureSelfieLive = async () => {
    const onResult = (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        showError('Camera Error', res.errorMessage || 'Failed to capture live photo.');
        return;
      }
      if (res.assets && res.assets[0]) {
        const file = res.assets[0];
        setDocs((prev) => ({
          ...prev,
          selfie: {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.fileName || 'auth_selfie.jpg',
          }
        }));
      }
    };

    if (Platform.OS === 'android') {
      try {
        const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (hasPermission) {
          launchCamera({ mediaType: 'photo', cameraType: 'front', quality: 0.85, maxWidth: 1200, maxHeight: 1200, saveToPhotos: false }, onResult);
          return;
        }
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Camera Permission',
          message: 'FameU requires camera access for live identity selfie verification.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          launchCamera({ mediaType: 'photo', cameraType: 'front', quality: 0.85, maxWidth: 1200, maxHeight: 1200, saveToPhotos: false }, onResult);
        } else {
          showError('Permission Denied', 'Camera permission is required for live photo capture.');
        }
      } catch (err) {
        showError('Error', err?.message || 'Failed to request camera permission');
      }
    } else {
      launchCamera({ mediaType: 'photo', cameraType: 'front', quality: 0.85, maxWidth: 1200, maxHeight: 1200, saveToPhotos: false }, onResult);
    }
  };

  const handleSelectDocument = async (key) => {
    if (isProfileIncomplete) {
      setShowProfileModal(true);
      return;
    }

    if (key === 'selfie') {
      captureSelfieLive();
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

    const hasPan = Boolean(getDoc('pan'));
    const hasDl = Boolean(getDoc('driving_license'));

    if (!hasPan || !hasDl) {
      showError('', 'Please upload BOTH mandatory documents (PAN Card AND Driving License) to submit KYC.');
      return;
    }

    const formData = new FormData();
    formData.append('hiringId', profile.id);

    let hasFilesToUpload = false;
    Object.keys(docs).forEach((key) => {
      if (docs[key]) {
        formData.append(key, docs[key]);
        hasFilesToUpload = true;
      }
    });

    if (!hasFilesToUpload && !profile?.is_verified) {
      showError('', 'Please attach your documents to upload.');
      return;
    }

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

  const getDoc = (key) => {
    if (docs[key]) return docs[key];
    const backendUrl = profile?.[`${key}_url`];
    if (backendUrl) {
      return { uri: backendUrl, isExisting: true, name: `${key}.jpg` };
    }
    return null;
  };

  const KYC_DOCS_CONFIG = [
    { key: 'pan', title: 'PAN Card', badge: 'Mandatory', required: true, icon: 'card-outline' },
    { key: 'driving_license', title: 'Driving License', badge: 'Mandatory', required: true, icon: 'car-outline' },
    { key: 'gst', title: 'GST Certificate', badge: 'Optional', required: false, icon: 'receipt-outline' },
    { key: 'company_reg', title: 'Company Reg.', badge: 'Optional', required: false, icon: 'business-outline' },
    { key: 'aadhaar', title: 'Aadhaar (F&B)', badge: 'Optional', required: false, icon: 'finger-print-outline' },
    { key: 'passport', title: 'Passport', badge: 'Optional', required: false, icon: 'airplane-outline' },
    { key: 'voter_id', title: 'Voter ID', badge: 'Optional', required: false, icon: 'checkbox-outline' },
    { key: 'selfie', title: 'Auth. Selfie', badge: 'Optional', required: false, icon: 'camera-outline' },
  ];

  const totalUploaded = KYC_DOCS_CONFIG.filter(item => Boolean(getDoc(item.key))).length;
  const hasPan = Boolean(getDoc('pan'));
  const hasDl = Boolean(getDoc('driving_license'));
  const hasBothMandatory = hasPan && hasDl;

  const DocumentGridCard = ({ item }) => {
    const doc = getDoc(item.key);
    const isMandatory = item.required;

    return (
      <View style={styles.gridCard}>
        <View style={styles.gridCardHeader}>
          <View style={styles.gridIconCircle}>
            <Icon name={item.icon} size={18} color={colors.primary} />
          </View>
          <View style={[styles.gridBadge, isMandatory ? styles.gridBadgeMandatory : styles.gridBadgeOptional]}>
            <Text style={[styles.gridBadgeText, isMandatory ? styles.gridBadgeTextMandatory : styles.gridBadgeTextOptional]}>
              {item.badge}
            </Text>
          </View>
        </View>

        <Text style={styles.gridCardTitle} numberOfLines={1}>{item.title}</Text>

        {doc ? (
          <View style={styles.gridPreviewContainer}>
            <Image source={{ uri: doc.uri }} style={styles.gridPreviewImage} />
            <View style={styles.gridUploadedOverlay}>
              <Icon name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.gridUploadedText}>
                {doc.isExisting ? 'Saved' : 'Uploaded'}
              </Text>
            </View>
            <TouchableOpacity style={styles.gridRemoveButton} onPress={() => removeDocument(item.key)}>
              <Icon name="close-circle" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.gridUploadBox, isProfileIncomplete && { opacity: 0.6 }]} 
            onPress={() => handleSelectDocument(item.key)}
            activeOpacity={0.7}
          >
            <Icon name={item.key === 'selfie' ? 'camera-outline' : 'cloud-upload-outline'} size={22} color={colors.primary} />
            <Text style={styles.gridUploadText}>
              {item.key === 'selfie' ? 'Take Live Photo' : 'Tap to Upload'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.backgroundLight }]}>
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

            <Text style={styles.modalTitle}>Profile {profileScore}% Complete</Text>

            <Text style={styles.modalSubtitle}>
              To ensure smooth KYC verification, your company profile must be 100% complete before uploading verification documents.
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

              <View style={styles.checklistItem}>
                <Icon
                  name={profile?.logo_url ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={profile?.logo_url ? colors.success : colors.textMutedLight}
                />
                <Text style={[styles.checklistText, profile?.logo_url && styles.checklistCompleted]}>
                  Company Logo
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

      {isProfileIncomplete ? (
        <View style={[styles.center, { flex: 1, padding: spacing.l }]}>
          <Building2 size={72} color={colors.primary} style={{ marginBottom: spacing.m }} />
          <Text style={[styles.title, { textAlign: 'center' }]}>
            Profile {profileScore}% Complete
          </Text>
          <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: spacing.xl, marginTop: spacing.s }]}>
            You must complete 100% of your company profile (Name, Type, About Bio, and Logo) before you can submit KYC verification documents.
          </Text>
          <TouchableOpacity
            style={[globalStyles.primaryButton, { width: '100%', marginBottom: spacing.m }]}
            onPress={() => navigation.navigate('EditCompanyProfile')}
          >
            <Text style={globalStyles.primaryButtonText}>Complete Profile ({profileScore}%)</Text>
          </TouchableOpacity>
        </View>
      ) : (profile?.verification_status === 'approved' || profile?.verification_status === 'pending' || profile?.is_verified) && !isReKyc ? (
        <View style={[styles.center, { flex: 1, padding: spacing.l }]}>
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Submit KYC Documents</Text>
              <Text style={styles.subtitle}>
                To verify your company and start hiring on FameU, please provide your documents. Ensure images are clear and readable.
              </Text>
            </View>

            {/* Live Upload Progress & Checklist Preview */}
            <View style={styles.previewSummaryCard}>
              <View style={styles.previewSummaryHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="shield-checkmark" size={18} color={hasBothMandatory ? colors.success : colors.warning} />
                  <Text style={styles.previewSummaryTitle}>
                    {totalUploaded} of {KYC_DOCS_CONFIG.length} Uploaded
                  </Text>
                </View>
                <View style={[styles.statusPill, hasBothMandatory ? styles.statusPillReady : styles.statusPillPending]}>
                  <Text style={[styles.statusPillText, hasBothMandatory ? styles.statusPillTextReady : styles.statusPillTextPending]}>
                    {hasBothMandatory ? 'Mandatory Ready (2/2)' : (hasPan || hasDl) ? 'Mandatory Incomplete (1/2)' : 'Mandatory Required (0/2)'}
                  </Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressIndicator, { width: `${Math.round((totalUploaded / KYC_DOCS_CONFIG.length) * 100)}%`, backgroundColor: hasBothMandatory ? colors.success : colors.primary }]} />
              </View>
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

            <View style={styles.gridContainer}>
              {KYC_DOCS_CONFIG.map((item) => (
                <DocumentGridCard key={item.key} item={item} />
              ))}
            </View>
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
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.s,
    paddingBottom: 40,
  },
  header: {
    marginTop: 4,
    marginBottom: spacing.m,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMainLight,
    lineHeight: 28,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textMutedLight,
    lineHeight: 20,
    marginBottom: spacing.s,
  },
  previewSummaryCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  previewSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  previewSummaryTitle: {
    ...typography.body2,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillReady: {
    backgroundColor: colors.success + '20',
  },
  statusPillPending: {
    backgroundColor: colors.warning + '20',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPillTextReady: {
    color: colors.success,
  },
  statusPillTextPending: {
    color: colors.warning,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    borderRadius: 3,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.m,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  gridCard: {
    width: '48.5%',
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: spacing.s,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gridIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridBadgeMandatory: {
    backgroundColor: colors.error + '18',
  },
  gridBadgeOptional: {
    backgroundColor: colors.borderLight,
  },
  gridBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  gridBadgeTextMandatory: {
    color: colors.error,
  },
  gridBadgeTextOptional: {
    color: colors.textMutedLight,
  },
  gridCardTitle: {
    ...typography.body2,
    fontWeight: '700',
    color: colors.textMainLight,
    marginBottom: spacing.s,
    fontSize: 13,
  },
  gridUploadBox: {
    height: 76,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  gridUploadText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
  },
  gridPreviewContainer: {
    height: 76,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  gridPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridUploadedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    gap: 4,
  },
  gridUploadedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  gridRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  footer: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
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
