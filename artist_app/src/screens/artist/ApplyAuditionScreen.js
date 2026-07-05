import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator , RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../../theme/theme';
import { useGetProfileQuery } from '../../services/profileApi';
import { useApplyToAuditionMutation } from '../../services/discoverApi';
import CustomButton from '../../components/forms/CustomButton';
import CustomInput from '../../components/forms/CustomInput';

export default function ApplyAuditionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { auditionId } = route.params;

  const [coverNote, setCoverNote] = useState('');
  
  const { data: profile, isLoading: isProfileLoading , isFetching, refetch} = useGetProfileQuery()
  const [applyToAudition, { isLoading: isApplying }] = useApplyToAuditionMutation();

  const handleApply = async () => {
    try {
      await applyToAudition({ id: auditionId, cover_note: coverNote }).unwrap();
      Alert.alert('Success', 'Application submitted successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Tabs', params: { screen: 'Applications' } }) }
      ]);
    } catch (err) {
      console.error('Apply to audition error:', err);
      const errMsg = err?.data?.error || err?.message || 'Failed to submit application.';
      Alert.alert('Error', typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
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
      <View style={styles.container}>
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

        {/* Video selector placeholder */}
        <View style={styles.videoSection}>
          <Icon name="videocam-outline" size={24} color={colors.textMutedLight} />
          <Text style={styles.videoText}>Attach audition video (Coming soon)</Text>
        </View>

        <CustomButton 
          title="Submit Application" 
          onPress={handleApply}
          loading={isApplying}
          style={{ marginTop: 'auto', marginBottom: spacing.xl }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 12,
    padding: spacing.m,
    ...typography.body,
    color: colors.textMainLight,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.textMutedLight + '30',
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
