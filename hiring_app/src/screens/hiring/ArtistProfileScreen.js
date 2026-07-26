import { GlobalAlert } from '../../components/core/GlobalAlert';
import { showError, showSuccess } from '../../utils/toast';
import React, { useState } from 'react';
import { View, Animated, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Linking, Alert, Modal, Dimensions , RefreshControl, TextInput, Share } from 'react-native';
import Video from 'react-native-video';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');
import Icon from 'react-native-vector-icons/Ionicons';
import { typography, spacing, globalStyles } from '../../theme/theme';
import { useTheme } from '../../theme/ThemeProvider';
import CommentsSection from '../../components/CommentsSection';
import { useGetArtistDetailsQuery, useInviteArtistMutation, useReportArtistMutation } from '../../services/discoveryApi';
import { useStartConversationMutation } from '../../services/chatApi';
import { useGetCompanyProfileQuery, useGetDashboardDataQuery } from '../../services/hiringApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../components/forms/CustomButton';
import SkeletonLoader from '../../components/SkeletonLoader';
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
      await inviteArtist({ id: artist.user_id, audition_id: selectedAuditionId, message: invitationMessage }).unwrap();
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
      await reportArtist({ id: artist.user_id, reason: reportReason }).unwrap();
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
    <SafeAreaView style={globalStyles.container} edges={['top', 'bottom']}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Profile Details</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={handleShare} style={[styles.backBtn, {marginRight: 8}]}>
            <Icon name="share-social-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsReportModalVisible(true)} style={styles.backBtn}>
            <Icon name="warning-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}>
        <View style={styles.headerProfile}>
          {user?.avatar_url || artist?.profile_image_url ? (
            <Image source={{ uri: user?.avatar_url || artist?.profile_image_url }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.placeholderImage]}>
              <Icon name="person" size={50} color={colors.textSecondaryLight} />
            </View>
          )}
          <Text style={styles.name}>{artist.full_name}</Text>
          <Text style={styles.category}>{user?.username ? `@${user.username}` : (artist.category || 'Artist')}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.followers_count || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.following_count || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {artist.bio && (
          <View style={styles.section}>
            <Text style={styles.bioText}>{artist.bio}</Text>
          </View>
        )}

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
                  <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12, paddingHorizontal: spacing.xl }}>Profile Videos</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl }}>
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: 12 }}>
                  <Text style={{ ...typography.h3, color: colors.primary }}>Video Portfolio</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('VideoPortfolio', { isOwner: true })}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl }}>
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

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginBottom: 24, marginHorizontal: spacing.xl }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 8, borderRadius: 20, marginRight: 10 }}>
                  <Icon name="information-circle-outline" size={24} color={colors.primary} />
                </View>
                <Text style={{ ...typography.h3, color: colors.primary }}>Basic Info</Text>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {['age', 'gender', 'height', 'weight', 'city', 'languages', 'skills', 'availability_type', 'available_dates'].map((k) => {
                  const v = artist[k];
                  if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return null;
                  
                  const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  const value = Array.isArray(v) ? v.join(', ') : String(v);
                  
                  const icons = {
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

                  return (
                    <View key={k} style={{ width: '48%', backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}>
                      <Icon name={icons[k] || 'information-outline'} size={24} color={colors.primary} style={{ marginBottom: 12 }} />
                      <Text style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 4 }}>{label}</Text>
                      <Text style={{ ...typography.body, color: colors.textMainLight, fontWeight: '600' }} numberOfLines={2}>{value}</Text>
                    </View>
                  );
                })}

                {/* CINTAA Info */}
                {artist.is_cintaa_member && (
                  <View style={{ width: '100%', backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: 16, borderRadius: 16, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Icon name="id-card-outline" size={24} color={colors.primary} style={{ marginRight: 12 }} />
                      <View>
                        <Text style={{ ...typography.caption, color: colors.textMutedLight }}>CINTAA Member</Text>
                        <Text style={{ ...typography.body, color: colors.primary, fontWeight: 'bold' }}>Yes ({artist.cintaa_reg_number})</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Tags / Preferences Section */}
            {(artist.work_preference?.length > 0 || artist.preferred_cities?.length > 0 || artist.look_alike?.length > 0 || artist.hashtags?.length > 0) && (
              <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginBottom: 24, marginHorizontal: spacing.xl }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 8, borderRadius: 20, marginRight: 10 }}>
                    <Icon name="options-outline" size={24} color={colors.primary} />
                  </View>
                  <Text style={{ ...typography.h3, color: colors.primary }}>Preferences & Tags</Text>
                </View>
                
                {artist.work_preference?.length > 0 && (
                  <View style={{ marginBottom: 20, backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)', padding: 6, borderRadius: 12, marginRight: 8 }}>
                        <Icon name="briefcase" size={16} color="#f97316" />
                      </View>
                      <Text style={{ ...typography.body, color: colors.textMainLight, fontWeight: '700' }}>Work Preference</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {parseArray(artist.work_preference).map((t, i) => (
                        <View key={i} style={[styles.chip, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}><Text style={[styles.chipText, { color: '#f97316' }]}>{t}</Text></View>
                      ))}
                    </View>
                  </View>
                )}
                
                {artist.preferred_cities?.length > 0 && (
                  <View style={{ marginBottom: 20, backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View style={{ backgroundColor: 'rgba(20, 184, 166, 0.15)', padding: 6, borderRadius: 12, marginRight: 8 }}>
                        <Icon name="location" size={16} color="#14b8a6" />
                      </View>
                      <Text style={{ ...typography.body, color: colors.textMainLight, fontWeight: '700' }}>Preferred Locations</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {parseArray(artist.preferred_cities).map((t, i) => (
                        <View key={i} style={[styles.chip, { backgroundColor: 'rgba(20, 184, 166, 0.15)' }]}><Text style={[styles.chipText, { color: '#14b8a6' }]}>{t}</Text></View>
                      ))}
                    </View>
                  </View>
                )}

                {artist.look_alike?.length > 0 && (
                  <View style={{ marginBottom: 20, backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', padding: 6, borderRadius: 12, marginRight: 8 }}>
                        <Icon name="people" size={16} color="#a855f7" />
                      </View>
                      <Text style={{ ...typography.body, color: colors.textMainLight, fontWeight: '700' }}>Look Alikes</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {parseArray(artist.look_alike).map((t, i) => (
                        <View key={i} style={[styles.chip, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}><Text style={[styles.chipText, { color: '#a855f7' }]}>{t}</Text></View>
                      ))}
                    </View>
                  </View>
                )}

                {artist.hashtags?.length > 0 && (
                  <View style={{ marginBottom: 20, backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', padding: 6, borderRadius: 12, marginRight: 8 }}>
                        <Icon name="pricetag" size={16} color="#ec4899" />
                      </View>
                      <Text style={{ ...typography.body, color: colors.textMainLight, fontWeight: '700' }}>Hashtags</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {parseArray(artist.hashtags).map((t, i) => (
                        <View key={i} style={[styles.chip, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}><Text style={[styles.chipText, { color: '#ec4899' }]}>#{t}</Text></View>
                      ))}
                    </View>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Recent Assignments Section */}
            {artist.recent_assignments?.length > 0 && (
              <View style={{ marginBottom: 24, paddingHorizontal: spacing.xl }}>
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

            <View style={{ marginBottom: 24, paddingHorizontal: spacing.xl }}>
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
                            const info = getVideoInfo(artist.video_url.split(',').filter(Boolean)[index]);
                            if (info?.type !== 'direct') {
                              import('react-native').then(({ Linking }) => {
                                Linking.openURL(artist.video_url.split(',').filter(Boolean)[index]).catch(() => {});
                              });
                            } else {
                              navigation.navigate('VideoPortfolio', { isOwner: true, initialIndex: index });
                            }
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
                      <Text style={{ marginLeft: 8, flex: 1, ...typography.body }} numberOfLines={1}>{audition.title}</Text>
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

      <View style={styles.footer}>
        <CustomButton title="Contact Talent" onPress={handleContact} />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  },
  backBtn: {
    padding: 4,
  },
  appBarTitle: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  headerProfile: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.m,
  },
  placeholderImage: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  name: {
    ...typography.h2,
    color: colors.textMainLight,
    marginBottom: 4,
  },
  category: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.m,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.m,
  },
  statValue: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondaryLight,
  },
  section: {
    marginBottom: spacing.l,
    alignItems: 'center',
  },
  bioText: {
    ...typography.body1,
    color: colors.textMainLight,
    lineHeight: 24,
    textAlign: 'center',
  },
  detailsSection: {
    marginTop: spacing.m,
  },
  tabsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    marginBottom: 8,
    paddingTop: 8,
  },
  tabsScroll: {
    paddingBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMutedLight,
  },
  tabTextActive: {
    color: colors.backgroundLight,
  },
  portfolioSection: {
    marginTop: spacing.m,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  galleryItem: {
    width: (width - 40) / 3 - 2, // 3 columns, adjusted for padding
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
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  },
});
