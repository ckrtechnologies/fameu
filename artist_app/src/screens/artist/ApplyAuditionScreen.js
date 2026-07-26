import { showError, showSuccess } from '../../utils/toast';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator , RefreshControl } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import { useGetProfileQuery } from '../../services/profileApi';
import { useApplyToAuditionMutation } from '../../services/discoverApi';
import CustomButton from '../../components/forms/CustomButton';
import CustomInput from '../../components/forms/CustomInput';
export default function ApplyAuditionScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute();
  const navigation = useNavigation();
  const { auditionId, mode } = route.params;

  const [coverNote, setCoverNote] = useState('');
  const [videoLink, setVideoLink] = useState('');
  
  const { data: profile, isLoading: isProfileLoading , isFetching, refetch} = useGetProfileQuery()
  const [applyToAudition, { isLoading: isApplying }] = useApplyToAuditionMutation();

  const handleApply = async () => {
    try {
      await applyToAudition({ id: auditionId, cover_note: coverNote, video_link: videoLink }).unwrap();
      showSuccess('', 'Application submitted successfully!');
      setTimeout(() => {
        navigation.navigate('MainTabs', { screen: 'Tabs', params: { screen: 'Applications' } });
      }, 1000);
    } catch (err) {
      console.error('Apply to audition error:', err);
      const errMsg = err?.data?.error || err?.message || 'Failed to submit application.';
      showError('', typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  };

  const handleCompleteProfile = () => {
    navigation.navigate('ArtistCategory');
  };

  if (isProfileLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // PPP Check: If profile is completely missing or lacks a category, intercept the flow
  const actualProfile = profile?.data;
  const profileIsComplete = actualProfile && actualProfile.categories && actualProfile.categories.length > 0;

  if (!profileIsComplete) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center, { padding: spacing.xl }]} edges={['top', 'bottom']}>
        <Icon name="person-circle-outline" size={64} color={colors.primary} style={{ marginBottom: spacing.m }} />
        <Text style={styles.title}>Profile Incomplete</Text>
        <Text style={styles.subtitle}>
          Casting directors need to know a bit more about you before you can apply. Let's set up your basic profile!
        </Text>
        <CustomButton 
          title="Complete Profile" 
          onPress={handleCompleteProfile} 
          style={{ width: '100%', marginTop: spacing.xl }}
        />
        <CustomButton 
          title="Cancel" 
          onPress={() => navigation.goBack()} 
          variant="outline" 
          style={{ width: '100%', marginTop: spacing.m }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Apply for Role</Text>
      </View>
      <KeyboardAwareScrollView 
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing.xl }}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Cover Note (Optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Why are you a good fit for this role?"
          placeholderTextColor={colors.textMutedLight}
          multiline
          numberOfLines={6}
          value={coverNote}
          onChangeText={setCoverNote}
          textAlignVertical="top"
        />

        {mode === 'Online' && (
          <>
            <Text style={[styles.label, { marginTop: spacing.l }]}>Audition Video Link (Optional)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.borderLight, color: colors.textMainLight }]}
              placeholder="e.g. YouTube or Instagram URL"
              placeholderTextColor={colors.textMutedLight}
              value={videoLink}
              onChangeText={setVideoLink}
              autoCapitalize="none"
              keyboardType="url"
            />
          </>
        )}

        <CustomButton 
          title="Submit Application" 
          onPress={handleApply}
          loading={isApplying}
          style={{ marginTop: 'auto', marginBottom: spacing.xl }}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: spacing.xl,
    paddingBottom: spacing.m,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textMainLight,
  },
  title: {
    ...typography.h2,
    color: colors.textMainLight,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMutedLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMainLight,
    marginBottom: spacing.s,
  },
  textArea: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.m,
    ...typography.body,
    color: colors.textMainLight,
    minHeight: 120,
    borderRadius: 8,
  },
  input: {
    ...typography.body,
    padding: spacing.m,
    borderWidth: 1,
    borderRadius: 8,
  },
  videoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    marginTop: spacing.l,
    borderWidth: 1,
    borderColor: colors.textMutedLight + '30',
    borderStyle: 'dashed',
  },
  videoText: {
    ...typography.body,
    color: colors.textMutedLight,
    marginLeft: spacing.m,
  }
});
