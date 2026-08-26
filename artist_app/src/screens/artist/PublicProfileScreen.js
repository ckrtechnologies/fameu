import { showError, showSuccess } from '../../utils/toast';
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity, Modal, Dimensions, Linking, RefreshControl, FlatList, TextInput, Animated, Share, Text, KeyboardAvoidingView, Platform } from 'react-native';
import Video from 'react-native-video';
const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon, {
  BasicInfoSectionIcon,
  ShareProfileIcon,
  CintaaGoldBadgeIcon,
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
  InstagramIcon,
  YouTubeIcon,
  FacebookIcon,
  SnapchatIcon,
  ReportFlagShieldIcon,
  BioQuoteIcon,
  ArtistRoleBadgeIcon,
  ProfessionCategoryIcon,
} from '../../components/icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { parseArray } from '../../utils/dataUtils';
import { useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import ImageWithFallback from '../../components/core/ImageWithFallback';
import VerifiedBadge from '../../components/core/VerifiedBadge';
import CustomButton from '../../components/forms/CustomButton';
import { 
  useGetPublicProfileQuery, 
  useFollowUserMutation, 
  useUnfollowUserMutation,
  useRecordVisitMutation
} from '../../services/connectionsApi';
import { useStartConversationMutation } from '../../services/chatApi';
import { useReportUserMutation } from '../../services/authApi';
import { useGetFeedQuery } from '../../services/discoverApi';
import CommentsSection from '../../components/CommentsSection';
import { getVideoInfo } from '../../utils/media';
import VideoThumbnail from '../../components/core/VideoThumbnail';
import InAppMediaModal from '../../components/core/InAppMediaModal';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';

export default function PublicProfileScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute();
  const navigation = useNavigation();
  const { username, scrollToComments } = route.params;
  
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const { data: profileData, isLoading, isError, refetch , isFetching} = useGetPublicProfileQuery(username);
  const [mediaModalUrl, setMediaModalUrl] = useState(null);

  const handleOpenMedia = (url) => {
    if (!url) return;
    const info = getVideoInfo(url);
    if (info?.type === 'direct') {
      navigation.navigate('VideoPortfolio', { videos: [url], initialIndex: 0 });
    } else {
      setMediaModalUrl(url);
    }
  };

  const hiringProfile = Array.isArray(profileData?.profile) ? profileData?.profile[0] : profileData?.profile;
  const hiringId = profileData?.role === 'hiring' ? (hiringProfile?.id || profileData?.id) : null;
  const { data: auditions, isLoading: isAuditionsLoading } = useGetFeedQuery({ hiring_id: hiringId }, { skip: !hiringId });
  
  const scrollViewRef = React.useRef(null);

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

      
  useEffect(() => {
    // Animations removed
  }, []);

  React.useEffect(() => {
    if (scrollToComments && !isLoading && profileData) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  }, [scrollToComments, isLoading, profileData]);
  
  const [followUser, { isLoading: isFollowingLoad }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowingLoad }] = useUnfollowUserMutation();
  const [startConversation, { isLoading: isStartingChat }] = useStartConversationMutation();
  const [recordVisit] = useRecordVisitMutation();

  // Record a profile visit when the profile loads (skip self-views)
  React.useEffect(() => {
    if (profileData?.id && currentUserId !== profileData.id) {
      recordVisit(profileData.id).catch(() => {}); // Fire-and-forget
    }
  }, [profileData?.id, currentUserId, recordVisit]);
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [showComments, setShowComments] = useState(false);
  const [auditionStatusFilter, setAuditionStatusFilter] = useState('All'); // 'All' | 'Active' | 'Expired'

  useEffect(() => {
    if (profileData?.id) {
      const timer = setTimeout(() => setShowComments(true), 800);
      return () => clearTimeout(timer);
    }
  }, [profileData?.id]);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportUser, { isLoading: isReporting }] = useReportUserMutation();

  const handleReport = async () => {
    if (!reportReason.trim()) {
      showError('', 'Please provide a reason');
      return;
    }
    try {
      await reportUser({ reported_user_id: profileData.id, reason: reportReason.trim() }).unwrap();
      setIsReportModalVisible(false);
      setReportReason('');
      showSuccess('', 'User reported successfully');
    } catch (error) {
      showError('', error?.data?.error || 'Failed to report user');
    }
  };

  const handleFollowToggle = async () => {
    if (!profileData) return;
    
    if (profileData.id === currentUserId) {
        // Can't follow yourself
        return;
    }

    try {
      if (profileData.is_following) {
        await unfollowUser(profileData.id).unwrap();
      } else {
        await followUser(profileData.id).unwrap();
      }
      refetch(); // Refetch to update counts
    } catch (error) {
      showError('', error?.data?.error || 'Failed to update follow status');
    }
  };

  const handleMessage = async () => {
    if (!profileData) return;
    try {
      const result = await startConversation({ targetUserId: profileData.id }).unwrap();
      navigation.navigate('Chat', {
        conversationId: result.data.id,
        otherParticipant: profileData,
      });
    } catch (error) {
      showError('', error?.data?.error || 'Failed to start conversation');
    }
  };

  const handleShare = async () => {
    if (!profileData) return;
    try {
      const url = `https://fameu.app/artist/${profileData.username}`;
      await Share.share({
        message: `Check out ${profileData.name}'s profile on Fameu! ${url}`,
        url: url,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !profileData) {
    return (
      <View style={styles.centerContainer}>
        <Typography variant="body" style={styles.errorText}>User not found</Typography>
        <CustomButton title="Go Back" onPress={() => navigation.goBack()} type="outline" style={{marginTop: spacing.m}} />
      </View>
    );
  }

  const isSelf = currentUserId === profileData.id;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ShrinkableHeader 
          title={profileData.name || `@${profileData.username}`}
          subtitle={`@${profileData.username}`}
          showBack={true}
          onBack={() => navigation.goBack()}
          headerTitleSize={headerTitleSize}
          subtitleHeight={subtitleHeight}
          subtitleOpacity={subtitleOpacity}
          headerElevation={headerElevation}
          rightActions={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity onPress={handleShare} style={styles.headerActionBtn}>
                <ShareProfileIcon size={18} />
              </TouchableOpacity>
              {!isSelf && (
                <TouchableOpacity onPress={() => setIsReportModalVisible(true)} style={styles.headerReportBtn}>
                  <ReportFlagShieldIcon size={18} />
                </TouchableOpacity>
              )}
            </View>
          }
        />

        <ScrollView 
          ref={scrollViewRef} 
          showsVerticalScrollIndicator={false} 
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {/* Avatar & Stats Header Area */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              {profileData.avatar_url ? (
                <ImageWithFallback source={{ uri: profileData.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={{ fontSize: 32, fontWeight: '800', color: '#FFFFFF' }}>
                    {(profileData.name || profileData.username || 'A').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.statsContainer}>
              <TouchableOpacity 
                style={styles.statCapsule}
                onPress={() => profileData?.id && navigation.navigate('ConnectionList', { type: 'followers', userId: profileData.id })}
                activeOpacity={0.75}
              >
                <Text style={styles.statValue}>{profileData.followers_count}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.statCapsule}
                onPress={() => profileData?.id && navigation.navigate('ConnectionList', { type: 'following', userId: profileData.id })}
                activeOpacity={0.75}
              >
                <Text style={styles.statValue}>{profileData.following_count}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
              <View style={styles.statCapsule}>
                <Text style={styles.statValue}>{profileData.visit_count || 0}</Text>
                <Text style={styles.statLabel}>Visits</Text>
              </View>
            </View>
          </View>

          <View style={styles.bioSection}>
            <Text style={styles.nameText}>{profileData.name}</Text>
            
            {/* Role Badge with Icon */}
            <View style={styles.roleBadge}>
              <ArtistRoleBadgeIcon size={14} style={{ marginRight: 6 }} />
              <Text style={styles.roleBadgeText}>
                {profileData.role === 'artist' 
                  ? (Array.isArray(profileData.profile?.categories) && profileData.profile.categories.length > 0 
                      ? profileData.profile.categories.join(' • ') 
                      : 'Verified Artist') 
                  : ((Array.isArray(profileData.profile) ? profileData.profile[0]?.company_type : profileData.profile?.company_type) || 'Casting Recruiter')}
              </Text>
            </View>
            
            {/* Contact Info (Only for Recruiters/Agencies) */}
            {profileData.role !== 'artist' && (
              <View style={{ 
                marginTop: spacing.s, 
                marginBottom: spacing.m, 
                backgroundColor: colors.surfaceLight,
                padding: spacing.m,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.borderLight
              }}>
                <Text style={{ color: colors.textMainLight, fontWeight: '600', marginBottom: spacing.xs, fontSize: 13 }}>Contact Information</Text>
                {(profileData.email) && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="mail-outline" size={16} color={colors.textMutedLight} style={{ marginRight: 8 }} />
                    <Text style={{ color: colors.textMainLight, fontSize: 13 }}>
                      {profileData.email}
                    </Text>
                  </View>
                )}
                {(profileData.mobile || profileData.profile?.phone) && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="call-outline" size={16} color={colors.textMutedLight} style={{ marginRight: 8 }} />
                    <Text style={{ color: colors.textMainLight, fontSize: 13 }}>
                      {profileData.mobile || profileData.profile?.phone}
                    </Text>
                  </View>
                )}
                {(() => {
                  let altContact = profileData.profile?.alternate_contact;
                  if (typeof altContact === 'string') {
                    try { altContact = JSON.parse(altContact); } catch (e) { altContact = null; }
                  }
                  return (
                    <>
                      {!!altContact?.phone && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Icon name="call-outline" size={16} color={colors.textMutedLight} style={{ marginRight: 8 }} />
                          <Text style={{ color: colors.textMainLight, fontSize: 13 }}>
                            {altContact.phone}
                          </Text>
                        </View>
                      )}
                      {!!altContact?.email && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Icon name="mail-outline" size={16} color={colors.textMutedLight} style={{ marginRight: 8 }} />
                          <Text style={{ color: colors.textMainLight, fontSize: 13 }}>
                            {altContact.email}
                          </Text>
                        </View>
                      )}
                    </>
                  );
                })()}
              </View>
            )}

            {/* Bio Text Card with Quote Icon */}
            {(profileData.profile?.bio || profileData.profile?.description) && (
              <View style={styles.bioCard}>
                <BioQuoteIcon size={16} style={{ marginBottom: 6 }} />
                <Text style={styles.bioCardText}>
                  {profileData.profile?.bio || profileData.profile?.description}
                </Text>
              </View>
            )}

            {/* Social Links Row */}
            {profileData.profile?.social_links && (() => {
              const links = typeof profileData.profile.social_links === 'string' 
                ? JSON.parse(profileData.profile.social_links || '{}') 
                : profileData.profile.social_links;
              const hasSocials = links && (links.instagram || links.youtube || links.facebook || links.snapchat);
              if (!hasSocials) return null;
              return (
                <View style={styles.socialRow}>
                  {links.instagram ? (
                    <TouchableOpacity onPress={() => Linking.openURL(links.instagram).catch(() => {})} style={styles.socialBtn} activeOpacity={0.8}>
                      <InstagramIcon size={34} />
                    </TouchableOpacity>
                  ) : null}
                  {links.youtube ? (
                    <TouchableOpacity onPress={() => Linking.openURL(links.youtube).catch(() => {})} style={styles.socialBtn} activeOpacity={0.8}>
                      <YouTubeIcon size={34} />
                    </TouchableOpacity>
                  ) : null}
                  {links.facebook ? (
                    <TouchableOpacity onPress={() => Linking.openURL(links.facebook).catch(() => {})} style={styles.socialBtn} activeOpacity={0.8}>
                      <FacebookIcon size={34} />
                    </TouchableOpacity>
                  ) : null}
                  {links.snapchat ? (
                    <TouchableOpacity onPress={() => Linking.openURL(links.snapchat).catch(() => {})} style={styles.socialBtn} activeOpacity={0.8}>
                      <SnapchatIcon size={34} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })()}

            {/* CINTAA Top Bio Badge */}
            {profileData.profile?.is_cintaa_member && (
              <View style={styles.cintaaTopBadge}>
                <CintaaGoldBadgeIcon size={18} />
                <Text style={styles.cintaaTopBadgeText}>
                  Verified CINTAA Member ({profileData.profile.cintaa_reg_number})
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionSection}>
            {!isSelf ? (
              <>
                <TouchableOpacity 
                  style={[styles.primaryActionBtn, profileData.is_following && styles.primaryActionBtnOutline]}
                  onPress={handleFollowToggle}
                  disabled={isFollowingLoad || isUnfollowingLoad}
                  activeOpacity={0.85}
                >
                  {isFollowingLoad || isUnfollowingLoad ? (
                    <ActivityIndicator size="small" color={profileData.is_following ? colors.primary : '#FFFFFF'} />
                  ) : (
                    <Text style={[styles.primaryActionBtnText, profileData.is_following && { color: colors.primary }]}>
                      {profileData.is_following ? 'Unfollow' : '+ Follow'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.secondaryActionBtn}
                  onPress={handleMessage}
                  disabled={isStartingChat}
                  activeOpacity={0.85}
                >
                  {isStartingChat ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Icon name="chatbubble-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                      <Text style={styles.secondaryActionBtnText}>Message</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : null}

            <TouchableOpacity
              style={[styles.shareProfileBtn, { flex: isSelf ? 1 : undefined }]}
              activeOpacity={0.8}
              onPress={handleShare}
            >
              <ShareProfileIcon size={18} style={{ marginRight: 6 }} />
              <Text style={styles.shareProfileBtnText}>Share</Text>
            </TouchableOpacity>
          </View>

        {/* Extended details */}
        {profileData.role === 'artist' && profileData.profile ? (
          <View style={styles.detailsSection}>
            <View style={styles.tabsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                {['Overview', ...(profileData.profile.categories || [])].map(tab => (
                  <TouchableOpacity 
                    key={tab} 
                    style={[styles.tab, activeTab === tab && styles.tabActive]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Typography variant="body" style={[styles.tabText, activeTab === tab && styles.tabTextActive, { textTransform: 'capitalize' }]}>{tab}</Typography>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {activeTab === 'Overview' ? (
              <View style={styles.portfolioSection}>
                {/* Profile Videos Section */}
                {(() => {
                  const profileVideos = [
                    { url: profileData.profile.intro_video_url, title: 'Intro Video' },
                    // Left Profile and Right Profile removed per request
                    // { url: profileData.profile.left_profile_url, title: 'Left Profile' },
                    // { url: profileData.profile.right_profile_url, title: 'Right Profile' }
                  ].filter(v => v.url && v.url.trim().length > 0);

                  if (profileVideos.length === 0) return null;

                  return (
                    <View style={{ marginBottom: 24, marginHorizontal: spacing.xl }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ backgroundColor: '#FEE2E2', padding: 8, borderRadius: 14, marginRight: 10 }}>
                          <VideoSectionIcon size={24} />
                        </View>
                        <Typography variant="body" style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Profile Videos</Typography>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 0 }}>
                        {profileVideos.map((video, index) => (
                          <View key={index} style={{ marginRight: spacing.m, width: 140 }}>
                            <TouchableOpacity 
                              onPress={() => handleOpenMedia(video.url)}
                              style={{ width: '100%', height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', overflow: 'hidden', borderRadius: 16, position: 'relative', borderWidth: 1, borderColor: colors.borderLight }}
                            >
                              <VideoThumbnail url={video.url} colors={colors} />
                              <View style={{ backgroundColor: 'rgba(0,0,0,0.35)', width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 }}>
                                  <Icon name="play" size={24} color={colors.primary} style={{ marginLeft: 3 }} />
                                </View>
                              </View>
                            </TouchableOpacity>
                            <Text style={{ ...typography.caption, color: colors.textMainLight, marginTop: 8, textAlign: 'center', fontWeight: '600' }}>{video.title}</Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  );
                })()}

                {/* Video Portfolio Grid */}
                {typeof profileData.profile.video_url === 'string' && profileData.profile.video_url.trim().length > 0 && (
                  <View style={{ marginBottom: 24, marginHorizontal: spacing.xl }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ backgroundColor: '#FEE2E2', padding: 8, borderRadius: 14, marginRight: 10 }}>
                          <VideoSectionIcon size={24} />
                        </View>
                        <Typography variant="body" style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Video Gallery</Typography>
                      </View>
                      <TouchableOpacity onPress={() => navigation.navigate('VideoPortfolio', { videos: profileData.profile.video_url.split(',').filter(Boolean) })}>
                        <Typography variant="body" style={{ color: colors.primary, fontWeight: 'bold' }}>See All</Typography>
                      </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 0 }}>
                      {profileData.profile.video_url.split(',').filter(Boolean).map((vUrl, idx) => (
                        <TouchableOpacity 
                          key={`vid-${idx}`}
                          style={{ width: 140, height: 200, borderRadius: 16, backgroundColor: '#0F172A', marginRight: 12, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', position: 'relative', borderWidth: 1, borderColor: colors.borderLight }}
                          onPress={() => handleOpenMedia(vUrl)}
                        >
                          <VideoThumbnail url={vUrl} colors={colors} />
                          <View style={{ backgroundColor: 'rgba(0,0,0,0.35)', width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 }}>
                              <Icon name="play" size={24} color={colors.primary} style={{ marginLeft: 3 }} />
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <View style={{ marginBottom: 24, marginHorizontal: spacing.xl }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ backgroundColor: colors.primary + '15', padding: 8, borderRadius: 14, marginRight: 10 }}>
                      <BasicInfoSectionIcon size={24} />
                    </View>
                    <Typography variant="body" style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Basic Info</Typography>
                  </View>

                  {/* Symmetrical 2-Column Side-by-Side Grid */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {(() => {
                      const standardInfoItems = [
                        profileData.profile.age ? { key: 'age', label: 'Age', value: `${profileData.profile.age} yrs`, IconComp: AgeProfileIcon, bg: '#FFF7ED' } : null,
                        profileData.profile.gender ? { key: 'gender', label: 'Gender', value: profileData.profile.gender, IconComp: GenderProfileIcon, bg: '#FDF2F8' } : null,
                        profileData.profile.height ? { key: 'height', label: 'Height', value: profileData.profile.height, IconComp: HeightProfileIcon, bg: '#ECFDF5' } : null,
                        profileData.profile.weight ? { key: 'weight', label: 'Weight', value: `${profileData.profile.weight} kg`, IconComp: WeightProfileIcon, bg: '#EFF6FF' } : null,
                        (profileData.profile.alt_number || profileData.profile.alternate_phone) ? { key: 'alt_phone', label: 'Alt. Number', value: profileData.profile.alt_number || profileData.profile.alternate_phone, IconComp: PhoneProfileIcon, bg: '#ECFDF5' } : null,
                        (Array.isArray(profileData.profile.languages) && profileData.profile.languages.length > 0) ? { key: 'languages', label: 'Languages', value: profileData.profile.languages.join(', '), IconComp: LanguagesProfileIcon, bg: '#EFF6FF' } : null,
                        profileData.profile.city ? { key: 'city', label: 'Base City', value: profileData.profile.city, IconComp: NearbySpotlightIcon, bg: '#F0FDF4' } : null,
                        profileData.profile.availability_type ? { key: 'availability', label: 'Availability', value: profileData.profile.availability_type, IconComp: null, iconName: 'availability_type', bg: '#FFFBEB' } : null,
                        profileData.profile.available_dates ? { key: 'dates', label: 'Dates', value: profileData.profile.available_dates, IconComp: null, iconName: 'available_dates', bg: '#EEF2FF' } : null,
                      ].filter(Boolean);

                      return standardInfoItems.map((item) => {
                        const CustomIcon = item.IconComp;
                        return (
                          <View key={item.key} style={styles.basicInfoGridCard}>
                            <View style={[styles.basicInfoIconBadge, { backgroundColor: item.bg }]}>
                              {CustomIcon ? <CustomIcon size={26} /> : <Icon name={item.iconName} size={24} />}
                            </View>
                            <Text style={styles.basicInfoLabel}>{item.label}</Text>
                            <Text style={styles.basicInfoValue} numberOfLines={1}>{item.value}</Text>
                          </View>
                        );
                      });
                    })()}
                  </View>

                  {/* Skills Full Width Card */}
                  {Array.isArray(profileData.profile.skills) && profileData.profile.skills.length > 0 && (
                    <View style={styles.basicInfoFullCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#FEF3C7' }]}>
                          <Icon name="skills" size={20} />
                        </View>
                        <Text style={styles.basicInfoSectionTitle}>Special Skills</Text>
                      </View>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {profileData.profile.skills.map((sk, idx) => (
                          <View key={idx} style={[styles.languageChip, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                            <Text style={[styles.languageChipText, { color: '#B45309' }]}>{sk}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                {/* Tags / Preferences Section */}
                {(profileData.profile.work_preference?.length > 0 || profileData.profile.preferred_cities?.length > 0 || profileData.profile.look_alike?.length > 0 || profileData.profile.hashtags?.length > 0) && (
                  <View style={{ marginBottom: 24, marginHorizontal: spacing.xl }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                      <View style={{ backgroundColor: '#D1FAE5', padding: 8, borderRadius: 14, marginRight: 10 }}>
                        <PreferencesSectionIcon size={24} />
                      </View>
                      <Typography variant="body" style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Preferences & Tags</Typography>
                    </View>
                    
                    {profileData.profile.work_preference?.length > 0 && (
                      <View style={styles.basicInfoFullCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                          <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#FFEDD5' }]}>
                            <Icon name="briefcase" size={18} />
                          </View>
                          <Text style={styles.basicInfoSectionTitle}>Work Preference</Text>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {parseArray(profileData.profile.work_preference).map((t, i) => (
                            <View key={i} style={[styles.languageChip, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
                              <Text style={[styles.languageChipText, { color: '#C2410C' }]}>{t}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                    
                    {profileData.profile.preferred_cities?.length > 0 && (
                      <View style={styles.basicInfoFullCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                          <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#CCFBF1' }]}>
                            <Icon name="location" size={18} />
                          </View>
                          <Text style={styles.basicInfoSectionTitle}>Preferred Locations</Text>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {parseArray(profileData.profile.preferred_cities).map((t, i) => (
                            <View key={i} style={[styles.languageChip, { backgroundColor: '#F0FDFA', borderColor: '#CCFBF1' }]}>
                              <Text style={[styles.languageChipText, { color: '#0F766E' }]}>{t}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {profileData.profile.look_alike?.length > 0 && (
                      <View style={styles.basicInfoFullCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                          <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#F3E8FF' }]}>
                            <Icon name="people" size={18} />
                          </View>
                          <Text style={styles.basicInfoSectionTitle}>Look Alikes</Text>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {parseArray(profileData.profile.look_alike).map((t, i) => (
                            <View key={i} style={[styles.languageChip, { backgroundColor: '#FAF5FF', borderColor: '#F3E8FF' }]}>
                              <Text style={[styles.languageChipText, { color: '#7E22CE' }]}>{t}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {profileData.profile.hashtags?.length > 0 && (
                      <View style={{ marginBottom: 20, backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                          <View style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', padding: 6, borderRadius: 12, marginRight: 8 }}>
                            <Icon name="pricetag" size={16} color="#ec4899" />
                          </View>
                          <Typography variant="body" style={{ ...typography.body, color: colors.textMainLight, fontWeight: '700' }}>Hashtags</Typography>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                          {parseArray(profileData.profile.hashtags).map((t, i) => (
                            <View key={i} style={[styles.chip, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}><Typography variant="body" style={[styles.chipText, { color: '#ec4899' }]}>#{t}</Typography></View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Recent Assignments Section */}
                {profileData.profile.recent_assignments?.length > 0 && (
                  <View style={{ marginBottom: 24, marginHorizontal: spacing.xl }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                      <View style={{ backgroundColor: '#FEF3C7', padding: 8, borderRadius: 14, marginRight: 10 }}>
                        <AssignmentsSectionIcon size={24} />
                      </View>
                      <Typography variant="body" style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Recent Assignments</Typography>
                    </View>
                    {parseArray(profileData.profile.recent_assignments).map((assignment, idx) => (
                      <View key={idx} style={{ backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 8 }}>
                        <View style={{ flex: 1, marginBottom: assignment.link ? 12 : 0 }}>
                          <Typography variant="body" style={{ ...typography.body, fontWeight: 'bold', color: colors.textMainLight }}>{assignment.title || 'Untitled'}</Typography>
                          <Typography variant="body" style={{ ...typography.caption, color: colors.textMutedLight }}>{assignment.role ? `Role: ${assignment.role}` : ''} {assignment.year ? `• ${assignment.year}` : ''}</Typography>
                        </View>
                        {assignment.link && assignment.link.trim().length > 0 && (() => {
                          const linkStr = assignment.link.trim();
                          const info = getVideoInfo(linkStr);
                          return (
                            <TouchableOpacity 
                              style={{ 
                                width: '100%', height: 160, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.surfaceDark, justifyContent: 'center', alignItems: 'center', position: 'relative'
                              }}
                              onPress={() => import('react-native').then(({ Linking }) => Linking.openURL(linkStr).catch(() => {}))}
                            >
                              {info?.thumbnail && info.thumbnail !== 'INSTAGRAM' && info.thumbnail !== 'LINK' ? (
                                <Image source={{ uri: info.thumbnail }} style={{ width: '100%', height: '100%', position: 'absolute' }} resizeMode="cover" />
                              ) : info?.type === 'direct' ? (
                                <Video source={{ uri: linkStr }} style={{ width: '100%', height: '100%', position: 'absolute' }} paused={true} resizeMode="cover" muted={true} />
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
                    <Typography variant="body" style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Media Gallery</Typography>
                  </View>
                  
                  {(!profileData.profile.photo_urls || profileData.profile.photo_urls.length === 0) && !profileData.profile.video_url ? (
                    <View style={styles.emptyPortfolioCard}>
                      <Icon name="images-outline" size={28} color={colors.textMutedLight} style={{ marginBottom: 8 }} />
                      <Typography variant="body" style={styles.emptyPortfolioText}>No media in portfolio yet.</Typography>
                    </View>
                  ) : (
                    <View>
                      {/* Video Section */}
                      {typeof profileData.profile.video_url === 'string' && profileData.profile.video_url.trim().length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 0, marginBottom: 16 }}>
                          {profileData.profile.video_url.split(',').filter(Boolean).map((vidUrl, index) => (
                            <TouchableOpacity 
                              key={index} 
                              onPress={() => {
                                const info = getVideoInfo(profileData.profile.video_url.split(',').filter(Boolean)[index]);
                                if (info?.type !== 'direct') {
                                  import('react-native').then(({ Linking }) => {
                                    Linking.openURL(profileData.profile.video_url.split(',').filter(Boolean)[index]).catch(() => {});
                                  });
                                } else {
                                  navigation.navigate('VideoPortfolio', { videos: profileData.profile.video_url.split(',').filter(Boolean), initialIndex: index });
                                }
                              }}
                              style={[styles.galleryItem, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceDark, marginRight: spacing.s }]}
                            >
                              <Icon name="play" size={40} color={colors.primary} />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      ) : null}

                      {/* Photo Section */}
                      {profileData.profile.photo_urls && profileData.profile.photo_urls.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 0 }}>
                          {parseArray(profileData.profile.photo_urls).map((imgUrl, index) => (
                            <TouchableOpacity key={index} onPress={() => { setSelectedImageIndex(index); setIsImageModalVisible(true); }} style={{ marginRight: spacing.s }}>
                              <Image source={{ uri: imgUrl }} style={styles.galleryItem} />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      ) : null}
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.l }}>
                {(() => {
                  const details = profileData.profile.category_details?.[activeTab] ||
                                  profileData.profile.category_details?.[activeTab.toLowerCase()] ||
                                  (profileData.profile.category_details ? profileData.profile.category_details[Object.keys(profileData.profile.category_details).find(k => k.toLowerCase() === activeTab.toLowerCase())] : null);
                  
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
                        <Text style={{ fontSize: 13, color: colors.textMutedLight, textAlign: 'center', lineHeight: 18, paddingHorizontal: 16 }}>
                          This artist hasn't added specific details for {activeTab.toLowerCase()} roles yet.
                        </Text>
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
                                        <Image source={{ uri: strVal }} style={{ width: '100%', height: 220, borderRadius: 12, backgroundColor: colors.surfaceLight, marginBottom: 8 }} resizeMode="cover" />
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
                                          <Image source={{ uri: thumbnailUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
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
                                          onPress={() => Linking.openURL(urlStr)}
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
                                        onPress={() => Linking.openURL(urlStr)}
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
            
            {/* Artist Profile Comments */}
            {profileData.profile && profileData.profile.id && (
              <View style={{ marginHorizontal: spacing.xl, marginBottom: 24, marginTop: 12 }}>
                {showComments && <CommentsSection targetType="artist_profile" targetId={profileData.profile.id} />}
              </View>
            )}
          </View>
        ) : profileData.role === 'hiring' && profileData.profile ? (() => {
          const hiringProfile = Array.isArray(profileData.profile) ? profileData.profile[0] : profileData.profile;

          const isAuditionExpired = (item) => {
            if (item.status === 'closed' || item.status === 'expired') return true;
            if (item.audition_date) {
              const today = new Date().toISOString().split('T')[0];
              return item.audition_date < today;
            }
            return false;
          };

          const rawList = auditions?.data || [];
          const filteredList = rawList.filter(item => {
            const expired = isAuditionExpired(item);
            if (auditionStatusFilter === 'Active') return !expired;
            if (auditionStatusFilter === 'Expired') return expired;
            return true;
          });

          const grouped = filteredList.reduce((acc, curr) => {
            const cat = curr.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(curr);
            return acc;
          }, {});
        
          const categoriesData = Object.keys(grouped).map(key => ({
            category: key.charAt(0).toUpperCase() + key.slice(1),
            data: grouped[key].slice(0, 5),
            total: grouped[key].length
          }));

          return (
            <View style={{ paddingHorizontal: spacing.m, marginTop: spacing.l }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.l }}>
                <View style={{ alignItems: 'center' }}>
                  <Typography variant="h3" style={{ fontWeight: '700', color: colors.textMainLight }}>{rawList.length}</Typography>
                  <Typography variant="caption" style={{ color: colors.textMutedLight }}>Posts</Typography>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Typography variant="h3" style={{ fontWeight: '700', color: colors.textMainLight }}>0</Typography>
                  <Typography variant="caption" style={{ color: colors.textMutedLight }}>Hired</Typography>
                </View>
              </View>

              {/* Audition Filter Segment Bar */}
              {rawList.length > 0 && (
                <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceLight, borderRadius: 10, padding: 4, marginBottom: spacing.m, borderWidth: 1, borderColor: colors.borderLight }}>
                  {['All', 'Active', 'Expired'].map(filter => (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => setAuditionStatusFilter(filter)}
                      style={{ 
                        flex: 1, 
                        paddingVertical: 6, 
                        alignItems: 'center', 
                        borderRadius: 8, 
                        backgroundColor: auditionStatusFilter === filter ? colors.primary : 'transparent' 
                      }}
                    >
                      <Typography variant="caption" style={{ fontWeight: '700', color: auditionStatusFilter === filter ? '#fff' : colors.textMutedLight }}>
                        {filter}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={{ height: 1, backgroundColor: colors.borderLight, marginBottom: spacing.m }} />
              
              {categoriesData.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: spacing.xl, paddingBottom: 24 }}>
                  <Icon name="camera" size={48} color={colors.borderLight} />
                  <Typography variant="body2" style={{ color: colors.textMutedLight, marginTop: spacing.s }}>
                    {auditionStatusFilter === 'All' ? 'No posts yet' : `No ${auditionStatusFilter.toLowerCase()} auditions found`}
                  </Typography>
                </View>
              ) : (
                categoriesData.map((catItem, catIndex) => (
                  <View key={catIndex} style={{ marginBottom: spacing.m }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.s }}>
                      <Typography variant="h3" style={{ fontWeight: 'bold', color: colors.textMainLight }}>{catItem.category}s</Typography>
                      {catItem.total > 5 && (
                        <TouchableOpacity>
                          <Typography variant="body2" style={{ color: colors.primary, fontWeight: '600' }}>See all</Typography>
                        </TouchableOpacity>
                      )}
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: spacing.m }}>
                      {catItem.data.map((item) => {
                        const expired = isAuditionExpired(item);
                        return (
                          <TouchableOpacity 
                            key={item.id}
                            style={{ width: 140, height: 140, marginRight: spacing.m, backgroundColor: colors.surfaceLight, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderLight, position: 'relative' }}
                            onPress={() => navigation.navigate('AuditionDetail', { id: item.id })}
                          >
                            <View style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
                              <ImageWithFallback source={{ uri: item.thumbnail_url }} fallbackSource={{ uri: item.hiring_profiles?.logo_url }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                              
                              {/* Expired / Closed Badge */}
                              {expired && (
                                <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(239, 68, 68, 0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 10 }}>
                                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>Closed</Text>
                                </View>
                              )}

                              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: spacing.xs }}>
                                <Typography variant="caption" style={{ textAlign: 'center', color: '#fff' }} numberOfLines={2}>{item.title}</Typography>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                ))
              )}

              {hiringProfile && hiringProfile.id && (
                <View style={{ marginBottom: 24, marginTop: spacing.l }}>
                  {showComments && <CommentsSection targetType="profile" targetId={hiringProfile.id} />}
                </View>
              )}
            </View>
          );
        })() : null}
      </ScrollView>
      
      <Modal visible={isImageModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsImageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsImageModalVisible(false)}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {profileData?.profile?.photo_urls && profileData.profile.photo_urls.length > 0 && (
            <FlatList
              data={profileData.profile.photo_urls}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={selectedImageIndex}
              getItemLayout={(data, index) => ({
                length: Dimensions.get('window').width,
                offset: Dimensions.get('window').width * index,
                index,
              })}
              renderItem={({ item }) => (
                <View style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height, justifyContent: 'center', alignItems: 'center' }}>
                  <Image source={{ uri: item }} style={styles.fullScreenImage} resizeMode="contain" />
                </View>
              )}
            />
          )}
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal visible={isReportModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsReportModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '80%', backgroundColor: colors.surfaceLight, borderRadius: 12, padding: spacing.l }}>
            <Typography variant="body" style={{ ...typography.h3, color: colors.textMainLight, marginBottom: spacing.m }}>Report User</Typography>
            <Typography variant="body" style={{ color: colors.textMutedLight, marginBottom: spacing.s }}>Why are you reporting this profile?</Typography>
            <TextInput
              style={{
                backgroundColor: colors.surfaceDark,
                color: colors.textMainLight,
                borderRadius: 8,
                padding: spacing.m,
                minHeight: 100,
                textAlignVertical: 'top',
                marginBottom: spacing.l
              }}
              placeholder="e.g. Inappropriate content, spam, fake profile..."
              placeholderTextColor={colors.textMutedLight}
              value={reportReason}
              onChangeText={setReportReason}
              multiline
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.m }}>
              <TouchableOpacity onPress={() => setIsReportModalVisible(false)} style={{ paddingVertical: spacing.s, paddingHorizontal: spacing.m }}>
                <Typography variant="body" style={{ color: colors.textMutedLight, fontWeight: 'bold' }}>Cancel</Typography>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReport} disabled={isReporting} style={{ paddingVertical: spacing.s, paddingHorizontal: spacing.m, backgroundColor: colors.error, borderRadius: 8 }}>
                {isReporting ? <ActivityIndicator color={colors.white} /> : <Typography variant="body" style={{ color: colors.white, fontWeight: 'bold' }}>Report</Typography>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* In-App Media Player Modal */}
      <InAppMediaModal
        visible={Boolean(mediaModalUrl)}
        url={mediaModalUrl}
        onClose={() => setMediaModalUrl(null)}
      />

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: 6,
    borderRadius: 10,
  },
  headerUsername: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMainLight,
    letterSpacing: 0.2,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  headerReportBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  headerTitle: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  errorText: {
    ...typography.h3,
    color: colors.error,
  },
  scrollContent: {
    padding: spacing.m,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.m,
    marginBottom: 18,
    paddingHorizontal: spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    padding: 3,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF',
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },
  avatarPlaceholder: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 16,
    gap: 6,
  },
  statCapsule: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMainLight,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textMutedLight,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  bioSection: {
    marginBottom: 16,
    paddingHorizontal: spacing.xl,
  },
  nameText: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.textMainLight,
    letterSpacing: -0.2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  roleBadgeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1D4ED8',
    textTransform: 'capitalize',
  },
  bioCard: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  bioCardText: {
    fontSize: 13.5,
    color: colors.textMainLight,
    lineHeight: 20,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  socialBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cintaaTopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  cintaaTopBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
    marginLeft: 7,
  },
  actionSection: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: 4,
    marginBottom: spacing.m,
  },
  primaryActionBtn: {
    flex: 1,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryActionBtnOutline: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryActionBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  shareProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  shareProfileBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.primary,
  },
  detailsSection: {
    paddingHorizontal: spacing.m,
    marginTop: spacing.m,
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
    zIndex: 1,
    padding: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
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
