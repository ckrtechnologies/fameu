import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions, Image, FlatList, StatusBar } from 'react-native';
import { ShieldCheck, Clock, AlertCircle, Video, Star, Users, PlusCircle, Bell, Search, MessageCircle, MapPin, ChevronRight, Briefcase, TrendingUp, Lock } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, globalStyles } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import { useGetDashboardDataQuery } from '../../services/hiringApi';
import AnimatedBorderCard from '../../components/AnimatedBorderCard';
import { getAuditionLiveStatus } from '../../utils/dateUtils';

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

export default function HiringDashboardScreen({ navigation }) {
  const { data: dashboardResponse, isLoading, isFetching, refetch } = useGetDashboardDataQuery();
  const data = dashboardResponse?.data;
  const insets = useSafeAreaInsets();

  if (isLoading && !data) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const { profile, stats, activeAuditions, draftAuditions, recentApplicants, recommendedTalent, upcomingInterviews, unreadMessagesCount, allApplicants } = data || {};
  const isVerified = profile?.is_verified;
  const verificationStatus = profile?.verification_status || 'unverified';

  // 1. KYC Banner
  const handleRestrictedNavigation = (screenName, params) => {
    if (!isVerified) {
      navigation.navigate('VerificationRequired');
    } else {
      navigation.navigate(screenName, params);
    }
  };

  const renderVerificationBanner = () => {
    if (isVerified) return null;
    let bannerProps = { bg: colors.primary + '15', border: colors.primary, icon: 'shield-checkmark-outline', color: colors.primary, title: 'Get Verified', desc: 'Verify your company to start posting auditions.', btn: 'Complete KYC' };
    if (verificationStatus === 'pending') {
      bannerProps = { bg: colors.warning + '15', border: colors.warning, icon: 'time-outline', color: colors.warning, title: 'KYC Pending Review', desc: 'Your documents are being reviewed (24-48 hrs).', btn: null };
    } else if (verificationStatus === 'rejected') {
      bannerProps = { bg: colors.error + '15', border: colors.error, icon: 'alert-circle-outline', color: colors.error, title: 'KYC Rejected', desc: 'Documents rejected. Please re-submit.', btn: 'Re-Submit KYC' };
    }
    return (
      <Animated.View entering={FadeInDown.duration(400)} style={[styles.banner, { backgroundColor: bannerProps.bg, borderColor: bannerProps.border }]}>
        {bannerProps.icon === "shield-checkmark-outline" && <ShieldCheck size={26} color={bannerProps.color} style={styles.bannerIcon} />}
        {bannerProps.icon === "time-outline" && <Clock size={26} color={bannerProps.color} style={styles.bannerIcon} />}
        {bannerProps.icon === "alert-circle-outline" && <AlertCircle size={26} color={bannerProps.color} style={styles.bannerIcon} />}
        <View style={styles.bannerTextContainer}>
          <Typography variant="body" style={[styles.bannerTitle, { color: bannerProps.color }]}>{bannerProps.title}</Typography>
          <Typography variant="caption" style={styles.bannerDesc}>{bannerProps.desc}</Typography>
          {bannerProps.btn && (
            <TouchableOpacity style={[styles.bannerButton, { backgroundColor: bannerProps.color }]} onPress={() => navigation.navigate('CompanyKyc')}>
              <Typography variant="caption" style={styles.bannerButtonText}>{bannerProps.btn}</Typography>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  // 2. Profile Completeness Progress
  const renderProfileCompleteness = () => {
    let score = 0;
    if (profile?.company_name) score += 25;
    if (profile?.company_type) score += 25;
    if (profile?.description) score += 25;
    if (profile?.logo_url) score += 25;

    if (score === 100) return null;
    return (
      <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.completenessCard}>
        <View style={styles.completenessHeader}>
          <Typography variant="h4" style={styles.completenessTitle}>Profile {score}% Complete</Typography>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Typography variant="caption" style={{ color: colors.primary, fontFamily: typography.fontFamily, fontWeight: 'bold' }}>Complete Now</Typography>
          </TouchableOpacity>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${score}%` }]} />
        </View>
      </Animated.View>
    );
  };

  // 3. Quick Metrics Grid
  const renderMetricsGrid = () => (
    <View style={styles.metricsGrid}>
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.metricCardWrapper}>
        <AnimatedBorderCard color={colors.primary} delay={0} onPress={() => navigation.navigate('MyAuditions', { initialStatus: 'All' })}>
          <View style={[styles.metricIconBg, { backgroundColor: colors.primary + '15' }]}>
            <Video size={24} color={colors.primary} />
          </View>
          <Typography variant="h2" style={styles.metricValue}>{activeAuditions?.length || 0}</Typography>
          <Typography variant="body" style={styles.metricLabel}>Active Auditions</Typography>
        </AnimatedBorderCard>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.metricCardWrapper}>
        <AnimatedBorderCard color={colors.warning} delay={200} onPress={() => handleRestrictedNavigation('Applicants', { initialTab: 'pending' })}>
          <View style={[styles.metricIconBg, { backgroundColor: colors.warning + '15' }]}>
            <Clock size={24} color={colors.warning} />
          </View>
          <Typography variant="h2" style={styles.metricValue}>{stats?.pending || 0}</Typography>
          <Typography variant="body" style={styles.metricLabel}>Pending Review</Typography>
        </AnimatedBorderCard>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.metricCardWrapper}>
        <AnimatedBorderCard color="#3b82f6" delay={400} onPress={() => handleRestrictedNavigation('Applicants', { initialTab: 'shortlisted' })}>
          <View style={[styles.metricIconBg, { backgroundColor: '#3b82f615' }]}>
            <Star size={24} color="#3b82f6" />
          </View>
          <Typography variant="h2" style={styles.metricValue}>{stats?.shortlisted || 0}</Typography>
          <Typography variant="body" style={styles.metricLabel}>Shortlisted</Typography>
        </AnimatedBorderCard>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.metricCardWrapper}>
        <AnimatedBorderCard color={colors.success} delay={600} onPress={() => handleRestrictedNavigation('Applicants', { initialTab: 'all' })}>
          <View style={[styles.metricIconBg, { backgroundColor: colors.success + '15' }]}>
            <Users size={24} color={colors.success} />
          </View>
          <Typography variant="h2" style={styles.metricValue}>{stats?.totalApplicants || 0}</Typography>
          <Typography variant="body" style={styles.metricLabel}>Total Applicants</Typography>
        </AnimatedBorderCard>
      </Animated.View>
    </View>
  );

  // 4. Quick Actions Row
  const renderQuickActions = () => (
    <Animated.View entering={FadeInRight.delay(200).duration(400)} style={styles.quickActionsContainer}>
      <TouchableOpacity style={styles.actionBtn} onPress={() => handleRestrictedNavigation('CreateAudition')}>
        <View style={[styles.actionBtnIcon, { backgroundColor: colors.primary }]}>
          <PlusCircle size={28} color="#fff" />
          {!isVerified && <View style={styles.lockBadge}><Lock size={12} color="#fff" /></View>}
        </View>
        <Typography variant="body" style={styles.actionBtnText}>Post Audition</Typography>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('FindTalent')}>
        <View style={[styles.actionBtnIcon, { backgroundColor: '#f59e0b' }]}>
          <Star size={28} color="#fff" />
        </View>
        <Typography variant="body" style={styles.actionBtnText}>Find Talent</Typography>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={() => handleRestrictedNavigation('Applicants')}>
        <View style={[styles.actionBtnIcon, { backgroundColor: '#8b5cf6' }]}>
          <Briefcase size={28} color="#fff" />
          {!isVerified && <View style={styles.lockBadge}><Lock size={12} color="#fff" /></View>}
        </View>
        <Typography variant="body" style={styles.actionBtnText}>Applications</Typography>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={() => handleRestrictedNavigation('Inbox')}>
        <View style={[styles.actionBtnIcon, { backgroundColor: colors.success }]}>
          <MessageCircle size={28} color="#fff" />
          {!isVerified && <View style={styles.lockBadge}><Lock size={12} color="#fff" /></View>}
        </View>
        <Typography variant="body" style={styles.actionBtnText}>Messaging</Typography>
      </TouchableOpacity>
    </Animated.View>
  );

  // 5. Recent Applicants
  const renderRecentApplicants = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>Recent Applicants</Typography>
          <TouchableOpacity onPress={() => handleRestrictedNavigation('Applicants')}>
            <Typography variant="body" style={styles.seeAllText}>See All</Typography>
          </TouchableOpacity>
        </View>
        {!recentApplicants?.length ? (
          <View style={styles.emptyState}>
            <Typography variant="body" style={styles.emptyStateText}>No recent applicants yet.</Typography>
          </View>
        ) : (
          recentApplicants.map((app) => (
            <TouchableOpacity key={app.id} style={styles.applicantCard} onPress={() => handleRestrictedNavigation('ArtistProfileScreen', { id: app.users?.id, applicationId: app.id })}>
              <Image source={{ uri: app.users?.avatar_url || 'https://via.placeholder.com/150' }} style={styles.applicantAvatar} />
              <View style={styles.applicantInfo}>
                <Typography variant="body" style={styles.applicantName}>{app.users?.artist_profiles?.[0]?.full_name || app.users?.display_name || 'Applicant'}</Typography>
                <Typography variant="caption" style={styles.applicantRole}>Applied for: {app.audition_title}</Typography>
              </View>
              <ChevronRight size={20} color={colors.textSecondaryLight} />
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  };
  // 5.5 Live Auditions (Today)
  const renderLiveAuditions = () => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const liveTodayAuditions = (activeAuditions || []).filter(item => {
      if (item.audition_date === todayString || item.date === todayString) return true;
      if (item.specific_start_date === todayString) return true;
      if (item.instructions) {
        try {
          const inst = typeof item.instructions === 'string' ? JSON.parse(item.instructions) : item.instructions;
          if (inst.walk_in_date === todayString || inst.specific_start_date === todayString) return true;
        } catch(e){}
      }
      return false;
    });

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>Live Auditions (Today)</Typography>
        </View>
        {liveTodayAuditions.length === 0 ? (
          <View style={styles.emptyState}>
            <Typography variant="body" style={styles.emptyStateText}>No auditions happening today.</Typography>
          </View>
        ) : (
          <FlatList
            data={liveTodayAuditions}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => 'live_' + item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.auditionCarouselCard, { borderColor: colors.primary, borderWidth: 1 }]} onPress={() => navigation.navigate('AuditionDetails', { auditionId: item.id })}>
                {item.thumbnail_url && (
                  <Image source={{ uri: item.thumbnail_url }} style={{ width: '100%', height: 100, borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                )}
                <View style={[styles.auditionCardHeader, item.thumbnail_url ? { paddingTop: spacing.s } : {}]}>
                  <Typography variant="body" style={styles.auditionCardTitle} numberOfLines={1}>{item.title}</Typography>
                  <View style={[styles.activeBadge, { backgroundColor: colors.error }]}><Typography variant="caption" style={[styles.activeBadgeText, { color: '#FFF' }]}>Live Now</Typography></View>
                </View>
                <View style={styles.auditionStatsRow}>
                  <Users size={16} color={colors.primary} />
                  <Typography variant="body" style={styles.auditionStatText}>{item.applications?.length || 0} Applicants</Typography>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingRight: spacing.m }}
          />
        )}
      </View>
    );
  };

  // 6. Active Auditions Carousel
  const renderActiveAuditions = () => {
    const liveAuditions = activeAuditions || [];

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>Active Auditions</Typography>
          <TouchableOpacity onPress={() => navigation.navigate('MyAuditions')}>
            <Typography variant="body" style={styles.seeAllText}>View All</Typography>
          </TouchableOpacity>
        </View>
        {liveAuditions.length === 0 ? (
          <View style={styles.emptyState}>
            <Typography variant="body" style={styles.emptyStateText}>No active auditions found.</Typography>
          </View>
        ) : (
          <FlatList
            data={liveAuditions}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => {
              const liveStatus = getAuditionLiveStatus(item);
              return (
              <TouchableOpacity style={[styles.auditionCarouselCard, liveStatus ? { borderColor: liveStatus.color, borderWidth: 1 } : {}]} onPress={() => navigation.navigate('AuditionDetails', { auditionId: item.id })}>
                {item.thumbnail_url && (
                  <Image source={{ uri: item.thumbnail_url }} style={{ width: '100%', height: 100, borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                )}
                <View style={[styles.auditionCardHeader, item.thumbnail_url ? { paddingTop: spacing.s } : {}]}>
                  <Typography variant="body" style={styles.auditionCardTitle} numberOfLines={1}>{item.title}</Typography>
                  {liveStatus ? (
                    <View style={[styles.activeBadge, { backgroundColor: liveStatus.color }]}><Typography variant="caption" style={[styles.activeBadgeText, { color: '#FFF' }]}>{liveStatus.text}</Typography></View>
                  ) : (
                    <View style={[styles.activeBadge, { backgroundColor: colors.success + '20' }]}><Typography variant="caption" style={[styles.activeBadgeText, { color: colors.success }]}>Active</Typography></View>
                  )}
                </View>
                <View style={styles.auditionStatsRow}>
                  <Users size={16} color={colors.primary} />
                  <Typography variant="body" style={styles.auditionStatText}>{item.applications?.length || 0} Applicants</Typography>
                </View>
              </TouchableOpacity>
            )}}
            contentContainerStyle={{ paddingRight: spacing.m }}
          />
        )}
      </View>
    );
  };

  // 7. Draft Auditions
  const renderDraftAuditions = () => {
    return (
      <View style={styles.sectionContainer}>
        <Typography variant="h3" style={styles.sectionTitle}>Saved Drafts</Typography>
        {!draftAuditions?.length ? (
          <View style={styles.emptyState}>
            <Typography variant="body" style={styles.emptyStateText}>No draft auditions saved.</Typography>
          </View>
        ) : (
          draftAuditions.map(draft => (
            <TouchableOpacity key={draft.id} style={styles.draftCard} onPress={() => handleRestrictedNavigation('CreateAudition', { audition: draft })}>
              <View style={styles.draftIconBg}>
                {draft.thumbnail_url ? (
                  <Image source={{ uri: draft.thumbnail_url }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                ) : (
                  <Briefcase size={22} color={colors.primary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="body" style={styles.draftTitle}>{draft.title || 'Untitled Draft'}</Typography>
                <Typography variant="caption" style={styles.draftDate}>Saved {timeAgo(draft.created_at)}</Typography>
              </View>
              <Typography variant="body" style={{ color: colors.primary, fontWeight: 'bold' }}>Edit</Typography>
            </TouchableOpacity>
          )))}
      </View>
    );
  };

  // 8 & 9. Charts
  const renderCharts = () => {
    const pieChartData = [
      { name: 'Hired', count: stats?.hired || 0, color: colors.success, legendFontColor: colors.textMainLight, legendFontSize: 13 },
      { name: 'Shortlisted', count: stats?.shortlisted || 0, color: '#3b82f6', legendFontColor: colors.textMainLight, legendFontSize: 13 },
      { name: 'Pending', count: stats?.pending || 0, color: colors.warning, legendFontColor: colors.textMainLight, legendFontSize: 13 },
      { name: 'Rejected', count: stats?.rejected || 0, color: colors.error, legendFontColor: colors.textMainLight, legendFontSize: 13 }
    ].filter(d => d.count > 0);


    let dataPoints = [0, 0, 0, 0, 0, 0, 0];
    let labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    if (allApplicants?.length > 0) {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { dateStr: d.toISOString().split('T')[0], dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), count: 0 };
      });

      allApplicants.forEach(a => {
        if (a.created_at) {
          const dateStr = a.created_at.split('T')[0];
          const dayData = last7Days.find(d => d.dateStr === dateStr);
          if (dayData) dayData.count++;
        }
      });

      let runningTotal = allApplicants.filter(a => a.created_at && a.created_at.split('T')[0] < last7Days[0].dateStr).length;
      dataPoints = last7Days.map(d => { runningTotal += d.count; return runningTotal; });
      labels = last7Days.map(d => d.dayName);
    }

    const lineChartData = { labels, datasets: [{ data: dataPoints.length > 0 && Math.max(...dataPoints) > 0 ? dataPoints : [0, 0, 0, 0, 0, 0, 0] }] };

    if (!allApplicants?.length && stats?.totalApplicants === 0) {
      return (
        <>
          <View style={styles.chartSection}>
            <Typography variant="h3" style={styles.sectionTitle}>Application Growth</Typography>
            <View style={styles.emptyState}><Typography variant="body" style={styles.emptyStateText}>No metrics available.</Typography></View>
          </View>
        </>
      );
    }

    return (
      <>
        <View style={styles.chartSection}>
          <Typography variant="h3" style={styles.sectionTitle}>Application Growth (Last 7 Days)</Typography>
          <LineChart
            data={lineChartData}
            width={width - spacing.l * 2 - 20}
            height={220}
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: '#fff', backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff', decimalPlaces: 0,
              color: (opacity = 1) => `rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, ${opacity})`,
              labelColor: (opacity = 1) => colors.textMainLight, style: { borderRadius: 16 }, propsForDots: { r: "5", strokeWidth: "2", stroke: colors.primary }
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </View>
      </>
    );
  };

  // 10. Recommended Talent
  const renderRecommendedTalent = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>Recommended Talent</Typography>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Typography variant="body" style={styles.seeAllText}>See All</Typography>
          </TouchableOpacity>
        </View>
        {!recommendedTalent?.length ? (
          <View style={styles.emptyState}>
            <Typography variant="body" style={styles.emptyStateText}>No talent recommendations right now.</Typography>
          </View>
        ) : (
          <FlatList
            data={recommendedTalent}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.talentCard} onPress={() => navigation.navigate('PublicProfile', { username: item.users?.username || item.user_id })}>
                <Image source={{ uri: item.photo_urls?.[0] || item.users?.avatar_url || 'https://via.placeholder.com/150' }} style={styles.talentAvatar} />
                <Typography variant="body" style={styles.talentName} numberOfLines={1}>{item.full_name}</Typography>
                <Typography variant="caption" style={styles.talentCategory} numberOfLines={1}>{item.category}</Typography>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingRight: spacing.m }}
          />
        )}
      </View>
    );
  };

  // 12. Upcoming Interviews (Using shortlisted)
  const renderUpcomingInterviews = () => {
    return (
      <View style={styles.sectionContainer}>
        <Typography variant="h3" style={styles.sectionTitle}>Upcoming Interviews</Typography>
        {!upcomingInterviews?.length ? (
          <View style={styles.emptyState}>
            <Typography variant="body" style={styles.emptyStateText}>No upcoming interviews scheduled.</Typography>
          </View>
        ) : (
          upcomingInterviews.map(interview => (
            <View key={interview.id} style={styles.interviewCard}>
              <View style={styles.interviewDateBox}>
                <Typography variant="caption" style={styles.interviewMonth}>{new Date().toLocaleString('default', { month: 'short' })}</Typography>
                <Typography variant="h3" style={styles.interviewDay}>{new Date().getDate().toString().padStart(2, '0')}</Typography>
              </View>
              <View style={styles.interviewInfo}>
                <Typography variant="body" style={styles.interviewName}>{interview.users?.display_name || 'Candidate'}</Typography>
                <Typography variant="caption" style={styles.interviewRole}>{interview.audition_title}</Typography>
              </View>
              <TouchableOpacity style={styles.interviewBtn} onPress={() => handleRestrictedNavigation('ArtistProfileScreen', { id: interview.users?.id, applicationId: interview.id })}>
                <Typography variant="body" style={styles.interviewBtnText}>View</Typography>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    );
  };

  // Network & Followers and Platform News placeholders removed.



  return (
    <View style={[globalStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: spacing.m }]}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >


        {renderVerificationBanner()}
        {renderProfileCompleteness()}
        {renderQuickActions()}
        {renderMetricsGrid()}
        {renderLiveAuditions()}
        {renderActiveAuditions()}
        {renderRecentApplicants()}
        {renderRecommendedTalent()}
        {renderUpcomingInterviews()}
        {renderDraftAuditions()}
        {renderCharts()}


        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  topVibrantHeader: { position: 'absolute', top: 0, left: 0, right: 0, height: 180, backgroundColor: colors.primary + '10', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  scrollContent: { paddingHorizontal: spacing.l },
  headerTitleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  headerTitle: { color: colors.textMainLight, fontWeight: 'bold' },
  headerSubtitle: { color: colors.textSecondaryLight, marginTop: 4, fontWeight: '600' },
  notificationBtn: { padding: 12, backgroundColor: '#fff', borderRadius: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  notificationBadge: { position: 'absolute', top: 12, right: 12, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.error, borderWidth: 2, borderColor: '#fff' },
  banner: { flexDirection: 'row', padding: spacing.m, borderRadius: 20, borderWidth: 2, marginBottom: spacing.s, position: 'relative' },
  bannerIcon: { marginRight: spacing.m, marginTop: 4 },
  bannerTextContainer: { flex: 1 },
  bannerTitle: { fontWeight: 'bold', marginBottom: 4, fontSize: 16 },
  bannerDesc: { opacity: 0.8, fontWeight: '500' },
  bannerButton: { marginTop: spacing.m, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start' },
  bannerButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  completenessCard: { backgroundColor: '#fff', padding: spacing.l, borderRadius: 20, marginBottom: spacing.l, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, borderWidth: 1, borderColor: colors.borderLight },
  completenessHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  completenessTitle: { color: colors.textMainLight, fontWeight: 'bold' },
  progressBarBg: { height: 12, backgroundColor: colors.borderLight, borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 6 },
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl },
  actionBtn: { alignItems: 'center', flex: 1 },
  actionBtnIcon: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  actionBtnText: { color: colors.textMainLight, textAlign: 'center', fontWeight: 'bold' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: colors.error, borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.l },
  metricCardWrapper: { width: '48%', marginBottom: spacing.m },
  metricIconBg: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  metricValue: { color: colors.textMainLight, marginBottom: 4, fontWeight: 'bold' },
  metricLabel: { color: colors.textSecondaryLight, fontWeight: '600' },
  sectionContainer: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.l },
  sectionTitle: { color: colors.textMainLight, fontWeight: 'bold' },
  seeAllText: { color: colors.primary, fontFamily: typography.fontFamily, fontWeight: 'bold' },
  applicantCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: spacing.m, borderRadius: 20, marginBottom: spacing.m, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  applicantAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: spacing.m },
  applicantInfo: { flex: 1 },
  applicantName: { color: colors.textMainLight, fontWeight: 'bold', fontSize: 16 },
  applicantRole: { color: colors.textSecondaryLight, marginTop: 4, fontWeight: '600' },
  auditionCarouselCard: { backgroundColor: '#fff', padding: spacing.l, borderRadius: 24, width: 260, marginRight: spacing.m, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, borderWidth: 1, borderColor: colors.borderLight },
  auditionCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.l },
  auditionCardTitle: { flex: 1, color: colors.textMainLight, fontWeight: 'bold', marginRight: 12, fontSize: 16 },
  activeBadge: { backgroundColor: colors.success + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  activeBadgeText: { color: colors.success, fontSize: 12, fontWeight: 'bold' },
  auditionStatsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', padding: 12, borderRadius: 12 },
  auditionStatText: { color: colors.primary, marginLeft: 8, fontWeight: 'bold' },
  draftCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: spacing.m, borderRadius: 20, marginBottom: spacing.m, borderWidth: 2, borderColor: colors.borderLight, borderStyle: 'dashed' },
  draftIconBg: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: spacing.m },
  draftTitle: { color: colors.textMainLight, fontWeight: 'bold', fontSize: 16 },
  draftDate: { color: colors.textSecondaryLight, marginTop: 4, fontWeight: '600' },
  talentCard: { backgroundColor: '#fff', borderRadius: 24, width: 160, marginRight: spacing.m, padding: spacing.l, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10 },
  talentAvatar: { width: 90, height: 90, borderRadius: 45, marginBottom: spacing.m, borderWidth: 3, borderColor: colors.primary + '30' },
  talentName: { color: colors.textMainLight, fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  talentCategory: { color: colors.primary, textAlign: 'center', marginTop: 4, fontWeight: 'bold' },
  interviewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: spacing.m, borderRadius: 20, marginBottom: spacing.m, elevation: 2 },
  interviewDateBox: { backgroundColor: colors.primary, padding: 12, borderRadius: 16, alignItems: 'center', width: 70, marginRight: spacing.m },
  interviewMonth: { color: '#fff', textTransform: 'uppercase', fontWeight: 'bold', fontSize: 12 },
  interviewDay: { color: '#fff', marginTop: 4, fontWeight: 'bold' },
  interviewInfo: { flex: 1 },
  interviewName: { color: colors.textMainLight, fontWeight: 'bold', fontSize: 16 },
  interviewRole: { color: colors.textSecondaryLight, marginTop: 4, fontWeight: '600' },
  interviewBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primary + '15', borderRadius: 16 },
  interviewBtnText: { color: colors.primary, fontWeight: 'bold' },
  networkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: spacing.xl, borderRadius: 24, elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
  networkIconBg: { backgroundColor: colors.primary, padding: 20, borderRadius: 24 },
  newsBanner: { backgroundColor: '#8b5cf6', borderRadius: 24, padding: spacing.xl, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl, elevation: 4 },
  newsTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 8, fontSize: 18 },
  newsDesc: { color: 'rgba(255,255,255,0.9)', fontWeight: '600', lineHeight: 20 },
  chartSection: { backgroundColor: '#fff', padding: spacing.l, borderRadius: 24, marginBottom: spacing.xl, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10 },
  emptyState: { backgroundColor: colors.backgroundLight, padding: spacing.l, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderLight, borderStyle: 'dashed' },
  emptyStateText: { color: colors.textSecondaryLight, fontWeight: 'bold' },
  lockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  }
});
