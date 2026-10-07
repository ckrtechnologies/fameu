import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image, Dimensions, Modal, Text, Animated, Easing, Platform, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing, globalStyles } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import ImageWithFallback from '../../components/core/ImageWithFallback';
import AuditionCard from '../../components/artist/AuditionCard';
import AuditionPeekModal from '../../components/artist/AuditionPeekModal';
import { useGetFeedQuery, useGetMyApplicationsQuery, useGetSavedAuditionsQuery, useGetBannersQuery } from '../../services/discoverApi';
import { useGetProfileQuery } from '../../services/profileApi';
import { useGetNotificationsQuery } from '../../services/notificationsApi';
import { useRefetchOnFocus } from '../../hooks/useRefetchOnFocus';
import { useAcceptDisclaimerMutation } from '../../services/authApi';
import { logout } from '../../store/slices/authSlice';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Search, MessageCircle, Briefcase, Users, Bell, Bookmark, TrendingUp, Compass, Star, ChevronRight, Video, Calendar, ShieldCheck, CheckCircle2, Clock, Sparkles, XCircle } from 'lucide-react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Linking } from 'react-native';
import AppIcon, {
  LiveRadarIcon,
  ClapperRoleIcon,
  NearbySpotlightIcon,
  VerifiedTrustShieldIcon,
  ProTalentStarIcon,
  ProfileViewsStatIcon,
  ApplicationsStatIcon,
  ShortlistedStatIcon,
  ProfileRocketIcon,
} from '../../components/icons';
import { calculateArtistProfileScore, getArtistProfileChecklist } from '../../utils/profileScoring';

const { width } = Dimensions.get('window');

function LiveFeatureTicker({ items, onPress, colors }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!items || items.length <= 1) return;
    const interval = setInterval(() => {
      // 1. Slide up & fade out
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
          backgroundColor: colors.surface,
          borderColor: currentItem.themeColor + '40',
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
          {/* Custom Vibrant Icon Container */}
          <View style={[stylesTicker.iconBadge, { backgroundColor: currentItem.badgeBg || (currentItem.themeColor + '18') }]}>
            {IconComp ? <IconComp size={18} /> : null}
          </View>

          {/* Headline Text */}
          <View style={{ flex: 1, marginLeft: 9, marginRight: 6 }}>
            <Text
              style={[stylesTicker.tickerText, { color: colors.textMain }]}
              numberOfLines={1}
            >
              <Text style={{ fontWeight: '800', color: currentItem.themeColor }}>{currentItem.countHighlight} </Text>
              {currentItem.text}
            </Text>
          </View>

          {/* Right Highlight Badge */}
          {currentItem.highlight && (
            <View style={[stylesTicker.tickerHighlightBadge, { backgroundColor: currentItem.themeColor + '20' }]}>
              <Text style={[stylesTicker.tickerHighlightText, { color: currentItem.themeColor }]}>{currentItem.highlight}</Text>
            </View>
          )}
        </Animated.View>
      </View>
      <ChevronRight size={15} color={currentItem.themeColor} />
    </TouchableOpacity>
  );
}

const stylesTicker = StyleSheet.create({
  tickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.2,
    marginTop: 2,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tickerContent: {
    flex: 1,
    overflow: 'hidden',
    height: 26,
    justifyContent: 'center',
    marginRight: 4,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickerText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  tickerHighlightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tickerHighlightText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
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

  const { data: notificationsData, refetch: refetchNotifs } = useGetNotificationsQuery();
  useRefetchOnFocus(refetchNotifs);
  const hasUnreadNotifications = notificationsData?.data?.some(n => !n.is_read);

  const { data: bannersData, refetch: refetchBanners } = useGetBannersQuery();
  useRefetchOnFocus(refetchBanners);
  const banners = bannersData || [];

  const [refreshing, setRefreshing] = useState(false);
  
  // Peek Modal State
  const [peekVisible, setPeekVisible] = useState(false);
  const [peekAuditions, setPeekAuditions] = useState([]);
  const [peekIndex, setPeekIndex] = useState(0);

  // Profile Checklist Modal State
  const [isChecklistVisible, setIsChecklistVisible] = useState(false);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  
  const scrollYRef = useRef(null);
  if (!scrollYRef.current) {
    scrollYRef.current = new Animated.Value(0);
  }
  const scrollY = scrollYRef.current;

  const getProfileChecklist = (p) => getArtistProfileChecklist(p, user);


  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchFeed(), refetchAll(), refetchLive(), refetchTrending(),
        refetchProfile(), refetchApps(), refetchSaved(), refetchNotifs(), refetchBanners()
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchFeed, refetchAll, refetchLive, refetchTrending, refetchProfile, refetchApps, refetchSaved, refetchNotifs, refetchBanners]);

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
  
  const profileCompletePct = Math.max(profile?.profile_complete_pct || 0, calculateArtistProfileScore(profile, user));

  // Header Shrinking Interpolations
  const headerPaddingVertical = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [10, 4],
    extrapolate: 'clamp',
  });

  const avatarSize = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [40, 32],
    extrapolate: 'clamp',
  });

  const avatarRadius = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [20, 16],
    extrapolate: 'clamp',
  });

  const nameFontSize = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [19.5, 16],
    extrapolate: 'clamp',
  });

  const greetingHeight = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [18, 0],
    extrapolate: 'clamp',
  });

  const greetingOpacity = scrollY.interpolate({
    inputRange: [0, 25],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const tickerHeight = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [38, 0],
    extrapolate: 'clamp',
  });

  const tickerOpacity = scrollY.interpolate({
    inputRange: [0, 35],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerBorderOpacity = scrollY.interpolate({
    inputRange: [0, 25],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const tickerItems = [
    {
      id: 'live',
      IconComponent: LiveRadarIcon,
      themeColor: '#EF4444',
      badgeBg: '#FEE2E2',
      countHighlight: `${liveData?.data?.length || 8} Live`,
      text: 'Auditions happening right now',
      highlight: 'Live Now',
    },
    {
      id: 'foryou',
      IconComponent: ClapperRoleIcon,
      themeColor: '#2563EB',
      badgeBg: '#DBEAFE',
      countHighlight: `${feedData?.data?.length || 14} Roles`,
      text: `matching ${(categories[0]) || 'Actor'} profile`,
      highlight: 'For You',
    },
    {
      id: 'nearby',
      IconComponent: NearbySpotlightIcon,
      themeColor: '#059669',
      badgeBg: '#D1FAE5',
      countHighlight: 'Casting Calls',
      text: `open in ${(profile?.city) || 'Mumbai / Delhi'}`,
      highlight: 'Nearby',
    },
    {
      id: 'verified',
      IconComponent: VerifiedTrustShieldIcon,
      themeColor: '#6366F1',
      badgeBg: '#EEF2FF',
      countHighlight: '100% Verified',
      text: 'Production calls • Zero scams',
      highlight: 'Trust',
    },
    {
      id: 'pro',
      IconComponent: ProTalentStarIcon,
      themeColor: '#D97706',
      badgeBg: '#FEF3C7',
      countHighlight: 'Pro Tip:',
      text: 'Add showreel to get 50% more calls',
      highlight: 'Pro',
    },
  ];

  const renderWelcomeHeader = () => (
    <Animated.View
      style={[
        styles.stickyHeader,
        {
          backgroundColor: colors.headerBackground || '#131418',
          borderBottomColor: 'rgba(227, 176, 75, 0.15)',
          borderBottomWidth: StyleSheet.hairlineWidth,
          paddingVertical: 10,
        },
      ]}
    >
      <View style={styles.headerTopRow}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginRight: 10 }}>
            <Animated.View style={{ width: avatarSize, height: avatarSize, borderRadius: avatarRadius, overflow: 'hidden', borderWidth: 1.5, borderColor: '#E3B04B' }}>
              {profile?.avatar_url || user?.avatar_url ? (
                <ImageWithFallback source={{ uri: profile?.avatar_url }} fallbackSource={{ uri: user?.avatar_url }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <View style={{ width: '100%', height: '100%', backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="body" style={{ color: '#1A1200', fontWeight: 'bold' }}>{name.charAt(0).toUpperCase()}</Typography>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Animated.View style={{ height: greetingHeight, opacity: greetingOpacity, overflow: 'hidden' }}>
              <Text style={styles.greetingText}>Good Morning,</Text>
            </Animated.View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Animated.Text style={[styles.nameText, { fontSize: nameFontSize }]} numberOfLines={1}>
                {name}
              </Animated.Text>
              <ShieldCheck size={18} color="#E3B04B" style={{ marginLeft: 5 }} />
            </View>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ArtistDiscovery')}>
            <Search size={21} color="#E3B04B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <Bell size={21} color="#E3B04B" />
            {hasUnreadNotifications && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderBannerCarousel = () => {
    if (!banners || banners.length === 0) return null;
    return (
      <View style={{ marginBottom: 16, marginHorizontal: -spacing.l }}>  
        <FlatList
          data={banners}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          snapToInterval={width - spacing.l * 2 + 16} // width of item + margin
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: spacing.l }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => item.target_link && Linking.openURL(item.target_link).catch(() => {})}
              style={{ width: width - spacing.l * 2, height: (width - spacing.l * 2) * 0.45, marginRight: 16, borderRadius: 12, overflow: 'hidden' }}
            >
              <Image source={{ uri: item.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderProfileBanner = () => {
    if (profileCompletePct >= 100) return null;
    const checklistItems = getProfileChecklist(profile);
    const pendingItems = checklistItems.filter(i => !i.completed);

    return (
      <View style={styles.profileSectionWrapper}>
        <TouchableOpacity style={styles.profileBanner} activeOpacity={0.88} onPress={() => setIsChecklistVisible(true)}>
          <View style={styles.profileBannerTopRow}>
            <View style={styles.profileRocketBadge}>
              <ProfileRocketIcon size={38} />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.profileBannerTitle}>Profile Strength</Text>
                <View style={[styles.profileStrengthBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Text style={[styles.profileStrengthText, { color: colors.primary }]}>
                    ⚡ {profileCompletePct}%
                  </Text>
                </View>
              </View>
              <Text style={styles.profileBannerSub} numberOfLines={1}>
                {profileCompletePct === 100
                  ? '🎉 Profile 100% complete! Ready for top recruiters.'
                  : `Complete ${pendingItems.length} more item${pendingItems.length > 1 ? 's' : ''} to get 2x more callbacks`}
              </Text>
            </View>
          </View>

          <View style={styles.profileBannerProgressRow}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${profileCompletePct}%`, backgroundColor: colors.primary }]} />
            </View>
            <TouchableOpacity 
              style={styles.viewChecklistPill} 
              onPress={() => setIsChecklistVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.viewChecklistText, { color: colors.primary }]}>Checklist →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Horizontal Pending Task Cards with Emojis */}
        {profileCompletePct < 100 && (
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
                  onPress={() => {
                    if (item.targetScreen === 'ArtistCategory') {
                      navigation.navigate('ArtistCategory');
                    } else {
                      navigation.navigate('EditProfile');
                    }
                  }}
                  style={[
                    styles.pendingCard,
                    {
                      borderColor: item.completed ? '#BBF7D0' : colors.borderLight,
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

        {/* Profile Checklist Modal */}
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
                  <Text style={[styles.checklistTitle, { color: colors.textMainLight }]}>Profile Setup Checklist</Text>
                  <Text style={{ color: colors.primary, fontWeight: 'bold', marginTop: 4 }}>
                    ⚡ {profileCompletePct}% Completed
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setIsChecklistVisible(false)}
                  style={styles.checklistCloseBtn}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Icon name="close" size={24} color={colors.textMutedLight} />
                </TouchableOpacity>
              </View>

              <View style={[styles.progressBarBg, { marginTop: 14, marginBottom: 16, marginRight: 0 }]}>
                <View style={[styles.progressBarFill, { width: `${profileCompletePct}%` }]} />
              </View>

              <ScrollView style={{ maxHeight: Dimensions.get('window').height * 0.48 }} showsVerticalScrollIndicator={false}>
                {checklistItems.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    activeOpacity={0.7}
                    onPress={() => {
                      setIsChecklistVisible(false);
                      if (item.targetScreen === 'ArtistCategory') {
                        navigation.navigate('ArtistCategory');
                      } else {
                        navigation.navigate('EditProfile');
                      }
                    }}
                    style={[
                      styles.checklistItemRow, 
                      { 
                        backgroundColor: item.completed ? 'rgba(34, 197, 94, 0.08)' : colors.surfaceLight,
                        borderColor: item.completed ? 'rgba(34, 197, 94, 0.3)' : colors.borderLight,
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
                        <Text style={{ fontSize: 11, color: colors.textMutedLight, marginTop: 2 }}>
                          {item.hint}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.checklistWeightBadge, { backgroundColor: item.completed ? '#DCFCE7' : item.bg }]}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: item.completed ? "#16A34A" : item.color }}>
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
                  navigation.navigate('EditProfile');
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Complete Remaining Info</Text>
                <Icon name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  };


  const renderOverviewStats = () => {
    const totalApps = myApplications.length;
    const shortlistedStatuses = ['shortlisted', 'interview_scheduled', 'hired'];
    const shortlisted = myApplications.filter(a => shortlistedStatuses.includes(a.status?.toLowerCase())).length;
    const visits = profile?.visit_count ?? profile?.stats?.views ?? 0;

    return (
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statCard} activeOpacity={0.8} onPress={() => navigation.navigate('ProfileVisitors')}>
          <View style={[styles.statIconBadge, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
            <ProfileViewsStatIcon size={28} />
          </View>
          <Text style={[styles.statNumber, { color: colors.textMainLight }]}>{visits}</Text>
          <Text style={[styles.statLabel, { color: colors.textMutedLight }]}>Profile Views</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} activeOpacity={0.8} onPress={() => navigation.navigate('Applications', { initialTab: 'Pending' })}>
          <View style={[styles.statIconBadge, { backgroundColor: '#F3E8FF', borderColor: '#DDD6FE' }]}>
            <ApplicationsStatIcon size={28} />
          </View>
          <Text style={[styles.statNumber, { color: colors.textMainLight }]}>{totalApps}</Text>
          <Text style={[styles.statLabel, { color: colors.textMutedLight }]}>Applied</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} activeOpacity={0.8} onPress={() => navigation.navigate('Applications', { initialTab: 'Accepted' })}>
          <View style={[styles.statIconBadge, { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' }]}>
            <ShortlistedStatIcon size={28} />
          </View>
          <Text style={[styles.statNumber, { color: '#059669' }]}>{shortlisted}</Text>
          <Text style={[styles.statLabel, { color: colors.textMutedLight }]}>Shortlisted</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={() => navigation.navigate('Auditions')}>
        <View style={[styles.actionBtnIcon, { backgroundColor: '#0284C7' }]}>
          <AppIcon name="discover" size={28} color="#FFFFFF" />
        </View>
        <Typography variant="body" style={styles.actionBtnText}>Discover</Typography>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={() => navigation.navigate('Inbox')}>
        <View style={[styles.actionBtnIcon, { backgroundColor: '#F59E0B' }]}>
          <AppIcon name="messages" size={28} color="#FFFFFF" />
        </View>
        <Typography variant="body" style={styles.actionBtnText}>Messages</Typography>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={() => navigation.navigate('Profile')}>
        <View style={[styles.actionBtnIcon, { backgroundColor: '#8B5CF6' }]}>
          <AppIcon name="portfolio" size={28} color="#FFFFFF" />
        </View>
        <Typography variant="body" style={styles.actionBtnText}>Portfolio</Typography>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={() => navigation.navigate('ArtistDiscovery')}>
        <View style={[styles.actionBtnIcon, { backgroundColor: '#10B981' }]}>
          <AppIcon name="network" size={28} color="#FFFFFF" />
        </View>
        <Typography variant="body" style={styles.actionBtnText}>Network</Typography>
      </TouchableOpacity>
    </View>
  );

  const renderRecentApplications = () => {
    const recent = myApplications.slice(0, 3);
    if (recent.length === 0) return null;

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>Recent Applications</Typography>
          <TouchableOpacity onPress={() => navigation.navigate('Applications')}>
            <Typography variant="bodySmall" style={styles.seeAllText}>See All</Typography>
          </TouchableOpacity>
        </View>

        {recent.map(app => {
          const s = String(app.status || 'pending').toLowerCase().trim();
          let bg = '#FEF3C7';
          let borderColor = '#FDE68A';
          let textColor = '#B45309';
          let label = 'In Review';
          let IconComponent = Clock;

          if (s === 'hired') {
            bg = '#DCFCE7';
            borderColor = '#BBF7D0';
            textColor = '#15803D';
            label = 'Hired';
            IconComponent = CheckCircle2;
          } else if (s === 'shortlisted' || s === 'accepted') {
            bg = '#DBEAFE';
            borderColor = '#BFDBFE';
            textColor = '#1D4ED8';
            label = 'Shortlisted';
            IconComponent = Sparkles;
          } else if (s === 'interview_scheduled') {
            bg = '#E0E7FF';
            borderColor = '#C7D2FE';
            textColor = '#4338CA';
            label = 'Interview';
            IconComponent = Calendar;
          } else if (s === 'rejected') {
            bg = '#FEE2E2';
            borderColor = '#FECACA';
            textColor = '#B91C1C';
            label = 'Not Selected';
            IconComponent = XCircle;
          }

          const photoUrl = app.auditions?.thumbnail_url || app.auditions?.banner_url || app.auditions?.image_url || app.auditions?.hiring_profiles?.logo_url;

          return (
            <TouchableOpacity 
              key={app.id} 
              style={styles.applicationCard}
              onPress={() => navigation.navigate('ApplicationDetail', { application: app })}
              activeOpacity={0.8}
            >
              {photoUrl ? (
                <ImageWithFallback 
                  source={{ uri: photoUrl }} 
                  fallbackSource={{ uri: app.auditions?.hiring_profiles?.logo_url }}
                  style={{ width: 44, height: 44, borderRadius: 12, marginRight: 12 }} 
                />
              ) : (
                <View style={styles.appIconBg}>
                  <Briefcase size={20} color={colors.primary} />
                </View>
              )}
              <View style={{ flex: 1, marginRight: 10 }}>
                <Typography variant="body" style={styles.appTitle} numberOfLines={1}>
                  {app.auditions?.title || 'Audition'}
                </Typography>
                <Typography variant="caption" style={styles.appDate}>
                  Applied {timeAgo(app.created_at)}
                </Typography>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: bg, borderColor, borderWidth: 1 }]}>
                <IconComponent size={12} color={textColor} strokeWidth={2.5} style={{ marginRight: 4 }} />
                <Typography variant="caption" style={[styles.statusText, { color: textColor }]}>
                  {label}
                </Typography>
              </View>
            </TouchableOpacity>
          );
        })}
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
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
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
          contentContainerStyle={styles.listContent}
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
                  <ImageWithFallback source={{ uri: item.thumbnail_url }} fallbackSource={{ uri: item.hiring_profiles?.logo_url }} style={{ width: 60, height: 60, borderRadius: 12 }} />
               </View>
               <Typography variant="body" style={styles.savedTitle} numberOfLines={2}>{item.title}</Typography>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderUpcomingSchedule = () => {
    const upcoming = myApplications.filter(a => {
      const s = String(a.status || '').toLowerCase().trim();
      return s === 'shortlisted' || s === 'accepted' || s === 'hired';
    });
    if (upcoming.length === 0) return null;

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>Upcoming Schedule</Typography>
          <TouchableOpacity onPress={() => navigation.navigate('Applications', { initialTab: 'Shortlisted' })}>
            <Typography variant="bodySmall" style={styles.seeAllText}>View All</Typography>
          </TouchableOpacity>
        </View>
        {upcoming.map((app, idx) => {
          const s = String(app.status || '').toLowerCase().trim();
          const isHired = s === 'hired';
          const targetDateStr = app.auditions?.audition_date || app.auditions?.date || app.auditions?.specific_start_date || app.auditions?.start_date || app.auditions?.created_at || app.created_at;
          
          let month = '';
          let day = '';
          if (targetDateStr) {
            try {
              const d = new Date(targetDateStr);
              if (!isNaN(d.getTime())) {
                month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
                day = d.getDate().toString().padStart(2, '0');
              }
            } catch(e) {}
          }
          
          const venue = app.auditions?.venue_address || app.auditions?.city || app.auditions?.hiring_profiles?.company_name || 'TBA';

          const photoUrl = app.auditions?.thumbnail_url || app.auditions?.banner_url || app.auditions?.image_url || app.auditions?.hiring_profiles?.logo_url;

          return (
            <TouchableOpacity 
              key={app.id || idx} 
              style={styles.scheduleCard}
              onPress={() => navigation.navigate('ApplicationDetail', { application: app })}
              activeOpacity={0.8}
            >
              {photoUrl ? (
                <ImageWithFallback 
                  source={{ uri: photoUrl }} 
                  fallbackSource={{ uri: app.auditions?.hiring_profiles?.logo_url }}
                  style={{ width: 48, height: 48, borderRadius: 10, marginRight: 12 }} 
                />
              ) : (
                <View style={styles.dateBlock}>
                  {month && day ? (
                    <>
                      <Typography variant="caption" style={styles.dateMonth}>{month}</Typography>
                      <Typography variant="h3" style={styles.dateDay}>{day}</Typography>
                    </>
                  ) : (
                    <Calendar size={22} color={colors.primary} />
                  )}
                </View>
              )}
              <View style={styles.scheduleInfo}>
                <Typography variant="body" style={styles.scheduleTitle} numberOfLines={1}>
                  {app.auditions?.title || 'Audition'}
                </Typography>
                <Typography variant="caption" style={styles.scheduleSub} numberOfLines={1}>
                  📍 {venue}
                </Typography>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.statusBadge, { 
                  backgroundColor: isHired ? '#DCFCE7' : '#DBEAFE', 
                  borderColor: isHired ? '#BBF7D0' : '#BFDBFE', 
                  borderWidth: 1, 
                  marginRight: 8 
                }]}>
                  {isHired ? (
                    <CheckCircle2 size={11} color="#15803D" strokeWidth={2.5} style={{ marginRight: 3 }} />
                  ) : (
                    <Sparkles size={11} color="#1D4ED8" strokeWidth={2.5} style={{ marginRight: 3 }} />
                  )}
                  <Typography variant="caption" style={[styles.statusText, { color: isHired ? '#15803D' : '#1D4ED8', fontSize: 11 }]}>
                    {isHired ? 'Hired' : 'Shortlisted'}
                  </Typography>
                </View>
                <ChevronRight size={18} color={colors.textMutedLight} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderActivityChart = () => {
    let dataPoints = [0, 0, 0, 0, 0, 0, 0];
    let labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    if (myApplications && myApplications.length > 0) {
      const today = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
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

      dataPoints = last7Days.map(d => d.count);
      labels = last7Days.map(d => d.dayName);
    }
    
    const maxVal = Math.max(...dataPoints);

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>Application Growth</Typography>
          <Text style={{ fontSize: 12, color: colors.textMutedLight, fontWeight: '600' }}>Last 7 Days</Text>
        </View>
        <BarChart
          data={{
            labels,
            datasets: [
              {
                data: dataPoints,
                colors: [
                  () => '#3B82F6',
                  () => '#06B6D4',
                  () => '#10B981',
                  () => '#F59E0B',
                  () => '#EC4899',
                  () => '#8B5CF6',
                  () => '#6366F1',
                ]
              }
            ]
          }}
          width={width - spacing.xl * 2}
          height={190}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero={true}
          withInnerLines={true}
          withCustomBarColorFromFunction={true}
          flatColor={true}
          showValuesOnTopOfBars={maxVal > 0}
          chartConfig={{
            backgroundColor: colors.surfaceLight,
            backgroundGradientFrom: colors.surfaceLight,
            backgroundGradientTo: colors.surfaceLight,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            labelColor: (opacity = 1) => colors.textMutedLight,
            barPercentage: 0.55,
            fillShadowGradientOpacity: 1,
            propsForBackgroundLines: {
              strokeDasharray: '4 4',
              stroke: colors.borderLight,
              strokeWidth: 1,
            },
            propsForLabels: {
              fontSize: 11,
              fontWeight: '600',
            }
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.borderLight,
            paddingRight: 20,
            paddingTop: 14,
            backgroundColor: colors.surfaceLight,
          }}
        />
      </View>
    );
  };

  const PRO_TIPS = [
    {
      id: 'tip_1',
      category: 'SHOWREELS',
      badgeIcon: 'videocam',
      badgeBg: '#EDE9FE',
      badgeColor: '#8B5CF6',
      title: 'Showreel Advantage',
      description: 'Profiles with video showreels get up to 50% more callbacks and recruiter shortlists.',
      actionText: 'Add Showreel',
      actionRoute: 'VideoPortfolio',
    },
    {
      id: 'tip_2',
      category: 'HEADSHOTS',
      badgeIcon: 'camera',
      badgeBg: '#E0F2FE',
      badgeColor: '#0284C7',
      title: 'Natural Lighting',
      description: 'Casting directors prioritize high-res headshots with natural expressions and neutral backdrops.',
      actionText: 'Upload Photos',
      actionRoute: 'EditProfile',
    },
    {
      id: 'tip_3',
      category: 'NETWORKING',
      badgeIcon: 'network',
      badgeBg: '#D1FAE5',
      badgeColor: '#059669',
      title: 'Grow Your Network',
      description: 'Follow casting directors and production agencies to get instant alerts on direct casting calls.',
      actionText: 'Explore Network',
      actionRoute: 'ArtistDiscovery',
    },
    {
      id: 'tip_4',
      category: 'SPECIAL SKILLS',
      badgeIcon: 'skills',
      badgeBg: '#FEF3C7',
      badgeColor: '#D97706',
      title: 'Tag Special Skills',
      description: 'Tag special talents like voice-modulation, martial arts, or languages to appear in niche searches.',
      actionText: 'Update Skills',
      actionRoute: 'EditProfile',
    },
  ];

  const renderProTips = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ ...typography.h3, color: colors.textMainLight }}>💡 Pro Tips for Artists</Text>
        </View>
      </View>
      <FlatList
        data={PRO_TIPS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        snapToInterval={width - spacing.xl * 2}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (width - spacing.xl * 2));
          setActiveTipIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={[styles.proTipCarouselCard, { width: width - spacing.xl * 2, backgroundColor: colors.surfaceLight, borderColor: colors.borderLight }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.proTipIconBadge, { backgroundColor: item.badgeBg }]}>
                  <AppIcon name={item.badgeIcon} size={22} />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: item.badgeColor, letterSpacing: 0.8 }}>{item.category}</Text>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: colors.textMainLight }}>{item.title}</Text>
                </View>
              </View>
            </View>
            <Text style={{ fontSize: 13, color: colors.textMutedLight, lineHeight: 19, marginBottom: 14 }}>{item.description}</Text>
            <TouchableOpacity 
              style={[styles.proTipActionBtn, { backgroundColor: item.badgeColor }]}
              onPress={() => navigation.navigate(item.actionRoute)}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{item.actionText} →</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.proTipPagination}>
        {PRO_TIPS.map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.proTipDot, 
              { 
                backgroundColor: i === activeTipIndex ? colors.primary : colors.borderLight,
                width: i === activeTipIndex ? 18 : 6,
              }
            ]} 
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? Math.max(insets.top, (StatusBar.currentHeight || 24)) + 4 : insets.top }]}>
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

      {/* Sticky Shrinking Header with Live Ticker */}
      {renderWelcomeHeader()}

      <Animated.ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        {/* Ticker + Banner carousel on dark header background — zero white gap */}
        <View style={styles.tickerWrapper}>
          <LiveFeatureTicker
            items={tickerItems}
            colors={colors}
            onPress={() => navigation.navigate('Auditions')}
          />
          {renderBannerCarousel()}
        </View>

        {/* Body content with horizontal padding */}
        <View style={styles.bodyContent}>
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
        </View>
      </Animated.ScrollView>

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
  safeArea: { flex: 1, backgroundColor: '#131418' },
  container: { flex: 1, backgroundColor: colors.backgroundLight },
  scrollContent: { paddingHorizontal: 0, paddingTop: 0 },
  tickerWrapper: {
    backgroundColor: '#131418',
    paddingHorizontal: spacing.l,
    paddingBottom: 0,
  },
  bodyContent: {
    paddingHorizontal: spacing.l,
    paddingTop: 16,
  },
  loadingSafeArea: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundLight },
  
  // 1. Header
  stickyHeader: { paddingHorizontal: spacing.l, zIndex: 10 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeftGroup: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  greetingText: { color: colors.headerSubtitle || '#9CA3AF', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  nameText: { color: colors.headerText || '#FFFFFF', fontWeight: '800' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    backgroundColor: 'rgba(227, 176, 75, 0.08)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 10, 
    borderWidth: 1, 
    borderColor: 'rgba(227, 176, 75, 0.3)' 
  },
  notificationBadge: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error, borderWidth: 1, borderColor: '#fff' },

  // 2. Banner & Pending Cards
  profileSectionWrapper: {
    marginBottom: spacing.l,
  },
  profileBanner: { 
    backgroundColor: colors.surface, 
    borderRadius: 18, 
    padding: 16, 
    borderWidth: 1.2, 
    borderColor: colors.borderLight, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 6, 
    elevation: 2 
  },
  profileBannerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  profileRocketBadge: { width: 54, height: 54, borderRadius: 16, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center' },
  profileBannerTitle: { fontSize: 17, fontWeight: '800', color: colors.textMain },
  profileStrengthBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  profileStrengthText: { fontSize: 13, fontWeight: '900' },
  profileBannerSub: { fontSize: 13.5, color: colors.textMuted, marginTop: 3, lineHeight: 19 },
  profileBannerProgressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: colors.borderLight, borderRadius: 4, overflow: 'hidden', marginRight: 12 },
  progressBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  viewChecklistPill: { paddingHorizontal: 6, paddingVertical: 3 },
  viewChecklistText: { fontSize: 13.5, fontWeight: '800' },

  // Pending Cards Carousel
  pendingCardsContainer: {
    marginTop: 14,
    marginBottom: 4,
  },
  pendingCardsHeader: {
    fontSize: 12.5,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10,
    fontFamily: typography.fontFamily,
  },
  pendingCard: {
    width: 148,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingEmojiText: {
    fontSize: 18,
  },
  pendingWeightPill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  pendingWeightText: {
    fontSize: 11.5,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
  },
  pendingCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    marginBottom: 3,
    color: colors.textMain,
    fontFamily: typography.fontFamily,
  },
  pendingCardHint: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 10,
    fontFamily: typography.fontFamily,
  },
  pendingCardBtn: {
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  pendingCardBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
  },

  // 3. Stats
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginHorizontal: -4, 
    marginTop: 6,
    marginBottom: spacing.l 
  },
  statCard: { flex: 1, backgroundColor: colors.surface, paddingVertical: 16, paddingHorizontal: 6, borderRadius: 18, alignItems: 'center', marginHorizontal: 4, borderWidth: 1.2, borderColor: colors.borderLight, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  statIconBadge: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statNumber: { fontSize: 22, fontWeight: '900', marginBottom: 2, color: colors.textMain },
  statLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted },

  // 4. Quick Actions
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -4, marginTop: 4, marginBottom: spacing.xl },
  actionBtn: { flex: 1, alignItems: 'center', marginHorizontal: 4 },
  actionBtnIcon: { width: 62, height: 62, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 5, elevation: 3 },
  actionBtnText: { fontSize: 13, color: colors.textMain, textAlign: 'center', fontWeight: '700', letterSpacing: 0.2 },

  // Shared Sections
  sectionContainer: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m },
  sectionTitle: { fontSize: 17.5, fontWeight: '800', color: colors.textMain },
  seeAllText: { fontSize: 14, color: colors.primary, fontWeight: '800' },
  listContent: { paddingRight: spacing.m },
  emptyState: { padding: spacing.l, backgroundColor: colors.surface, borderRadius: 14, alignItems: 'center' },
  emptyStateText: { fontSize: 13.5, color: colors.textMuted },

  // 5. Applications
  applicationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 14, borderRadius: 14, marginBottom: 12, borderWidth: 1.2, borderColor: colors.borderLight },
  appIconBg: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  appTitle: { fontSize: 15.5, fontWeight: '700', color: colors.textMain, marginBottom: 4 },
  appDate: { fontSize: 12.5, color: colors.textMuted },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontWeight: '800', fontSize: 13, letterSpacing: 0.2 },

  // 9. Saved Auditions
  savedCard: { width: 105, marginRight: 16, alignItems: 'center' },
  savedIconBg: { width: 64, height: 64, borderRadius: 14, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1.2, borderColor: colors.borderLight },
  savedTitle: { fontSize: 13.5, fontWeight: '700', textAlign: 'center', color: colors.textMain },

  // 10. Schedule
  scheduleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 14, borderRadius: 14, marginBottom: 12, borderWidth: 1.2, borderColor: colors.borderLight },
  dateBlock: { width: 54, height: 54, backgroundColor: colors.primary + '15', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  dateMonth: { fontSize: 12, color: colors.primary, fontWeight: '800', textTransform: 'uppercase' },
  dateDay: { fontSize: 20, color: colors.primary, fontWeight: '900' },
  scheduleInfo: { flex: 1 },
  scheduleTitle: { fontSize: 15, fontWeight: '700', color: colors.textMain, marginBottom: 4 },
  scheduleSub: { fontSize: 13, color: colors.textMuted },

  // 12. Recruiters
  recruiterCard: { width: 136, backgroundColor: colors.surface, padding: 16, borderRadius: 16, alignItems: 'center', marginRight: 16, borderWidth: 1.2, borderColor: colors.borderLight },
  recruiterAvatarBg: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#8b5cf6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  recruiterName: { fontSize: 14.5, fontWeight: '800', color: colors.textMain, marginBottom: 4, textAlign: 'center' },
  recruiterRole: { color: colors.textMuted, fontSize: 12.5, marginBottom: 12, textAlign: 'center' },
  followBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 12, backgroundColor: colors.primary + '15' },
  followBtnText: { fontSize: 13, color: colors.primary, fontWeight: '800' },

  // 14. Pro Tips Carousel
  proTipCarouselCard: { padding: 16, borderRadius: 16, borderWidth: 1.2, marginRight: 16 },
  proTipIconBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  proTipActionBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  proTipPagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  proTipDot: { height: 6, borderRadius: 3, marginHorizontal: 3 },

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
  disclaimerBtnTextAgree: { color: '#fff', fontWeight: 'bold' },

  // Checklist Modal
  checklistModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  checklistModalContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: Dimensions.get('window').height * 0.8 },
  checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  checklistTitle: { fontSize: 18, fontWeight: 'bold' },
  checklistCloseBtn: { padding: 4 },
  checklistItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 14, marginBottom: 8, borderWidth: 1 },
  checklistItemTitle: { fontSize: 14, fontWeight: '600' },
  checklistEmojiBadge: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  checklistWeightBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  checklistActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginTop: 16 }
});

