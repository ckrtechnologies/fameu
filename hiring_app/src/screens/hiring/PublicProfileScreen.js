import { showError, showSuccess } from '../../utils/toast';
import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity, Modal, Dimensions, Linking , RefreshControl, FlatList, Animated, Text } from 'react-native';
import Video from 'react-native-video';
const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon, {
  Icon,
  BasicInfoSectionIcon,
  PreferencesSectionIcon,
  AgeProfileIcon,
  GenderProfileIcon,
  HeightProfileIcon,
  WeightProfileIcon,
  PhoneProfileIcon,
  LanguagesProfileIcon,
  NearbySpotlightIcon,
  VideoSectionIcon,
  MediaGallerySectionIcon,
  AssignmentsSectionIcon,
  CintaaGoldBadgeIcon,
  ShareProfileIcon,
  ReportFlagShieldIcon,
  BioQuoteIcon,
  ArtistRoleBadgeIcon,
  InstagramIcon,
  YouTubeIcon,
  FacebookIcon,
  SnapchatIcon,
} from '../../components/icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { typography, spacing } from '../../theme/theme';
import { useTheme } from '../../theme/ThemeProvider';
import ImageWithFallback from '../../components/core/ImageWithFallback';
import Typography from '../../components/core/Typography';
import CustomButton from '../../components/forms/CustomButton';
import { 
  useGetPublicProfileQuery, 
  useFollowUserMutation, 
  useUnfollowUserMutation,
  useRecordVisitMutation
} from '../../services/connectionsApi';
import { useStartConversationMutation } from '../../services/chatApi';
import { useGetCompanyProfileQuery } from '../../services/hiringApi';
import { useGetFeedQuery } from '../../services/discoverApi';
import CommentsSection from '../../components/CommentsSection';
import InAppMediaModal from '../../components/core/InAppMediaModal';

const CustomAudioPlayerItem = ({ uri, label }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={{ marginBottom: 16 }}>
      {label && <Typography variant="body" style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>{label}</Typography>}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: colors.surfaceLight, 
        padding: 12, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: colors.borderLight 
      }}>
        <TouchableOpacity 
          onPress={() => setIsPlaying(!isPlaying)}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' }}
        >
          <Icon name={isPlaying ? "pause" : "play"} size={22} color={colors.primary} style={{ marginLeft: isPlaying ? 0 : 3 }} />
        </TouchableOpacity>
        
        <View style={{ flex: 1, marginLeft: 16, marginRight: 12 }}>
           <Typography variant="body" style={{ fontWeight: '600', color: colors.textMainLight, marginBottom: 4 }} numberOfLines={1}>Audio Track</Typography>
           <View style={{ height: 4, backgroundColor: colors.borderLight, borderRadius: 2, overflow: 'hidden' }}>
             <View style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : '0%', height: '100%', backgroundColor: colors.primary }} />
           </View>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
             <Typography variant="caption" style={{ fontSize: 10, color: colors.textMutedLight }}>{formatTime(progress)}</Typography>
             <Typography variant="caption" style={{ fontSize: 10, color: colors.textMutedLight }}>{formatTime(duration)}</Typography>
           </View>
        </View>

        <Video 
          ref={videoRef}
          source={{ uri }}
          paused={!isPlaying}
          audioOnly={true}
          controls={false}
          onProgress={(e) => setProgress(e.currentTime)}
          onLoad={(e) => setDuration(e.duration)}
          onEnd={() => { setIsPlaying(false); setProgress(0); videoRef.current?.seek(0); }}
          style={{ width: 0, height: 0 }}
        />
      </View>
    </View>
  );
};

const CustomVideoPlayerItem = ({ uri, label }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  return (
    <View style={{ marginBottom: 16 }}>
      {label && <Typography variant="body" style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>{label}</Typography>}
      <View style={{ width: '100%', height: 250, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', position: 'relative' }}>
        <Video 
          source={{ uri }} 
          style={{ width: '100%', height: '100%' }} 
          controls={showControls}
          resizeMode="contain"
          paused={!isPlaying}
          onEnd={() => { setIsPlaying(false); setShowControls(false); }}
        />
        {!isPlaying && !showControls && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <TouchableOpacity 
              onPress={() => { setIsPlaying(true); setShowControls(true); }}
              style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                <Icon name="play" size={24} color="#fff" style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default function PublicProfileScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute();
  const navigation = useNavigation();
  const { username, scrollToComments } = route.params;
  
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const { data: profileData, isLoading, isError, refetch , isFetching} = useGetPublicProfileQuery(username);
  const { data: companyResponse } = useGetCompanyProfileQuery();
  const isVerified = companyResponse?.data?.is_verified;

  const hiringId = profileData?.role === 'hiring' ? (Array.isArray(profileData?.profile) ? profileData?.profile[0]?.id : profileData?.profile?.id) : null;
  const { data: auditions, isLoading: isAuditionsLoading } = useGetFeedQuery({ hiring_id: hiringId }, { skip: !hiringId });
  
  React.useEffect(() => {
    if (profileData && profileData.role === 'artist' && profileData.profile) {
      navigation.replace('ArtistProfileScreen', { id: profileData.profile.id });
    }
  }, [profileData, navigation]);

  const scrollViewRef = React.useRef(null);

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

  const parseArray = (str) => {
    if (!str) return [];
    if (typeof str === 'string') {
      try { return JSON.parse(str); } catch(e) { return str.split(',').filter(Boolean); }
    }
    if (Array.isArray(str)) return str;
    return [];
  };

  const getVideoInfo = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return { type: 'youtube', thumbnail: `https://img.youtube.com/vi/${url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0]}/0.jpg` };
    if (url.includes('vimeo.com')) return { type: 'vimeo' };
    return { type: 'other' };
  };

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true })
    ]).start();
  }, [fadeAnim, slideAnim]);


  // Record a profile visit when the profile loads (skip self-views)
  React.useEffect(() => {
    if (profileData?.id && currentUserId !== profileData.id) {
      recordVisit(profileData.id).catch(() => {}); // Fire-and-forget
    }
  }, [profileData?.id, currentUserId, recordVisit]);
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [showComments, setShowComments] = useState(false);

  React.useEffect(() => {
    if (profileData?.id) {
      const timer = setTimeout(() => setShowComments(true), 800);
      return () => clearTimeout(timer);
    }
  }, [profileData?.id]);
  const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState('photo'); // 'photo' or 'video'
  const [mediaModalUrl, setMediaModalUrl] = useState(null);
  const [mediaModalTitle, setMediaModalTitle] = useState('');
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
    if (!isVerified) {
      navigation.navigate('VerificationRequired');
      return;
    }
    if (!profileData) return;
    try {
      const result = await startConversation({ targetUserId: profileData.id }).unwrap();
      navigation.navigate('ChatScreen', {
        conversationId: result.data.id,
        otherParticipant: profileData,
      });
    } catch (error) {
      showError('', error?.data?.error || 'Failed to start conversation');
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
        <CustomButton title="Go Back" onPress={() => navigation.goBack()} variant="outline" style={{marginTop: spacing.m}} />
      </View>
    );
  }

  const isSelf = currentUserId === profileData.id;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profileData.name || `@${profileData.username}`}</Text>
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
      </View>

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}>
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
              <Text style={styles.statValue}>{profileData.followers_count || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statCapsule}
              onPress={() => profileData?.id && navigation.navigate('ConnectionList', { type: 'following', userId: profileData.id })}
              activeOpacity={0.75}
            >
              <Text style={styles.statValue}>{profileData.following_count || 0}</Text>
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
              <Typography variant="body2" style={{ color: colors.textMainLight, fontWeight: '600', marginBottom: spacing.xs }}>Contact Information</Typography>
              {(profileData.email) && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Icon name="mail-outline" size={16} color={colors.textMutedLight} style={{ marginRight: 8 }} />
                  <Typography variant="body2" style={{ color: colors.textMainLight }}>
                    {profileData.email}
                  </Typography>
                </View>
              )}
              {(profileData.mobile || profileData.profile?.phone) && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Icon name="call-outline" size={16} color={colors.textMutedLight} style={{ marginRight: 8 }} />
                  <Typography variant="body2" style={{ color: colors.textMainLight }}>
                    {profileData.mobile || profileData.profile?.phone}
                  </Typography>
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
                        <Typography variant="body2" style={{ color: colors.textMainLight }}>
                          {altContact.phone}
                        </Typography>
                      </View>
                    )}
                    {!!altContact?.email && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Icon name="mail-outline" size={16} color={colors.textMutedLight} style={{ marginRight: 8 }} />
                        <Typography variant="body2" style={{ color: colors.textMainLight }}>
                          {altContact.email}
                        </Typography>
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
                    <Typography variant="body" style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Typography>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {activeTab === 'Overview' ? (
              <View style={styles.portfolioSection}>
            {(() => {
              const profileVideos = [
                { url: profileData.profile.intro_video_url, title: 'Intro Video' },
                { url: profileData.profile.left_profile_url, title: 'Left Profile' },
                { url: profileData.profile.right_profile_url, title: 'Right Profile' }
              ].filter(v => v.url && v.url.trim().length > 0);

              if (profileVideos.length === 0) return null;

              return (
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12, paddingHorizontal: spacing.l }}>Profile Videos</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.l }}>
                    {profileVideos.map((video, index) => (
                          <View key={index} style={{ marginRight: spacing.m, width: 140 }}>
                            <TouchableOpacity 
                              onPress={() => {
                                const info = getVideoInfo(video.url);
                                if (info?.type !== 'direct') {
                                  import('react-native').then(({ Linking }) => {
                                    Linking.openURL(video.url).catch(() => {});
                                  });
                                } else {
                                  navigation.navigate('VideoPortfolio', { videos: profileVideos.map(v => v.url), initialIndex: index });
                                }
                              }}
                              style={{ width: '100%', height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceDark, overflow: 'hidden', borderRadius: 12, position: 'relative' }}
                            >
                              {(() => {
                                const info = getVideoInfo(video.url);
                                if (info?.thumbnail === 'INSTAGRAM') {
                                  return (
                                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }}>
                                      <Icon name="logo-instagram" color={colors.primary} size={40} />
                                    </View>
                                  );
                                }
                                if (info?.thumbnail === 'LINK') {
                                  return (
                                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }}>
                                      <Text style={{ ...typography.caption, color: colors.textMutedLight }}>Web Link</Text>
                                    </View>
                                  );
                                }
                                if (info?.thumbnail) {
                                  return <Image source={{ uri: info.thumbnail }} style={{ width: '100%', height: '100%', position: 'absolute' }} resizeMode="cover" />;
                                }
                                return <Video source={{ uri: video.url }} style={{ width: '100%', height: '100%', position: 'absolute' }} paused={true} resizeMode="cover" muted={true} />;
                              })()}
                              <View style={{ width: '100%', height: '100%', position: 'absolute', backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
                                <Icon name="play" size={40} color={colors.white} />
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
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.l, marginBottom: 12 }}>
                  <Text style={{ ...typography.h3, color: colors.primary }}>Video Portfolio</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('VideoPortfolio', { isOwner: true })}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.l }}>
                  {profileData.profile.video_url.split(',').filter(Boolean).map((vUrl, idx) => {
                    const info = getVideoInfo(vUrl);
                    return (
                      <TouchableOpacity 
                        key={`vid-${idx}`}
                        style={{ width: 140, height: 200, borderRadius: 12, backgroundColor: colors.surfaceDark, marginRight: 12, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}
                        onPress={() => {
                          if (info?.type !== 'direct') {
                            import('react-native').then(({ Linking }) => {
                              Linking.openURL(vUrl).catch(() => {});
                            });
                          } else {
                            navigation.navigate('VideoPortfolio', { isOwner: true, initialIndex: idx });
                          }
                        }}
                      >
                        {info?.thumbnail === 'INSTAGRAM' ? (
                          <View style={{ width: '100%', height: '100%', backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }}>
                            <Icon name="logo-instagram" color={colors.primary} size={32} />
                            <Text style={{ ...typography.caption, color: colors.textMutedLight, marginTop: 8 }}>Instagram</Text>
                          </View>
                        ) : info?.thumbnail === 'LINK' ? (
                          <View style={{ width: '100%', height: '100%', backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ ...typography.caption, color: colors.textMutedLight, marginTop: 8 }}>Web Link</Text>
                          </View>
                        ) : info?.thumbnail ? (
                          <Image source={{ uri: info.thumbnail }} style={{ width: '100%', height: '100%', position: 'absolute', resizeMode: 'cover' }} />
                        ) : (
                          <Video source={{ uri: vUrl }} style={{ width: '100%', height: '100%', position: 'absolute' }} paused={true} resizeMode="cover" muted={true} />
                        )}
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                          <Icon name="play" size={32} color={colors.white} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Basic Info Section */}
            <View style={{ marginBottom: 24, marginHorizontal: spacing.l }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ backgroundColor: colors.primary + '15', padding: 8, borderRadius: 14, marginRight: 10 }}>
                  <BasicInfoSectionIcon size={24} />
                </View>
                <Text style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Basic Info</Text>
              </View>

              {/* Symmetrical 2-Column Side-by-Side Grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {(() => {
                  const p = profileData.profile;
                  const standardInfoItems = [
                    p.age ? { key: 'age', label: 'Age', value: `${p.age} yrs`, IconComp: AgeProfileIcon, bg: '#FFF7ED' } : null,
                    p.gender ? { key: 'gender', label: 'Gender', value: p.gender, IconComp: GenderProfileIcon, bg: '#FDF2F8' } : null,
                    p.height ? { key: 'height', label: 'Height', value: p.height, IconComp: HeightProfileIcon, bg: '#ECFDF5' } : null,
                    p.weight ? { key: 'weight', label: 'Weight', value: `${p.weight} kg`, IconComp: WeightProfileIcon, bg: '#EFF6FF' } : null,
                    (p.alt_number || p.alternate_phone) ? { key: 'alt_phone', label: 'Alt. Number', value: p.alt_number || p.alternate_phone, IconComp: PhoneProfileIcon, bg: '#ECFDF5' } : null,
                    (Array.isArray(p.languages) && p.languages.length > 0) ? { key: 'languages', label: 'Languages', value: p.languages.join(', '), IconComp: LanguagesProfileIcon, bg: '#EFF6FF' } : null,
                    p.city ? { key: 'city', label: 'Base City', value: p.city, IconComp: NearbySpotlightIcon, bg: '#F0FDF4' } : null,
                    p.availability_type ? { key: 'availability', label: 'Availability', value: p.availability_type, IconComp: null, iconName: 'availability_type', bg: '#FFFBEB' } : null,
                    p.available_dates ? { key: 'dates', label: 'Dates', value: p.available_dates, IconComp: null, iconName: 'available_dates', bg: '#EEF2FF' } : null,
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

              {/* Special Skills */}
              {Array.isArray(profileData.profile.skills) && profileData.profile.skills.length > 0 && (
                <View style={styles.basicInfoFullCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#FEF3C7' }]}>
                      <AppIcon name="skills" size={20} />
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
              <View style={{ marginBottom: 24, marginHorizontal: spacing.l }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ backgroundColor: '#D1FAE5', padding: 8, borderRadius: 14, marginRight: 10 }}>
                    <PreferencesSectionIcon size={24} />
                  </View>
                  <Text style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Preferences & Tags</Text>
                </View>
                
                {profileData.profile.work_preference?.length > 0 && (
                  <View style={styles.basicInfoFullCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#FFEDD5' }]}>
                        <AppIcon name="briefcase" size={18} />
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
                        <AppIcon name="location" size={18} />
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
                        <AppIcon name="people" size={18} />
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
                  <View style={styles.basicInfoFullCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#FCE7F3' }]}>
                        <AppIcon name="pricetag" size={18} />
                      </View>
                      <Text style={styles.basicInfoSectionTitle}>Hashtags</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {parseArray(profileData.profile.hashtags).map((t, i) => (
                        <View key={i} style={[styles.languageChip, { backgroundColor: '#FDF2F8', borderColor: '#FCE7F3' }]}>
                          <Text style={[styles.languageChipText, { color: '#BE185D' }]}>#{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Recent Assignments Section */}
            {profileData.profile.recent_assignments?.length > 0 && (
              <View style={{ marginBottom: 24, paddingHorizontal: spacing.l }}>
                <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Recent Assignments</Text>
                {parseArray(profileData.profile.recent_assignments).map((assignment, idx) => (
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
                            onPress={() => {
                              setMediaModalTitle(assignment.title || 'Assignment Video');
                              setMediaModalUrl(linkStr);
                            }}
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

            <View style={{ marginBottom: 24, paddingHorizontal: spacing.l }}>
              <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Media Gallery</Text>
              
              {(!profileData.profile.photo_urls || profileData.profile.photo_urls.length === 0) && !profileData.profile.video_url ? (
                <View style={styles.emptyPortfolio}>
                  <Text style={{ color: colors.textMutedLight, textAlign: 'center' }}>No media in portfolio.</Text>
                </View>
              ) : (
                <View>
                  {/* Video Section */}
                  {typeof profileData.profile.video_url === 'string' && profileData.profile.video_url.trim().length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 0, marginBottom: 16 }}>
                    {profileData.profile.video_url.split(',').filter(Boolean).map((vidUrl, index) => {
                      const info = getVideoInfo(vidUrl);
                      return (
                        <TouchableOpacity 
                          key={index} 
                          onPress={() => {
                            const selectedUrl = profileData.profile.video_url.split(',').filter(Boolean)[index];
                            setMediaModalTitle(profileData.user?.display_name ? `${profileData.user.display_name}'s Video` : 'Video');
                            setMediaModalUrl(selectedUrl);
                          }}
                          style={[styles.galleryItem, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceDark, marginRight: spacing.s, overflow: 'hidden' }]}
                        >
                          {info?.thumbnail === 'INSTAGRAM' ? (
                            <View style={{ width: '100%', height: '100%', backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }}>
                              <Icon name="logo-instagram" color={colors.primary} size={32} />
                              <Text style={{ ...typography.caption, color: colors.textMutedLight, marginTop: 8 }}>Instagram</Text>
                            </View>
                          ) : info?.thumbnail === 'LINK' ? (
                            <View style={{ width: '100%', height: '100%', backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ ...typography.caption, color: colors.textMutedLight, marginTop: 8 }}>Web Link</Text>
                            </View>
                          ) : info?.thumbnail ? (
                            <Image source={{ uri: info.thumbnail }} style={{ width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' }} />
                          ) : (
                            <Video source={{ uri: vidUrl }} style={{ width: '100%', height: '100%', position: 'absolute' }} paused={true} resizeMode="cover" muted={true} />
                          )}
                          <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                            <Icon name="play" size={40} color={colors.white} />
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                ) : null}

                  {/* Photo Section */}
                  {profileData.profile.photo_urls && profileData.profile.photo_urls.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 0 }}>
                      {parseArray(profileData.profile.photo_urls).map((imgUrl, index) => (
                        <TouchableOpacity key={index} onPress={() => { setSelectedImageIndex(index); setIsImageModalVisible(true); }} style={{ marginRight: spacing.s }}>
                          <Image source={{ uri: imgUrl }} style={styles.galleryItem} resizeMode="contain" />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : null}
                </View>
              )}
            </View>
          </View>
            ) : (
              <View style={{ paddingHorizontal: spacing.l, marginTop: spacing.l }}>
                {(() => {
                  const details = profileData.profile.category_details?.[activeTab] || profileData.profile.category_details?.[activeTab.toLowerCase()];
                  if (!details) {
                    return (
                      <View style={styles.emptyPortfolio}>
                        <Typography variant="body" style={{ color: colors.textMutedLight }}>No {activeTab} details added.</Typography>
                      </View>
                    );
                  }
                  
                  const entries = Object.entries(details).filter(([k,v]) => k !== 'id' && k !== 'artist_id' && v !== null && v !== '');
                  if (entries.length === 0) {
                    return (
                      <View style={styles.emptyPortfolio}>
                        <Typography variant="body" style={{ color: colors.textMutedLight }}>No {activeTab} details added.</Typography>
                      </View>
                    );
                  }
                  
                  return (
                    <View style={{ backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12, marginBottom: 12 }}>
                      <Typography variant="body" style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>{activeTab} Details</Typography>
                      {entries.map(([k,v]) => {
                        const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        const renderMediaItem = (itemValue, index) => {
                          const strVal = String(itemValue);
                          const isVideo = strVal.match(/\.(mp4|mov|avi|wmv|mkv)$/i);
                          const isAudio = strVal.match(/\.(mp3|wav|aac|ogg|webm|m4a|flac)$/i);
                          const isImage = strVal.match(/\.(jpg|jpeg|png|webp)$/i);

                          if (isAudio) {
                            return <CustomAudioPlayerItem key={`${k}-${index}`} uri={strVal} label={index === 0 ? label : null} />;
                          }

                          if (isVideo) {
                            return <CustomVideoPlayerItem key={`${k}-${index}`} uri={strVal} label={index === 0 ? label : null} />;
                          }

                          if (isImage) {
                            return (
                              <View key={`${k}-${index}`} style={{ marginBottom: 16 }}>
                                {index === 0 && <Typography variant="body" style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>{label}</Typography>}
                                <Image source={{ uri: strVal }} style={{ width: '100%', height: 250, borderRadius: 8, backgroundColor: colors.surfaceLight, marginBottom: 8 }} resizeMode="cover" />
                              </View>
                            );
                          }
                          return null;
                        };

                        const mediaRegex = /\.(mp4|mov|avi|wmv|mkv|mp3|wav|aac|ogg|webm|m4a|flac|jpg|jpeg|png|webp)$/i;
                        const isMediaArray = Array.isArray(v) && v.some(val => String(val).match(mediaRegex));
                        const isSingleMedia = typeof v === 'string' && String(v).match(mediaRegex);

                        if (isMediaArray) {
                          return <View key={k}>{v.map((item, idx) => renderMediaItem(item, idx))}</View>;
                        }

                        if (isSingleMedia) {
                          return <View key={k}>{renderMediaItem(v, 0)}</View>;
                        }

                        const urlStr = typeof v === 'string' ? v.trim() : '';
                        const urlRegex = /^(https?:\/\/[^\s]+)$/i;
                        const isUrl = urlRegex.test(urlStr);

                        if (isUrl) {
                          const isYoutube = urlStr.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                          const isInstagram = urlStr.match(/instagram\.com/i);

                          if (isYoutube) {
                            const videoId = isYoutube[1];
                            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
                            return (
                              <View key={k} style={{ marginBottom: 16 }}>
                                <Typography variant="body" style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>{label}</Typography>
                                <TouchableOpacity 
                                  onPress={() => Linking.openURL(urlStr)}
                                  style={{ position: 'relative', width: '100%', height: 200, borderRadius: 12, overflow: 'hidden' }}
                                >
                                  <Image source={{ uri: thumbnailUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name="logo-youtube" size={48} color="#ef4444" />
                                  </View>
                                </TouchableOpacity>
                              </View>
                            );
                          }
                          
                          if (isInstagram) {
                            return (
                              <View key={k} style={{ marginBottom: 16 }}>
                                <Typography variant="body" style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>{label}</Typography>
                                <TouchableOpacity 
                                  onPress={() => Linking.openURL(urlStr)}
                                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fdf4ff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fbcfe8' }}
                                >
                                  <Icon name="logo-instagram" size={24} color="#db2777" style={{ marginRight: 12 }} />
                                  <Typography variant="body" style={{ ...typography.body, color: '#db2777', fontWeight: 'bold' }}>View on Instagram</Typography>
                                </TouchableOpacity>
                              </View>
                            );
                          }

                          return (
                            <View key={k} style={{ marginBottom: 16 }}>
                              <Typography variant="body" style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>{label}</Typography>
                              <TouchableOpacity 
                                onPress={() => Linking.openURL(urlStr)}
                                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12 }}
                              >
                                <Icon name="link" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                                <Typography variant="body" style={{ ...typography.body, color: colors.primary, flex: 1 }} numberOfLines={1}>{urlStr}</Typography>
                              </TouchableOpacity>
                            </View>
                          );
                        }

                        const textValue = Array.isArray(v) ? v.join(', ') : String(v);
                        return (
                          <View key={k} style={{ marginBottom: 8 }}>
                            <Typography variant="body" style={{ ...typography.caption, color: colors.textMutedLight }}>{label}</Typography>
                            <Typography variant="body" style={{ ...typography.body, color: colors.textMainLight }}>{textValue}</Typography>
                          </View>
                        );
                      })}
                    </View>
                  );
                })()}
              </View>
            )}
            
            {/* Artist Profile Comments */}
            {profileData.profile && profileData.profile.id && (
              <View style={{ marginHorizontal: spacing.l, marginBottom: 24, marginTop: 12 }}>
                {showComments && <CommentsSection targetType="artist_profile" targetId={profileData.profile.id} />}
              </View>
            )}
          </View>
        ) : profileData.role === 'hiring' && profileData.profile ? (() => {
          const hiringProfile = Array.isArray(profileData.profile) ? profileData.profile[0] : profileData.profile;

          const grouped = (auditions?.data || []).reduce((acc, curr) => {
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
                  <Typography variant="h3" style={{ fontWeight: '700', color: colors.textMainLight }}>{auditions?.data?.length || 0}</Typography>
                  <Typography variant="caption" style={{ color: colors.textSecondaryLight }}>Posts</Typography>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Typography variant="h3" style={{ fontWeight: '700', color: colors.textMainLight }}>0</Typography>
                  <Typography variant="caption" style={{ color: colors.textSecondaryLight }}>Hired</Typography>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: colors.borderLight, marginBottom: spacing.m }} />
              
              {categoriesData.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
                  <Icon name="camera" size={48} color={colors.borderLight} />
                  <Typography variant="body2" style={{ color: colors.textMutedLight, marginTop: spacing.s }}>No posts yet</Typography>
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
                      {catItem.data.map((item, index) => (
                          <TouchableOpacity 
                          key={item.id}
                          style={{ width: 140, height: 140, marginRight: spacing.m, backgroundColor: colors.surfaceLight, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderLight }}
                          onPress={() => navigation.navigate('AuditionDetails', { auditionId: item.id })}
                        >
                          <View style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
                            <ImageWithFallback source={{ uri: item.thumbnail_url }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: spacing.xs }}>
                              <Typography variant="caption" style={{ textAlign: 'center', color: '#fff' }} numberOfLines={2}>{item.title}</Typography>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
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
      <InAppMediaModal
        visible={Boolean(mediaModalUrl)}
        url={mediaModalUrl}
        title={mediaModalTitle}
        onClose={() => setMediaModalUrl(null)}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  },
  headerBackBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
  },
  headerTitle: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerReportBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.m,
    marginBottom: 18,
    paddingHorizontal: spacing.l,
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
    paddingHorizontal: spacing.l,
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
    paddingHorizontal: spacing.l,
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
    width: (width - 48) / 3 - 2,
    aspectRatio: 1,
    marginBottom: 4,
    marginRight: 4,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
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
  basicInfoSectionTitle: {
    fontSize: 14,
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.m },
  modalContent: { width: '100%', backgroundColor: colors.surfaceLight, borderRadius: 12, padding: spacing.l },
  auditionSelectBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 8, marginBottom: 8 },
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
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    ...typography.body1,
    color: colors.textMainLight,
    marginLeft: spacing.m,
  },
  footer: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  },
});
