import { showError, showSuccess } from '../../utils/toast';
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity, Modal, Dimensions, Linking , RefreshControl, FlatList, TextInput, Animated } from 'react-native';
import Video from 'react-native-video';
const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Play, ChevronRight, Youtube, Link, X, AlertTriangle } from 'lucide-react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { parseArray } from '../../utils/dataUtils';
import { useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
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
import { Video as IconVideo, Camera as IconCamera } from 'lucide-react-native';
import CommentsSection from '../../components/CommentsSection';
import { getVideoInfo } from '../../utils/media';

export default function PublicProfileScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute();
  const navigation = useNavigation();
  const { username, scrollToComments } = route.params;
  
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const { data: profileData, isLoading, isError, refetch , isFetching} = useGetPublicProfileQuery(username);

  const hiringId = profileData?.role === 'hiring' ? profileData?.profile?.id : null;
  const { data: auditions, isLoading: isAuditionsLoading } = useGetFeedQuery({ hiring_id: hiringId }, { skip: !hiringId });
  
  const scrollViewRef = React.useRef(null);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Start pulse animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Start slide & fade entrance
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }),
    ]).start();
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
  }, [profileData?.id]);
  
  const [activeTab, setActiveTab] = useState('Overview');
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Typography variant="body" style={styles.headerTitle}>@{profileData.username}</Typography>
        {!isSelf ? (
          <TouchableOpacity onPress={() => setIsReportModalVisible(true)} style={{ width: 40, alignItems: 'center' }}>
            <AlertTriangle size={24} color={colors.error} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}>
        {/* Cover Photo / Header Area */}
        <View style={styles.profileHeader}>
          <View style={{ position: 'relative' }}>
            <Animated.View style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: colors.primary,
                borderRadius: 40,
                transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }],
                opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.6] })
              }
            ]} />
            {profileData.avatar_url ? (
              <Image source={{ uri: profileData.avatar_url }} style={[styles.avatar, { borderWidth: 2, borderColor: colors.backgroundLight }]} />
            ) : (
              <View style={[styles.avatarPlaceholder, { borderWidth: 2, borderColor: colors.backgroundLight }]}>
                <User size={40} color={colors.primary} />
              </View>
            )}
          </View>
          
          <View style={styles.statsContainer}>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => profileData?.id && navigation.navigate('ConnectionList', { type: 'followers', userId: profileData.id })}
            >
              <Typography variant="body" style={styles.statValue}>{profileData.followers_count}</Typography>
              <Typography variant="body" style={styles.statLabel}>Followers</Typography>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => profileData?.id && navigation.navigate('ConnectionList', { type: 'following', userId: profileData.id })}
            >
              <Typography variant="body" style={styles.statValue}>{profileData.following_count}</Typography>
              <Typography variant="body" style={styles.statLabel}>Following</Typography>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Typography variant="body" style={styles.statValue}>{profileData.visit_count || 0}</Typography>
              <Typography variant="body" style={styles.statLabel}>Visits</Typography>
            </View>
          </View>
        </View>

        <View style={styles.bioSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Typography variant="body" style={[styles.nameText, { marginBottom: 0 }]}>{profileData.name}</Typography>
            {profileData.profile?.is_verified && <VerifiedBadge size={22} style={{ marginLeft: 6 }} />}
          </View>
          <Typography variant="body" style={styles.roleText}>{profileData.role === 'artist' ? 'Artist' : 'Recruiter'}</Typography>
          {profileData.profile?.bio && (
            <Typography variant="body" style={styles.bioText}>{profileData.profile.bio}</Typography>
          )}
          {profileData.profile?.description && (
            <Typography variant="body" style={styles.bioText}>{profileData.profile.description}</Typography>
          )}

          {/* Social Links Row */}
          {profileData.profile?.social_links && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 16 }}>
              {(() => {
                const links = typeof profileData.profile.social_links === 'string' 
                  ? JSON.parse(profileData.profile.social_links || '{}') 
                  : profileData.profile.social_links;
                return (
                  <>
                    {links.instagram ? (
                      <TouchableOpacity onPress={() => Linking.openURL(links.instagram)}>
                        <Icon name="logo-instagram" size={28} color="#E1306C" />
                      </TouchableOpacity>
                    ) : null}
                    {links.youtube ? (
                      <TouchableOpacity onPress={() => Linking.openURL(links.youtube)}>
                        <Icon name="logo-youtube" size={28} color="#FF0000" />
                      </TouchableOpacity>
                    ) : null}
                    {links.facebook ? (
                      <TouchableOpacity onPress={() => Linking.openURL(links.facebook)}>
                        <Icon name="logo-facebook" size={28} color="#1877F2" />
                      </TouchableOpacity>
                    ) : null}
                    {links.snapchat ? (
                      <TouchableOpacity onPress={() => Linking.openURL(links.snapchat)}>
                        <Icon name="logo-snapchat" size={28} color="#FFFC00" />
                      </TouchableOpacity>
                    ) : null}
                  </>
                );
              })()}
            </View>
          )}
        </View>

        {!isSelf && (
          <View style={[styles.actionSection, { flexDirection: 'row', gap: 12 }]}>
            <View style={{ flex: 1 }}>
              <CustomButton
                title={profileData.is_following ? 'Unfollow' : 'Follow'}
                type={profileData.is_following ? 'outline' : 'primary'}
                onPress={handleFollowToggle}
                loading={isFollowingLoad || isUnfollowingLoad}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomButton
                title="Message"
                type="outline"
                onPress={handleMessage}
                loading={isStartingChat}
              />
            </View>
          </View>
        )}

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
                {/* Intro Video Section */}
                {profileData.profile.intro_video_url && (
                  <View style={{ marginBottom: 24, paddingHorizontal: spacing.xl }}>
                    <Typography variant="body" style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Intro Video</Typography>
                    <TouchableOpacity 
                      onPress={() => {
                        const info = getVideoInfo(profileData.profile.intro_video_url);
                        if (info?.type !== 'direct') {
                          import('react-native').then(({ Linking }) => {
                            Linking.openURL(profileData.profile.intro_video_url).catch(() => {});
                          });
                        } else {
                          navigation.navigate('VideoPortfolio', { videos: [profileData.profile.intro_video_url], initialIndex: 0 });
                        }
                      }}
                      style={[styles.galleryItem, { width: '100%', height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceDark, overflow: 'hidden' }]}
                    >
                      {(() => {
                        const info = getVideoInfo(profileData.profile.intro_video_url);
                        if (info?.thumbnail === 'INSTAGRAM') {
                          return (
                            <View style={{ width: '100%', height: '100%', backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }}>
                              <Icon name="logo-instagram" color={colors.primary} size={48} />
                              <Text style={{ ...typography.caption, color: colors.textMutedLight, marginTop: 8 }}>Instagram Reel</Text>
                            </View>
                          );
                        }
                        if (info?.thumbnail === 'LINK') {
                          return (
                            <View style={{ width: '100%', height: '100%', backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ ...typography.caption, color: colors.textMutedLight, marginTop: 8 }}>Web Link</Text>
                            </View>
                          );
                        }
                        if (info?.thumbnail) {
                          return <Image source={{ uri: info.thumbnail }} style={{ width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' }} />;
                        }
                        return <Video source={{ uri: profileData.profile.intro_video_url }} style={{ width: '100%', height: '100%', position: 'absolute' }} paused={true} resizeMode="cover" muted={true} />;
                      })()}
                      <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                        <Play size={50} color={colors.white} />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Video Portfolio Grid */}
                {typeof profileData.profile.video_url === 'string' && profileData.profile.video_url.trim().length > 0 && (
                  <View style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: 12 }}>
                      <Typography variant="body" style={{ ...typography.h3, color: colors.primary }}>Video Portfolio</Typography>
                      <TouchableOpacity onPress={() => navigation.navigate('VideoPortfolio', { videos: profileData.profile.video_url.split(',').filter(Boolean) })}>
                        <Typography variant="body" style={{ color: colors.primary, fontWeight: 'bold' }}>See All</Typography>
                      </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl }}>
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
                                navigation.navigate('VideoPortfolio', { videos: profileData.profile.video_url.split(',').filter(Boolean), initialIndex: idx });
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
                              <Play size={32} color={colors.white} />
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
                    <Typography variant="body" style={{ ...typography.h3, color: colors.primary }}>Basic Info</Typography>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {['age', 'gender', 'height', 'weight', 'city', 'languages', 'skills', 'availability_type', 'available_dates'].map((k) => {
                      const v = profileData.profile[k];
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
                          <Typography variant="body" style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 4 }}>{label}</Typography>
                          <Typography variant="body" style={{ ...typography.body, color: colors.textMainLight, fontWeight: '600' }} numberOfLines={2}>{value}</Typography>
                        </View>
                      );
                    })}

                    {/* CINTAA Info */}
                    {profileData.profile.is_cintaa_member && (
                      <View style={{ width: '100%', backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: 16, borderRadius: 16, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.1)' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <Icon name="id-card-outline" size={24} color={colors.primary} style={{ marginRight: 12 }} />
                          <View>
                            <Typography variant="body" style={{ ...typography.caption, color: colors.textMutedLight }}>CINTAA Member</Typography>
                            <Typography variant="body" style={{ ...typography.body, color: colors.primary, fontWeight: 'bold' }}>Yes ({profileData.profile.cintaa_reg_number})</Typography>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                </Animated.View>

                {/* Tags / Preferences Section */}
                {(profileData.profile.work_preference?.length > 0 || profileData.profile.preferred_cities?.length > 0 || profileData.profile.look_alike?.length > 0 || profileData.profile.hashtags?.length > 0) && (
                  <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginBottom: 24, marginHorizontal: spacing.xl }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                      <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 8, borderRadius: 20, marginRight: 10 }}>
                        <Icon name="options-outline" size={24} color={colors.primary} />
                      </View>
                      <Typography variant="body" style={{ ...typography.h3, color: colors.primary }}>Preferences & Tags</Typography>
                    </View>
                    
                    {profileData.profile.work_preference?.length > 0 && (
                      <View style={{ marginBottom: 20, backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                          <View style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)', padding: 6, borderRadius: 12, marginRight: 8 }}>
                            <Icon name="briefcase" size={16} color="#f97316" />
                          </View>
                          <Typography variant="body" style={{ ...typography.body, color: colors.textMainLight, fontWeight: '700' }}>Work Preference</Typography>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                          {parseArray(profileData.profile.work_preference).map((t, i) => (
                            <View key={i} style={[styles.chip, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}><Typography variant="body" style={[styles.chipText, { color: '#f97316' }]}>{t}</Typography></View>
                          ))}
                        </View>
                      </View>
                    )}
                    
                    {profileData.profile.preferred_cities?.length > 0 && (
                      <View style={{ marginBottom: 20, backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                          <View style={{ backgroundColor: 'rgba(20, 184, 166, 0.15)', padding: 6, borderRadius: 12, marginRight: 8 }}>
                            <Icon name="location" size={16} color="#14b8a6" />
                          </View>
                          <Typography variant="body" style={{ ...typography.body, color: colors.textMainLight, fontWeight: '700' }}>Preferred Locations</Typography>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                          {parseArray(profileData.profile.preferred_cities).map((t, i) => (
                            <View key={i} style={[styles.chip, { backgroundColor: 'rgba(20, 184, 166, 0.15)' }]}><Typography variant="body" style={[styles.chipText, { color: '#14b8a6' }]}>{t}</Typography></View>
                          ))}
                        </View>
                      </View>
                    )}

                    {profileData.profile.look_alike?.length > 0 && (
                      <View style={{ marginBottom: 20, backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                          <View style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', padding: 6, borderRadius: 12, marginRight: 8 }}>
                            <Icon name="people" size={16} color="#a855f7" />
                          </View>
                          <Typography variant="body" style={{ ...typography.body, color: colors.textMainLight, fontWeight: '700' }}>Look Alikes</Typography>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                          {parseArray(profileData.profile.look_alike).map((t, i) => (
                            <View key={i} style={[styles.chip, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}><Typography variant="body" style={[styles.chipText, { color: '#a855f7' }]}>{t}</Typography></View>
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
                  </Animated.View>
                )}

                {/* Recent Assignments Section */}
                {profileData.profile.recent_assignments?.length > 0 && (
                  <View style={{ marginBottom: 24, paddingHorizontal: spacing.xl }}>
                    <Typography variant="body" style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Recent Assignments</Typography>
                    {parseArray(profileData.profile.recent_assignments).map((assignment, idx) => (
                      <View key={idx} style={{ backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 8 }}>
                        <Typography variant="body" style={{ ...typography.body, fontWeight: 'bold', color: colors.textMainLight }}>{assignment.title || 'Untitled'}</Typography>
                        <Typography variant="body" style={{ ...typography.caption, color: colors.textMutedLight }}>{assignment.role ? `Role: ${assignment.role}` : ''} {assignment.year ? `• ${assignment.year}` : ''}</Typography>
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={{ marginBottom: 24, paddingHorizontal: spacing.xl }}>
                  <Typography variant="body" style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Media Gallery</Typography>
                  
                  {(!profileData.profile.photo_urls || profileData.profile.photo_urls.length === 0) && !profileData.profile.video_url ? (
                    <View style={styles.emptyPortfolio}>
                      <Typography variant="body" style={{ color: colors.textMutedLight, textAlign: 'center' }}>No media in portfolio.</Typography>
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
                              <Play size={40} color={colors.primary} />
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
                  const categories = parseArray(profileData?.profile?.categories);
                  const details = profileData.profile.category_details?.[activeTab.toLowerCase()];
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

                          if (isVideo || isAudio) {
                            return (
                              <View key={`${k}-${index}`} style={{ marginBottom: 16 }}>
                                {index === 0 && <Typography variant="body" style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>{label}</Typography>}
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
                                    <Youtube size={48} color="#ef4444" />
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
                                <Link size={20} color={colors.primary} style={{ marginRight: 12 }} />
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
              <View style={{ marginHorizontal: spacing.xl, marginBottom: 24, marginTop: 12 }}>
                <CommentsSection targetType="artist_profile" targetId={profileData.profile.id} />
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
                  <Typography variant="caption" style={{ color: colors.textMutedLight }}>Posts</Typography>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Typography variant="h3" style={{ fontWeight: '700', color: colors.textMainLight }}>0</Typography>
                  <Typography variant="caption" style={{ color: colors.textMutedLight }}>Hired</Typography>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: colors.borderLight, marginBottom: spacing.m }} />
              
              {categoriesData.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
                  <IconCamera size={48} color={colors.borderLight} />
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
                          onPress={() => navigation.navigate('AuditionDetail', { id: item.id })}
                        >
                          {item.thumbnail_url ? (
                            <View style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
                              <Image source={{ uri: item.thumbnail_url }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: spacing.xs }}>
                                <Typography variant="caption" style={{ textAlign: 'center', color: '#fff' }} numberOfLines={2}>{item.title}</Typography>
                              </View>
                            </View>
                          ) : (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.s }}>
                              <IconVideo size={28} color={colors.textMutedLight} />
                              <Typography variant="caption" style={{ marginTop: spacing.xs, textAlign: 'center', color: colors.textMutedLight }} numberOfLines={2}>{item.title}</Typography>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ))
              )}

              {hiringProfile && hiringProfile.id && (
                <View style={{ marginBottom: 24, marginTop: spacing.l }}>
                  <CommentsSection targetType="profile" targetId={hiringProfile.id} />
                </View>
              )}
            </View>
          );
        })() : null}
      </ScrollView>
      
      <Modal visible={isImageModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsImageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsImageModalVisible(false)}>
            <X size={30} color="#fff" />
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
    paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.xs,
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
    marginBottom: spacing.l,
    paddingHorizontal: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 51, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: spacing.l,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMutedLight,
  },
  bioSection: {
    marginBottom: spacing.l,
    paddingHorizontal: spacing.xl,
  },
  nameText: {
    ...typography.h3,
    fontWeight: '600',
    color: colors.textMainLight,
  },
  roleText: {
    ...typography.body,
    color: colors.primary,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  bioText: {
    ...typography.body,
    color: colors.textMainLight,
    marginTop: 2,
  },
  actionSection: {
    paddingHorizontal: spacing.m,
    marginTop: spacing.m,
  },
  detailsSection: {
    paddingHorizontal: spacing.m,
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
    paddingHorizontal: 16,
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
  }
});
