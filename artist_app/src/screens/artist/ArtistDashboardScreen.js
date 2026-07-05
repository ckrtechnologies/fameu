import React from 'react';
import { View, StyleSheet, ScrollView, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors, typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import AuditionCard from '../../components/artist/AuditionCard';
import { useGetFeedQuery } from '../../services/discoverApi';
import { useGetProfileQuery } from '../../services/profileApi';

export default function ArtistDashboardScreen() {
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  
  const { data: profileResponse, refetch: refetchProfile } = useGetProfileQuery();
  const profile = profileResponse?.data;
  
  // Extract categories for feed filtering.
  // We use the first category as the primary filter for now, or fall back to a reasonable default if none exists.
  const categories = profile?.categories || [];
  const primaryCategory = categories.length > 0 ? categories[0] : null;
  
  // Build query params for feed
  const feedParams = primaryCategory ? { category: primaryCategory } : {};
  const { data: feedData, isLoading, isError, refetch: refetchFeed } = useGetFeedQuery(feedParams);
  const { data: allFeedData, isLoading: isLoadingAll, refetch: refetchAll } = useGetFeedQuery({});
  const { data: liveData, isLoading: isLoadingLive, isError: isErrorLive, refetch: refetchLive } = useGetFeedQuery({ ...feedParams, is_live: true });

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchFeed(),
        refetchAll(),
        refetchLive(),
        refetchProfile()
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchFeed, refetchAll, refetchLive, refetchProfile]);

  const handleAuditionPress = (id) => {
    navigation.navigate('AuditionDetail', { id });
  };

  const name = profile?.full_name || user?.display_name || user?.full_name || user?.email?.split('@')[0] || 'Artist';

  if (isLoading || isLoadingLive || isLoadingAll) {
    return (
      <SafeAreaView style={styles.loadingSafeArea} edges={['left', 'right']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const recommendedAuditions = Array.isArray(feedData?.data) ? feedData.data : (Array.isArray(feedData) ? feedData : []);
  const allAuditions = Array.isArray(allFeedData?.data) ? allFeedData.data : (Array.isArray(allFeedData) ? allFeedData : []);
  
  // If no recommended auditions for their specific category, fall back to showing all available auditions
  const displayAuditions = recommendedAuditions.length > 0 ? recommendedAuditions : allAuditions;
  const recommendedTitle = recommendedAuditions.length > 0 ? "Recommended for You" : "Explore Auditions";
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
    if (p.avatar_url || (p.photo_urls && p.photo_urls.length > 0)) score += 20;
    if (p.languages && p.languages.length > 0) score += 5;
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
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >

        {/* Profile Status Banner */}
        {profileCompletePct < 100 && (
          <TouchableOpacity 
            style={styles.profileBanner} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.profileBannerContent}>
              <Typography variant="body" style={styles.profileBannerTitle}>Profile Setup</Typography>
              <Typography variant="body" style={styles.profileBannerText}>Your profile is {profileCompletePct}% complete. Finish setting it up to get more matches!</Typography>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${profileCompletePct}%` }]} />
              </View>
              <Typography variant="body" style={styles.completeNowText}>Complete Now &gt;</Typography>
            </View>
          </TouchableOpacity>
        )}

        {(isError || isErrorLive) && (
          <View style={styles.errorContainer}>
            <Typography variant="body" style={styles.errorText}>Failed to load some auditions.</Typography>
            <Typography variant="body" onPress={handleRefresh} style={styles.retryText}>Retry</Typography>
          </View>
        )}

        {/* Live Auditions Section */}
        {liveAuditions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography variant="body" style={styles.sectionTitle}>🔴 Live Auditions</Typography>
              <Typography variant="body" style={styles.seeAll}>See All</Typography>
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
            <Typography variant="body" style={styles.sectionTitle}>{recommendedTitle}</Typography>
            <Typography variant="body" style={styles.seeAll}>See All</Typography>
          </View>
          
          {displayAuditions.length === 0 && !isError ? (
            <Typography variant="body" style={styles.emptyText}>No auditions available right now.</Typography>
          ) : (
            <FlatList
              data={displayAuditions}
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
    ...typography.h2,
    color: colors.textMainLight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
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
    backgroundColor: 'rgba(0, 51, 255, 0.03)',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
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
