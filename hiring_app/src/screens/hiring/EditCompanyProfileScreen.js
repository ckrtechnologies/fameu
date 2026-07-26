import { showError, showSuccess } from '../../utils/toast';
import React, { useState, useEffect } from 'react';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, RefreshControl, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { Eye, Users, Briefcase, UserCheck } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Typography from '../../components/core/Typography';
import AnimatedBorderCard from '../../components/AnimatedBorderCard';

import { useNavigation, useRoute } from '@react-navigation/native';

import { typography, spacing, globalStyles } from '../../theme/theme';
import { useGetCompanyProfileQuery, useUpsertCompanyProfileMutation, useUploadLogoMutation } from '../../services/hiringApi';
import { useLazyCheckUsernameQuery } from '../../services/profileApi';
import CommentsSection from '../../components/CommentsSection';
import CustomDropdown from '../../components/forms/CustomDropdown';
import { useTheme } from '../../theme/ThemeProvider';
export default function EditCompanyProfileScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute();
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const { data: response, isLoading , isFetching, refetch} = useGetCompanyProfileQuery(user?.id)
  const [upsertProfile, { isLoading: isUpdating }] = useUpsertCompanyProfileMutation();
  const [uploadLogo, { isLoading: isUploading }] = useUploadLogoMutation();
  const [checkUsername, { isFetching: isCheckingUsername }] = useLazyCheckUsernameQuery();

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
        await uploadLogo(formData).unwrap();
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
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.didCancel || !res.assets || res.assets.length === 0) return;
      const asset = res.assets[0];
      setLogoUri(asset.uri);
      setSelectedLogo(asset);
    });
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
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
    <KeyboardAwareScrollView 
      ref={scrollViewRef} 
      contentContainerStyle={styles.scrollContent} 
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}
    >
      
      <View style={styles.logoSection}>
        <TouchableOpacity style={styles.logoContainer} onPress={handleSelectLogo}>
          {currentLogo ? (
            <Image source={{ uri: currentLogo }} style={styles.logoImage} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Icon name="business-outline" size={40} color={colors.textMutedLight} />
              <Text style={styles.logoText}>Upload Logo</Text>
            </View>
          )}
          {isUploading && (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.helperText}>Recommended size: 500x500px</Text>
      </View>



      <View style={styles.formGroup}>
        <Text style={styles.label}>Username *</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="e.g. dharmaproductions"
            placeholderTextColor={colors.textMutedLight}
            value={form.username}
            onChangeText={(text) => handleChange('username', text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={{ marginLeft: 8, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, justifyContent: 'center' }}
            onPress={handleVerifyUsername}
            disabled={isCheckingUsername}
          >
            {isCheckingUsername ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <UserCheck size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Company Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Dharma Productions"
          placeholderTextColor={colors.textMutedLight}
          value={form.company_name}
          onChangeText={(text) => handleChange('company_name', text)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Company Type *</Text>
        <TouchableOpacity 
          style={styles.customSelectInput}
          onPress={() => setShowCompanyTypeModal(true)}
        >
          <Text style={[styles.customSelectText, !form.company_type && { color: colors.textMutedLight }]}>
            {form.company_type || 'Select Company Type'}
          </Text>
          <Icon name="chevron-down" size={20} color={colors.textMutedLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Alternate Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. +91 9876543210"
          placeholderTextColor={colors.textMutedLight}
          value={form.alternate_phone || ''}
          onChangeText={(text) => handleChange('alternate_phone', text)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Alternate Email</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. contact@dharma.com"
          placeholderTextColor={colors.textMutedLight}
          value={form.alternate_email || ''}
          onChangeText={(text) => handleChange('alternate_email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about your company and the work you do..."
          placeholderTextColor={colors.textMutedLight}
          value={form.description}
          onChangeText={(text) => handleChange('description', text)}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity 
        style={[globalStyles.primaryButton, { marginTop: spacing.xl }]} 
        onPress={handleSave}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={globalStyles.primaryButtonText}>Save Profile</Text>
        )}
      </TouchableOpacity>

      {profile?.id && (
        <CommentsSection targetType="profile" targetId={profile.id} disableComment={true} />
      )}

    </KeyboardAwareScrollView>

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
    paddingBottom: 100,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: spacing.m,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoPlaceholder: {
    alignItems: 'center',
  },
  logoText: {
    ...typography.body2,
    color: colors.textMutedLight,
    marginTop: 8,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    ...typography.body2,
    color: colors.textMutedLight,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xl,
  },
  metricCardWrapper: {
    width: '48%',
    marginBottom: spacing.md,
  },
  metricIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  formGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.body1,
    color: colors.textMainLight,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: spacing.l,
    paddingVertical: 14,
    ...typography.body1,
    color: colors.textMainLight,
  },
  textArea: {
    minHeight: 120,
  },
  kycSection: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.l,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.xl,
  },
  kycHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  kycTitle: {
    ...typography.body1,
    color: colors.textMainLight,
    fontWeight: 'bold',
    marginLeft: spacing.s,
  },
  kycButton: {
    backgroundColor: colors.primary + '15', // light primary
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  kycButtonText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: 'bold',
  },
  customSelectInput: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: spacing.l,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customSelectText: {
    ...typography.body1,
    color: colors.textMainLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.m,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: spacing.s,
  },
  modalList: {
    paddingBottom: spacing.xxl,
  },
  companyTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.l,
    marginBottom: spacing.l,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  companyTypeIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.l,
  },
  companyTypeText: {
    ...typography.h3,
    color: colors.textMainLight,
    flex: 1,
  }
});
