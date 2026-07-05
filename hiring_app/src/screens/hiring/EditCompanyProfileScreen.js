import { showError, showSuccess } from '../../utils/toast';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image , RefreshControl } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { Eye, Users, Briefcase, UserCheck } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Typography from '../../components/core/Typography';
import AnimatedBorderCard from '../../components/AnimatedBorderCard';

import { useNavigation, useRoute } from '@react-navigation/native';

import { colors, typography, spacing, globalStyles } from '../../theme/theme';
import { useGetCompanyProfileQuery, useUpsertCompanyProfileMutation, useUploadLogoMutation } from '../../services/hiringApi';
import { useLazyCheckUsernameQuery } from '../../services/profileApi';
import CommentsSection from '../../components/CommentsSection';
export default function EditCompanyProfileScreen() {
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
  });
  
  const [logoUri, setLogoUri] = useState(null);
  const scrollViewRef = React.useRef(null);
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
        username: user?.username || '',
        company_name: profile.company_name || '',
        company_type: profile.company_type || '',
        description: profile.description || '',
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
      await upsertProfile(form).unwrap();
      showSuccess('', 'Company profile updated successfully.');
    } catch (error) {
      showError('', error?.data?.error || 'Failed to update profile');
    }
  };

  const handleSelectLogo = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (res) => {
      if (res.didCancel || !res.assets || res.assets.length === 0) return;
      
      const asset = res.assets[0];
      setLogoUri(asset.uri);
      
      if (!profile?.id) {
        showError('', 'Please save your profile first before uploading a logo.');
        return;
      }

      const formData = new FormData();
      formData.append('hiringId', profile.id);
      formData.append('logo', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'logo.jpg',
      });

      try {
        await uploadLogo(formData).unwrap();
        showSuccess('', 'Logo uploaded successfully.');
      } catch (error) {
        showError('', 'Failed to upload logo.');
      }
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
    <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}>
      
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
        <TextInput
          style={styles.input}
          placeholder="e.g. Casting Agency, Production House"
          placeholderTextColor={colors.textMutedLight}
          value={form.company_type}
          onChangeText={(text) => handleChange('company_type', text)}
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

    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    ...typography.body2,
    color: colors.primary,
    fontWeight: 'bold',
  }
});
