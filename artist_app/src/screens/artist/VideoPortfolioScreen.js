import { GlobalAlert } from '../../components/core/GlobalAlert';
import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions, Platform, Image, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, X, Volume2, VolumeX, Trash2 } from 'lucide-react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';
import { useGetProfileQuery, useUpsertProfileMutation } from '../../services/profileApi';
import { getVideoInfo } from '../../utils/media';
import VideoThumbnail from '../../components/core/VideoThumbnail';
import InAppMediaModal from '../../components/core/InAppMediaModal';

const { width, height } = Dimensions.get('window');

export default function VideoPortfolioScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const route = useRoute();
  
  // If we came from the dashboard with no params, or explicitly passed isOwner, we allow editing.
  const isOwner = route.params?.isOwner || Object.keys(route.params || {}).length === 0;
  
  const { data: profileResponse, isLoading: profileLoading } = useGetProfileQuery(undefined, { skip: !isOwner });
  const [upsertProfile, { isLoading: isUpdating }] = useUpsertProfileMutation();
  
  const profile = profileResponse?.data;
  
  let videos = [];
  if (isOwner && profile?.video_url) {
    videos = profile.video_url.split(',').filter(Boolean);
  } else if (!isOwner && route.params?.videos) {
    videos = route.params.videos.filter(Boolean);
  }

  const [activeVideoIndex, setActiveVideoIndex] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [mediaModalUrl, setMediaModalUrl] = useState(null);

  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) return;
    try {
      const updatedVideos = [...videos, newVideoUrl.trim()].join(',');
      await upsertProfile({ video_url: updatedVideos }).unwrap();
      setNewVideoUrl('');
      GlobalAlert.show("Success", "Video added to your portfolio.");
    } catch (err) {
      GlobalAlert.show("Error", "Failed to add video.");
    }
  };

  const handleDeleteVideo = (indexToDelete) => {
    GlobalAlert.show(
      "Delete Video",
      "Are you sure you want to remove this video from your portfolio?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const updatedVideos = videos.filter((_, idx) => idx !== indexToDelete).join(',');
              await upsertProfile({ video_url: updatedVideos }).unwrap();
              GlobalAlert.show("Success", "Video removed.");
              if (activeVideoIndex === indexToDelete) setActiveVideoIndex(null);
            } catch (err) {
              GlobalAlert.show("Error", "Failed to delete video.");
            }
          }
        }
      ]
    );
  };

  const renderVideoItem = ({ item, index }) => {
    const isActive = activeVideoIndex === index;
    const videoInfo = getVideoInfo(item);

    return (
      <View style={styles.videoContainer}>
        {isActive ? (
          <View style={styles.activeVideoWrapper}>
              <>
                <Video
                  source={{ uri: item }}
                  style={styles.fullVideo}
                  resizeMode="contain"
                  repeat={true}
                  controls={Platform.OS === 'ios'}
                  muted={isMuted}
                />
                {Platform.OS === 'android' && (
                   <View style={styles.androidControls}>
                     <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.controlBtn}>
                        {isMuted ? <VolumeX color={colors.white} size={24} /> : <Volume2 color={colors.white} size={24} />}
                     </TouchableOpacity>
                   </View>
                )}
              </>
            <TouchableOpacity 
              style={styles.closeActiveBtn}
              onPress={() => setActiveVideoIndex(null)}
            >
              <X color={colors.white} size={24} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.thumbnailPlaceholder, { overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }]}
              onPress={() => {
                if (videoInfo?.type === 'direct') {
                  setActiveVideoIndex(index);
                } else {
                  setMediaModalUrl(item);
                }
              }}
            >
              <VideoThumbnail url={item} colors={colors} />
              <View style={styles.playButtonOverlay}>
                <Play fill={colors.primary} color={colors.primary} size={28} style={{ marginLeft: 3 }} />
              </View>
              <Typography variant="body" style={styles.videoTitle}>Video {index + 1}</Typography>
            </TouchableOpacity>
            {isOwner && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteVideo(index)}
              >
                <Trash2 color={colors.error} size={20} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  const {
    scrollY,
    onScroll,
    headerPaddingVertical,
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    headerElevation,
  } = useShrinkableHeader();

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ShrinkableHeader 
        title="Video Portfolio"
        subtitle={`${videos.length} videos & showreels`}
        showBack={true}
        onBack={() => navigation.goBack()}
        headerPaddingVertical={headerPaddingVertical}
        headerTitleSize={headerTitleSize}
        subtitleHeight={subtitleHeight}
        subtitleOpacity={subtitleOpacity}
        headerElevation={headerElevation}
      />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
        data={videos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderVideoItem}
        contentContainerStyle={styles.listContainer}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Typography variant="body" style={{color: colors.textMutedLight}}>No videos uploaded yet.</Typography>
          </View>
        }
        ListFooterComponent={
          isOwner ? (
            <View style={styles.addVideoContainer}>
              <Typography variant="h4" style={{ marginBottom: spacing.s, color: colors.textMainLight }}>Add New Video</Typography>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={styles.input}
                  placeholder="Paste YouTube or MP4 link..."
                  placeholderTextColor={colors.textMutedLight}
                  value={newVideoUrl}
                  onChangeText={setNewVideoUrl}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddVideo} disabled={isUpdating}>
                  {isUpdating ? <ActivityIndicator size="small" color={colors.white} /> : <Typography variant="button" style={{ color: colors.white }}>Add</Typography>}
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        }
      />
      </KeyboardAvoidingView>

      {/* In-App Media Player Modal */}
      <InAppMediaModal
        visible={Boolean(mediaModalUrl)}
        url={mediaModalUrl}
        onClose={() => setMediaModalUrl(null)}
      />
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
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.s,
  },
  headerTitle: {
    color: colors.textMainLight,
    fontWeight: '600',
  },
  listContainer: {
    padding: spacing.m,
  },
  videoContainer: {
    marginBottom: spacing.l,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  thumbnailPlaceholder: {
    height: 200,
    width: '100%',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButtonOverlay: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  videoTitle: {
    position: 'absolute',
    top: spacing.s,
    left: spacing.s,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
    zIndex: 2,
  },
  activeVideoWrapper: {
    height: 250,
    backgroundColor: '#000',
  },
  fullVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  closeActiveBtn: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    padding: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    zIndex: 10,
  },
  androidControls: {
    position: 'absolute',
    bottom: spacing.s,
    right: spacing.s,
    zIndex: 10,
  },
  controlBtn: {
    padding: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addVideoContainer: {
    marginTop: spacing.l,
    paddingTop: spacing.l,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: spacing.m,
    color: colors.textMainLight,
    marginRight: spacing.s,
  },
  addButton: {
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.l,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    padding: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    zIndex: 10,
  }
});
