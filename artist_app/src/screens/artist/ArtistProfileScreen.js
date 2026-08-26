import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Modal, RefreshControl, Linking, FlatList, Animated, Share, Platform, KeyboardAvoidingView } from 'react-native';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AppIcon, {
  default as Icon,
  BasicInfoSectionIcon,
  ShareProfileIcon,
  CintaaGoldBadgeIcon,
  EditPencilIcon,
  AgeProfileIcon,
  GenderProfileIcon,
  HeightProfileIcon,
  WeightProfileIcon,
  PhoneProfileIcon,
  NearbySpotlightIcon,
  LanguagesProfileIcon,
  MediaGallerySectionIcon,
  VideoSectionIcon,
  PreferencesSectionIcon,
  AssignmentsSectionIcon,
  ProfessionCategoryIcon,
} from '../../components/icons';
import { WebView } from 'react-native-webview';
import { parseArray } from '../../utils/dataUtils';

import { useSelector, useDispatch } from 'react-redux';

import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import { useGetProfileQuery } from '../../services/profileApi';
import { useRefetchOnFocus } from '../../hooks/useRefetchOnFocus';
import { useAcceptDisclaimerMutation } from '../../services/authApi';
import { logout } from '../../store/slices/authSlice';
import CommentsSection from '../../components/CommentsSection';
import VerifiedBadge from '../../components/core/VerifiedBadge';
import ImageWithFallback from '../../components/core/ImageWithFallback';
import VideoThumbnail from '../../components/core/VideoThumbnail';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import InAppMediaModal from '../../components/core/InAppMediaModal';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';
import { getVideoInfo } from '../../utils/media';

const { width } = Dimensions.get('window');

const BASIC_INFO_KEYS = ['age', 'gender', 'height', 'weight', 'city', 'languages', 'skills', 'availability_type', 'available_dates'];
const BASIC_INFO_ICONS = {
  age: 'calendar-outline',
  gender: 'male-female-outline',
  height: 'resize-outline',
  weight: 'barbell-outline',
  city: 'location-outline',
  languages: 'language-outline',
  skills: 'star-outline',
  availability_type: 'time-outline',
  available_dates: 'calendar-number-outline'
};
const URL_REGEX = /^(https?:\/\/[^\s]+)$/i;
const MEDIA_REGEX = /\.(mp4|mov|avi|wmv|mkv|mp3|wav|aac|ogg|webm|m4a|flac|jpg|jpeg|png|webp)$/i;

export default function ArtistProfileScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);
  const [acceptDisclaimer, { isLoading: isAccepting }] = useAcceptDisclaimerMutation();
  
  const { data: profileResponse, isLoading, isError, error, refetch } = useGetProfileQuery();
  useRefetchOnFocus(refetch);
  
  const profile = profileResponse?.data;
  const [activeTab, setActiveTab] = useState('Overview');
  const [showComments, setShowComments] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [mediaModalUrl, setMediaModalUrl] = useState(null);
  const [mediaModalTitle, setMediaModalTitle] = useState('');

  const handleOpenMedia = (url, title = '') => {
    if (!url) return;
    const info = getVideoInfo(url);
    if (info?.type === 'direct') {
      navigation.navigate('VideoPortfolio', { isOwner: true, initialIndex: 0 });
    } else {
      setMediaModalTitle(title);
      setMediaModalUrl(url);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      const timer = setTimeout(() => setShowComments(true), 400);
      return () => clearTimeout(timer);
    }
  }, [profile?.id]);

  const {
    scrollY,
    onScroll,
    headerPaddingVertical,
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    avatarSize,
    avatarRadius,
    headerElevation,
  } = useShrinkableHeader();

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const openImageModal = (images, index = 0) => {
    const arr = parseArray(images).filter(Boolean);
    if (arr.length > 0) {
      setModalImages(arr);
      setSelectedImageIndex(index >= 0 && index < arr.length ? index : 0);
      setIsImageModalVisible(true);
    }
  };

  const fullName = profile?.full_name || user?.full_name || 'Artist';
  const username = profile?.users?.username || 'user';
  const avatarUrl = profile?.avatar_url || user?.avatar_url || 'https://via.placeholder.com/150';
  const bio = profile?.bio || 'Add a bio to let casting directors know more about you.';
  const portfolio = profile?.photo_urls || [];
  
  const stats = profile?.stats || { applications: 0, callbacks: 0, views: 0 };
  const followersCount = profile?.users?.followers_count || 0;
  const followingCount = profile?.users?.following_count || 0;
  const is404 = isError && error?.status === 404;
  const categories = useMemo(() => parseArray(profile?.categories), [profile?.categories]);
  const tabs = useMemo(() => ['Overview', ...categories], [categories]);

  const workPreferences = useMemo(() => parseArray(profile?.work_preference), [profile?.work_preference]);
  const preferredCities = useMemo(() => parseArray(profile?.preferred_cities), [profile?.preferred_cities]);
  const lookAlikes = useMemo(() => parseArray(profile?.look_alike), [profile?.look_alike]);
  const hashtags = useMemo(() => parseArray(profile?.hashtags), [profile?.hashtags]);
  const recentAssignments = useMemo(() => parseArray(profile?.recent_assignments), [profile?.recent_assignments]);
  const parsedPhotoUrls = useMemo(() => parseArray(profile?.photo_urls), [profile?.photo_urls]);
  const parsedVideoUrls = useMemo(() => (typeof profile?.video_url === 'string' && profile.video_url.trim().length > 0) ? profile.video_url.split(',').filter(Boolean) : [], [profile?.video_url]);


  const openDrawer = () => {
    navigation.openDrawer();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]} edges={['left', 'right']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError && !is404) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]} edges={['left', 'right']}>
        <Text style={styles.errorText}>Failed to load profile. Please try again.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 404 State
  if (is404 || !profile) {
    return (
      <SafeAreaView style={[styles.safeArea, { flex: 1 }]} edges={[]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 }}>
          <Icon name="person-circle-outline" size={80} color={colors.textMutedLight} />
          <Text style={{ ...typography.h2, color: colors.textMainLight, marginTop: 16 }}>No Profile Yet</Text>
          <TouchableOpacity 
            style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 8, marginTop: 24 }}
            onPress={() => navigation.navigate('ArtistCategory')}
          >
            <Text style={{ color: colors.backgroundLight, fontWeight: 'bold' }}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
              <TouchableOpacity style={[styles.disclaimerBtn, styles.disclaimerBtnDeny]} onPress={() => dispatch(logout())}>
                <Text style={styles.disclaimerBtnTextDeny}>Deny</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.disclaimerBtn, styles.disclaimerBtnAgree]} onPress={async () => {
                try {
                  await acceptDisclaimer().unwrap();
                  dispatch({ type: 'auth/setCredentials', payload: { user: { ...user, disclaimer_accepted: true }, token } });
                } catch (e) {
                  console.error("Failed to accept disclaimer", e);
                }
              }} disabled={isAccepting}>
                {isAccepting ? <ActivityIndicator color="#fff" /> : <Text style={styles.disclaimerBtnTextAgree}>I Agree</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Shrinkable Animated Top Header */}
      <ShrinkableHeader 
        title="Profile"
        showMenu={true}
        onMenuPress={() => navigation.openDrawer()}
        avatarUrl={avatarUrl}
        avatarText={fullName?.charAt(0) || 'A'}
        scrollY={scrollY}
        headerPaddingVertical={headerPaddingVertical}
        headerTitleSize={headerTitleSize}
        subtitleHeight={subtitleHeight}
        subtitleOpacity={subtitleOpacity}
        headerElevation={headerElevation}
        rightActions={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ padding: 4, marginRight: 10 }} onPress={() => navigation.navigate('ArtistDiscovery')}>
              <Icon name="search-outline" size={24} color={colors.textMainLight} />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 4 }} onPress={() => navigation.navigate('Notifications')}>
              <Icon name="notifications-outline" size={24} color={colors.textMainLight} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        removeClippedSubviews={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        
        {/* Instagram Profile Info Row */}
        <View style={styles.profileRow}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => openImageModal([avatarUrl], 0)} style={{ position: 'relative' }}>
            <ImageWithFallback source={{ uri: avatarUrl }} style={[styles.avatarInsta, { borderWidth: 2, borderColor: colors.backgroundLight }]} />
          </TouchableOpacity>
          <View style={styles.statsContainerInsta}>
            <TouchableOpacity 
              style={styles.statBoxInsta}
              onPress={() => navigation.navigate('Applications')}
            >
              <Text style={styles.statNumberInsta}>{stats.applications}</Text>
              <Text style={styles.statLabelInsta}>Applied</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statBoxInsta}
              onPress={() => profile?.user_id && navigation.navigate('ConnectionList', { type: 'followers', userId: profile.user_id })}
            >
              <Text style={styles.statNumberInsta}>{followersCount}</Text>
              <Text style={styles.statLabelInsta}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statBoxInsta}
              onPress={() => profile?.user_id && navigation.navigate('ConnectionList', { type: 'following', userId: profile.user_id })}
            >
              <Text style={styles.statNumberInsta}>{followingCount}</Text>
              <Text style={styles.statLabelInsta}>Following</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statBoxInsta}>
              <Text style={styles.statNumberInsta}>{stats.views || 0}</Text>
              <Text style={styles.statLabelInsta}>Visits</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text style={[styles.fullNameInsta, { marginBottom: 0 }]}>{fullName}</Text>
          </View>
          <Text style={{ ...typography.body, color: colors.textMutedLight, marginBottom: 4 }}>@{username}</Text>
          {categories.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4, marginTop: 2 }}>
              {categories.map((cat, i) => (
                <View key={i} style={{ backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.borderLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 }}>
                  <Text style={{ color: colors.textMainLight, fontSize: 12, fontWeight: '600' }}>{cat}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.bioInsta}>{bio}</Text>
          
          {/* CINTAA Top Bio Badge */}
          {profile?.is_cintaa_member && (
            <View style={styles.cintaaTopBadge}>
              <CintaaGoldBadgeIcon size={18} />
              <Text style={styles.cintaaTopBadgeText}>
                Verified CINTAA Member ({profile.cintaa_reg_number})
              </Text>
            </View>
          )}

          {/* Social Links Row */}
          {profile?.social_links && (
            <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 4, gap: 14 }}>
              {(() => {
                const links = typeof profile.social_links === 'string' 
                  ? JSON.parse(profile.social_links || '{}') 
                  : profile.social_links;
                return (
                  <>
                    {links.instagram ? (
                      <TouchableOpacity onPress={() => Linking.openURL(links.instagram).catch(() => {})}>
                        <Icon name="logo-instagram" size={26} color="#E1306C" />
                      </TouchableOpacity>
                    ) : null}
                    {links.youtube ? (
                      <TouchableOpacity onPress={() => Linking.openURL(links.youtube).catch(() => {})}>
                        <Icon name="logo-youtube" size={26} color="#FF0000" />
                      </TouchableOpacity>
                    ) : null}
                    {links.facebook ? (
                      <TouchableOpacity onPress={() => Linking.openURL(links.facebook).catch(() => {})}>
                        <Icon name="logo-facebook" size={26} color="#1877F2" />
                      </TouchableOpacity>
                    ) : null}
                    {links.snapchat ? (
                      <TouchableOpacity onPress={() => Linking.openURL(links.snapchat).catch(() => {})}>
                        <Icon name="logo-snapchat" size={26} color="#FFFC00" />
                      </TouchableOpacity>
                    ) : null}
                  </>
                );
              })()}
            </View>
          )}

          {/* Symmetrical Action Buttons Row */}
          <View style={styles.profileActionRow}>
            <TouchableOpacity 
              style={[styles.profileActionBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <EditPencilIcon size={16} style={{ marginRight: 8 }} />
              <Text style={[styles.profileActionBtnText, { color: colors.textMainLight }]}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileActionBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
              activeOpacity={0.8}
              onPress={async () => {
                try {
                  await Share.share({
                    message: `Check out my Fameu artist profile: https://fameu.in/artist/${profile?.username || profile?.id}`,
                    title: 'Share My Profile',
                  });
                } catch (e) { console.log(e); }
              }}
            >
              <ShareProfileIcon size={18} style={{ marginRight: 8 }} />
              <Text style={[styles.profileActionBtnText, { color: colors.primary }]}>Share Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {tabs.map(tab => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive, { textTransform: 'capitalize' }]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        {activeTab === 'Overview' ? (
          <View style={styles.portfolioSection}>
            {/* Profile Videos Section */}
            {(() => {
              const profileVideos = [
                { url: profile.intro_video_url, title: 'Intro Video' },
              ].filter(v => v.url && v.url.trim().length > 0);

              if (profileVideos.length === 0) return null;

              return (
                <View style={{ marginBottom: 24, marginHorizontal: spacing.xl }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ backgroundColor: '#FEE2E2', padding: 8, borderRadius: 14, marginRight: 10 }}>
                      <VideoSectionIcon size={24} />
                    </View>
                    <Text style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Profile Videos</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 0 }}>
                    {profileVideos.map((video, index) => (
                      <View key={index} style={{ marginRight: spacing.m, width: 140 }}>
                        <TouchableOpacity 
                          onPress={() => handleOpenMedia(video.url, video.title)}
                          style={{ width: '100%', height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', overflow: 'hidden', borderRadius: 16, position: 'relative', borderWidth: 1, borderColor: colors.borderLight }}
                        >
                          <VideoThumbnail url={video.url} colors={colors} />
                          <View style={{ backgroundColor: 'rgba(0,0,0,0.35)', width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 }}>
                              <Icon name="play" size={24} color={colors.primary} style={{ marginLeft: 3 }} />
                            </View>
                          </View>
                        </TouchableOpacity>
                        <Text style={{ ...typography.caption, color: colors.textMainLight, marginTop: 4, textAlign: 'center' }} numberOfLines={1}>{video.title}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              );
            })()}

            {/* Additional Videos from Portfolio */}
            {parsedVideoUrls.length > 0 && (
              <View style={{ marginBottom: 24, marginHorizontal: spacing.xl }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ backgroundColor: '#FEE2E2', padding: 8, borderRadius: 14, marginRight: 10 }}>
                      <VideoSectionIcon size={24} />
                    </View>
                    <Text style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Video Gallery</Text>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('VideoPortfolio', { isOwner: true })}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>See All</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 0 }}
                  data={parsedVideoUrls}
                  keyExtractor={(_, idx) => `vid-${idx}`}
                  initialNumToRender={2}
                  windowSize={3}
                  renderItem={({ item: vUrl, index: idx }) => (
                    <TouchableOpacity 
                      style={{ width: 140, height: 200, borderRadius: 16, backgroundColor: '#0F172A', marginRight: 12, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', position: 'relative', borderWidth: 1, borderColor: colors.borderLight }}
                      onPress={() => handleOpenMedia(vUrl, `Video ${idx + 1}`)}
                    >
                      <VideoThumbnail url={vUrl} colors={colors} />
                      <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 }}>
                          <Icon name="play" size={24} color={colors.primary} style={{ marginLeft: 3 }} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Basic Info Section */}
            <View style={{ marginBottom: 24, marginHorizontal: spacing.xl }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ backgroundColor: colors.primary + '15', padding: 8, borderRadius: 14, marginRight: 10 }}>
                  <BasicInfoSectionIcon size={24} />
                </View>
                <Text style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Basic Info</Text>
              </View>

              {/* Symmetrical 2-Column Side-by-Side Grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {(() => {
                  const standardInfoItems = [
                    profile.age ? { key: 'age', label: 'Age', value: `${profile.age} yrs`, IconComp: AgeProfileIcon, bg: '#FFF7ED' } : null,
                    profile.gender ? { key: 'gender', label: 'Gender', value: profile.gender, IconComp: GenderProfileIcon, bg: '#FDF2F8' } : null,
                    profile.height ? { key: 'height', label: 'Height', value: profile.height, IconComp: HeightProfileIcon, bg: '#ECFDF5' } : null,
                    profile.weight ? { key: 'weight', label: 'Weight', value: `${profile.weight} kg`, IconComp: WeightProfileIcon, bg: '#EFF6FF' } : null,
                    (profile.alt_number || profile.alternate_phone) ? { key: 'alt_phone', label: 'Alt. Number', value: profile.alt_number || profile.alternate_phone, IconComp: PhoneProfileIcon, bg: '#ECFDF5' } : null,
                    (Array.isArray(profile.languages) && profile.languages.length > 0) ? { key: 'languages', label: 'Languages', value: profile.languages.join(', '), IconComp: LanguagesProfileIcon, bg: '#EFF6FF' } : null,
                    profile.city ? { key: 'city', label: 'Base City', value: profile.city, IconComp: NearbySpotlightIcon, bg: '#F0FDF4' } : null,
                    profile.availability_type ? { key: 'availability', label: 'Availability', value: profile.availability_type, IconComp: null, iconName: 'availability_type', bg: '#FFFBEB' } : null,
                    profile.available_dates ? { key: 'dates', label: 'Dates', value: profile.available_dates, IconComp: null, iconName: 'available_dates', bg: '#EEF2FF' } : null,
                  ].filter(Boolean);

                  return standardInfoItems.map((item) => {
                    const CustomIcon = item.IconComp;
                    return (
                      <View key={item.key} style={styles.basicInfoGridCard}>
                        <View style={[styles.basicInfoIconBadge, { backgroundColor: item.bg }]}>
                          {CustomIcon ? <CustomIcon size={26} /> : <AppIcon name={item.iconName} size={24} />}
                        </View>
                        <Text style={styles.basicInfoLabel}>{item.label}</Text>
                        <Text style={styles.basicInfoValue} numberOfLines={1}>{item.value}</Text>
                      </View>
                    );
                  });
                })()}
              </View>

              {/* Full Width Card: Special Skills */}
              {Array.isArray(profile.skills) && profile.skills.length > 0 && (
                <View style={styles.basicInfoFullCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#FEF3C7' }]}>
                      <AppIcon name="skills" size={20} />
                    </View>
                    <Text style={styles.basicInfoSectionTitle}>Special Skills</Text>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {profile.skills.map((sk, idx) => (
                      <View key={idx} style={[styles.languageChip, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                        <Text style={[styles.languageChipText, { color: '#B45309' }]}>{sk}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Tags / Preferences Section */}
            {(profile.work_preference?.length > 0 || profile.preferred_cities?.length > 0 || profile.look_alike?.length > 0 || profile.hashtags?.length > 0) && (
              <View style={{ marginBottom: 24, marginHorizontal: spacing.xl }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ backgroundColor: '#D1FAE5', padding: 8, borderRadius: 14, marginRight: 10 }}>
                    <PreferencesSectionIcon size={24} />
                  </View>
                  <Text style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Preferences & Tags</Text>
                </View>
                
                {profile.work_preference?.length > 0 && (
                  <View style={styles.basicInfoFullCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#FFEDD5' }]}>
                        <AppIcon name="briefcase" size={18} />
                      </View>
                      <Text style={styles.basicInfoSectionTitle}>Work Preference</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {workPreferences.map((t, i) => (
                        <View key={i} style={[styles.languageChip, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
                          <Text style={[styles.languageChipText, { color: '#C2410C' }]}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                
                {profile.preferred_cities?.length > 0 && (
                  <View style={styles.basicInfoFullCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#CCFBF1' }]}>
                        <AppIcon name="location" size={18} />
                      </View>
                      <Text style={styles.basicInfoSectionTitle}>Preferred Locations</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {preferredCities.map((t, i) => (
                        <View key={i} style={[styles.languageChip, { backgroundColor: '#F0FDFA', borderColor: '#CCFBF1' }]}>
                          <Text style={[styles.languageChipText, { color: '#0F766E' }]}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {profile.look_alike?.length > 0 && (
                  <View style={styles.basicInfoFullCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#F3E8FF' }]}>
                        <AppIcon name="people" size={18} />
                      </View>
                      <Text style={styles.basicInfoSectionTitle}>Look Alikes</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {lookAlikes.map((t, i) => (
                        <View key={i} style={[styles.languageChip, { backgroundColor: '#FAF5FF', borderColor: '#F3E8FF' }]}>
                          <Text style={[styles.languageChipText, { color: '#7E22CE' }]}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {profile.hashtags?.length > 0 && (
                  <View style={{ marginBottom: 20, backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.borderLight }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', padding: 6, borderRadius: 12, marginRight: 8 }}>
                        <Icon name="pricetag" size={16} color="#ec4899" />
                      </View>
                      <Text style={{ ...typography.body, color: colors.textMainLight, fontWeight: '700' }}>Hashtags</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {hashtags.map((t, i) => (
                        <View key={i} style={[styles.chip, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}><Text style={[styles.chipText, { color: '#ec4899' }]}>#{t}</Text></View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Recent Assignments Section */}
            {profile.recent_assignments?.length > 0 && (
              <View style={{ marginBottom: 24, marginHorizontal: spacing.xl }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ backgroundColor: '#FEF3C7', padding: 8, borderRadius: 14, marginRight: 10 }}>
                    <AssignmentsSectionIcon size={24} />
                  </View>
                  <Text style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Recent Assignments</Text>
                </View>
                {recentAssignments.map((assignment, idx) => (
                  <View key={idx} style={{ backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 8 }}>
                      <View style={{ flex: 1, marginBottom: assignment.link ? 12 : 0 }}>
                        <Text style={{ ...typography.body, fontWeight: 'bold', color: colors.textMainLight }}>{assignment.title || 'Untitled'}</Text>
                        <Text style={{ ...typography.caption, color: colors.textMutedLight }}>{assignment.role ? `Role: ${assignment.role}` : ''} {assignment.year ? `• ${assignment.year}` : ''}</Text>
                      </View>
                      {assignment.link && assignment.link.trim().length > 0 && (() => {
                        const linkStr = assignment.link.trim();
                        const info = getVideoInfo(linkStr);
                        return (
                          <TouchableOpacity 
                            style={{ 
                              width: '100%', height: 160, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.surfaceDark, justifyContent: 'center', alignItems: 'center', position: 'relative'
                            }}
                            onPress={() => handleOpenMedia(linkStr, 'External Media')}
                          >
                            {info?.thumbnail && info.thumbnail !== 'INSTAGRAM' && info.thumbnail !== 'LINK' ? (
                              <ImageWithFallback source={{ uri: info.thumbnail }} style={{ width: '100%', height: '100%', position: 'absolute' }} resizeMode="cover" />
                            ) : info?.type === 'direct' ? (
                              <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' }}>
                                <Icon name="videocam" size={36} color={colors.primary} />
                              </View>
                            ) : null}
                            <View style={{ width: '100%', height: '100%', position: 'absolute', backgroundColor: (info?.thumbnail && info.thumbnail !== 'LINK' && info.thumbnail !== 'INSTAGRAM') || info?.type === 'direct' ? 'rgba(0,0,0,0.3)' : colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                              <Icon name={info?.thumbnail === 'INSTAGRAM' ? 'logo-instagram' : (!info || info?.thumbnail === 'LINK' ? 'link-outline' : 'play')} size={32} color={(info?.thumbnail && info.thumbnail !== 'LINK' && info.thumbnail !== 'INSTAGRAM') || info?.type === 'direct' ? colors.white : colors.primary} />
                            </View>
                          </TouchableOpacity>
                        );
                      })()}
                  </View>
                ))}
              </View>
            )}

            {/* Media Gallery Section */}
            <View style={{ marginBottom: 24, marginHorizontal: spacing.xl }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ backgroundColor: '#EDE9FE', padding: 8, borderRadius: 14, marginRight: 10 }}>
                  <MediaGallerySectionIcon size={24} />
                </View>
                <Text style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Media Gallery</Text>
              </View>
              
              {(!profile.photo_urls || profile.photo_urls.length === 0) && !profile.video_url ? (
                <View style={styles.emptyPortfolioCard}>
                  <Icon name="images-outline" size={28} color={colors.textMutedLight} style={{ marginBottom: 8 }} />
                  <Text style={styles.emptyPortfolioText}>No media uploaded in portfolio yet.</Text>
                </View>
              ) : (
                <View>
                  {/* Video Section */}
                  {parsedVideoUrls.length > 0 ? (
                  <FlatList 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    nestedScrollEnabled={true}
                    style={{ marginHorizontal: 0, marginBottom: 16 }}
                    data={parsedVideoUrls}
                    keyExtractor={(_, index) => `media-vid-${index}`}
                    initialNumToRender={2}
                    windowSize={3}
                    renderItem={({ item: vidUrl, index }) => {
                      const info = getVideoInfo(vidUrl);
                      return (
                        <TouchableOpacity 
                          onPress={() => handleOpenMedia(vidUrl, `Video ${index + 1}`)}
                          style={[styles.galleryItem, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceDark, marginRight: spacing.s, overflow: 'hidden' }]}
                        >
                          <VideoThumbnail url={vidUrl} colors={colors} />
                          <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                            <Icon name="play" size={40} color={colors.white} />
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                ) : null}

                  {/* Photo Section */}
                  {parsedPhotoUrls.length > 0 ? (
                    <FlatList 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      nestedScrollEnabled={true}
                      style={{ marginHorizontal: 0 }}
                      data={parsedPhotoUrls}
                      keyExtractor={(_, index) => `media-photo-${index}`}
                      initialNumToRender={3}
                      windowSize={3}
                      renderItem={({ item: imgUrl, index }) => (
                        <TouchableOpacity onPress={() => openImageModal(parsedPhotoUrls, index)} style={{ marginRight: spacing.s }}>
                          <ImageWithFallback source={{ uri: imgUrl }} style={styles.galleryItem} resizeMode="cover" />
                        </TouchableOpacity>
                      )}
                    />
                  ) : null}
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.l }}>
            {(() => {
              const details = profile.category_details?.[activeTab] || 
                              profile.category_details?.[activeTab.toLowerCase()] ||
                              (profile.category_details ? profile.category_details[Object.keys(profile.category_details).find(k => k.toLowerCase() === activeTab.toLowerCase())] : null);
              
              const entries = details ? Object.entries(details).filter(([k,v]) => k !== 'id' && k !== 'artist_id' && v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)) : [];
              
              if (!details || entries.length === 0) {
                return (
                  <View style={styles.emptyPortfolioCard}>
                    <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#DBEAFE' }}>
                      <ProfessionCategoryIcon categoryName={activeTab} size={32} />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textMainLight, marginBottom: 4, textTransform: 'capitalize' }}>
                      No {activeTab} Details Added
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textMutedLight, textAlign: 'center', marginBottom: 16, paddingHorizontal: 16, lineHeight: 18 }}>
                      Highlight your verified skills, experience, and domain portfolio for {activeTab.toLowerCase()} roles.
                    </Text>
                    <TouchableOpacity 
                      style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 }}
                      onPress={() => navigation.navigate('EditProfile')}
                    >
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>+ Add {activeTab} Details</Text>
                    </TouchableOpacity>
                  </View>
                );
              }

              return (
                <View style={{ marginBottom: 20 }}>
                  {/* Profession Section Header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 14, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.borderLight }}>
                    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#DBEAFE' }}>
                      <ProfessionCategoryIcon categoryName={activeTab} size={26} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textMainLight, textTransform: 'capitalize' }}>
                        {activeTab} Specialization
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textMutedLight, marginTop: 2, fontWeight: '500' }}>
                        Verified domain attributes & talent specifications
                      </Text>
                    </View>
                  </View>

                  {/* Attribute Details Container */}
                  <View style={{ backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.borderLight }}>
                    {(() => {
                      const mediaRegex = /\.(mp4|mov|avi|wmv|mkv|mp3|wav|aac|ogg|webm|m4a|flac|jpg|jpeg|png|webp)$/i;
                      const urlRegex = /^(https?:\/\/[^\s]+)$/i;

                      const complexEntries = [];
                      const gridSpecEntries = [];

                      entries.forEach(([k, v]) => {
                        const isMediaArray = Array.isArray(v) && v.some(val => String(val).match(mediaRegex));
                        const isSingleMedia = typeof v === 'string' && String(v).match(mediaRegex);
                        const isUrl = typeof v === 'string' && urlRegex.test(v.trim());
                        const isTagList = Array.isArray(v) || (typeof v === 'string' && (v.includes(',') || k.toLowerCase().includes('specialism') || k.toLowerCase().includes('skills') || k.toLowerCase().includes('styles') || k.toLowerCase().includes('permit') || k.toLowerCase().includes('language')));

                        if (isMediaArray || isSingleMedia || isUrl || isTagList) {
                          complexEntries.push([k, v]);
                        } else {
                          gridSpecEntries.push([k, v]);
                        }
                      });

                      return (
                        <>
                          {/* 1. Complex & List Items */}
                          {complexEntries.map(([k, v]) => {
                            const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                            const renderMediaItem = (itemValue, index) => {
                              const strVal = String(itemValue);
                              const isVideo = strVal.match(/\.(mp4|mov|avi|wmv|mkv)$/i);
                              const isAudio = strVal.match(/\.(mp3|wav|aac|ogg|webm|m4a|flac)$/i);
                              const isImage = strVal.match(/\.(jpg|jpeg|png|webp)$/i);

                              if (isVideo || isAudio) {
                                return (
                                  <View key={`${k}-${index}`} style={{ marginBottom: 16 }}>
                                    {index === 0 && <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMutedLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>}
                                    <Video 
                                      source={{ uri: strVal }} 
                                      style={{ width: '100%', height: isVideo ? 220 : 50, borderRadius: 12, backgroundColor: '#000', marginBottom: 8 }} 
                                      controls={true}
                                      resizeMode={isVideo ? "cover" : "contain"}
                                      paused={true}
                                    />
                                  </View>
                                );
                              }

                              if (isImage) {
                                return (
                                  <View key={`${k}-${index}`} style={{ marginBottom: 16 }}>
                                    {index === 0 && <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMutedLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>}
                                    <ImageWithFallback source={{ uri: strVal }} style={{ width: '100%', height: 220, borderRadius: 12, backgroundColor: colors.surfaceLight, marginBottom: 8 }} resizeMode="cover" />
                                  </View>
                                );
                              }
                              return null;
                            };

                            const isMediaArray = Array.isArray(v) && v.some(val => String(val).match(mediaRegex));
                            const isSingleMedia = typeof v === 'string' && String(v).match(mediaRegex);

                            if (isMediaArray) return <View key={k}>{v.map((item, idx) => renderMediaItem(item, idx))}</View>;
                            if (isSingleMedia) return <View key={k}>{renderMediaItem(v, 0)}</View>;

                            const urlStr = typeof v === 'string' ? v.trim() : '';
                            if (urlRegex.test(urlStr)) {
                              const isYoutube = urlStr.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                              const isInstagram = urlStr.match(/instagram\.com/i);

                              if (isYoutube) {
                                const videoId = isYoutube[1];
                                const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
                                return (
                                  <View key={k} style={{ marginBottom: 16 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMutedLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
                                    <TouchableOpacity 
                                      onPress={() => Linking.openURL(urlStr)}
                                      style={{ position: 'relative', width: '100%', height: 190, borderRadius: 12, overflow: 'hidden' }}
                                    >
                                      <ImageWithFallback source={{ uri: thumbnailUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
                                        <Icon name="logo-youtube" size={44} color="#ef4444" />
                                      </View>
                                    </TouchableOpacity>
                                  </View>
                                );
                              }
                              
                              if (isInstagram) {
                                return (
                                  <View key={k} style={{ marginBottom: 16 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMutedLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
                                    <TouchableOpacity 
                                      onPress={() => handleOpenMedia(urlStr, 'Instagram Reel')}
                                      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fdf4ff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#fbcfe8' }}
                                    >
                                      <Icon name="logo-instagram" size={22} color="#db2777" style={{ marginRight: 10 }} />
                                      <Text style={{ fontSize: 13, color: '#db2777', fontWeight: '700' }}>View on Instagram</Text>
                                    </TouchableOpacity>
                                  </View>
                                );
                              }

                              return (
                                <View key={k} style={{ marginBottom: 16 }}>
                                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMutedLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
                                  <TouchableOpacity 
                                    onPress={() => handleOpenMedia(urlStr, label)}
                                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight }}
                                  >
                                    <Icon name="link" size={18} color={colors.primary} style={{ marginRight: 10 }} />
                                    <Text style={{ fontSize: 13, color: colors.primary, flex: 1 }} numberOfLines={1}>{urlStr}</Text>
                                  </TouchableOpacity>
                                </View>
                              );
                            }

                            // Tag list / pill array
                            const itemsList = Array.isArray(v) 
                              ? v 
                              : (typeof v === 'string' && (v.includes(',') || k.toLowerCase().includes('specialism') || k.toLowerCase().includes('skills') || k.toLowerCase().includes('styles') || k.toLowerCase().includes('permit') || k.toLowerCase().includes('language')))
                                ? v.split(',').map(s => s.trim()).filter(Boolean)
                                : null;

                            if (itemsList && itemsList.length > 0) {
                              return (
                                <View key={k} style={{ marginBottom: 16 }}>
                                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMutedLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    {label}
                                  </Text>
                                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                    {itemsList.map((item, idx) => (
                                      <View 
                                        key={idx} 
                                        style={{ 
                                          backgroundColor: '#F8FAFC', 
                                          paddingHorizontal: 12, 
                                          paddingVertical: 6, 
                                          borderRadius: 20, 
                                          borderWidth: 1, 
                                          borderColor: '#E2E8F0',
                                          flexDirection: 'row',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginRight: 6 }} />
                                        <Text style={{ fontSize: 13, color: colors.textMainLight, fontWeight: '600' }}>
                                          {String(item)}
                                        </Text>
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              );
                            }

                            return null;
                          })}

                          {/* 2. Symmetrical 2-Column Grid for Short Single Specs */}
                          {gridSpecEntries.length > 0 && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: complexEntries.length > 0 ? 4 : 0 }}>
                              {gridSpecEntries.map(([k, v]) => {
                                const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                const textValue = String(v);
                                const isLong = textValue.length > 35;

                                return (
                                  <View 
                                    key={k} 
                                    style={{ 
                                      width: isLong ? '100%' : '48.5%', 
                                      backgroundColor: '#F8FAFC', 
                                      padding: 12, 
                                      borderRadius: 14, 
                                      marginBottom: 10, 
                                      borderWidth: 1, 
                                      borderColor: '#E2E8F0',
                                      minHeight: 58,
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMutedLight, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                      {label}
                                    </Text>
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textMainLight }} numberOfLines={2}>
                                      {textValue}
                                    </Text>
                                  </View>
                                );
                              })}
                            </View>
                          )}
                        </>
                      );
                    })()}
                  </View>
                </View>
              );
            })()}
          </View>
        )}

        {showComments && profile && profile.id ? (
          <View style={{ marginHorizontal: spacing.xl, marginBottom: 24, marginTop: 12 }}>
            <CommentsSection targetType="artist_profile" targetId={profile.id} isOwnProfile={true} />
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal 
        visible={isImageModalVisible} 
        transparent={true} 
        animationType="fade" 
        onRequestClose={() => { setIsImageModalVisible(false); setModalImages([]); }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.closeModalBtn} 
            onPress={() => { setIsImageModalVisible(false); setModalImages([]); }}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Icon name="close" size={32} color="#fff" />
          </TouchableOpacity>

          {modalImages.length > 0 && (
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <ImageWithFallback 
                source={{ uri: modalImages[selectedImageIndex] || modalImages[0] }} 
                style={{ width: Dimensions.get('window').width * 0.95, height: Dimensions.get('window').height * 0.75 }} 
                resizeMode="contain" 
              />
              
              {/* Pagination controls if multiple images */}
              {modalImages.length > 1 && (
                <View style={{ position: 'absolute', bottom: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                  <TouchableOpacity 
                    onPress={() => setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : modalImages.length - 1))}
                    style={{ padding: 12, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 30 }}
                  >
                    <Icon name="chevron-back" size={28} color="#fff" />
                  </TouchableOpacity>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                    {(selectedImageIndex >= 0 && selectedImageIndex < modalImages.length ? selectedImageIndex : 0) + 1} / {modalImages.length}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setSelectedImageIndex(prev => (prev < modalImages.length - 1 ? prev + 1 : 0))}
                    style={{ padding: 12, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 30 }}
                  >
                    <Icon name="chevron-forward" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>

      {/* In-App Media Player Modal */}
      <InAppMediaModal
        visible={Boolean(mediaModalUrl)}
        url={mediaModalUrl}
        title={mediaModalTitle}
        onClose={() => setMediaModalUrl(null)}
      />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundLight },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  headerUsername: {
    ...typography.h2,
    color: colors.textMainLight,
    fontWeight: '700',
  },
  menuButton: {
    padding: 4,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.l,
    justifyContent: 'space-between',
  },
  avatarInsta: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statsContainerInsta: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: spacing.l,
  },
  statBoxInsta: {
    alignItems: 'center',
  },
  statNumberInsta: {
    ...typography.h2,
    color: colors.textMainLight,
    fontWeight: '700',
  },
  statLabelInsta: {
    ...typography.caption,
    color: colors.textMainLight,
  },
  bioSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.m,
  },
  fullNameInsta: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  bioInsta: {
    ...typography.body,
    color: colors.textMainLight,
    marginTop: 2,
    lineHeight: 20,
  },
  cintaaTopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  cintaaTopBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
    marginLeft: 6,
  },
  profileActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  profileActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  profileActionBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  editProfileBtnInsta: {
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  editProfileTextInsta: {
    ...typography.body,
    fontWeight: '600',
    color: '#000000',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 12,
    backgroundColor: colors.backgroundLight,
  },
  tabsScroll: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomColor: colors.primary,
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.textMutedLight,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  portfolioSection: {
    marginTop: spacing.m,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  galleryItem: {
    width: width / 3 - 2, // 3 columns with 1px gap
    aspectRatio: 1,
    marginBottom: 2,
    marginRight: 2,
    backgroundColor: colors.surfaceLight,
  },
  emptyPortfolio: {
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyPortfolioCard: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPortfolioText: {
    fontSize: 13,
    color: colors.textMutedLight,
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger,
    marginBottom: spacing.m,
  },
  retryButton: {
    padding: spacing.s,
    backgroundColor: colors.surfaceDark,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.textMainLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  disclaimerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  disclaimerContainer: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  disclaimerTitle: {
    ...typography.h2,
    color: colors.textMainLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  disclaimerText: {
    ...typography.body,
    color: colors.textMutedLight,
    marginBottom: 16,
    lineHeight: 22,
  },
  disclaimerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  disclaimerBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disclaimerBtnDeny: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: 10,
  },
  disclaimerBtnAgree: {
    backgroundColor: colors.primary,
    marginLeft: 10,
  },
  disclaimerBtnTextDeny: {
    color: colors.textMainLight,
    fontWeight: 'bold',
  },
  disclaimerBtnTextAgree: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chip: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)', // Light blue for chips
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    ...typography.body,
    fontSize: 13,
    color: colors.primary, // Primary color text
    fontWeight: '600',
  },
  basicInfoGridCard: {
    width: '48%',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    height: 124,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  basicInfoIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  basicInfoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMutedLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  basicInfoValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMainLight,
    marginTop: 3,
    textAlign: 'center',
  },
  basicInfoFullCard: {
    width: '100%',
    backgroundColor: colors.surfaceLight,
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  basicInfoIconBadgeSmall: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  basicInfoFullRowCard: {
    width: '100%',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  basicInfoRowLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMutedLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  basicInfoRowValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMainLight,
    marginTop: 2,
  },
  basicInfoSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  languageChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  languageChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
