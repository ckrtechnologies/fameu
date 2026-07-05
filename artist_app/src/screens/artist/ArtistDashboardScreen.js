import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors, typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import AuditionCard from '../../components/artist/AuditionCard';
import { useGetFeedQuery, useGetMyApplicationsQuery, useGetSavedAuditionsQuery } from '../../services/discoverApi';
import { useGetProfileQuery } from '../../services/profileApi';
import { LineChart } from 'react-native-chart-kit';
import { Search, MessageCircle, Briefcase, Users, Bell, Bookmark, TrendingUp, Compass, Star, ChevronRight, Video, Calendar, ShieldCheck } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "just now";
};

export default function ArtistDashboardScreen() {
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  
  const { data: profileResponse, refetch: refetchProfile } = useGetProfileQuery();
  const profile = profileResponse?.data;
  
  const categories = profile?.categories || [];
  const primaryCategory = categories.length > 0 ? categories[0] : null;
  
  const feedParams = primaryCategory ? { category: primaryCategory } : {};
  const { data: feedData, isLoading, isError, refetch: refetchFeed } = useGetFeedQuery(feedParams);
  const { data: allFeedData, refetch: refetchAll } = useGetFeedQuery({});
  const { data: liveData, refetch: refetchLive } = useGetFeedQuery({ is_live: true });
  const { data: trendingData, refetch: refetchTrending } = useGetFeedQuery({ sort: 'popular' }); // Assuming this is supported
  const { data: myAppsData, refetch: refetchApps } = useGetMyApplicationsQuery();
  const { data: savedData, refetch: refetchSaved } = useGetSavedAuditionsQuery();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchFeed(), refetchAll(), refetchLive(), refetchTrending(),
        refetchProfile(), refetchApps(), refetchSaved()
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchFeed, refetchAll, refetchLive, refetchTrending, refetchProfile, refetchApps, refetchSaved]);

  const handleAuditionPress = (id) => {
    navigation.navigate('AuditionDetail', { id });
  };

  const name = profile?.full_name || user?.display_name || user?.full_name || user?.email?.split('@')[0] || 'Artist';

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingSafeArea} edges={['left', 'right']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const recommendedAuditions = Array.isArray(feedData?.data) ? feedData.data : [];
  const allAuditions = Array.isArray(allFeedData?.data) ? allFeedData.data : [];
  const displayAuditions = recommendedAuditions.length > 0 ? recommendedAuditions : allAuditions;
  const liveAuditions = Array.isArray(liveData?.data) ? liveData.data : [];
  const trendingAuditions = Array.isArray(trendingData?.data) ? trendingData.data : allAuditions.slice(0, 5); // Fallback
  const myApplications = Array.isArray(myAppsData?.data) ? myAppsData.data : [];
  const savedAuditions = Array.isArray(savedData?.data) ? savedData.data : [];
  
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

  // 1. Welcome Header
  const renderWelcomeHeader = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.headerContainer}>
      <View style={styles.headerTextContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginRight: 12 }}>
            {profile?.avatar_url || user?.avatar_url ? (
              <Image source={{ uri: profile?.avatar_url || user?.avatar_url }} style={{ width: 40, height: 40, borderRadius: 20 }} />
            ) : (
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="body" style={{ color: 'white', fontWeight: 'bold' }}>{name.charAt(0).toUpperCase()}</Typography>
              </View>
            )}
          </TouchableOpacity>
          <View>
            <Typography variant="caption" style={styles.greetingText}>Good Morning,</Typography>
            <Typography variant="h2" style={styles.nameText} numberOfLines={1}>{name} <ShieldCheck size={20} color={colors.primary} /></Typography>
          </View>
        </View>
      </View>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ArtistDiscovery')}>
          <Search size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
          <Bell size={24} color={colors.textMainLight} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // 2. Profile Setup Banner
  const renderProfileBanner = () => {
    if (profileCompletePct >= 100) return null;
    return (
      <TouchableOpacity style={styles.profileBanner} activeOpacity={0.8} onPress={() => navigation.navigate('EditProfile')}>
        <View style={styles.profileBannerContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body" style={styles.profileBannerTitle}>Profile Setup</Typography>
            <Typography variant="caption" style={{ color: colors.primary, fontWeight: 'bold' }}>{profileCompletePct}%</Typography>
          </View>
          <Typography variant="body" style={styles.profileBannerText}>Finish setting up to get 2x more matches!</Typography>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${profileCompletePct}%` }]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 3. Overview Stats
  const renderOverviewStats = () => {
    const totalApps = myApplications.length;
    const shortlistedStatuses = ['shortlisted', 'interview_scheduled', 'hired'];
    const shortlisted = myApplications.filter(a => shortlistedStatuses.includes(a.status?.toLowerCase())).length;
    const visits = profile?.visit_count || 0;

    return (
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('ProfileVisitors')}>
          <Typography variant="h3" style={styles.statNumber}>{visits}</Typography>
          <Typography variant="caption" style={styles.statLabel}>Profile Views</Typography>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Applications', { initialTab: 'Pending' })}>
          <Typography variant="h3" style={styles.statNumber}>{totalApps}</Typography>
          <Typography variant="caption" style={styles.statLabel}>Applications</Typography>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Applications', { initialTab: 'Accepted' })}>
          <Typography variant="h3" style={[styles.statNumber, { color: colors.success }]}>{shortlisted}</Typography>
          <Typography variant="caption" style={styles.statLabel}>Shortlisted</Typography>
        </TouchableOpacity>
      </View>
    );
  };

  // 4. Quick Actions
  const renderQuickActions = () => (
    <Animated.View entering={FadeInRight.delay(200).duration(400)} style={styles.quickActionsContainer}>
      <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Auditions')}>
        <View style={[styles.actionBtnIcon, { backgroundColor: colors.primary }]}>
          <Compass size={28} color="#fff" />
        </View>
        <Typography variant="body" style={styles.actionBtnText}>Discover</Typography>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Inbox')}>
        <View style={[styles.actionBtnIcon, { backgroundColor: '#f59e0b' }]}>
          <MessageCircle size={28} color="#fff" />
        </View>
        <Typography variant="body" style={styles.actionBtnText}>Messages</Typography>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Profile')}>
        <View style={[styles.actionBtnIcon, { backgroundColor: '#8b5cf6' }]}>
          <Briefcase size={28} color="#fff" />
        </View>
        <Typography variant="body" style={styles.actionBtnText}>Portfolio</Typography>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ArtistDiscovery')}>
        <View style={[styles.actionBtnIcon, { backgroundColor: colors.success }]}>
          <Users size={28} color="#fff" />
        </View>
        <Typography variant="body" style={styles.actionBtnText}>Network</Typography>
      </TouchableOpacity>
    </Animated.View>
  );

  // 5. Recent Applications
  const renderRecentApplications = () => {
    if (myApplications.length === 0) return null;
    const recent = myApplications.slice(0, 2);
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>Recent Applications</Typography>
          <TouchableOpacity onPress={() => navigation.navigate('MyApplications')}>
            <Typography variant="body" style={styles.seeAllText}>See All</Typography>
          </TouchableOpacity>
        </View>
        {recent.map((app) => (
          <TouchableOpacity key={app.id} style={styles.applicationCard} onPress={() => navigation.navigate('ApplicationDetail', { application: app })}>
            <View style={styles.appIconBg}>
              <Briefcase size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="body" style={styles.appTitle} numberOfLines={1}>{app.auditions?.title}</Typography>
              <Typography variant="caption" style={styles.appDate}>Applied {timeAgo(app.created_at)}</Typography>
            </View>
            <View style={[styles.statusBadge, 
              app.status === 'shortlisted' ? { backgroundColor: colors.success + '20' } : 
              app.status === 'rejected' ? { backgroundColor: colors.error + '20' } : 
              { backgroundColor: colors.warning + '20' }
            ]}>
              <Typography variant="caption" style={[styles.statusText,
                app.status === 'shortlisted' ? { color: colors.success } : 
                app.status === 'rejected' ? { color: colors.error } : 
                { color: colors.warning }
              ]}>{app.status || 'Pending'}</Typography>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 6. Live Auditions
  const renderLiveAuditions = () => {
    if (liveAuditions.length === 0) return null;
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>🔴 Live Auditions</Typography>
          <TouchableOpacity onPress={() => navigation.navigate('AuditionDiscovery', { initialCategory: 'Live Now' })}>
            <Typography variant="body" style={styles.seeAllText}>See All</Typography>
          </TouchableOpacity>
        </View>
        <FlatList
          data={liveAuditions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <AuditionCard audition={item} onPress={() => handleAuditionPress(item.id)} />}
        />
      </View>
    );
  };

  // 7. Recommended Auditions
  const renderRecommendedAuditions = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>Recommended for You</Typography>
          <TouchableOpacity onPress={() => navigation.navigate('AuditionDiscovery')}>
            <Typography variant="body" style={styles.seeAllText}>Explore</Typography>
          </TouchableOpacity>
        </View>
        {displayAuditions.length === 0 ? (
          <View style={styles.emptyState}><Typography variant="body" style={styles.emptyStateText}>No recommendations yet.</Typography></View>
        ) : (
          <FlatList
            data={displayAuditions.slice(0, 5)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <AuditionCard audition={item} onPress={() => handleAuditionPress(item.id)} />}
          />
        )}
      </View>
    );
  };

  // 8. Trending Auditions
  const renderTrendingAuditions = () => {
    if (trendingAuditions.length === 0) return null;
    return (
      <View style={[styles.sectionContainer, { backgroundColor: colors.surfaceLight, paddingVertical: spacing.l, marginHorizontal: -spacing.xl, paddingHorizontal: spacing.xl }]}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>🔥 Trending Now</Typography>
        </View>
        <FlatList
          data={trendingAuditions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => 'trend_' + item.id}
          contentContainerStyle={{ paddingRight: spacing.m }}
          renderItem={({ item }) => <AuditionCard audition={item} onPress={() => handleAuditionPress(item.id)} compact />}
        />
      </View>
    );
  };

  // 9. Saved Auditions
  const renderSavedAuditions = () => {
    if (savedAuditions.length === 0) return null;
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>Saved Auditions</Typography>
          <TouchableOpacity onPress={() => navigation.navigate('SavedAuditions')}>
            <Typography variant="body" style={styles.seeAllText}>See All</Typography>
          </TouchableOpacity>
        </View>
        <FlatList
          data={savedAuditions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.savedCard} onPress={() => handleAuditionPress(item.auditions?.id)}>
               <View style={styles.savedIconBg}>
                  {item.auditions?.thumbnail_url ? (
                    <Image source={{ uri: item.auditions.thumbnail_url }} style={{ width: 60, height: 60, borderRadius: 12 }} />
                  ) : (
                    <Bookmark size={24} color={colors.primary} />
                  )}
               </View>
               <Typography variant="body" style={styles.savedTitle} numberOfLines={2}>{item.auditions?.title}</Typography>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  // 10. Upcoming Schedule
  const renderUpcomingSchedule = () => {
    // Upcoming based on shortlisted apps
    const upcoming = myApplications.filter(a => a.status === 'shortlisted' || a.status === 'hired');
    if (upcoming.length === 0) return null;

    return (
      <View style={styles.sectionContainer}>
        <Typography variant="h3" style={styles.sectionTitle}>Upcoming Schedule</Typography>
        {upcoming.map((app, idx) => {
          let dateStr = app.auditions?.date || app.auditions?.created_at;
          let month = '';
          let day = '';
          if (dateStr) {
            const d = new Date(dateStr);
            month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
            day = d.getDate().toString().padStart(2, '0');
          }
          
          let location = 'TBA';
          try {
            if (app.auditions?.instructions) {
              const inst = JSON.parse(app.auditions.instructions);
              if (inst.city) location = inst.city;
            }
          } catch(e) {}

          return (
          <View key={app.id || idx} style={styles.scheduleCard}>
             <View style={styles.dateBlock}>
                <Typography variant="caption" style={styles.dateMonth}>{month}</Typography>
                <Typography variant="h3" style={styles.dateDay}>{day}</Typography>
             </View>
             <View style={styles.scheduleInfo}>
                <Typography variant="body" style={styles.scheduleTitle}>{app.auditions?.title}</Typography>
                <Typography variant="caption" style={styles.scheduleSub}>{location}</Typography>
             </View>
             <ChevronRight size={20} color={colors.textSecondaryLight} />
          </View>
          );
        })}
      </View>
    );
  };

  // 11. Activity Chart
  const renderActivityChart = () => {
    // Generate sparkline data based on application history
    let dataPoints = [0, 0, 0, 0, 0, 0, 0];
    let labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    if (myApplications && myApplications.length > 0) {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { 
          dateStr: d.toISOString().split('T')[0], 
          dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), 
          count: 0 
        };
      });

      myApplications.forEach(a => {
        if (a.created_at) {
          const dateStr = a.created_at.split('T')[0];
          const dayData = last7Days.find(d => d.dateStr === dateStr);
          if (dayData) dayData.count++;
        }
      });

      let runningTotal = myApplications.filter(a => a.created_at && a.created_at.split('T')[0] < last7Days[0].dateStr).length;
      dataPoints = last7Days.map(d => { runningTotal += d.count; return runningTotal; });
      labels = last7Days.map(d => d.dayName);
    }
    
    // Ensure we don't crash if all points are 0
    if (Math.max(...dataPoints) === 0) dataPoints = [0,0,0,0,0,0,0];

    return (
      <View style={styles.sectionContainer}>
        <Typography variant="h3" style={styles.sectionTitle}>Application Growth</Typography>
        <LineChart
          data={{ labels, datasets: [{ data: dataPoints }] }}
          width={width - spacing.xl * 2}
          height={180}
          withInnerLines={false}
          withOuterLines={false}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(${parseInt(colors.primary.slice(1,3),16)}, ${parseInt(colors.primary.slice(3,5),16)}, ${parseInt(colors.primary.slice(5,7),16)}, ${opacity})`,
            labelColor: (opacity = 1) => colors.textMutedLight,
            style: { borderRadius: 16 },
            propsForDots: { r: "4", strokeWidth: "2", stroke: colors.primary }
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16, marginLeft: -16 }}
        />
      </View>
    );
  };



  // 14. Pro Tips
  const renderProTips = () => (
    <View style={styles.proTipCard}>
      <View style={styles.proTipHeader}>
        <Star size={20} color="#f59e0b" fill="#f59e0b" />
        <Typography variant="h4" style={styles.proTipTitle}>Pro Tip</Typography>
      </View>
      <Typography variant="body" style={styles.proTipText}>Adding a high-quality showreel increases your chances of being shortlisted by up to 50%!</Typography>
      <TouchableOpacity style={styles.proTipBtn} onPress={() => navigation.navigate('VideoPortfolio')}>
        <Typography variant="caption" style={styles.proTipBtnText}>Add Showreel</Typography>
      </TouchableOpacity>
    </View>
  );

  // 15. Recent Profile Visitors Removed
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        {renderWelcomeHeader()}
        {renderProfileBanner()}
        {renderOverviewStats()}
        {renderQuickActions()}
        {renderRecentApplications()}
        {renderLiveAuditions()}
        {renderRecommendedAuditions()}
        {renderTrendingAuditions()}
        {renderSavedAuditions()}
        {renderUpcomingSchedule()}
        {renderActivityChart()}

        {renderProTips()}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundLight },
  container: { flex: 1 },
  loadingSafeArea: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundLight },
  
  // 1. Header
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.m, paddingBottom: spacing.m },
  headerTextContainer: { flex: 1 },
  greetingText: { color: colors.textSecondaryLight, marginBottom: 2 },
  nameText: { color: colors.textMainLight, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  notificationBadge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error, borderWidth: 1, borderColor: '#fff' },

  // 2. Banner
  profileBanner: { backgroundColor: colors.primary + '15', marginHorizontal: spacing.xl, borderRadius: 16, padding: spacing.l, marginBottom: spacing.l, borderWidth: 1, borderColor: colors.primary + '30' },
  profileBannerTitle: { fontWeight: 'bold', color: colors.primary, marginBottom: spacing.xs },
  profileBannerText: { color: colors.textSecondaryLight, marginBottom: spacing.m, fontSize: 13 },
  progressBarBg: { height: 6, backgroundColor: colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.primary },

  // 3. Stats
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  statCard: { flex: 1, backgroundColor: colors.surfaceLight, paddingVertical: spacing.m, paddingHorizontal: spacing.s, borderRadius: 12, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: colors.borderLight },
  statNumber: { fontWeight: 'bold', color: colors.textMainLight },
  statLabel: { color: colors.textSecondaryLight, fontSize: 11, marginTop: 4 },

  // 4. Quick Actions
  quickActionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: spacing.xl, marginBottom: spacing.l },
  actionBtn: { width: '23%', alignItems: 'center', marginBottom: spacing.m },
  actionBtnIcon: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.s, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  actionBtnText: { fontSize: 12, color: colors.textMainLight, textAlign: 'center', fontWeight: '500' },

  // Shared Sections
  sectionContainer: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m },
  sectionTitle: { fontWeight: 'bold', color: colors.textMainLight },
  seeAllText: { color: colors.primary, fontWeight: '600' },
  listContent: { paddingRight: spacing.m },
  emptyState: { padding: spacing.l, backgroundColor: colors.surfaceLight, borderRadius: 12, alignItems: 'center' },
  emptyStateText: { color: colors.textMutedLight },

  // 5. Applications
  applicationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.borderLight },
  appIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  appTitle: { fontWeight: '600', color: colors.textMainLight, marginBottom: 4 },
  appDate: { color: colors.textSecondaryLight },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontWeight: 'bold', fontSize: 11 },

  // 9. Saved Auditions
  savedCard: { width: 100, marginRight: 16, alignItems: 'center' },
  savedIconBg: { width: 60, height: 60, borderRadius: 12, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: colors.borderLight },
  savedTitle: { fontSize: 12, textAlign: 'center', color: colors.textMainLight },

  // 10. Schedule
  scheduleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 12, marginBottom: 12 },
  dateBlock: { width: 50, height: 50, backgroundColor: colors.primary + '15', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  dateMonth: { fontSize: 10, color: colors.primary, fontWeight: 'bold' },
  dateDay: { fontSize: 18, color: colors.primary, fontWeight: 'bold' },
  scheduleInfo: { flex: 1 },
  scheduleTitle: { fontWeight: 'bold', color: colors.textMainLight, marginBottom: 4 },
  scheduleSub: { color: colors.textSecondaryLight },

  // 12. Recruiters
  recruiterCard: { width: 130, backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 16, alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: colors.borderLight },
  recruiterAvatarBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#8b5cf6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  recruiterName: { fontWeight: 'bold', color: colors.textMainLight, marginBottom: 4, textAlign: 'center' },
  recruiterRole: { color: colors.textSecondaryLight, fontSize: 11, marginBottom: 12, textAlign: 'center' },
  followBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.primary + '15' },
  followBtnText: { color: colors.primary, fontWeight: 'bold' },

  // 14. Pro Tips
  proTipCard: { marginHorizontal: spacing.xl, padding: spacing.l, backgroundColor: '#fffbe4', borderRadius: 16, marginBottom: spacing.xl, borderWidth: 1, borderColor: '#fde047' },
  proTipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  proTipTitle: { fontWeight: 'bold', color: '#b45309', marginLeft: 8 },
  proTipText: { color: '#92400e', marginBottom: 16, lineHeight: 20 },
  proTipBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f59e0b', borderRadius: 8 },
  proTipBtnText: { color: '#fff', fontWeight: 'bold' },

  // 15. Visitors
  visitorsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  visitorAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#cbd5e1', borderWidth: 2, borderColor: '#fff' },
  visitorCountBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: -15, borderWidth: 2, borderColor: '#fff' },

  bottomSpacer: { height: 100 }
});
