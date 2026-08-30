import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions, FlatList, StatusBar, Modal, Text, Easing, ScrollView } from 'react-native';
import { ChevronRight, Lock, Bell, CheckCircle2, X } from 'lucide-react-native';
import ReAnimated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import ImageWithFallback from '../../components/core/ImageWithFallback';
import { typography, spacing, globalStyles } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import { useGetDashboardDataQuery, useGetNotificationsQuery, useGetCompanyProfileQuery } from '../../services/hiringApi';
import { useAcceptDisclaimerMutation } from '../../services/authApi';
import { logout } from '../../store/slices/authSlice';
import AnimatedBorderCard from '../../components/AnimatedBorderCard';
import { getAuditionLiveStatus } from '../../utils/dateUtils';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';
import { useTheme } from '../../theme/ThemeProvider';
import AppIcon, {
  Icon,
  BellFilledIcon,
  PostAudition3DIcon,
  FindTalent3DIcon,
  ApplicationsAction3DIcon,
  MessagingAction3DIcon,
  ActiveAuditionsStat3DIcon,
  PendingReviewStat3DIcon,
  ShortlistedStat3DIcon,
  TotalApplicantsStat3DIcon,
  LiveAuditionsSectionIcon,
  ApplicationGrowthSectionIcon,
  RecentApplicantsSectionIcon,
  RecommendedTalentSectionIcon,
  InterviewsSectionIcon,
  DraftAuditionsSectionIcon,
  KycShield3DIcon,
  LiveRadarIcon,
  ClapperRoleIcon,
  NearbySpotlightIcon,
  VerifiedTrustShieldIcon,
  ProTalentStarIcon,
  ProfileRocketIcon,
} from '../../components/icons';

const { width } = Dimensions.get('window');

function LiveFeatureTicker({ items, onPress, colors }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!items || items.length <= 1) return;
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -16,
          duration: 260,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        translateY.setValue(16);
        scale.setValue(0.95);
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 320,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.4)),
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3400);

    return () => clearInterval(interval);
  }, [items, translateY, opacity, scale]);

  const currentItem = items[currentIndex] || items[0];
  const IconComp = currentItem.IconComponent;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        stylesTicker.tickerContainer,
        {
          backgroundColor: colors.surfaceLight,
          borderColor: currentItem.themeColor + '30',
        },
      ]}
    >
      <View style={stylesTicker.tickerContent}>
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            transform: [{ translateY }, { scale }],
            opacity,
          }}
        >
          <View style={[stylesTicker.iconBadge, { backgroundColor: currentItem.badgeBg || (currentItem.themeColor + '15') }]}>
            {IconComp ? <IconComp size={16} /> : null}
          </View>

          <View style={{ flex: 1, marginLeft: 8, marginRight: 6 }}>
            <Text
              style={[stylesTicker.tickerText, { color: colors.textMainLight }]}
              numberOfLines={1}
            >
              <Text style={{ fontWeight: '800', color: currentItem.themeColor }}>{currentItem.countHighlight} </Text>
              {currentItem.text}
            </Text>
          </View>

          {currentItem.highlight && (
            <View style={[stylesTicker.tickerHighlightBadge, { backgroundColor: currentItem.themeColor + '18' }]}>
              <Text style={[stylesTicker.tickerHighlightText, { color: currentItem.themeColor }]}>{currentItem.highlight}</Text>
            </View>
          )}
        </Animated.View>
      </View>
      <ChevronRight size={14} color={currentItem.themeColor} />
    </TouchableOpacity>
  );
}

const stylesTicker = StyleSheet.create({
  tickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.2,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tickerContent: {
    flex: 1,
    overflow: 'hidden',
    height: 24,
    justifyContent: 'center',
    marginRight: 4,
  },
  iconBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tickerHighlightBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  tickerHighlightText: {
    fontSize: 10.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});


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
  return Math.floor(seconds) + " seconds ago";
};

export default function HiringDashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [acceptDisclaimer, { isLoading: isAccepting }] = useAcceptDisclaimerMutation();
  const [isChecklistVisible, setIsChecklistVisible] = useState(false);
  const { data: dashboardResponse, isLoading, isFetching, refetch: refetchDashboard } = useGetDashboardDataQuery();
  const { refetch: refetchNotifications } = useGetNotificationsQuery();
  const { data: profileResponse, refetch: refetchProfile } = useGetCompanyProfileQuery(user?.id, { skip: !user?.id });

  useFocusEffect(
    useCallback(() => {
      refetchDashboard();
      refetchNotifications();
      if (user?.id) refetchProfile();
    }, [refetchDashboard, refetchNotifications, refetchProfile, user?.id])
  );

  const data = dashboardResponse?.data;
  const companyProfile = profileResponse?.data || data?.profile;
  const insets = useSafeAreaInsets();
  const logoUrl = companyProfile?.logo_url || user?.avatar_url || null;
  const companyName = companyProfile?.company_name || user?.display_name || 'Company';
  const avatarText = companyName.charAt(0).toUpperCase();

  const {
    scrollY,
    onScroll,
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    headerElevation,
    avatarSize,
    avatarRadius,
  } = useShrinkableHeader();

  const { profile: dashboardProfile, stats, activeAuditions, draftAuditions, recentApplicants, recommendedTalent, upcomingInterviews, unreadMessagesCount, allApplicants } = data || {};
  const profile = companyProfile || dashboardProfile;
  const isVerified = profile?.is_verified;
  const verificationStatus = profile?.verification_status || 'unverified';

  const handleRestrictedNavigation = (screenName, params) => {
    if (!isVerified) {
      navigation.navigate('VerificationRequired');
    } else {
      navigation.navigate(screenName, params);
    }
  };

  const handleRefresh = useCallback(() => {
    refetchDashboard();
    refetchNotifications();
    if (user?.id) refetchProfile();
  }, [refetchDashboard, refetchNotifications, refetchProfile, user?.id]);

  if (isLoading && !data) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }


  const getCompanyChecklist = (p) => {
    const data = p || {};
    return [
      {
        id: 'company_name',
        emoji: '🏢',
        title: 'Company Name',
        hint: 'Registered or brand trade name',
        completed: !!(data.company_name || user?.display_name),
        weight: '+25%',
        color: '#3B82F6',
        bg: '#EFF6FF',
      },
      {
        id: 'company_type',
        emoji: '🎬',
        title: 'Company Type',
        hint: 'Production house, Casting, Studio, OTT',
        completed: !!data.company_type,
        weight: '+25%',
        color: '#8B5CF6',
        bg: '#F5F3FF',
      },
      {
        id: 'description',
        emoji: '📝',
        title: 'About Company',
        hint: 'Overview of your casting work & projects',
        completed: !!(data.description && data.description.trim().length > 0),
        weight: '+25%',
        color: '#F59E0B',
        bg: '#FFFBEB',
      },
      {
        id: 'logo_url',
        emoji: '🖼️',
        title: 'Company Logo',
        hint: 'Official brand avatar / production logo',
        completed: !!(data.logo_url || user?.avatar_url),
        weight: '+25%',
        color: '#10B981',
        bg: '#ECFDF5',
      },
      {
        id: 'alternate_contact',
        emoji: '📞',
        title: 'Contact Details',
        hint: 'Alternate phone & official coordinator email',
        completed: !!(data.alternate_phone || data.alternate_email),
        weight: 'Bonus',
        color: '#06B6D4',
        bg: '#ECFEFF',
      },
    ];
  };

  const checklistItems = getCompanyChecklist(profile);
  const pendingItems = checklistItems.filter(i => !i.completed);
  let profileCompleteness = 0;
  if (profile?.company_name || user?.display_name) profileCompleteness += 25;
  if (profile?.company_type) profileCompleteness += 25;
  if (profile?.description) profileCompleteness += 25;
  if (profile?.logo_url || user?.avatar_url) profileCompleteness += 25;
  const isProfileFullyComplete = profileCompleteness === 100;

  const tickerItems = [
    {
      id: 'live',
      IconComponent: LiveRadarIcon,
      themeColor: '#EF4444',
      badgeBg: '#FEE2E2',
      countHighlight: `${(activeAuditions || []).length} Live`,
      text: 'Production calls active today',
      highlight: 'Live Now',
    },
    {
      id: 'pending',
      IconComponent: ClapperRoleIcon,
      themeColor: '#F59E0B',
      badgeBg: '#FEF3C7',
      countHighlight: `${stats?.pending || 0} Pending`,
      text: 'Applications awaiting your review',
      highlight: 'Action Needed',
    },
    {
      id: 'shortlisted',
      IconComponent: ProTalentStarIcon,
      themeColor: '#2563EB',
      badgeBg: '#DBEAFE',
      countHighlight: `${stats?.shortlisted || 0} Talent`,
      text: 'Shortlisted for casting rounds',
      highlight: 'Shortlisted',
    },
    {
      id: 'verified',
      IconComponent: VerifiedTrustShieldIcon,
      themeColor: '#059669',
      badgeBg: '#D1FAE5',
      countHighlight: isVerified ? 'Verified Company' : 'KYC Protection',
      text: isVerified ? 'Full production casting unlocked' : 'Submit docs to unlock direct messaging',
      highlight: isVerified ? 'Verified' : 'Get Verified',
    },
  ];

  // 1. STEP 1: Profile Completeness & What's Pending Cards
  const renderProfileCompleteness = () => {
    const score = profileCompleteness;
    if (score >= 100) return null;

    return (
      <ReAnimated.View entering={FadeInDown.duration(400)} style={styles.profileCompletenessSection}>
        {/* Main Banner Header */}
        <TouchableOpacity 
          activeOpacity={0.88} 
          onPress={() => setIsChecklistVisible(true)}
          style={styles.profileBannerContainer}
        >
          <View style={styles.profileBannerTopRow}>
            <View style={styles.profileRocketWrapper}>
              <ProfileRocketIcon size={38} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.profileBannerTitle}>Company Profile Strength</Text>
                <View style={[styles.profileStrengthBadge, { backgroundColor: score === 100 ? '#DCFCE7' : '#EFF6FF' }]}>
                  <Text style={[styles.profileStrengthText, { color: score === 100 ? '#16A34A' : colors.primary }]}>
                    ⚡ {score}%
                  </Text>
                </View>
              </View>
              <Text style={styles.profileBannerSubtitle} numberOfLines={1}>
                {score === 100 
                  ? '🎉 Profile 100% complete! Proceed to KYC verification.' 
                  : `Step 1 of 2: Complete ${pendingItems.length} more item${pendingItems.length > 1 ? 's' : ''} to unlock KYC`}
              </Text>
            </View>
          </View>

          {/* Progress Bar & View Checklist Pill */}
          <View style={styles.profileProgressBarRow}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${score}%`, backgroundColor: score === 100 ? '#10B981' : colors.primary }]} />
            </View>
            <TouchableOpacity 
              style={styles.checklistPill} 
              onPress={() => setIsChecklistVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.checklistPillText}>Checklist →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Horizontal Pending Task Cards with Emojis */}
        {score < 100 && (
          <View style={styles.pendingCardsContainer}>
            <Text style={styles.pendingCardsHeader}>WHAT'S PENDING TO COMPLETE</Text>
            <FlatList
              data={checklistItems}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingRight: spacing.s }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('EditCompanyProfile')}
                  style={[
                    styles.pendingCard,
                    {
                      borderColor: item.completed ? '#BBF7D0' : '#E2E8F0',
                      backgroundColor: item.completed ? '#F0FDF4' : colors.surfaceLight,
                    }
                  ]}
                >
                  <View style={styles.pendingCardTop}>
                    <View style={[styles.pendingEmojiBadge, { backgroundColor: item.bg }]}>
                      <Text style={styles.pendingEmojiText}>{item.emoji}</Text>
                    </View>
                    <View style={[styles.pendingWeightPill, { backgroundColor: item.completed ? '#DCFCE7' : item.bg }]}>
                      <Text style={[styles.pendingWeightText, { color: item.completed ? '#16A34A' : item.color }]}>
                        {item.completed ? '✓ Done' : item.weight}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.pendingCardTitle, { color: colors.textMainLight }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.pendingCardHint} numberOfLines={1}>
                    {item.hint}
                  </Text>

                  <View style={[styles.pendingCardBtn, { backgroundColor: item.completed ? '#DCFCE7' : item.color }]}>
                    <Text style={[styles.pendingCardBtnText, { color: item.completed ? '#16A34A' : '#FFFFFF' }]}>
                      {item.completed ? 'Completed' : '➕ Add Now'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </ReAnimated.View>
    );
  };

  // 2. STEP 2: KYC Verification Banner
  const renderVerificationBanner = () => {
    if (isVerified) return null;

    if (!isProfileFullyComplete) {
      // Step 2 Locked Guide Card
      return (
        <ReAnimated.View entering={FadeInDown.delay(100).duration(400)} style={styles.lockedKycBanner}>
          <View style={styles.lockedKycIconWrapper}>
            <KycShield3DIcon size={30} opacity={0.6} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.lockedKycTitle}>Step 2: KYC Verification</Text>
              <View style={styles.lockedBadgePill}>
                <Lock size={10} color="#64748B" />
                <Text style={styles.lockedBadgeText}>Locked</Text>
              </View>
            </View>
            <Text style={styles.lockedKycDesc}>
              Complete 100% of your company profile above to unlock official document upload & verification.
            </Text>
          </View>
        </ReAnimated.View>
      );
    }

    let bannerProps = {
      bg: '#EFF6FF',
      border: '#BFDBFE',
      color: colors.primary,
      title: 'Get Verified & Unlock Full Casting',
      desc: 'Your profile is 100% complete! Upload business KYC documents to start posting verified auditions & direct messaging.',
      btn: 'Complete KYC Verification →',
      target: 'CompanyKyc'
    };

    if (verificationStatus === 'pending') {
      bannerProps = { 
        bg: '#FFFBEB', 
        border: '#FDE68A', 
        color: '#D97706', 
        title: 'KYC Documents Pending Review', 
        desc: 'Your registration documents are being verified by our compliance team (24-48 hrs).', 
        btn: null, 
        target: null 
      };
    } else if (verificationStatus === 'rejected') {
      bannerProps = {
        bg: '#FEF2F2',
        border: '#FECACA',
        color: colors.error,
        title: 'KYC Verification Action Required',
        desc: 'Your documents were returned. Please re-upload valid government proof.',
        btn: 'Re-Submit KYC Proof',
        target: 'CompanyKyc'
      };
    }

    return (
      <ReAnimated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.banner, { backgroundColor: bannerProps.bg, borderColor: bannerProps.border }]}>
        <View style={styles.bannerIconWrapper}>
          <KycShield3DIcon size={36} />
        </View>
        <View style={styles.bannerTextContainer}>
          <Text style={[styles.bannerTitle, { color: bannerProps.color }]}>{bannerProps.title}</Text>
          <Text style={styles.bannerDesc}>{bannerProps.desc}</Text>
          {bannerProps.btn && (
            <TouchableOpacity 
              style={[styles.bannerButton, { backgroundColor: bannerProps.color }]} 
              onPress={() => navigation.navigate(bannerProps.target)}
              activeOpacity={0.85}
            >
              <Text style={styles.bannerButtonText}>{bannerProps.btn}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ReAnimated.View>
    );
  };


  // 3. Quick Actions Row (4 Solid 3D Buttons)
  const renderQuickActions = () => (
    <ReAnimated.View entering={FadeInRight.delay(100).duration(400)} style={styles.quickActionsContainer}>
      <TouchableOpacity style={styles.actionBtn} onPress={() => handleRestrictedNavigation('CreateAudition')} activeOpacity={0.8}>
        <View style={[styles.actionBtnIcon, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
          <PostAudition3DIcon size={36} />
          {!isVerified && <View style={styles.lockBadge}><Lock size={11} color="#fff" /></View>}
        </View>
        <Text style={styles.actionBtnText}>Post Audition</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('FindTalent')} activeOpacity={0.8}>
        <View style={[styles.actionBtnIcon, { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' }]}>
          <FindTalent3DIcon size={36} />
        </View>
        <Text style={styles.actionBtnText}>Find Talent</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtn} onPress={() => handleRestrictedNavigation('Applicants')} activeOpacity={0.8}>
        <View style={[styles.actionBtnIcon, { backgroundColor: '#F5F3FF', borderColor: '#EDE9FE' }]}>
          <ApplicationsAction3DIcon size={36} />
          {!isVerified && <View style={styles.lockBadge}><Lock size={11} color="#fff" /></View>}
        </View>
        <Text style={styles.actionBtnText}>Applications</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtn} onPress={() => handleRestrictedNavigation('Inbox')} activeOpacity={0.8}>
        <View style={[styles.actionBtnIcon, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
          <MessagingAction3DIcon size={36} />
          {!isVerified && <View style={styles.lockBadge}><Lock size={11} color="#fff" /></View>}
        </View>
        <Text style={styles.actionBtnText}>Messaging</Text>
      </TouchableOpacity>
    </ReAnimated.View>
  );

  // 4. Quick Metrics Grid (2x2 with Tailored 3D Stat Icons - Centered Layout)
  const renderMetricsGrid = () => (
    <View style={styles.metricsGrid}>
      <ReAnimated.View entering={FadeInDown.delay(100).duration(400)} style={styles.metricCardWrapper}>
        <AnimatedBorderCard style={styles.metricCardInner} color={colors.primary} delay={0} onPress={() => navigation.navigate('MyAuditions', { initialStatus: 'All' })}>
          <View style={[styles.metricIconBg, { backgroundColor: '#EFF6FF' }]}>
            <ActiveAuditionsStat3DIcon size={28} />
          </View>
          <Text style={styles.metricValue}>{activeAuditions?.length || 0}</Text>
          <Text style={styles.metricLabel}>Active Auditions</Text>
        </AnimatedBorderCard>
      </ReAnimated.View>

      <ReAnimated.View entering={FadeInDown.delay(180).duration(400)} style={styles.metricCardWrapper}>
        <AnimatedBorderCard style={styles.metricCardInner} color="#F59E0B" delay={200} onPress={() => handleRestrictedNavigation('Applicants', { initialTab: 'pending' })}>
          <View style={[styles.metricIconBg, { backgroundColor: '#FFFBEB' }]}>
            <PendingReviewStat3DIcon size={28} />
          </View>
          <Text style={styles.metricValue}>{stats?.pending || 0}</Text>
          <Text style={styles.metricLabel}>Pending Review</Text>
        </AnimatedBorderCard>
      </ReAnimated.View>

      <ReAnimated.View entering={FadeInDown.delay(260).duration(400)} style={styles.metricCardWrapper}>
        <AnimatedBorderCard style={styles.metricCardInner} color="#3B82F6" delay={400} onPress={() => handleRestrictedNavigation('Applicants', { initialTab: 'shortlisted' })}>
          <View style={[styles.metricIconBg, { backgroundColor: '#EFF6FF' }]}>
            <ShortlistedStat3DIcon size={28} />
          </View>
          <Text style={styles.metricValue}>{stats?.shortlisted || 0}</Text>
          <Text style={styles.metricLabel}>Shortlisted</Text>
        </AnimatedBorderCard>
      </ReAnimated.View>

      <ReAnimated.View entering={FadeInDown.delay(340).duration(400)} style={styles.metricCardWrapper}>
        <AnimatedBorderCard style={styles.metricCardInner} color="#10B981" delay={600} onPress={() => handleRestrictedNavigation('Applicants', { initialTab: 'all' })}>
          <View style={[styles.metricIconBg, { backgroundColor: '#ECFDF5' }]}>
            <TotalApplicantsStat3DIcon size={28} />
          </View>
          <Text style={styles.metricValue}>{stats?.totalApplicants || 0}</Text>
          <Text style={styles.metricLabel}>Total Applicants</Text>
        </AnimatedBorderCard>
      </ReAnimated.View>
    </View>
  );

  // 5. Live Auditions (Today)
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
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#FEE2E2' }]}>
              <LiveAuditionsSectionIcon size={18} />
            </View>
            <Text style={styles.sectionTitle}>Live Auditions (Today)</Text>
          </View>
        </View>
        {liveTodayAuditions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No auditions happening today.</Text>
          </View>
        ) : (
          <FlatList
            data={liveTodayAuditions}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => 'live_' + item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.auditionCarouselCard, { borderColor: '#EF4444', borderWidth: 1.5 }]} onPress={() => navigation.navigate('AuditionDetails', { auditionId: item.id })} activeOpacity={0.85}>
                <ImageWithFallback source={{ uri: item.thumbnail_url }} fallbackSource={{ uri: profile?.logo_url }} style={{ width: '100%', height: 110, borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                <View style={{ padding: spacing.m }}>
                  <View style={[styles.auditionCardHeader, { paddingTop: 4 }]}>
                    <Text style={styles.auditionCardTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={[styles.activeBadge, { backgroundColor: '#EF4444' }]}>
                      <Text style={[styles.activeBadgeText, { color: '#FFF' }]}>Live Now</Text>
                    </View>
                  </View>
                  <View style={styles.auditionStatsRow}>
                    <TotalApplicantsStat3DIcon size={18} />
                    <Text style={styles.auditionStatText}>{item.applications?.length || 0} Applicants</Text>
                  </View>
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
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#EFF6FF' }]}>
              <ActiveAuditionsStat3DIcon size={18} />
            </View>
            <Text style={styles.sectionTitle}>Active Auditions</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('MyAuditions')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {liveAuditions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No active auditions found.</Text>
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
              <TouchableOpacity style={[styles.auditionCarouselCard, liveStatus ? { borderColor: liveStatus.color, borderWidth: 1.2 } : {}]} onPress={() => navigation.navigate('AuditionDetails', { auditionId: item.id })} activeOpacity={0.85}>
                <ImageWithFallback source={{ uri: item.thumbnail_url }} fallbackSource={{ uri: profile?.logo_url }} style={{ width: '100%', height: 110, borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                <View style={{ padding: spacing.m }}>
                  <View style={[styles.auditionCardHeader, { paddingTop: 4 }]}>
                    <Text style={styles.auditionCardTitle} numberOfLines={1}>{item.title}</Text>
                    {liveStatus ? (
                      <View style={[styles.activeBadge, { backgroundColor: liveStatus.color }]}>
                        <Text style={[styles.activeBadgeText, { color: '#FFF' }]}>{liveStatus.text}</Text>
                      </View>
                    ) : (
                      <View style={[styles.activeBadge, { backgroundColor: '#ECFDF5' }]}>
                        <Text style={[styles.activeBadgeText, { color: '#059669' }]}>Active</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.auditionStatsRow}>
                    <TotalApplicantsStat3DIcon size={18} />
                    <Text style={styles.auditionStatText}>{item.applications?.length || 0} Applicants</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}}
            contentContainerStyle={{ paddingRight: spacing.m }}
          />
        )}
      </View>
    );
  };

  // 7. Recent Applicants
  const renderRecentApplicants = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#ECFDF5' }]}>
              <RecentApplicantsSectionIcon size={18} />
            </View>
            <Text style={styles.sectionTitle}>Recent Applicants</Text>
          </View>
          <TouchableOpacity onPress={() => handleRestrictedNavigation('Applicants')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {!recentApplicants?.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent applicants yet.</Text>
          </View>
        ) : (
          <View style={styles.applicantsGrid}>
            {recentApplicants.map((app) => (
              <TouchableOpacity key={app.id} style={styles.applicantCardGrid} onPress={() => handleRestrictedNavigation('ArtistProfileScreen', { id: app.artist_id, applicationId: app.id })} activeOpacity={0.85}>
                <ImageWithFallback source={{ uri: app.users?.avatar_url }} fallbackSource={{ uri: 'https://via.placeholder.com/150' }} style={styles.applicantGridAvatar} />
                <View style={styles.applicantGridInfo}>
                  <Text style={styles.applicantName} numberOfLines={1}>{app.users?.artist_profiles?.[0]?.full_name || app.users?.display_name || 'Applicant'}</Text>
                  <Text style={styles.applicantRole} numberOfLines={2}>Applied for: {app.audition_title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // 8. Application Growth Chart
  const renderCharts = () => {
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

    return (
      <View style={styles.chartSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#EFF6FF' }]}>
              <ApplicationGrowthSectionIcon size={18} />
            </View>
            <Text style={styles.sectionTitle}>Application Growth (7 Days)</Text>
          </View>
        </View>
        <LineChart
          data={lineChartData}
          width={width - spacing.l * 2 - 32}
          height={210}
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: colors.surfaceLight,
            backgroundGradientFrom: colors.surfaceLight,
            backgroundGradientTo: colors.surfaceLight,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(2, 132, 199, ${opacity})`,
            labelColor: (opacity = 1) => colors.textMainLight,
            style: { borderRadius: 16 },
            propsForDots: { r: "5", strokeWidth: "2", stroke: colors.primary }
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>
    );
  };

  // 9. Recommended Talent
  const renderRecommendedTalent = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#FFFBEB' }]}>
              <RecommendedTalentSectionIcon size={18} />
            </View>
            <Text style={styles.sectionTitle}>Recommended Talent</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {!recommendedTalent?.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No talent recommendations right now.</Text>
          </View>
        ) : (
          <FlatList
            data={recommendedTalent}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.talentCard} onPress={() => navigation.navigate('PublicProfile', { username: item.users?.username || item.user_id })} activeOpacity={0.85}>
                <ImageWithFallback source={{ uri: item.photo_urls?.[0] }} fallbackSource={{ uri: item.users?.avatar_url || 'https://via.placeholder.com/150' }} style={styles.talentAvatar} />
                <Text style={styles.talentName} numberOfLines={1}>{item.full_name}</Text>
                <Text style={styles.talentCategory} numberOfLines={1}>{item.category || 'Artist'}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingRight: spacing.m }}
          />
        )}
      </View>
    );
  };

  // 10. Upcoming Interviews
  const renderUpcomingInterviews = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#EEF2FF' }]}>
              <InterviewsSectionIcon size={18} />
            </View>
            <Text style={styles.sectionTitle}>Upcoming Interviews</Text>
          </View>
        </View>
        {!upcomingInterviews?.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No upcoming interviews scheduled.</Text>
          </View>
        ) : (
          upcomingInterviews.map(interview => (
            <View key={interview.id} style={styles.interviewCard}>
              <View style={styles.interviewDateBox}>
                <Text style={styles.interviewMonth}>{new Date().toLocaleString('default', { month: 'short' })}</Text>
                <Text style={styles.interviewDay}>{new Date().getDate().toString().padStart(2, '0')}</Text>
              </View>
              <View style={styles.interviewInfo}>
                <Text style={styles.interviewName}>{interview.users?.display_name || 'Candidate'}</Text>
                <Text style={styles.interviewRole}>{interview.audition_title}</Text>
              </View>
              <TouchableOpacity style={styles.interviewBtn} onPress={() => handleRestrictedNavigation('ArtistProfileScreen', { id: interview.artist_id, applicationId: interview.id })} activeOpacity={0.85}>
                <Text style={styles.interviewBtnText}>View</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    );
  };

  // 11. Draft Auditions
  const renderDraftAuditions = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#FCE7F3' }]}>
              <DraftAuditionsSectionIcon size={18} />
            </View>
            <Text style={styles.sectionTitle}>Saved Drafts</Text>
          </View>
        </View>
        {!draftAuditions?.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No draft auditions saved.</Text>
          </View>
        ) : (
          draftAuditions.map(draft => (
            <TouchableOpacity key={draft.id} style={styles.draftCard} onPress={() => handleRestrictedNavigation('CreateAudition', { audition: draft })} activeOpacity={0.85}>
              <View style={styles.draftIconBg}>
                <ImageWithFallback source={{ uri: draft.thumbnail_url }} fallbackSource={{ uri: profile?.logo_url }} style={{ width: 44, height: 44, borderRadius: 12 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.draftTitle}>{draft.title || 'Untitled Draft'}</Text>
                <Text style={styles.draftDate}>Saved {timeAgo(draft.created_at)}</Text>
              </View>
              <Text style={styles.draftEditText}>Resume</Text>
            </TouchableOpacity>
          )))}
      </View>
    );
  };


  return (
    <View style={[globalStyles.container, { backgroundColor: colors.background }]}>
      <ShrinkableHeader
        title={companyName}
        subtitle="Dashboard"
        showMenu={true}
        avatarUrl={logoUrl}
        avatarText={avatarText}
        avatarSize={avatarSize}
        avatarRadius={avatarRadius}
        scrollY={scrollY}
        headerTitleSize={headerTitleSize}
        subtitleHeight={subtitleHeight}
        subtitleOpacity={subtitleOpacity}
        headerElevation={headerElevation}
        rightActions={
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={{ padding: 8 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Bell size={22} color={colors.textMainLight} />
          </TouchableOpacity>
        }
      />
      {/* Company Profile Setup Checklist Modal */}
      <Modal
        visible={isChecklistVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsChecklistVisible(false)}
      >
        <View style={styles.checklistModalOverlay}>
          <View style={[styles.checklistModalContainer, { backgroundColor: colors.surfaceLight }]}>
            <View style={styles.checklistHeader}>
              <View>
                <Text style={[styles.checklistTitle, { color: colors.textMainLight }]}>Company Setup Checklist</Text>
                <Text style={{ color: colors.primary, fontWeight: '800', marginTop: 4, fontSize: 13, fontFamily: typography.fontFamily }}>
                  ⚡ {profileCompleteness}% Completed
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setIsChecklistVisible(false)}
                style={styles.checklistCloseBtn}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <X size={22} color={colors.textSecondaryLight} />
              </TouchableOpacity>
            </View>

            <View style={[styles.progressBarBg, { marginTop: 14, marginBottom: 16 }]}>
              <View style={[styles.progressBarFill, { width: `${profileCompleteness}%`, backgroundColor: profileCompleteness === 100 ? '#10B981' : colors.primary }]} />
            </View>

            <ScrollView style={{ maxHeight: Dimensions.get('window').height * 0.45 }} showsVerticalScrollIndicator={false}>
              {checklistItems.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  activeOpacity={0.75}
                  onPress={() => {
                    setIsChecklistVisible(false);
                    navigation.navigate('EditCompanyProfile');
                  }}
                  style={[
                    styles.checklistItemRow, 
                    { 
                      backgroundColor: item.completed ? 'rgba(16, 185, 129, 0.08)' : colors.backgroundLight,
                      borderColor: item.completed ? 'rgba(16, 185, 129, 0.3)' : colors.borderLight,
                    }
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={[styles.checklistEmojiBadge, { backgroundColor: item.bg }]}>
                      <Text style={styles.pendingEmojiText}>{item.emoji}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.checklistItemTitle, { color: colors.textMainLight, textDecorationLine: item.completed ? 'line-through' : 'none' }]}>
                        {item.title}
                      </Text>
                      <Text style={{ fontSize: 11.5, color: colors.textSecondaryLight, marginTop: 2, fontFamily: typography.fontFamily }}>
                        {item.hint}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.checklistWeightBadge, { backgroundColor: item.completed ? '#DCFCE7' : item.bg }]}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: item.completed ? "#16A34A" : item.color, fontFamily: typography.fontFamily }}>
                      {item.completed ? '✓ Done' : item.weight}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.checklistActionBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                setIsChecklistVisible(false);
                navigation.navigate('EditCompanyProfile');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.checklistActionBtnText}>
                {profileCompleteness === 100 ? 'Review Company Profile' : 'Complete Pending Details'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={user && !user.disclaimer_accepted}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.disclaimerOverlay}>
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerTitle}>Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              We request all users to check the credentials of the artists and verify the same independently before deciding to work with them.
            </Text>
            <Text style={styles.disclaimerText}>
              You should never transfer any money to anyone claiming to be representing FAMEU and demanding money.
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

      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: spacing.m }]}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={handleRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <LiveFeatureTicker
          items={tickerItems}
          onPress={() => {
            if (!isVerified) {
              navigation.navigate('CompanyKyc');
            } else {
              navigation.navigate('MyAuditions');
            }
          }}
          colors={colors}
        />
        {renderProfileCompleteness()}
        {renderVerificationBanner()}
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
      </Animated.ScrollView>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: spacing.l },
  
  // Profile Completeness & Strength Banner
  profileCompletenessSection: {
    marginBottom: spacing.m,
  },
  profileBannerContainer: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.m,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  profileBannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileRocketWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  profileBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMainLight,
    fontFamily: typography.fontFamily,
  },
  profileStrengthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  profileStrengthText: {
    fontSize: 11.5,
    fontWeight: '900',
    fontFamily: typography.fontFamily,
  },
  profileBannerSubtitle: {
    fontSize: 12,
    color: colors.textSecondaryLight,
    marginTop: 2,
    fontWeight: '500',
    fontFamily: typography.fontFamily,
  },
  profileProgressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  progressBarBg: { 
    flex: 1,
    height: 9, 
    backgroundColor: colors.borderLight, 
    borderRadius: 6, 
    overflow: 'hidden' 
  },
  progressBarFill: { 
    height: '100%', 
    borderRadius: 6 
  },
  checklistPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.primary + '15',
  },
  checklistPillText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 11.5,
    fontFamily: typography.fontFamily,
  },

  // What's Pending Cards Horizontal Row
  pendingCardsContainer: {
    marginTop: 12,
    marginBottom: 4,
  },
  pendingCardsHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    fontFamily: typography.fontFamily,
  },
  pendingCard: {
    width: 140,
    backgroundColor: colors.surfaceLight,
    padding: 10,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  pendingCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pendingEmojiBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingEmojiText: {
    fontSize: 17,
  },
  pendingWeightPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pendingWeightText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
  },
  pendingCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
    fontFamily: typography.fontFamily,
  },
  pendingCardHint: {
    fontSize: 10.5,
    color: colors.textSecondaryLight,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: typography.fontFamily,
  },
  pendingCardBtn: {
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  pendingCardBtnText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
  },

  // Locked KYC Banner (Step 2 Preview)
  lockedKycBanner: {
    flexDirection: 'row',
    padding: spacing.m,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
    marginBottom: spacing.m,
    alignItems: 'center',
  },
  lockedKycIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedKycTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textMainLight,
    fontFamily: typography.fontFamily,
  },
  lockedBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: typography.fontFamily,
  },
  lockedKycDesc: {
    fontSize: 11.5,
    color: colors.textSecondaryLight,
    marginTop: 3,
    lineHeight: 16,
    fontFamily: typography.fontFamily,
  },

  // Active KYC Banner
  banner: { 
    flexDirection: 'row', 
    padding: spacing.m, 
    borderRadius: 20, 
    borderWidth: 1.5, 
    marginBottom: spacing.m, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerIconWrapper: { 
    marginRight: spacing.m, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  bannerTextContainer: { flex: 1 },
  bannerTitle: { 
    fontWeight: '800', 
    marginBottom: 4, 
    fontSize: 15,
    fontFamily: typography.fontFamily,
  },
  bannerDesc: { 
    color: colors.textSecondaryLight, 
    fontSize: 12.5, 
    fontWeight: '500', 
    lineHeight: 18,
    fontFamily: typography.fontFamily,
  },
  bannerButton: { 
    marginTop: spacing.m, 
    paddingVertical: 9, 
    paddingHorizontal: 16, 
    borderRadius: 12, 
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerButtonText: { 
    color: '#FFFFFF', 
    fontWeight: '800', 
    fontSize: 12.5,
    fontFamily: typography.fontFamily,
  },

  // Quick Action Hub
  quickActionsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: spacing.xl,
    paddingHorizontal: 2,
  },
  actionBtn: { alignItems: 'center', flex: 1 },
  actionBtnIcon: { 
    width: 64, 
    height: 64, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 6,
    borderWidth: 1.2,
    position: 'relative',
  },
  actionBtnText: { 
    color: colors.textMainLight, 
    textAlign: 'center', 
    fontWeight: '700',
    fontSize: 12,
    fontFamily: typography.fontFamily,
  },
  lockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  // 2x2 Metric Grid (Centered Layout matching Artist Profile Screen)
  metricsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginBottom: spacing.l 
  },
  metricCardWrapper: { 
    width: '48%', 
    marginBottom: spacing.m 
  },
  metricCardInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  metricIconBg: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    alignSelf: 'center',
  },
  metricValue: { 
    fontSize: 22,
    fontWeight: '900', 
    color: colors.textMainLight,
    fontFamily: typography.fontFamily,
    marginBottom: 2,
    textAlign: 'center',
  },
  metricLabel: { 
    color: colors.textMuted, 
    fontWeight: '700',
    fontSize: 12,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },

  // Section Headers & Lists
  sectionContainer: { marginBottom: spacing.xl },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: spacing.m 
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  sectionTitle: { 
    fontSize: 16.5,
    fontWeight: '800', 
    color: colors.textMainLight,
    fontFamily: typography.fontFamily,
  },
  seeAllText: { 
    color: colors.primary, 
    fontFamily: typography.fontFamily, 
    fontWeight: '800',
    fontSize: 13,
  },
  applicantsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  applicantCardGrid: { 
    width: '48%', 
    backgroundColor: colors.surfaceLight, 
    padding: spacing.m, 
    borderRadius: 18, 
    marginBottom: spacing.m, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 6, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  applicantGridAvatar: { width: 56, height: 56, borderRadius: 28, marginBottom: spacing.s },
  applicantGridInfo: { width: '100%', alignItems: 'center' },
  applicantName: { 
    fontWeight: '800', 
    fontSize: 14,
    color: colors.textMainLight,
    fontFamily: typography.fontFamily,
  },
  applicantRole: { 
    color: colors.textMuted, 
    marginTop: 3, 
    fontWeight: '600',
    fontSize: 11.5,
    textAlign: 'center',
    fontFamily: typography.fontFamily,
  },
  auditionCarouselCard: { 
    backgroundColor: colors.surfaceLight, 
    padding: 0, 
    borderRadius: 18, 
    width: 220, 
    marginRight: spacing.m, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 10, 
    borderWidth: 1, 
    borderColor: colors.borderLight, 
    overflow: 'hidden' 
  },
  auditionCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.s },
  auditionCardTitle: { 
    flex: 1, 
    fontWeight: '800', 
    marginRight: 6, 
    fontSize: 14.5,
    color: colors.textMainLight,
    fontFamily: typography.fontFamily,
  },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 3.5, borderRadius: 8 },
  activeBadgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  auditionStatsRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#EFF6FF', 
    paddingHorizontal: 10,
    paddingVertical: 7, 
    borderRadius: 10,
    marginTop: 4,
    gap: 6,
  },
  auditionStatText: { color: colors.primary, fontWeight: '800', fontSize: 12, fontFamily: typography.fontFamily },
  draftCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.surfaceLight, 
    padding: spacing.m, 
    borderRadius: 18, 
    marginBottom: spacing.m, 
    borderWidth: 1.5, 
    borderColor: '#FBCFE8', 
    borderStyle: 'dashed' 
  },
  draftIconBg: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: '#FDF2F8', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: spacing.m 
  },
  draftTitle: { color: colors.textMainLight, fontWeight: '800', fontSize: 14.5, fontFamily: typography.fontFamily },
  draftDate: { color: colors.textSecondaryLight, marginTop: 2, fontWeight: '600', fontSize: 12, fontFamily: typography.fontFamily },
  draftEditText: { color: '#DB2777', fontWeight: '800', fontSize: 13, fontFamily: typography.fontFamily },
  talentCard: { 
    backgroundColor: colors.surfaceLight, 
    borderRadius: 20, 
    width: 150, 
    marginRight: spacing.m, 
    padding: spacing.m, 
    alignItems: 'center', 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  talentAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: spacing.s, borderWidth: 2.5, borderColor: '#FEF3C7' },
  talentName: { color: colors.textMainLight, fontWeight: '800', textAlign: 'center', fontSize: 14, fontFamily: typography.fontFamily },
  talentCategory: { color: colors.primary, textAlign: 'center', marginTop: 3, fontWeight: '700', fontSize: 12, fontFamily: typography.fontFamily },
  interviewCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.surfaceLight, 
    padding: spacing.m, 
    borderRadius: 18, 
    marginBottom: spacing.m, 
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  interviewDateBox: { 
    backgroundColor: '#4F46E5', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 14, 
    alignItems: 'center', 
    width: 60, 
    marginRight: spacing.m 
  },
  interviewMonth: { color: '#EEF2FF', textTransform: 'uppercase', fontWeight: '900', fontSize: 11, fontFamily: typography.fontFamily },
  interviewDay: { color: '#FFFFFF', marginTop: 2, fontWeight: '900', fontSize: 18, fontFamily: typography.fontFamily },
  interviewInfo: { flex: 1 },
  interviewName: { color: colors.textMainLight, fontWeight: '800', fontSize: 14.5, fontFamily: typography.fontFamily },
  interviewRole: { color: colors.textSecondaryLight, marginTop: 2, fontWeight: '600', fontSize: 12, fontFamily: typography.fontFamily },
  interviewBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#EEF2FF', borderRadius: 12 },
  interviewBtnText: { color: '#4F46E5', fontWeight: '800', fontSize: 13, fontFamily: typography.fontFamily },
  chartSection: { 
    backgroundColor: colors.surfaceLight, 
    padding: spacing.l, 
    borderRadius: 22, 
    marginBottom: spacing.xl, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emptyState: { 
    backgroundColor: colors.backgroundLight, 
    padding: spacing.l, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: colors.borderLight, 
    borderStyle: 'dashed' 
  },
  emptyStateText: { color: colors.textSecondaryLight, fontWeight: '700', fontSize: 13, fontFamily: typography.fontFamily },
  
  // Checklist Modal Styles
  checklistModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  checklistModalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.l,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: typography.fontFamily,
  },
  checklistCloseBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1.2,
  },
  checklistEmojiBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
  },
  checklistWeightBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  checklistActionBtn: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  checklistActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14.5,
    fontFamily: typography.fontFamily,
  },

  // Disclaimer Modal Styles
  disclaimerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  disclaimerContainer: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  disclaimerTitle: {
    ...typography.h2,
    color: colors.error,
    marginBottom: spacing.l,
    fontWeight: 'bold',
  },
  disclaimerText: {
    ...typography.body2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.m,
    lineHeight: 22,
  },
  disclaimerActions: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.m,
  },
  disclaimerBtn: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: 12,
    alignItems: 'center',
  },
  disclaimerBtnDeny: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disclaimerBtnAgree: {
    backgroundColor: colors.primary,
  },
  disclaimerBtnTextDeny: {
    ...typography.button,
    color: colors.textMainLight,
  },
  disclaimerBtnTextAgree: {
    ...typography.button,
    color: colors.white,
  },
});

