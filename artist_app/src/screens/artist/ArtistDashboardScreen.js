import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image, Dimensions, Modal, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import AuditionCard from '../../components/artist/AuditionCard';
import AuditionPeekModal from '../../components/artist/AuditionPeekModal';
import { useGetFeedQuery, useGetMyApplicationsQuery, useGetSavedAuditionsQuery } from '../../services/discoverApi';
import { useGetProfileQuery } from '../../services/profileApi';
import { useRefetchOnFocus } from '../../hooks/useRefetchOnFocus';
import { useAcceptDisclaimerMutation } from '../../services/authApi';
import { logout } from '../../store/slices/authSlice';
import { LineChart } from 'react-native-chart-kit';
import { Search, MessageCircle, Briefcase, Users, Bell, Bookmark, TrendingUp, Compass, Star, ChevronRight, Video, Calendar, ShieldCheck } from 'lucide-react-native';

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
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);
  const insets = useSafeAreaInsets();
  
  const [acceptDisclaimer, { isLoading: isAccepting }] = useAcceptDisclaimerMutation();
  const { data: profileResponse, refetch: refetchProfile } = useGetProfileQuery();
  useRefetchOnFocus(refetchProfile);
  const profile = profileResponse?.data;
  
  const categories = profile?.categories || [];
  const categoryString = categories.length > 0 ? categories.join(',') : null;
  
  const feedParams = categoryString ? { category: categoryString } : {};
  const { data: feedData, isLoading, isError, refetch: refetchFeed, error } = useGetFeedQuery(feedParams, { refetchOnMountOrArgChange: true });
  
  const { data: allFeedData, refetch: refetchAll } = useGetFeedQuery({}, { refetchOnMountOrArgChange: true });
  const { data: liveData, refetch: refetchLive } = useGetFeedQuery({ filter: 'live', ...feedParams }, { refetchOnMountOrArgChange: true });
  const { data: trendingData, refetch: refetchTrending } = useGetFeedQuery({ filter: 'trending', ...feedParams }, { refetchOnMountOrArgChange: true });

  useRefetchOnFocus(refetchFeed);
  useRefetchOnFocus(refetchAll);
  useRefetchOnFocus(refetchLive);
  useRefetchOnFocus(refetchTrending);
  const { data: myAppsData, refetch: refetchApps } = useGetMyApplicationsQuery();
  const { data: savedData, refetch: refetchSaved } = useGetSavedAuditionsQuery();

  useRefetchOnFocus(refetchApps);
  useRefetchOnFocus(refetchSaved);

  const [refreshing, setRefreshing] = useState(false);
  
  // Peek Modal State
  const [peekVisible, setPeekVisible] = useState(false);
  const [peekAuditions, setPeekAuditions] = useState([]);
  const [peekIndex, setPeekIndex] = useState(0);

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

  const handleViewAuditionDetails = useCallback((auditionOrId) => {
    const id = typeof auditionOrId === 'object' && auditionOrId !== null ? auditionOrId.id : auditionOrId;
    navigation.navigate('AuditionDetail', { id });
  }, [navigation]);

  const handleAuditionPress = useCallback((item, list = []) => {
    if (list && list.length > 0) {
      const index = list.findIndex(a => a.id === item.id);
      setPeekAuditions(list);
      setPeekIndex(index !== -1 ? index : 0);
      setPeekVisible(true);
    } else {
      handleViewAuditionDetails(item);
    }
  }, [handleViewAuditionDetails]);

  const name = profile?.full_name || user?.display_name || user?.full_name || user?.email?.split('@')[0] || 'Artist';

  if (isLoading) {
    return (
      <View style={[styles.loadingSafeArea, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const recommendedAuditions = Array.isArray(feedData?.data) ? feedData.data : [];
  const allAuditions = Array.isArray(allFeedData?.data) ? allFeedData.data : [];
  
  const displayAuditions = (categoryString && recommendedAuditions.length === 0) ? [] : (recommendedAuditions.length > 0 ? recommendedAuditions : allAuditions);
  const liveAuditions = Array.isArray(liveData?.data) ? liveData.data : [];
  
  const trendingAuditions = Array.isArray(trendingData?.data) ? trendingData.data : [];
  const myApplications = Array.isArray(myAppsData?.data) ? myAppsData.data : [];
  const savedAuditions = Array.isArray(savedData?.data) ? savedData.data : [];
  
  const calculateProfileCompletion = (p) => {
    if (!p) return 0;
    let score = 0;
    if (p.full_name) score += 15;
    if (p.age) score += 5;
    if (p.gender) score += 5;
    if (p.city || (p.preferred_cities && p.preferred_cities.length > 0)) score += 10;
    if (p.bio) score += 15;
    if (p.categories && p.categories.length > 0) score += 20;
    if (p.avatar_url || (p.photo_urls && p.photo_urls.length > 0)) score += 20;
    if (p.languages && p.languages.length > 0) score += 5;
    if (p.height || p.weight) score += 5;
    return Math.min(100, score);
  };
  const profileCompletePct = Math.max(profile?.profile_complete_pct || 0, calculateProfileCompletion(profile));

  const renderWelcomeHeader = () => (
    <View style={styles.headerContainer}>
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
    </View>
  );

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

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
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
    </View>
  );

  const renderRecentApplications = () => {
    if (myApplications.length === 0) return null;
    const recent = myApplications.slice(0, 2);
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>Recent Applications</Typography>
          <TouchableOpacity onPress={() => navigation.navigate('Applications')}>
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

  const renderLiveAuditions = () => {
    if (liveAuditions.length === 0) return null;
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>🔴 Live Auditions</Typography>
          <TouchableOpacity onPress={() => navigation.navigate('Auditions', { initialCategory: 'Live (Today)' })}>
            <Typography variant="body" style={styles.seeAllText}>See All</Typography>
          </TouchableOpacity>
        </View>
        <FlatList
          data={liveAuditions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <AuditionCard audition={item} onPress={() => handleAuditionPress(item, liveAuditions)} />}
        />
      </View>
    );
  };

  const renderRecommendedAuditions = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>Recommended for You</Typography>
          <TouchableOpacity onPress={() => navigation.navigate('Auditions', { initialCategory: 'Relevant' })}>
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
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={5}
            removeClippedSubviews={true}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <AuditionCard audition={item} onPress={() => handleAuditionPress(item, displayAuditions)} />}
          />
        )}
      </View>
    );
  };

  const renderTrendingAuditions = () => {
    if (trendingAuditions.length === 0) return null;
    return (
      <View style={[styles.sectionContainer, { backgroundColor: colors.surfaceLight, paddingVertical: spacing.l, marginHorizontal: -spacing.xl }]}>
        <View style={[styles.sectionHeader, { paddingHorizontal: spacing.xl }]}>
          <Typography variant="h3" style={styles.sectionTitle}>🔥 Trending Now</Typography>
          <TouchableOpacity onPress={() => navigation.navigate('Auditions', { initialCategory: 'Trending' })}>
            <Typography variant="body" style={styles.seeAllText}>See All</Typography>
          </TouchableOpacity>
        </View>
        <FlatList
          data={trendingAuditions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => 'trend_' + item.id}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews={true}
          contentContainerStyle={{ paddingLeft: spacing.xl, paddingRight: spacing.m }}
          renderItem={({ item }) => <AuditionCard audition={item} onPress={() => handleAuditionPress(item, trendingAuditions)} compact />}
        />
      </View>
    );
  };

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
            <TouchableOpacity style={styles.savedCard} onPress={() => handleAuditionPress(item, savedAuditions)}>
               <View style={styles.savedIconBg}>
                  <Image source={{ uri: item.thumbnail_url || item.hiring_profiles?.logo_url || 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=800&auto=format&fit=crop' }} style={{ width: 60, height: 60, borderRadius: 12 }} />
               </View>
               <Typography variant="body" style={styles.savedTitle} numberOfLines={2}>{item.title}</Typography>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderUpcomingSchedule = () => {
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
             <ChevronRight size={20} color={colors.textMutedLight} />
          </View>
          );
        })}
      </View>
    );
  };

  const renderActivityChart = () => {
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
    
    if (Math.max(...dataPoints) === 0) dataPoints = [0,0,0,0,0,0,0];

    const datasets = [{ data: dataPoints }];
    if (Math.max(...dataPoints) === 0) {
      datasets.push({ data: [5], color: () => 'transparent', strokeWidth: 0, withDots: false });
    }

    return (
      <View style={styles.sectionContainer}>
        <Typography variant="h3" style={styles.sectionTitle}>Application Growth</Typography>
        <LineChart
          data={{ labels, datasets }}
          width={width - spacing.xl * 2}
          height={180}
          withInnerLines={false}
          withOuterLines={false}
          yAxisLabel=""
          fromZero={true}
          formatYLabel={(y) => Number(y) % 1 !== 0 ? '' : y}
          chartConfig={{
            backgroundColor: colors.surfaceLight,
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(${parseInt(colors.primary.slice(1,3),16)}, ${parseInt(colors.primary.slice(3,5),16)}, ${parseInt(colors.primary.slice(5,7),16)}, ${opacity})`,
            labelColor: (opacity = 1) => colors.textMutedLight,
            style: { borderRadius: 16 },
            propsForDots: { r: "4", strokeWidth: "2", stroke: colors.primary },
            propsForLabels: { dy: 15 }, // Push labels down to prevent overlap
            paddingRight: 32 // Add internal padding to balance the Y-axis labels on the left
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16, paddingBottom: 16 }}
        />
      </View>
    );
  };

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

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <Modal
        visible={user && !user.disclaimer_accepted}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.disclaimerOverlay}>
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerTitle}>Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              We request all users to check the credentials of the hiring / artists and verify the same independently before deciding to work with them.
            </Text>
            <Text style={styles.disclaimerText}>
              You should never transfer any money to anyone claiming to be representing FAMEU and demanding money for Artist card, Audition fee, Travel ETC.
            </Text>
            
            <View style={styles.disclaimerActions}>
              <TouchableOpacity 
                style={[styles.disclaimerBtn, styles.disclaimerBtnDeny]} 
                onPress={() => dispatch(logout())}
              >
                <Text style={styles.disclaimerBtnTextDeny}>Deny</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.disclaimerBtn, styles.disclaimerBtnAgree]} 
                onPress={async () => {
                  try {
                    await acceptDisclaimer().unwrap();
                    dispatch({ type: 'auth/setCredentials', payload: { user: { ...user, disclaimer_accepted: true }, token } });
                  } catch (e) {
                    console.error("Failed to accept disclaimer", e);
                  }
                }}
                disabled={isAccepting}
              >
                {isAccepting ? <ActivityIndicator color="#fff" /> : <Text style={styles.disclaimerBtnTextAgree}>I Agree</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

      {/* Peek Modal */}
      <AuditionPeekModal
        visible={peekVisible}
        auditions={peekAuditions}
        initialIndex={peekIndex}
        onClose={() => setPeekVisible(false)}
        onViewDetails={(item) => {
          setPeekVisible(false);
          handleViewAuditionDetails(item);
        }}
      />
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundLight },
  container: { flex: 1 },
  loadingSafeArea: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundLight },
  
  // 1. Header
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.m, paddingBottom: spacing.m },
  headerTextContainer: { flex: 1 },
  greetingText: { color: colors.textMutedLight, marginBottom: 2 },
  nameText: { color: colors.textMainLight, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  notificationBadge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error, borderWidth: 1, borderColor: '#fff' },

  // 2. Banner
  profileBanner: { backgroundColor: colors.primary + '15', marginHorizontal: spacing.xl, borderRadius: 16, padding: spacing.l, marginBottom: spacing.l, borderWidth: 1, borderColor: colors.primary + '30' },
  profileBannerTitle: { fontWeight: 'bold', color: colors.primary, marginBottom: spacing.xs },
  profileBannerText: { color: colors.textMutedLight, marginBottom: spacing.m, fontSize: 13 },
  progressBarBg: { height: 6, backgroundColor: colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.primary },

  // 3. Stats
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  statCard: { flex: 1, backgroundColor: colors.surfaceLight, paddingVertical: spacing.m, paddingHorizontal: spacing.s, borderRadius: 12, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: colors.borderLight },
  statNumber: { fontWeight: 'bold', color: colors.textMainLight },
  statLabel: { color: colors.textMutedLight, fontSize: 11, marginTop: 4 },

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
  appDate: { color: colors.textMutedLight },
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
  scheduleSub: { color: colors.textMutedLight },

  // 12. Recruiters
  recruiterCard: { width: 130, backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 16, alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: colors.borderLight },
  recruiterAvatarBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#8b5cf6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  recruiterName: { fontWeight: 'bold', color: colors.textMainLight, marginBottom: 4, textAlign: 'center' },
  recruiterRole: { color: colors.textMutedLight, fontSize: 11, marginBottom: 12, textAlign: 'center' },
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
  visitorCountBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: -15, borderWidth: 2, borderColor: '#fff' },

  bottomSpacer: { height: 100 },

  // Disclaimer Modal
  disclaimerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  disclaimerContainer: { backgroundColor: colors.surfaceLight, borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 },
  disclaimerTitle: { ...typography.h2, color: colors.textMainLight, marginBottom: 16, textAlign: 'center' },
  disclaimerText: { ...typography.body, color: colors.textMutedLight, marginBottom: 16, lineHeight: 22 },
  disclaimerActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  disclaimerBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  disclaimerBtnDeny: { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.borderLight, marginRight: 10 },
  disclaimerBtnAgree: { backgroundColor: colors.primary, marginLeft: 10 },
  disclaimerBtnTextDeny: { color: colors.textMainLight, fontWeight: 'bold' },
  disclaimerBtnTextAgree: { color: '#fff', fontWeight: 'bold' }
});
