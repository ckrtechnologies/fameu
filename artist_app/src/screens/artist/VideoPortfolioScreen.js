import { GlobalAlert } from '../../components/core/GlobalAlert';
import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions, Platform, Image, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, X, Volume2, VolumeX, Trash2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import { WebView } from 'react-native-webview';
import { colors, typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import { useGetProfileQuery, useUpsertProfileMutation } from '../../services/profileApi';

const { width, height } = Dimensions.get('window');

const getYoutubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getVideoThumbnail = (url) => {
  const id = getYoutubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/0.jpg` : null;
};

export default function VideoPortfolioScreen() {
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

  const initialIndex = route.params?.initialIndex ?? null;

  const [activeVideoIndex, setActiveVideoIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');

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
    const ytThumb = getVideoThumbnail(item);

    return (
      <View style={styles.videoContainer}>
        {isActive ? (
          <View style={styles.activeVideoWrapper}>
            {ytThumb ? (
              <WebView
                source={{ uri: `https://www.youtube.com/embed/${getYoutubeVideoId(item)}?autoplay=1&rel=0` }}
                style={styles.fullVideo}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
              />
            ) : (
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
            )}
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
              style={[styles.thumbnailPlaceholder, { overflow: 'hidden' }]}
              onPress={() => setActiveVideoIndex(index)}
            >
              {ytThumb ? (
                <Image source={{ uri: ytThumb }} style={{ width: '100%', height: '100%', position: 'absolute', resizeMode: 'cover' }} />
              ) : (
                <Video source={{ uri: item }} style={{ width: '100%', height: '100%', position: 'absolute' }} paused={true} resizeMode="cover" muted={true} />
              )}
              <View style={styles.playButtonOverlay}>
                <Play fill={colors.white} color={colors.white} size={32} />
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Typography variant="h3" style={styles.headerTitle}>Video Portfolio</Typography>
      </View>

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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Typography variant="body" style={{color: colors.textSecondaryLight}}>No videos uploaded yet.</Typography>
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
    backgroundColor: colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonOverlay: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 2,
  },
  videoTitle: {
    position: 'absolute',
    bottom: spacing.m,
    left: spacing.m,
    color: colors.white,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
