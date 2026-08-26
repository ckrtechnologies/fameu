import { showError, showSuccess } from '../../utils/toast';
import React, { useState, useEffect } from 'react';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image, RefreshControl, Modal, FlatList, PermissionsAndroid, Platform } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { GlobalAlert } from '../../components/core/GlobalAlert';
import { useSelector } from 'react-redux';
import AppIcon, { Icon } from '../../components/icons';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import { Building2, User, Briefcase, Phone, Mail, FileText, Camera, Check, CheckCircle, ChevronDown, AtSign } from 'lucide-react-native';
import ProgressBar from '../../components/core/ProgressBar';
import { uploadFileWithProgress } from '../../utils/uploadUtils';

import { useNavigation, useRoute } from '@react-navigation/native';

import { typography, spacing, globalStyles } from '../../theme/theme';
import { useGetCompanyProfileQuery, useUpsertCompanyProfileMutation } from '../../services/hiringApi';
import { useLazyCheckUsernameQuery } from '../../services/profileApi';
import CommentsSection from '../../components/CommentsSection';
import { useTheme } from '../../theme/ThemeProvider';

export default function EditCompanyProfileScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute();
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const { data: response, isLoading , isFetching, refetch} = useGetCompanyProfileQuery(user?.id)
  const [upsertProfile, { isLoading: isUpdating }] = useUpsertCompanyProfileMutation();
  const [checkUsername, { isFetching: isCheckingUsername }] = useLazyCheckUsernameQuery();
  const token = useSelector(state => state.auth.token);
  
  const [isUploading, setIsUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);

  const profile = response?.data;

  const [form, setForm] = useState({
    username: user?.username || '',
    company_name: '',
    company_type: '',
    description: '',
    alternate_phone: '',
    alternate_email: '',
  });
  
  const [logoUri, setLogoUri] = useState(null);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [showCompanyTypeModal, setShowCompanyTypeModal] = useState(false);
  const scrollViewRef = React.useRef(null);

  const COMPANY_TYPE_OPTIONS = [
    { label: 'Production house', value: 'Production house', icon: 'videocam', color: '#8b5cf6' },
    { label: 'Casting company or director', value: 'Casting company or director', icon: 'person-add', color: '#3b82f6' },
    { label: 'Free lancer', value: 'Free lancer', icon: 'person', color: '#10b981' },
    { label: 'Theater group or institution', value: 'Theater group or institution', icon: 'business', color: '#f59e0b' },
    { label: 'Music company', value: 'Music company', icon: 'musical-notes', color: '#ec4899' },
    { label: 'Post production Studio', value: 'Post production Studio', icon: 'desktop', color: '#6366f1' },
    { label: 'Brand or Corporate', value: 'Brand or Corporate', icon: 'briefcase', color: '#0ea5e9' },
    { label: 'Broadcaster or channel', value: 'Broadcaster or channel', icon: 'tv', color: '#ef4444' },
    { label: 'Filmmaker', value: 'Filmmaker', icon: 'film', color: '#8b5cf6' },
    { label: 'Media or Advertising agency', value: 'Media or Advertising agency', icon: 'megaphone', color: '#f97316' },
    { label: 'Event or outdoor', value: 'Event or outdoor', icon: 'calendar', color: '#14b8a6' },
    { label: 'Media company or network', value: 'Media company or network', icon: 'globe', color: '#06b6d4' },
    { label: 'Talent management agency', value: 'Talent management agency', icon: 'star', color: '#eab308' },
    { label: 'Others', value: 'Others', icon: 'ellipsis-horizontal', color: '#94a3b8' }
  ];
  const scrollToComments = route.params?.scrollToComments;

  useEffect(() => {
    if (scrollToComments && profile) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  }, [scrollToComments, profile]);

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.users?.username || user?.username || '',
        company_name: profile.company_name || '',
        company_type: profile.company_type || '',
        description: profile.description || '',
        alternate_phone: profile.alternate_contact?.phone || '',
        alternate_email: profile.alternate_contact?.email || '',
      });
    }
  }, [profile, user]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVerifyUsername = async () => {
    if (!form.username) return showError('', 'Please enter a username to verify.');
    try {
      const response = await checkUsername(form.username).unwrap();
      if (response.data.available) {
        showSuccess('', 'This username is available!');
      } else {
        showError('', 'This username is already taken. Please choose another one.');
      }
    } catch (err) {
      showError('', err?.data?.error || 'Failed to check username.');
    }
  };

  const handleSave = async () => {
    if (!form.company_name || !form.company_type) {
      showError('', 'Company Name and Type are required.');
      return;
    }
    try {
      const payload = {
        username: form.username,
        company_name: form.company_name,
        company_type: form.company_type,
        description: form.description,
        alternate_contact: {
          phone: form.alternate_phone,
          email: form.alternate_email
        }
      };
      const res = await upsertProfile(payload).unwrap();
      const profileId = res?.data?.id || res?.id || profile?.id;

      if (selectedLogo && profileId) {
        const formData = new FormData();
        formData.append('hiringId', profileId);
        formData.append('logo', {
          uri: selectedLogo.uri,
          type: selectedLogo.type || 'image/jpeg',
          name: selectedLogo.fileName || 'logo.jpg',
        });
        
        setIsUploading(true);
        setLogoProgress(0);
        try {
          await uploadFileWithProgress('/hiring_app/company/logo', formData, (progress) => {
            setLogoProgress(progress);
          }, token);
        } catch (uploadErr) {
          showError('', 'Failed to upload logo, but profile was saved.');
          console.error(uploadErr);
        } finally {
          setIsUploading(false);
        }
      }

      showSuccess('', 'Company profile updated successfully.');
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      showError('', error?.data?.error || 'Failed to update profile');
    }
  };

  const handleSelectLogo = () => {
    const onImageResult = (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        showError('', res.errorMessage || 'Failed to capture image');
        return;
      }
      if (!res.assets?.length) return;
      const asset = res.assets[0];
      setLogoUri(asset.uri);
      setSelectedLogo(asset);
    };

    GlobalAlert.show('Upload Logo', 'Choose how to upload your company logo', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Take Photo',
        onPress: async () => {
          if (Platform.OS === 'android') {
            try {
              const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
              if (hasPermission) {
                launchCamera({ mediaType: 'photo', quality: 0.8, maxWidth: 1080, maxHeight: 1080, saveToPhotos: false }, onImageResult);
                return;
              }
              const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
                title: 'Camera Permission',
                message: 'This app needs access to your camera to capture your company logo photo.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              });
              if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                launchCamera({ mediaType: 'photo', quality: 0.8, maxWidth: 1080, maxHeight: 1080, saveToPhotos: false }, onImageResult);
              } else {
                showError('', 'Camera permission is required to take a photo.');
              }
            } catch (err) {
              showError('', err?.message || 'Failed to request camera permission');
            }
          } else {
            launchCamera({ mediaType: 'photo', quality: 0.8, maxWidth: 1080, maxHeight: 1080, saveToPhotos: false }, onImageResult);
          }
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: () => launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 1080, maxHeight: 1080 }, onImageResult),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const currentLogo = logoUri || profile?.logo_url;

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
      <ShrinkableHeader title="Edit Company Profile" showBack={true} />
      
      <KeyboardAwareScrollView 
        ref={scrollViewRef} 
        contentContainerStyle={styles.scrollContent} 
        enableOnAndroid={true}
        extraScrollHeight={80}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* Compact Logo Uploader Header */}
        <View style={styles.logoSection}>
          <TouchableOpacity style={styles.logoContainer} onPress={handleSelectLogo} disabled={isUploading} activeOpacity={0.8}>
            {currentLogo ? (
              <Image source={{ uri: currentLogo }} style={styles.logoImage} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Building2 size={28} color={colors.primary} />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Camera size={12} color="#FFFFFF" />
            </View>
            {isUploading && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.logoMeta}>
            <Text style={styles.logoHeading}>Company Logo</Text>
            <Text style={styles.logoSubtext}>Tap icon to change (500x500px)</Text>
          </View>
        </View>

        {isUploading && (
          <View style={{ marginBottom: 10 }}>
            <ProgressBar progress={logoProgress} />
          </View>
        )}

        {/* Username */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Username *</Text>
          <View style={styles.inputWithIcon}>
            <AtSign size={16} color={colors.textMutedLight} style={styles.fieldLeadingIcon} />
            <TextInput
              style={styles.innerInput}
              placeholder="e.g. dharmaproductions"
              placeholderTextColor={colors.textMutedLight}
              value={form.username}
              onChangeText={(text) => handleChange('username', text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.verifyButton}
              onPress={handleVerifyUsername}
              disabled={isCheckingUsername}
              activeOpacity={0.8}
            >
              {isCheckingUsername ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Check size={14} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Company Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Company Name *</Text>
          <View style={styles.inputWithIcon}>
            <Building2 size={16} color={colors.textMutedLight} style={styles.fieldLeadingIcon} />
            <TextInput
              style={styles.innerInput}
              placeholder="e.g. Dharma Productions"
              placeholderTextColor={colors.textMutedLight}
              value={form.company_name}
              onChangeText={(text) => handleChange('company_name', text)}
            />
          </View>
        </View>

        {/* Company Type Dropdown */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Company Type *</Text>
          <TouchableOpacity 
            style={styles.inputWithIcon}
            onPress={() => setShowCompanyTypeModal(true)}
            activeOpacity={0.7}
          >
            <Briefcase size={16} color={colors.textMutedLight} style={styles.fieldLeadingIcon} />
            <Text style={[styles.innerInputText, !form.company_type && { color: colors.textMutedLight }]}>
              {form.company_type || 'Select Company Type'}
            </Text>
            <ChevronDown size={16} color={colors.textMutedLight} style={{ marginRight: 10 }} />
          </TouchableOpacity>
        </View>

        {/* 2-Column Contact Row */}
        <View style={styles.twoColRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 6 }]}>
            <Text style={styles.label}>Alt. Phone</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={14} color={colors.textMutedLight} style={styles.fieldLeadingIcon} />
              <TextInput
                style={styles.innerInput}
                placeholder="+91 98765..."
                placeholderTextColor={colors.textMutedLight}
                value={form.alternate_phone || ''}
                onChangeText={(text) => handleChange('alternate_phone', text)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={[styles.formGroup, { flex: 1, marginLeft: 6 }]}>
            <Text style={styles.label}>Alt. Email</Text>
            <View style={styles.inputWithIcon}>
              <Mail size={14} color={colors.textMutedLight} style={styles.fieldLeadingIcon} />
              <TextInput
                style={styles.innerInput}
                placeholder="contact@..."
                placeholderTextColor={colors.textMutedLight}
                value={form.alternate_email || ''}
                onChangeText={(text) => handleChange('alternate_email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>About / Bio</Text>
          <View style={[styles.inputWithIcon, styles.textAreaContainer]}>
            <FileText size={16} color={colors.textMutedLight} style={[styles.fieldLeadingIcon, { marginTop: 10 }]} />
            <TextInput
              style={[styles.innerInput, styles.textAreaInput]}
              placeholder="Tell us about your company and the work you do..."
              placeholderTextColor={colors.textMutedLight}
              value={form.description}
              onChangeText={(text) => handleChange('description', text)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[globalStyles.primaryButton, styles.saveButton]} 
          onPress={handleSave}
          disabled={isUpdating || isUploading}
          activeOpacity={0.85}
        >
          {(isUpdating || isUploading) ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={18} color="#FFF" />
              <Text style={globalStyles.primaryButtonText}>Save Company Profile</Text>
            </View>
          )}
        </TouchableOpacity>

        {profile?.id && (
          <CommentsSection targetType="profile" targetId={profile.id} disableComment={true} />
        )}
      </KeyboardAwareScrollView>

      {/* Company Type Modal */}
      <Modal
        visible={showCompanyTypeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCompanyTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Company Type</Text>
              <TouchableOpacity onPress={() => setShowCompanyTypeModal(false)} style={styles.modalCloseButton}>
                <Icon name="close" size={24} color={colors.textMainLight} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COMPANY_TYPE_OPTIONS}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.companyTypeOption,
                    form.company_type === item.value && { backgroundColor: item.color + '15', borderColor: item.color }
                  ]}
                  onPress={() => {
                    handleChange('company_type', item.value);
                    setShowCompanyTypeModal(false);
                  }}
                >
                  <View style={[styles.companyTypeIconWrapper, { backgroundColor: item.color + '20' }]}>
                    <Icon name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={[
                    styles.companyTypeText,
                    form.company_type === item.value && { color: item.color, fontWeight: '700' }
                  ]}>
                    {item.label}
                  </Text>
                  {form.company_type === item.value && (
                    <Icon name="checkmark-circle" size={24} color={item.color} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    paddingBottom: 30,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 14,
    padding: spacing.s,
    marginBottom: spacing.s,
    gap: 12,
  },
  logoContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary + '15',
    borderWidth: 1.5,
    borderColor: colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
    resizeMode: 'cover',
  },
  logoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.surfaceLight,
  },
  logoMeta: {
    flex: 1,
  },
  logoHeading: {
    ...typography.body1,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  logoSubtext: {
    fontSize: 11,
    color: colors.textMutedLight,
    marginTop: 2,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 8,
  },
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: colors.textMainLight,
    fontWeight: '600',
    marginBottom: 3,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
  },
  fieldLeadingIcon: {
    marginRight: 8,
  },
  innerInput: {
    flex: 1,
    height: '100%',
    color: colors.textMainLight,
    fontSize: 13,
    paddingVertical: 0,
  },
  innerInputText: {
    flex: 1,
    color: colors.textMainLight,
    fontSize: 13,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textAreaContainer: {
    height: 60,
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  textAreaInput: {
    height: '100%',
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: spacing.l,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.s,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalList: {
    paddingBottom: spacing.xl,
  },
  companyTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.s,
  },
  companyTypeIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  companyTypeText: {
    ...typography.body1,
    color: colors.textMainLight,
  },
});

