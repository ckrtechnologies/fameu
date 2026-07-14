import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Modal, RefreshControl, Linking, FlatList } from 'react-native';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import { parseArray } from '../../utils/dataUtils';

import { useSelector, useDispatch } from 'react-redux';

import { colors, typography, spacing } from '../../theme/theme';
import { useGetProfileQuery } from '../../services/profileApi';
import { useAcceptDisclaimerMutation } from '../../services/authApi';
import { logout } from '../../store/slices/authSlice';
import CommentsSection from '../../components/CommentsSection';
import { getVideoInfo } from '../../utils/media';
import VerifiedBadge from '../../components/core/VerifiedBadge';

const { width } = Dimensions.get('window');

export default function ArtistProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);
  const [acceptDisclaimer, { isLoading: isAccepting }] = useAcceptDisclaimerMutation();
  
  const { data: profileResponse, isLoading, isError, error, refetch } = useGetProfileQuery();
  
  const profile = profileResponse?.data;
  const [activeTab, setActiveTab] = useState('Overview');
  const [modalImages, setModalImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
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
  const categories = parseArray(profile?.categories);
  const tabs = ['Overview', ...categories];

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
    <SafeAreaView style={styles.safeArea} edges={[]}>
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
                <Text style={styles.disclaimerBtnText}>Deny</Text>
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
                {isAccepting ? <ActivityIndicator color="#fff" /> : <Text style={styles.disclaimerBtnText}>I Agree</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        
        {/* Instagram Profile Info Row */}
        <View style={styles.profileRow}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => { setModalImages([avatarUrl]); setSelectedImageIndex(0); setIsImageModalVisible(true); }}>
            <Image source={{ uri: avatarUrl }} style={styles.avatarInsta} />
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
            {profile?.is_verified && <VerifiedBadge size={22} style={{ marginLeft: 6 }} />}
          </View>
          <Text style={{ ...typography.body, color: colors.textSecondaryLight, marginBottom: 4 }}>@{username}</Text>
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
          
          <TouchableOpacity 
            style={styles.editProfileBtnInsta}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editProfileTextInsta}>Edit Profile</Text>
          </TouchableOpacity>
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
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        {activeTab === 'Overview' ? (
          <View style={styles.portfolioSection}>
            {/* Intro Video Section */}
            {profile.intro_video_url && (
              <View style={{ marginBottom: 24, paddingHorizontal: spacing.xl }}>
                <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Intro Video</Text>
                <TouchableOpacity 
                  onPress={() => {
                    const info = getVideoInfo(profile.intro_video_url);
                    if (info?.type !== 'direct') {
                      import('react-native').then(({ Linking }) => {
                        Linking.openURL(profile.intro_video_url).catch(() => {});
                      });
                    } else {
                      navigation.navigate('VideoPortfolio', { videos: [profile.intro_video_url], initialIndex: 0 });
                    }
                  }}
                  style={[styles.galleryItem, { width: '100%', height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceDark, overflow: 'hidden' }]}
                >
                  {(() => {
                    const info = getVideoInfo(profile.intro_video_url);
                    if (info?.thumbnail === 'INSTAGRAM') {
                      return (
                        <View style={{ width: '100%', height: '100%', backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }}>
                          <Icon name="logo-instagram" color={colors.primary} size={48} />
                          <Text style={{ ...typography.caption, color: colors.textMutedLight, marginTop: 8 }}>Instagram</Text>
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
                    return <Video source={{ uri: profile.intro_video_url }} style={{ width: '100%', height: '100%', position: 'absolute' }} paused={true} resizeMode="cover" muted={true} />;
                  })()}
                  <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                    <Icon name="play" size={50} color={colors.white} />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Video Portfolio Grid */}
            {typeof profile.video_url === 'string' && profile.video_url.trim().length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: 12 }}>
                  <Text style={{ ...typography.h3, color: colors.primary }}>Video Portfolio</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('VideoPortfolio', { isOwner: true })}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl }}>
                  {profile.video_url.split(',').filter(Boolean).map((vUrl, idx) => {
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

            <View style={{ backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12, marginBottom: 24, marginHorizontal: spacing.xl }}>
              <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Basic Info</Text>
              {['age', 'gender', 'height', 'weight', 'city', 'languages', 'skills', 'availability_type', 'available_dates'].map((k) => {
                const v = profile[k];
                if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return null;
                const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const value = Array.isArray(v) ? v.join(', ') : String(v);
                return (
                  <View key={k} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Text style={{ ...typography.caption, color: colors.textMutedLight, width: 110 }}>{label}</Text>
                    <Text style={{ ...typography.body, color: colors.textMainLight, flex: 1 }}>{value}</Text>
                  </View>
                );
              })}
              {/* CINTAA Info */}
              {profile.is_cintaa_member && (
                <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={{ ...typography.caption, color: colors.textMutedLight, width: 110 }}>CINTAA Member</Text>
                  <Text style={{ ...typography.body, color: colors.textMainLight, flex: 1 }}>Yes ({profile.cintaa_reg_number})</Text>
                </View>
              )}
            </View>

            {/* Tags / Preferences Section */}
            {(profile.work_preference?.length > 0 || profile.preferred_cities?.length > 0 || profile.look_alike?.length > 0 || profile.hashtags?.length > 0) && (
              <View style={{ marginBottom: 24, paddingHorizontal: spacing.xl }}>
                <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Preferences & Tags</Text>
                
                {profile.work_preference?.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>Work Preference</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {parseArray(profile.work_preference).map((t, i) => (
                        <View key={i} style={styles.chip}><Text style={styles.chipText}>{t}</Text></View>
                      ))}
                    </View>
                  </View>
                )}
                
                {profile.preferred_cities?.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>Preferred Locations</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {parseArray(profile.preferred_cities).map((t, i) => (
                        <View key={i} style={styles.chip}><Text style={styles.chipText}>{t}</Text></View>
                      ))}
                    </View>
                  </View>
                )}

                {profile.look_alike?.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>Look Alikes</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {parseArray(profile.look_alike).map((t, i) => (
                        <View key={i} style={styles.chip}><Text style={styles.chipText}>{t}</Text></View>
                      ))}
                    </View>
                  </View>
                )}

                {profile.hashtags?.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ ...typography.caption, color: colors.textMutedLight, marginBottom: 8 }}>Hashtags</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {parseArray(profile.hashtags).map((t, i) => (
                        <View key={i} style={styles.chip}><Text style={styles.chipText}>#{t}</Text></View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Recent Assignments Section */}
            {profile.recent_assignments?.length > 0 && (
              <View style={{ marginBottom: 24, paddingHorizontal: spacing.xl }}>
                <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Recent Assignments</Text>
                {parseArray(profile.recent_assignments).map((assignment, idx) => (
                  <View key={idx} style={{ backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 8 }}>
                    <Text style={{ ...typography.body, fontWeight: 'bold', color: colors.textMainLight }}>{assignment.title || 'Untitled'}</Text>
                    <Text style={{ ...typography.caption, color: colors.textMutedLight }}>{assignment.role ? `Role: ${assignment.role}` : ''} {assignment.year ? `• ${assignment.year}` : ''}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ marginBottom: 24, paddingHorizontal: spacing.xl }}>
              <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Media Gallery</Text>
              
              {(!profile.photo_urls || profile.photo_urls.length === 0) && !profile.video_url ? (
                <View style={styles.emptyPortfolio}>
                  <Text style={{ color: colors.textMutedLight, textAlign: 'center' }}>No media in portfolio.</Text>
                </View>
              ) : (
                <View>
                  {/* Video Section */}
                  {typeof profile.video_url === 'string' && profile.video_url.trim().length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 0, marginBottom: 16 }}>
                    {profile.video_url.split(',').filter(Boolean).map((vidUrl, index) => {
                      const info = getVideoInfo(vidUrl);
                      return (
                        <TouchableOpacity 
                          key={index} 
                          onPress={() => {
                            const info = getVideoInfo(profile.video_url.split(',').filter(Boolean)[index]);
                            if (info?.type !== 'direct') {
                              import('react-native').then(({ Linking }) => {
                                Linking.openURL(profile.video_url.split(',').filter(Boolean)[index]).catch(() => {});
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
                  {profile.photo_urls && profile.photo_urls.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 0 }}>
                      {parseArray(profile.photo_urls).map((imgUrl, index) => (
                        <TouchableOpacity key={index} onPress={() => { setModalImages(profile.photo_urls); setSelectedImageIndex(index); setIsImageModalVisible(true); }} style={{ marginRight: spacing.s }}>
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
          <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.l }}>
            {(() => {
              const details = profile.category_details?.[activeTab] || profile.category_details?.[activeTab.toLowerCase()];
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

        {profile && profile.id && (
          <View style={{ marginHorizontal: spacing.xl, marginBottom: 24, marginTop: 12 }}>
            <CommentsSection targetType="artist_profile" targetId={profile.id} />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal visible={isImageModalVisible} transparent={true} animationType="fade" onRequestClose={() => { setIsImageModalVisible(false); setModalImages([]); }}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => { setIsImageModalVisible(false); setModalImages([]); }}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {modalImages.length > 0 && (
            <FlatList
              data={modalImages}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.surfaceDark,
    marginRight: 10,
  },
  disclaimerBtnAgree: {
    backgroundColor: colors.primary,
    marginLeft: 10,
  },
  disclaimerBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
