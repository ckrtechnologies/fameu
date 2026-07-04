import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Modal, RefreshControl, Linking } from 'react-native';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

import { colors, typography, spacing } from '../../theme/theme';
import { useGetProfileQuery } from '../../services/profileApi';

const { width } = Dimensions.get('window');

export default function ArtistProfileScreen() {
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  
  const { data: profileResponse, isLoading, isError, error, refetch } = useGetProfileQuery();
  
  const profile = profileResponse?.data;
  const [activeTab, setActiveTab] = useState('Overview');
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
  const categories = profile?.categories || [];
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

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        
        {/* Instagram Profile Info Row */}
        <View style={styles.profileRow}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => setIsImageModalVisible(true)}>
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
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.fullNameInsta}>{fullName}</Text>
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
            <View style={{ backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12, marginBottom: 24, marginHorizontal: spacing.xl }}>
              <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Basic Info</Text>
              {['age', 'gender', 'height', 'weight', 'city', 'languages', 'skills'].map((k) => {
                const v = profile[k];
                if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return null;
                const label = k.charAt(0).toUpperCase() + k.slice(1);
                const value = Array.isArray(v) ? v.join(', ') : String(v);
                return (
                  <View key={k} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Text style={{ ...typography.caption, color: colors.textMutedLight, width: 80 }}>{label}</Text>
                    <Text style={{ ...typography.body, color: colors.textMainLight, flex: 1 }}>{value}</Text>
                  </View>
                );
              })}
            </View>

            <View style={{ marginBottom: 24, paddingHorizontal: spacing.xl }}>
              <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Media Gallery</Text>
              
              {(!profile.photo_urls || profile.photo_urls.length === 0) && !profile.video_url ? (
                <View style={styles.emptyPortfolio}>
                  <Text style={{ color: colors.textMutedLight, textAlign: 'center' }}>No media in portfolio.</Text>
                </View>
              ) : (
                <View>
                  {/* Video Section */}
                  {profile.video_url ? (
                    <TouchableOpacity 
                      style={{ backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => Linking.openURL(profile.video_url)}
                    >
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                        <Icon name="play" size={20} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...typography.body, color: colors.textMainLight, fontWeight: 'bold' }}>Watch Video Portfolio</Text>
                        <Text style={{ ...typography.caption, color: colors.textMutedLight }}>Tap to open video</Text>
                      </View>
                      <Icon name="chevron-forward" size={20} color={colors.textMutedLight} />
                    </TouchableOpacity>
                  ) : null}

                  {/* Photo Section */}
                  {profile.photo_urls && profile.photo_urls.length > 0 ? (
                    <View style={[styles.galleryGrid, { marginHorizontal: 0 }]}>
                      {profile.photo_urls.map((imgUrl, index) => (
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
              const details = profile.category_details?.[activeTab];
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

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal visible={isImageModalVisible} transparent={true} animationType="fade" onRequestClose={() => { setIsImageModalVisible(false); setSelectedImage(null); }}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => { setIsImageModalVisible(false); setSelectedImage(null); }}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage || avatarUrl }} style={styles.fullScreenImage} resizeMode="contain" />
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
  }
});
