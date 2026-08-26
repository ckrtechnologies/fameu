import React, { useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppIcon from '../icons';
import { getVideoInfo } from '../../utils/media';

// Proxy endpoint on our backend that fetches and pipes external CDN images.
// This is needed because some network environments (e.g. emulators, corporate NAT)
// cannot reach img.youtube.com or images.unsplash.com directly.
const PROXY_BASE = 'https://api.fameu.in/api/proxy/thumbnail?url=';

const ytThumb = (id, quality = 'hqdefault') =>
  `${PROXY_BASE}${encodeURIComponent(`https://img.youtube.com/vi/${id}/${quality}.jpg`)}`;

const CINEMATIC_POSTER = `${PROXY_BASE}${encodeURIComponent('https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop')}`;

export default function VideoThumbnail({ url, style, colors, hideBadge }) {
  const [errorLevel, setErrorLevel] = useState(0);
  const info = getVideoInfo(url);

  if (!url || typeof url !== 'string' || url.trim() === '') {
    return (
      <View style={[StyleSheet.absoluteFillObject, styles.center, { backgroundColor: '#0F172A' }, style]}>
        <AppIcon name="videocam" size={36} color={colors?.primary || '#3B82F6'} />
      </View>
    );
  }

  // 1. YouTube video thumbnail — proxied through backend for high availability
  if (info?.type === 'youtube' && info.id) {
    const id = info.id;
    const ytUrls = [
      ytThumb(id, 'hqdefault'),
      ytThumb(id, 'mqdefault'),
      ytThumb(id, '0'),
      `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      CINEMATIC_POSTER,
    ];
    const currentYtUrl = ytUrls[errorLevel] || ytUrls[0];

    return (
      <View style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%', backgroundColor: '#0F172A', overflow: 'hidden' }, style]}>
        <Image
          key={currentYtUrl}
          source={{ uri: currentYtUrl }}
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          resizeMode="cover"
          onError={() => {
            if (errorLevel < ytUrls.length - 1) {
              setErrorLevel(prev => prev + 1);
            }
          }}
        />
        {!hideBadge && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            style={styles.bottomOverlay}
          >
            <View style={styles.badgeRow}>
              <AppIcon name="logo-youtube" size={13} color="#FF0000" />
              <Text style={styles.badgeText}>YouTube</Text>
            </View>
          </LinearGradient>
        )}
      </View>
    );
  }

  // 2. Instagram Video / Reel
  if (info?.type === 'instagram') {
    return (
      <View style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%', overflow: 'hidden' }, style]}>
        <LinearGradient
          colors={['#833AB4', '#FD1D1D', '#FCAF45']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, styles.center]}
        >
          <View style={[styles.center, { backgroundColor: 'rgba(0,0,0,0.22)', width: '100%', height: '100%' }]}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
              <AppIcon name="logo-instagram" color="#FFFFFF" size={28} />
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700', letterSpacing: 0.3 }}>Instagram Reel</Text>
          </View>
        </LinearGradient>

        {!hideBadge && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            style={styles.bottomOverlay}
          >
            <View style={styles.badgeRow}>
              <AppIcon name="logo-instagram" size={13} color="#E1306C" />
              <Text style={styles.badgeText}>Instagram</Text>
            </View>
          </LinearGradient>
        )}
      </View>
    );
  }

  // 3. Direct Uploaded Video / Web link (.mp4, .mov, etc.)
  return (
    <View style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%', backgroundColor: '#0F172A', overflow: 'hidden' }, style]}>
      <Image
        source={{ uri: CINEMATIC_POSTER }}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(15, 23, 42, 0.45)', 'rgba(15, 23, 42, 0.85)']}
        style={[StyleSheet.absoluteFillObject, styles.center]}
      >
        <View style={styles.directVideoEmblem}>
          <AppIcon name="videocam" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.directVideoLabel}>Video Showreel</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 44,
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  directVideoEmblem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  directVideoLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
