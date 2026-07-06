import { GlobalAlert } from '../../components/core/GlobalAlert';
import { showError, showSuccess } from '../../utils/toast';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Linking, Alert, Modal, Dimensions , RefreshControl } from 'react-native';
import Video from 'react-native-video';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, globalStyles } from '../../theme/theme';
import CommentsSection from '../../components/CommentsSection';
import { useGetArtistDetailsQuery } from '../../services/discoveryApi';
import { useStartConversationMutation } from '../../services/chatApi';
import { useGetCompanyProfileQuery } from '../../services/hiringApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../components/forms/CustomButton';
import SkeletonLoader from '../../components/SkeletonLoader';
export default function ArtistProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const { id } = route.params;
  const { data: response, isLoading, error , isFetching, refetch} = useGetArtistDetailsQuery(id);
  const { data: companyResponse } = useGetCompanyProfileQuery();
  const isVerified = companyResponse?.data?.is_verified;
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [startConversation, { isLoading: isStartingChat }] = useStartConversationMutation();

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
      { text: "Cancel", style: "cancel" },
      { text: "Message", onPress: async () => {
          try {
            const response = await startConversation({ targetUserId: artist.user_id }).unwrap();
            navigation.navigate('ChatScreen', { 
              conversationId: response.data.id, 
              otherUserName: artist.full_name 
            });
          } catch (err) {
            console.error(err);
            showError('', "Could not start conversation.");
          }
        } 
      }
    ]);
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

  return (
    <SafeAreaView style={globalStyles.container} edges={['top', 'bottom']}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Profile Details</Text>
        <View style={{ width: 24 }} />
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
                <View style={{ backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12, marginBottom: 24 }}>
                  <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Basic Info</Text>
                  {['age', 'gender', 'height', 'weight', 'city', 'languages', 'skills'].map((k) => {
                    const v = artist[k];
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

                {(artist.portfolio_url || artist.instagram_url || artist.youtube_url) && (
                  <View style={{ backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12, marginBottom: 24 }}>
                    <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Links</Text>
                    {artist.portfolio_url && (
                      <TouchableOpacity style={styles.linkRow} onPress={() => openLink(artist.portfolio_url)}>
                        <Icon name="globe-outline" size={20} color={colors.primary} />
                        <Text style={styles.linkText}>Portfolio</Text>
                      </TouchableOpacity>
                    )}
                    {artist.instagram_url && (
                      <TouchableOpacity style={styles.linkRow} onPress={() => openLink(artist.instagram_url)}>
                        <Icon name="logo-instagram" size={20} color={'#E1306C'} />
                        <Text style={styles.linkText}>Instagram</Text>
                      </TouchableOpacity>
                    )}
                    {artist.youtube_url && (
                      <TouchableOpacity style={styles.linkRow} onPress={() => openLink(artist.youtube_url)}>
                        <Icon name="logo-youtube" size={20} color={'#FF0000'} />
                        <Text style={styles.linkText}>YouTube</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Media Gallery</Text>
                  
                  {(!artist.photo_urls || artist.photo_urls.length === 0) && !artist.video_url ? (
                    <View style={styles.emptyPortfolio}>
                      <Text style={{ color: colors.textMutedLight, textAlign: 'center' }}>No media in portfolio.</Text>
                    </View>
                  ) : (
                    <View>
                      {/* Video Section */}
                      {artist.video_url ? (
                        <View style={[styles.galleryGrid, { marginHorizontal: 0, marginBottom: 16 }]}>
                          {artist.video_url.split(',').map((vidUrl, index) => (
                            <TouchableOpacity 
                              key={index} 
                              onPress={() => {
                                navigation.navigate('VideoPortfolio', { videos: artist.video_url.split(','), initialIndex: index });
                              }}
                              style={[styles.galleryItem, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceDark }]}
                            >
                              <Icon name="play" size={40} color={colors.primary} />
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : null}

                      {/* Photo Section */}
                      {artist.photo_urls && artist.photo_urls.length > 0 ? (
                        <View style={[styles.galleryGrid, { marginHorizontal: 0 }]}>
                          {artist.photo_urls.map((imgUrl, index) => (
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

      <Modal visible={isImageModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsImageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsImageModalVisible(false)}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />}
        </View>
      </Modal>

      <View style={styles.footer}>
        <CustomButton title="Contact Talent" onPress={handleContact} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
