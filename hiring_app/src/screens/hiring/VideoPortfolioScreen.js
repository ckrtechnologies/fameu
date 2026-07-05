import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, X, Volume2, VolumeX } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import { colors, typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';

const { width, height } = Dimensions.get('window');

export default function VideoPortfolioScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const videos = route.params?.videos || [];
  const initialIndex = route.params?.initialIndex ?? null;

  const [activeVideoIndex, setActiveVideoIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);

  const renderVideoItem = ({ item, index }) => {
    const isActive = activeVideoIndex === index;

    return (
      <View style={styles.videoContainer}>
        {isActive ? (
          <View style={styles.activeVideoWrapper}>
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
            <TouchableOpacity 
              style={styles.closeActiveBtn}
              onPress={() => setActiveVideoIndex(null)}
            >
              <X color={colors.white} size={24} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.thumbnailPlaceholder}
            onPress={() => setActiveVideoIndex(index)}
          >
            <View style={styles.playButtonOverlay}>
              <Play fill={colors.white} color={colors.white} size={32} />
            </View>
            <Typography variant="body" style={styles.videoTitle}>Video {index + 1}</Typography>
          </TouchableOpacity>
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

      <FlatList
        data={videos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderVideoItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Typography variant="body" style={{color: colors.textSecondaryLight}}>No videos uploaded yet.</Typography>
          </View>
        }
      />
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
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundDark,
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
  },
  videoTitle: {
    color: colors.white,
    marginTop: spacing.s,
    position: 'absolute',
    bottom: spacing.m,
    left: spacing.m,
    fontWeight: '600',
  },
  activeVideoWrapper: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  fullVideo: {
    width: '100%',
    height: '100%',
  },
  closeActiveBtn: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    padding: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  androidControls: {
    position: 'absolute',
    bottom: spacing.m,
    right: spacing.m,
    flexDirection: 'row',
  },
  controlBtn: {
    padding: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    marginLeft: spacing.s,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
