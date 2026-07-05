import { showError, showSuccess } from '../../utils/toast';
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity, Modal, Dimensions, Linking , RefreshControl } from 'react-native';
import Video from 'react-native-video';
const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Play, ChevronRight, Youtube, Instagram, Link, X } from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors, typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import CustomButton from '../../components/forms/CustomButton';
import { 
  useGetPublicProfileQuery, 
  useFollowUserMutation, 
  useUnfollowUserMutation,
  useRecordVisitMutation
} from '../../services/connectionsApi';
import { useStartConversationMutation } from '../../services/chatApi';
import { useGetFeedQuery } from '../../services/discoverApi';
import { Video as IconVideo, Camera as IconCamera } from 'lucide-react-native';
import CommentsSection from '../../components/CommentsSection';
export default function PublicProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { username, scrollToComments } = route.params;
  
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const { data: profileData, isLoading, isError, refetch , isFetching} = useGetPublicProfileQuery(username);

  const hiringId = profileData?.role === 'hiring' ? profileData?.profile?.id : null;
  const { data: auditions, isLoading: isAuditionsLoading } = useGetFeedQuery({ hiring_id: hiringId }, { skip: !hiringId });
  
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

  // Record a profile visit when the profile loads (skip self-views)
  React.useEffect(() => {
    if (profileData?.id && currentUserId !== profileData.id) {
      recordVisit(profileData.id).catch(() => {}); // Fire-and-forget
    }
  }, [profileData?.id]);
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
        <View style={{ width: 40 }} />
      </View>

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}>
        {/* Cover Photo / Header Area */}
        <View style={styles.profileHeader}>
          {profileData.avatar_url ? (
            <Image source={{ uri: profileData.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={40} color={colors.primary} />
            </View>
          )}
          
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
          <Typography variant="body" style={styles.nameText}>{profileData.name}</Typography>
          <Typography variant="body" style={styles.roleText}>{profileData.role === 'artist' ? 'Artist' : 'Recruiter'}</Typography>
          {profileData.profile?.bio && (
            <Typography variant="body" style={styles.bioText}>{profileData.profile.bio}</Typography>
          )}
          {profileData.profile?.description && (
            <Typography variant="body" style={styles.bioText}>{profileData.profile.description}</Typography>
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
                <View style={{ backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12, marginBottom: 24, marginHorizontal: spacing.xl }}>
                  <Typography variant="body" style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Basic Info</Typography>
                  {['age', 'gender', 'height', 'weight', 'city', 'languages', 'skills'].map((k) => {
                    const v = profileData.profile[k];
                    if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return null;
                    const label = k.charAt(0).toUpperCase() + k.slice(1);
                    const value = Array.isArray(v) ? v.join(', ') : String(v);
                    return (
                      <View key={k} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start' }}>
                        <Typography variant="body" style={{ ...typography.caption, color: colors.textMutedLight, width: 80 }}>{label}</Typography>
                        <Typography variant="body" style={{ ...typography.body, color: colors.textMainLight, flex: 1 }}>{value}</Typography>
                      </View>
                    );
                  })}
                </View>
                
                <View style={{ marginBottom: 24, paddingHorizontal: spacing.xl }}>
                  <Typography variant="body" style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Media Gallery</Typography>
                  
                  {(!profileData.profile.photo_urls || profileData.profile.photo_urls.length === 0) && !profileData.profile.video_url ? (
                    <View style={styles.emptyPortfolio}>
                      <Typography variant="body" style={{ color: colors.textMutedLight, textAlign: 'center' }}>No media in portfolio.</Typography>
                    </View>
                  ) : (
                    <View>
                      {/* Video Section */}
                      {profileData.profile.video_url ? (
                        <View style={[styles.galleryGrid, { marginHorizontal: 0, marginBottom: 16 }]}>
                          {profileData.profile.video_url.split(',').map((vidUrl, index) => (
                            <TouchableOpacity 
                              key={index} 
                              onPress={() => {
                                navigation.navigate('VideoPortfolio', { videos: profileData.profile.video_url.split(','), initialIndex: index });
                              }}
                              style={[styles.galleryItem, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceDark }]}
                            >
                              <Play size={40} color={colors.primary} />
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : null}

                      {/* Photo Section */}
                      {profileData.profile.photo_urls && profileData.profile.photo_urls.length > 0 ? (
                        <View style={[styles.galleryGrid, { marginHorizontal: 0 }]}>
                          {profileData.profile.photo_urls.map((imgUrl, index) => (
                            <TouchableOpacity key={index} onPress={() => { setSelectedImage(imgUrl); setIsImageModalVisible(true); }}>
                              <Image source={{ uri: imgUrl }} style={styles.galleryItem} />
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.l }}>
                {(() => {
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
                                  <Instagram size={24} color="#db2777" style={{ marginRight: 12 }} />
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
                  <Typography variant="caption" style={{ color: colors.textSecondaryLight }}>Posts</Typography>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Typography variant="h3" style={{ fontWeight: '700', color: colors.textMainLight }}>0</Typography>
                  <Typography variant="caption" style={{ color: colors.textSecondaryLight }}>Hired</Typography>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Typography variant="h3" style={{ fontWeight: '700', color: colors.textMainLight }}>0</Typography>
                  <Typography variant="caption" style={{ color: colors.textSecondaryLight }}>Visits</Typography>
                </View>
              </View>
              <View style={{ marginBottom: spacing.l }}>
                <Typography variant="h4" style={{ fontWeight: 'bold', color: colors.textMainLight, marginBottom: 2 }}>{hiringProfile.company_name || 'Company Name'}</Typography>
                <Typography variant="body2" style={{ color: colors.primary, marginBottom: 4 }}>@{profileData.username}</Typography>
                {hiringProfile.description && (
                  <Typography variant="body2" style={{ color: colors.textMainLight, lineHeight: 20 }}>{hiringProfile.description}</Typography>
                )}
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
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    color: colors.textSecondaryLight,
  },
  bioSection: {
    marginBottom: spacing.l,
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
});
