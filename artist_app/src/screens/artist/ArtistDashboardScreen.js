import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors, typography, spacing } from '../../theme/theme';
import AuditionCard from '../../components/artist/AuditionCard';
import { useGetFeedQuery } from '../../services/discoverApi';
import { useGetProfileQuery } from '../../services/profileApi';

export default function ArtistDashboardScreen() {
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  
  const { data: feedData, isLoading, isError, refetch: refetchFeed } = useGetFeedQuery();
  const { data: liveData, isLoading: isLoadingLive, isError: isErrorLive, refetch: refetchLive } = useGetFeedQuery({ is_live: true });
  const { data: profileResponse, refetch: refetchProfile } = useGetProfileQuery();

  const handleRefresh = React.useCallback(() => {
    refetchFeed();
    refetchLive();
    refetchProfile();
  }, [refetchFeed, refetchLive, refetchProfile]);

  const handleAuditionPress = (id) => {
    navigation.navigate('AuditionDetail', { id });
  };

  const profile = profileResponse?.data;
  const name = profile?.full_name || user?.display_name || user?.full_name || user?.email?.split('@')[0] || 'Artist';

  if (isLoading || isLoadingLive) {
    return (
      <SafeAreaView style={styles.loadingSafeArea} edges={['left', 'right']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // Assuming feedData is an array of auditions. We will split it into two for display purposes 
  // (or backend could return { nearby: [], trending: [] })
  // For now, if it's a flat array, we just show it under "Recommended"
  const auditions = Array.isArray(feedData?.data) ? feedData.data : (Array.isArray(feedData) ? feedData : []);
  const liveAuditions = Array.isArray(liveData?.data) ? liveData.data : (Array.isArray(liveData) ? liveData : []);
  
  const calculateProfileCompletion = (p) => {
    if (!p) return 0;
    let score = 0;
    if (p.full_name) score += 15;
    if (p.age) score += 5;
    if (p.gender) score += 5;
    if (p.city) score += 10;
    if (p.bio) score += 15;
    if (p.categories && p.categories.length > 0) score += 20;
    if (p.photo_urls && p.photo_urls.length > 0) score += 20;
    if (p.experience) score += 5;
    if (p.height || p.weight) score += 5;
    return Math.min(100, score);
  };
  
  const profileCompletePct = profile?.profile_complete_pct || calculateProfileCompletion(profile);

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading || isLoadingLive} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {name} 👋</Text>
          <Text style={styles.subtitle}>Here are your matches for today</Text>
        </View>

        {/* Profile Status Banner */}
        <TouchableOpacity 
          style={styles.profileBanner} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <View style={styles.profileBannerContent}>
            <Text style={styles.profileBannerTitle}>Profile Setup</Text>
            <Text style={styles.profileBannerText}>Your profile is {profileCompletePct}% complete. Finish setting it up to get more matches!</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${profileCompletePct}%` }]} />
            </View>
            <Text style={styles.completeNowText}>Complete Now &gt;</Text>
          </View>
        </TouchableOpacity>

        {(isError || isErrorLive) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load some auditions.</Text>
            <Text onPress={handleRefresh} style={styles.retryText}>Retry</Text>
          </View>
        )}

        {/* Live Auditions Section */}
        {liveAuditions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔴 Live Auditions</Text>
              <Text style={styles.seeAll}>See All</Text>
            </View>
            <FlatList
              data={liveAuditions}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <AuditionCard 
                  audition={item} 
                  onPress={() => handleAuditionPress(item.id)} 
                />
              )}
            />
          </View>
        )}

        {/* Recommended Auditions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          
          {auditions.length === 0 && !isError ? (
            <Text style={styles.emptyText}>No auditions available right now.</Text>
          ) : (
            <FlatList
              data={auditions}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <AuditionCard 
                  audition={item} 
                  onPress={() => handleAuditionPress(item.id)} 
                />
              )}
            />
          )}
        </View>
        
        {/* Bottom padding for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.l,
  },
  greeting: {
    ...typography.h1,
    color: colors.textMainLight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMutedLight,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.m,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textMainLight,
  },
  seeAll: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    paddingHorizontal: spacing.xl,
    ...typography.body,
    color: colors.textMutedLight,
  },
  profileBanner: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  profileBannerContent: {
    padding: spacing.l,
  },
  profileBannerTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    marginBottom: spacing.xs,
  },
  profileBannerText: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginBottom: spacing.m,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  completeNowText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginTop: spacing.m,
    alignSelf: 'flex-end',
  },
  loadingSafeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: spacing.xl,
  },
  errorText: {
    color: colors.danger,
    ...typography.body,
  },
  retryText: {
    color: colors.primary,
    marginTop: spacing.s,
    ...typography.body,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
