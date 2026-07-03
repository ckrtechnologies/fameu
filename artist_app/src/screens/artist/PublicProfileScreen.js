import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity, Modal, Dimensions, Linking , RefreshControl } from 'react-native';
const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors, typography, spacing } from '../../theme/theme';
import CustomButton from '../../components/CustomButton';
import { 
  useGetPublicProfileQuery, 
  useFollowUserMutation, 
  useUnfollowUserMutation 
} from '../../services/connectionsApi';
import { useStartConversationMutation } from '../../services/chatApi';

export default function PublicProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { username } = route.params;
  
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const { data: profileData, isLoading, isError, refetch , isFetching} = useGetPublicProfileQuery(username)
  
  const [followUser, { isLoading: isFollowingLoad }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowingLoad }] = useUnfollowUserMutation();
  const [startConversation, { isLoading: isStartingChat }] = useStartConversationMutation();
  
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
      Alert.alert('Error', error?.data?.error || 'Failed to update follow status');
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
      Alert.alert('Error', error?.data?.error || 'Failed to start conversation');
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
        <Text style={styles.errorText}>User not found</Text>
        <CustomButton title="Go Back" onPress={() => navigation.goBack()} type="outline" style={{marginTop: spacing.m}} />
      </View>
    );
  }

  const isSelf = currentUserId === profileData.id;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>@{profileData.username}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}>
        <View style={styles.profileHeader}>
          {profileData.avatar_url ? (
            <Image source={{ uri: profileData.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={40} color={colors.textSecondaryLight} />
            </View>
          )}
          
          <View style={styles.statsContainer}>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => profileData?.id && navigation.navigate('ConnectionList', { type: 'followers', userId: profileData.id })}
            >
              <Text style={styles.statValue}>{profileData.followers_count}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => profileData?.id && navigation.navigate('ConnectionList', { type: 'following', userId: profileData.id })}
            >
              <Text style={styles.statValue}>{profileData.following_count}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bioSection}>
          <Text style={styles.nameText}>{profileData.name}</Text>
          <Text style={styles.roleText}>{profileData.role === 'artist' ? 'Artist' : 'Recruiter'}</Text>
          {profileData.profile?.bio && (
            <Text style={styles.bioText}>{profileData.profile.bio}</Text>
          )}
          {profileData.profile?.description && (
            <Text style={styles.bioText}>{profileData.profile.description}</Text>
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
                    <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {activeTab === 'Overview' ? (
              <View style={styles.portfolioSection}>
                <View style={{ backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12, marginBottom: 24, marginHorizontal: spacing.xl }}>
                  <Text style={{ ...typography.h3, color: colors.primary, marginBottom: 12 }}>Basic Info</Text>
                  {['age', 'gender', 'height', 'weight', 'city', 'languages', 'skills'].map((k) => {
                    const v = profileData.profile[k];
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
                  
                  {(!profileData.profile.photo_urls || profileData.profile.photo_urls.length === 0) && !profileData.profile.video_url ? (
                    <View style={styles.emptyPortfolio}>
                      <Text style={{ color: colors.textMutedLight, textAlign: 'center' }}>No media in portfolio.</Text>
                    </View>
                  ) : (
                    <View>
                      {/* Video Section */}
                      {profileData.profile.video_url ? (
                        <TouchableOpacity 
                          style={{ backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}
                          onPress={() => Linking.openURL(profileData.profile.video_url)}
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
                        const value = Array.isArray(v) ? v.join(', ') : String(v);
                        return (
                          <View key={k} style={{ marginBottom: 8 }}>
                            <Text style={{ ...typography.caption, color: colors.textMutedLight }}>{label}</Text>
                            <Text style={{ ...typography.body, color: colors.textMainLight }}>{value}</Text>
                          </View>
                        );
                      })}
                    </View>
                  );
                })()}
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>
      
      <Modal visible={isImageModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsImageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsImageModalVisible(false)}>
            <Icon name="close" size={30} color="#fff" />
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
    backgroundColor: colors.surfaceLight,
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
