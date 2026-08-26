import { GlobalAlert } from '../../components/core/GlobalAlert';
import { showError, showSuccess } from '../../utils/toast';
import React, { useState } from 'react';
import { View, Animated, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Linking, Alert, Modal, Dimensions , RefreshControl, TextInput, Share } from 'react-native';
import Video from 'react-native-video';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');
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
import { typography, spacing, globalStyles } from '../../theme/theme';
import { useTheme } from '../../theme/ThemeProvider';
import CommentsSection from '../../components/CommentsSection';
import { useGetArtistDetailsQuery, useInviteArtistMutation, useReportArtistMutation } from '../../services/discoveryApi';
import { useStartConversationMutation } from '../../services/chatApi';
import { useGetCompanyProfileQuery, useGetDashboardDataQuery } from '../../services/hiringApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../components/forms/CustomButton';
import SkeletonLoader from '../../components/SkeletonLoader';
import InAppMediaModal from '../../components/core/InAppMediaModal';
import VideoThumbnail from '../../components/core/VideoThumbnail';
export default function ArtistProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  
  const { id } = route.params;
  const { data: response, isLoading, error , isFetching, refetch} = useGetArtistDetailsQuery(id);
  const { data: companyResponse } = useGetCompanyProfileQuery();
  const isVerified = companyResponse?.data?.is_verified;
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [selectedAuditionId, setSelectedAuditionId] = useState('');
  const [auditionSearchText, setAuditionSearchText] = useState('');
  const [invitationMessage, setInvitationMessage] = useState('');
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [mediaModalUrl, setMediaModalUrl] = useState(null);
  const [mediaModalTitle, setMediaModalTitle] = useState('');

  const [startConversation, { isLoading: isStartingChat }] = useStartConversationMutation();
  const [inviteArtist, { isLoading: isInviting }] = useInviteArtistMutation();
  const [reportArtist, { isLoading: isReporting }] = useReportArtistMutation();
  const { data: dashboardData } = useGetDashboardDataQuery();
  const myAuditions = dashboardData?.data?.activeAuditions || [];

  
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

  const artist = response?.data;
  const user = artist?.users;

  if (isLoading) {
    return (
      <SafeAreaView style={[globalStyles.container, { padding: spacing.xl }]} edges={['top', 'bottom']}>
        <View style={styles.appBar}>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
        </View>
        <View style={{ alignItems: 'center', marginTop: spacing.xxl }}>
          <SkeletonLoader width={120} height={120} borderRadius={60} />
          <SkeletonLoader width={150} height={24} style={{ marginTop: spacing.m }} />
          <SkeletonLoader width={100} height={20} />
        </View>
        <SkeletonLoader height={100} style={{ marginTop: spacing.xxl }} />
      </SafeAreaView>
    );
  }

  if (error || !artist) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.center]} edges={['top', 'bottom']}>
        <Text style={typography.body1}>Failed to load artist profile.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.m }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleContact = () => {
    if (!isVerified) {
      navigation.navigate('VerificationRequired');
      return;
    }
    GlobalAlert.show("Contact Artist", `Would you like to invite ${artist.full_name} to an audition or send a message?`, [
      { text: "Invite", onPress: () => setIsInviteModalVisible(true) },
      { text: "Message", onPress: async () => {
          try {
            const response = await startConversation({ targetUserId: artist.user_id }).unwrap();
            navigation.navigate('ChatScreen', { 
              conversationId: response.data.id,
              otherUserName: artist.full_name 
            });
          } catch (err) {
            showError('', 'Failed to start conversation.');
          }
        } 
      },
      { text: "Cancel", style: "cancel" }
    ]);
  };

  const handleInviteSubmit = async () => {
    if (!selectedAuditionId) {
      showError('', 'Please select an audition to invite the artist to.');
      return;
    }
    try {
      await inviteArtist({ id: artist.id, audition_id: selectedAuditionId, message: invitationMessage }).unwrap();
      showSuccess('', 'Artist has been invited successfully.');
      setIsInviteModalVisible(false);
      setSelectedAuditionId('');
      setAuditionSearchText('');
      setInvitationMessage('');
    } catch (err) {
      showError('', err?.data?.error || 'Failed to send invite.');
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      showError('', 'Please provide a reason for reporting.');
      return;
    }
    try {
      await reportArtist({ id: artist.id, reason: reportReason }).unwrap();
      showSuccess('', 'Artist reported successfully. Our team will review this shortly.');
      setIsReportModalVisible(false);
      setReportReason('');
    } catch (err) {
      showError('', err?.data?.error || 'Failed to report artist.');
    }
  };

  const openLink = async (url) => {
    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        showError('', 'Cannot open this link');
      }
    }
  };

  const handleShare = async () => {
    if (!user || !user.username) return;
    try {
      const url = `https://fameu.app/artist/${user.username}`;
      await Share.share({
        message: `Check out ${artist.full_name}'s profile on Fameu! ${url}`,
        url: url,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>{artist.full_name || `@${user?.username}`}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <TouchableOpacity onPress={handleShare} style={styles.headerActionBtn}>
            <ShareProfileIcon size={18} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsReportModalVisible(true)} style={styles.headerReportBtn}>
            <ReportFlagShieldIcon size={18} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}>
        {/* Profile Header Area (Avatar & 3 Stat Capsules) */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            {user?.avatar_url || artist?.profile_image_url ? (
              <Image source={{ uri: user?.avatar_url || artist?.profile_image_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={{ fontSize: 32, fontWeight: '800', color: '#FFFFFF' }}>
                  {(artist.full_name || user?.username || 'A').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCapsule}>
              <Text style={styles.statValue}>{user?.followers_count || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statCapsule}>
              <Text style={styles.statValue}>{user?.following_count || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statCapsule}>
              <Text style={styles.statValue}>{user?.visit_count || artist?.views || 0}</Text>
              <Text style={styles.statLabel}>Profile Views</Text>
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.nameText}>{artist.full_name}</Text>
          
          <View style={styles.roleBadge}>
            <ArtistRoleBadgeIcon size={14} style={{ marginRight: 6 }} />
            <Text style={styles.roleBadgeText}>
              {Array.isArray(artist.categories) && artist.categories.length > 0 
                ? artist.categories.join(' • ') 
                : (artist.category || (user?.username ? `@${user.username}` : 'Verified Artist'))}
            </Text>
          </View>

          {/* Bio Text Card with Quote Icon */}
          {artist.bio && (
            <View style={styles.bioCard}>
              <BioQuoteIcon size={16} style={{ marginBottom: 6 }} />
              <Text style={styles.bioCardText}>{artist.bio}</Text>
            </View>
          )}

          {/* Social Links Row */}
          {artist?.social_links && (() => {
            const links = typeof artist.social_links === 'string' 
              ? JSON.parse(artist.social_links || '{}') 
              : artist.social_links;
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
          {artist?.is_cintaa_member && (
            <View style={styles.cintaaTopBadge}>
              <CintaaGoldBadgeIcon size={18} />
              <Text style={styles.cintaaTopBadgeText}>
                Verified CINTAA Member ({artist.cintaa_reg_number})
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.primaryActionBtn} 
            onPress={handleContact}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionBtnText}>Contact Talent</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryActionBtn} 
            onPress={async () => {
              try {
                const res = await startConversation({ targetUserId: artist.user_id }).unwrap();
                navigation.navigate('ChatScreen', { 
                  conversationId: res.data.id,
                  otherUserName: artist.full_name 
                });
              } catch (err) {
                showError('', 'Failed to start conversation.');
              }
            }}
            disabled={isStartingChat}
            activeOpacity={0.85}
          >
            <Icon name="chatbubble-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.secondaryActionBtnText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareProfileBtn}
            activeOpacity={0.8}
            onPress={handleShare}
          >
            <ShareProfileIcon size={18} style={{ marginRight: 6 }} />
            <Text style={styles.shareProfileBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsSection}>
            <View style={styles.tabsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                {['Overview', ...(artist.categories || [])].map(tab => (
                  <TouchableOpacity 
                    key={tab} 
                    style={[styles.tab, activeTab === tab && styles.tabActive]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {activeTab === 'Overview' ? (
              <View style={styles.portfolioSection}>
            {(() => {
              const profileVideos = [
                { url: artist.intro_video_url, title: 'Intro Video' },
                { url: artist.left_profile_url, title: 'Left Profile' },
                { url: artist.right_profile_url, title: 'Right Profile' }
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
            {typeof artist.video_url === 'string' && artist.video_url.trim().length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.l, marginBottom: 12 }}>
                  <Text style={{ ...typography.h3, color: colors.primary }}>Video Portfolio</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('VideoPortfolio', { isOwner: true })}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.l }}>
                  {artist.video_url.split(',').filter(Boolean).map((vUrl, idx) => {
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
                  const standardInfoItems = [
                    artist.age ? { key: 'age', label: 'Age', value: `${artist.age} yrs`, IconComp: AgeProfileIcon, bg: '#FFF7ED' } : null,
                    artist.gender ? { key: 'gender', label: 'Gender', value: artist.gender, IconComp: GenderProfileIcon, bg: '#FDF2F8' } : null,
                    artist.height ? { key: 'height', label: 'Height', value: artist.height, IconComp: HeightProfileIcon, bg: '#ECFDF5' } : null,
                    artist.weight ? { key: 'weight', label: 'Weight', value: `${artist.weight} kg`, IconComp: WeightProfileIcon, bg: '#EFF6FF' } : null,
                    (artist.alt_number || artist.alternate_phone) ? { key: 'alt_phone', label: 'Alt. Number', value: artist.alt_number || artist.alternate_phone, IconComp: PhoneProfileIcon, bg: '#ECFDF5' } : null,
                    (Array.isArray(artist.languages) && artist.languages.length > 0) ? { key: 'languages', label: 'Languages', value: artist.languages.join(', '), IconComp: LanguagesProfileIcon, bg: '#EFF6FF' } : null,
                    artist.city ? { key: 'city', label: 'Base City', value: artist.city, IconComp: NearbySpotlightIcon, bg: '#F0FDF4' } : null,
                    artist.availability_type ? { key: 'availability', label: 'Availability', value: artist.availability_type, IconComp: null, iconName: 'availability_type', bg: '#FFFBEB' } : null,
                    artist.available_dates ? { key: 'dates', label: 'Dates', value: artist.available_dates, IconComp: null, iconName: 'available_dates', bg: '#EEF2FF' } : null,
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
              {Array.isArray(artist.skills) && artist.skills.length > 0 && (
                <View style={styles.basicInfoFullCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#FEF3C7' }]}>
                      <AppIcon name="skills" size={20} />
                    </View>
                    <Text style={styles.basicInfoSectionTitle}>Special Skills</Text>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {artist.skills.map((sk, idx) => (
                      <View key={idx} style={[styles.languageChip, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                        <Text style={[styles.languageChipText, { color: '#B45309' }]}>{sk}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Tags / Preferences Section */}
            {(artist.work_preference?.length > 0 || artist.preferred_cities?.length > 0 || artist.look_alike?.length > 0 || artist.hashtags?.length > 0) && (
              <View style={{ marginBottom: 24, marginHorizontal: spacing.l }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ backgroundColor: '#D1FAE5', padding: 8, borderRadius: 14, marginRight: 10 }}>
                    <PreferencesSectionIcon size={24} />
                  </View>
                  <Text style={{ ...typography.h3, color: colors.textMainLight, fontWeight: 'bold' }}>Preferences & Tags</Text>
                </View>
                
                {artist.work_preference?.length > 0 && (
                  <View style={styles.basicInfoFullCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#FFEDD5' }]}>
                        <AppIcon name="briefcase" size={18} />
                      </View>
                      <Text style={styles.basicInfoSectionTitle}>Work Preference</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {parseArray(artist.work_preference).map((t, i) => (
                        <View key={i} style={[styles.languageChip, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
                          <Text style={[styles.languageChipText, { color: '#C2410C' }]}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                
                {artist.preferred_cities?.length > 0 && (
                  <View style={styles.basicInfoFullCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#CCFBF1' }]}>
                        <AppIcon name="location" size={18} />
                      </View>
                      <Text style={styles.basicInfoSectionTitle}>Preferred Locations</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {parseArray(artist.preferred_cities).map((t, i) => (
                        <View key={i} style={[styles.languageChip, { backgroundColor: '#F0FDFA', borderColor: '#CCFBF1' }]}>
                          <Text style={[styles.languageChipText, { color: '#0F766E' }]}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {artist.look_alike?.length > 0 && (
                  <View style={styles.basicInfoFullCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#F3E8FF' }]}>
                        <AppIcon name="people" size={18} />
                      </View>
                      <Text style={styles.basicInfoSectionTitle}>Look Alikes</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {parseArray(artist.look_alike).map((t, i) => (
                        <View key={i} style={[styles.languageChip, { backgroundColor: '#FAF5FF', borderColor: '#F3E8FF' }]}>
                          <Text style={[styles.languageChipText, { color: '#7E22CE' }]}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {artist.hashtags?.length > 0 && (
                  <View style={styles.basicInfoFullCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <View style={[styles.basicInfoIconBadgeSmall, { backgroundColor: '#FCE7F3' }]}>
                        <AppIcon name="pricetag" size={18} />
                      </View>
                      <Text style={styles.basicInfoSectionTitle}>Hashtags</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {parseArray(artist.hashtags).map((t, i) => (
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
            {artist.recent_assignments?.length > 0 && (
              <View style={{ marginBottom: 24, paddingHorizontal: spacing.l }}>
                <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Recent Assignments</Text>
                {parseArray(artist.recent_assignments).map((assignment, idx) => (
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
              
              {(!artist.photo_urls || artist.photo_urls.length === 0) && !artist.video_url ? (
                <View style={styles.emptyPortfolio}>
                  <Text style={{ color: colors.textMutedLight, textAlign: 'center' }}>No media in portfolio.</Text>
                </View>
              ) : (
                <View>
                  {/* Video Section */}
                  {typeof artist.video_url === 'string' && artist.video_url.trim().length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 0, marginBottom: 16 }}>
                    {artist.video_url.split(',').filter(Boolean).map((vidUrl, index) => {
                      const info = getVideoInfo(vidUrl);
                      return (
                        <TouchableOpacity 
                          key={index} 
                          onPress={() => {
                            const selectedUrl = artist.video_url.split(',').filter(Boolean)[index];
                            setMediaModalTitle(artist.full_name ? `${artist.full_name}'s Video` : 'Video');
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
                  {artist.photo_urls && artist.photo_urls.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 0 }}>
                      {parseArray(artist.photo_urls).map((imgUrl, index) => (
                        <TouchableOpacity key={index} onPress={() => { setSelectedImage(imgUrl); setIsImageModalVisible(true); }} style={{ marginRight: spacing.s }}>
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
              <View style={{ marginTop: spacing.l }}>
                {(() => {
                  const details = artist.category_details?.[activeTab] || artist.category_details?.[activeTab.toLowerCase()];
                  if (!details) {
                    return (
                      <View style={styles.emptyPortfolio}>
                        <Text style={{ color: colors.textMutedLight }}>No {activeTab} details added.</Text>
                      </View>
                    );
                  }
                  
                  const entries = Object.entries(details).filter(([k,v]) => k !== 'id' && k !== 'artist_id' && v !== null && v !== '');
                  if (entries.length === 0) {
                    return (
                      <View style={styles.emptyPortfolio}>
                        <Text style={{ color: colors.textMutedLight }}>No {activeTab} details added.</Text>
                      </View>
                    );
                  }
                  
                  return (
                    <View style={{ backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12, marginBottom: 12 }}>
                      <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>{activeTab} Details</Text>
                      {entries.map(([k,v]) => {
                        const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                        const renderMediaItem = (itemValue, index) => {
                          const strVal = String(itemValue);
                          const isVideo = strVal.match(/\.(mp4|mov|avi|wmv|mkv)$/i);
                          const isAudio = strVal.match(/\.(mp3|wav|aac|ogg|webm|m4a|flac)$/i);
                          const isImage = strVal.match(/\.(jpg|jpeg|png|webp)$/i);

                          if (isVideo || isAudio) {
                            return (
                              <View key={`${k}-${index}`} style={{ marginBottom: 16 }}>
                                {index === 0 && <Text style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>{label}</Text>}
                                <Video 
                                  source={{ uri: strVal }} 
                                  style={{ width: '100%', height: isVideo ? 250 : 50, borderRadius: 8, backgroundColor: '#000', marginBottom: 8 }} 
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
                                {index === 0 && <Text style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>{label}</Text>}
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
                                <Text style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>{label}</Text>
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
                                <Text style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>{label}</Text>
                                <TouchableOpacity 
                                  onPress={() => Linking.openURL(urlStr)}
                                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fdf4ff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fbcfe8' }}
                                >
                                  <Icon name="logo-instagram" size={24} color="#db2777" style={{ marginRight: 12 }} />
                                  <Text style={{ ...typography.body, color: '#db2777', fontWeight: 'bold' }}>View on Instagram</Text>
                                </TouchableOpacity>
                              </View>
                            );
                          }

                          return (
                            <View key={k} style={{ marginBottom: 16 }}>
                              <Text style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>{label}</Text>
                              <TouchableOpacity 
                                onPress={() => Linking.openURL(urlStr)}
                                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12 }}
                              >
                                <Icon name="link-outline" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                                <Text style={{ ...typography.body, color: colors.primary, flex: 1 }} numberOfLines={1}>{urlStr}</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        }

                        const textValue = Array.isArray(v) ? v.join(', ') : String(v);
                        return (
                          <View key={k} style={{ marginBottom: 8 }}>
                            <Text style={{ ...typography.caption, color: colors.textMutedLight }}>{label}</Text>
                            <Text style={{ ...typography.body, color: colors.textMainLight }}>{textValue}</Text>
                          </View>
                        );
                      })}
                    </View>
                  );
                })()}
              </View>
            )}
          </View>

          <CommentsSection targetType="artist_profile" targetId={artist.id} />
      </ScrollView>

      {/* Modals for Image, Invite, and Report */}
      <Modal visible={isImageModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsImageModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setIsImageModalVisible(false)}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />}
        </View>
      </Modal>

      <Modal visible={isInviteModalVisible} transparent={true} animationType="slide" onRequestClose={() => setIsInviteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[typography.h3, { marginBottom: 16, color: colors.textMainLight }]}>Invite to Audition</Text>
            {myAuditions.length === 0 ? (
              <Text style={[typography.body, { color: colors.textMutedLight, marginBottom: 16 }]}>You have no active auditions. Please create one first.</Text>
            ) : (
              <View style={{ marginBottom: 16, maxHeight: 350 }}>
                <TextInput
                  style={[styles.searchInput, { marginBottom: 12, backgroundColor: colors.surfaceLight, color: colors.textMainLight, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.borderLight }]}
                  placeholder="Search auditions..."
                  placeholderTextColor={colors.textMutedLight}
                  value={auditionSearchText}
                  onChangeText={setAuditionSearchText}
                />
                <ScrollView style={{ maxHeight: 150 }}>
                  {myAuditions.filter(a => a.title.toLowerCase().includes(auditionSearchText.toLowerCase())).map(audition => (
                    <TouchableOpacity
                      key={audition.id}
                      style={[
                        styles.auditionSelectBtn,
                        selectedAuditionId === audition.id && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                      ]}
                      onPress={() => setSelectedAuditionId(audition.id)}
                    >
                      <Icon name={selectedAuditionId === audition.id ? "radio-button-on" : "radio-button-off"} size={20} color={selectedAuditionId === audition.id ? colors.primary : colors.textMutedLight} />
                      <Text style={{ marginLeft: 8, flex: 1, color: colors.textMainLight, ...typography.body }} numberOfLines={1}>{audition.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TextInput
                  style={[styles.searchInput, { marginTop: 12, height: 80, textAlignVertical: 'top', backgroundColor: colors.surfaceLight, color: colors.textMainLight, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.borderLight }]}
                  placeholder="Type invitation message (optional)..."
                  placeholderTextColor={colors.textMutedLight}
                  multiline
                  value={invitationMessage}
                  onChangeText={setInvitationMessage}
                />
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <CustomButton title="Cancel" variant="outline" onPress={() => setIsInviteModalVisible(false)} style={{ flex: 1 }} />
              <CustomButton title="Invite" onPress={handleInviteSubmit} isLoading={isInviting} disabled={!selectedAuditionId || isInviting} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isReportModalVisible} transparent={true} animationType="slide" onRequestClose={() => setIsReportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[typography.h3, { marginBottom: 16, color: colors.error }]}>Report Artist</Text>
            <Text style={[typography.body, { color: colors.textSecondaryLight, marginBottom: 12 }]}>Please describe why you are reporting this artist. This will be reviewed by our team.</Text>
            <View style={{ borderWidth: 1, borderColor: colors.borderLight, borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <TextInput
                style={{ minHeight: 100, textAlignVertical: 'top', color: colors.textMainLight }}
                placeholder="Reason for reporting..."
                placeholderTextColor={colors.textMutedLight}
                multiline
                value={reportReason}
                onChangeText={setReportReason}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <CustomButton title="Cancel" variant="outline" onPress={() => setIsReportModalVisible(false)} style={{ flex: 1 }} />
              <CustomButton title="Report" onPress={handleReportSubmit} isLoading={isReporting} disabled={!reportReason.trim() || isReporting} style={{ flex: 1, backgroundColor: colors.error, borderColor: colors.error }} />
            </View>
          </View>
        </View>
      </Modal>

      <InAppMediaModal
        visible={Boolean(mediaModalUrl)}
        url={mediaModalUrl}
        title={mediaModalTitle}
        onClose={() => setMediaModalUrl(null)}
      />

      <View style={styles.footer}>
        <CustomButton title="Contact Talent" onPress={handleContact} />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBar: {
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
  appBarTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    fontWeight: '700',
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
    width: (width - 40) / 3 - 2,
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
