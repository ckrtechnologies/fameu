import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Dimensions, Text, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { X, ExternalLink, RefreshCw } from 'lucide-react-native';
import AppIcon from '../icons';
import { useTheme } from '../../theme/ThemeProvider';
import { getVideoInfo } from '../../utils/media';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function InAppMediaModal({ visible, url, title, onClose }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets);
  const [webViewKey, setWebViewKey] = useState(0);

  const [isWebMode, setIsWebMode] = useState(false);

  if (!visible || !url) return null;

  const info = getVideoInfo(url);
  const isYouTube = info?.type === 'youtube';
  const isInstagram = info?.type === 'instagram';

  // Determine optimal embed / web source
  let source = { uri: url };
  let badgeIcon = 'videocam';
  let badgeColor = '#3B82F6';
  let badgeLabel = 'Video';

  if (isYouTube && info.id) {
    badgeIcon = 'logo-youtube';
    badgeColor = '#FF0000';
    badgeLabel = 'YouTube';

    if (isWebMode) {
      source = { uri: `https://m.youtube.com/watch?v=${info.id}` };
    } else {
      const youtubeHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              html, body { width: 100%; height: 100%; background: #000000 !important; overflow: hidden; display: flex; justify-content: center; align-items: center; }
              iframe { width: 100%; height: 100%; border: 0; background: #000000 !important; }
            </style>
          </head>
          <body>
            <iframe 
              src="https://www.youtube-nocookie.com/embed/${info.id}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&fs=1"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </body>
        </html>
      `;
      source = { html: youtubeHtml, baseUrl: 'https://www.youtube-nocookie.com' };
    }
  } else if (isInstagram && info.id) {
    badgeIcon = 'logo-instagram';
    badgeColor = '#E1306C';
    badgeLabel = 'Instagram';
    source = { uri: `https://www.instagram.com/p/${info.id}/embed/` };
  }

  const modalWidth = Math.min(SCREEN_WIDTH * 0.94, 420);
  const modalHeight = isInstagram
    ? Math.min(SCREEN_HEIGHT * 0.76, 560)
    : isYouTube
      ? (isWebMode ? Math.min(SCREEN_HEIGHT * 0.75, 560) : Math.round(modalWidth * (9 / 16)))
      : Math.min(SCREEN_HEIGHT * 0.70, 520);

  // Injected CSS & JS to scrub Instagram login banners, popups, and sign-in prompts
  const injectedInstagramScrubber = `
    (function() {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = \`
        .Header, .Footer, .HoverBanner, .Banner, [data-testid="login-button"], 
        .LoginBanner, .EmbeddedMediaFooter, .embedFooter, a[href*="login"], 
        .logged-out-form, .bottom-cta, .CtaBanner, .embedCta,
        div[role="dialog"], .MobileLandingPage, [role="banner"],
        a[href*="accounts/login"], a[href*="accounts/emailsignup"],
        .EmbedFrameFooter, .EmbeddedMediaHeader, .OverlayBanner,
        .SignupCta, .login-cta, .cta-bottom {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          height: 0 !important;
          pointer-events: none !important;
        }
        body, html {
          background-color: #0F172A !important;
          overflow: hidden !important;
        }
      \`;
      if (document.head) document.head.appendChild(style);

      setInterval(function() {
        var elementsToHide = document.querySelectorAll(
          'a[href*="login"], a[href*="signup"], .HoverBanner, .Banner, .embedFooter, [data-testid="login-button"], .EmbedFrameFooter'
        );
        elementsToHide.forEach(function(el) {
          el.style.display = 'none';
        });
      }, 250);
    })();
    true;
  `;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
          {/* Top Bar Header */}
          <View style={styles.topBar}>
            <View style={[styles.platformBadge, { backgroundColor: badgeColor + '20', borderColor: badgeColor + '40' }]}>
              <AppIcon name={badgeIcon} size={15} color={badgeColor} style={{ marginRight: 6 }} />
              <Text style={[styles.platformBadgeText, { color: badgeColor }]}>{badgeLabel}</Text>
            </View>

            <View style={styles.topActionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setWebViewKey(prev => prev + 1)}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <RefreshCw size={17} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { marginLeft: 10 }]}
                onPress={onClose}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Media Player Frame */}
          <View style={styles.centerContainer} pointerEvents="box-none">
            <View style={[styles.playerContainer, { width: modalWidth, height: modalHeight, backgroundColor: '#000000' }]}>
              <WebView
                key={`${webViewKey}-${isWebMode ? 'web' : 'embed'}`}
                source={source}
                style={[styles.webView, { backgroundColor: '#000000' }]}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                allowsFullscreenVideo={true}
                setSupportMultipleWindows={false}
                originWhitelist={['*']}
                mixedContentMode="always"
                startInLoadingState={true}
                injectedJavaScript={isInstagram ? injectedInstagramScrubber : undefined}
                injectedJavaScriptBeforeContentLoaded={isInstagram ? injectedInstagramScrubber : undefined}
                onShouldStartLoadWithRequest={(request) => {
                  const reqUrl = (request?.url || '').toLowerCase();
                  // If YouTube embed tries to redirect to watch page on click, switch to Web View mode
                  if (reqUrl.includes('youtube.com/watch') || reqUrl.includes('youtu.be/')) {
                    if (!isWebMode) {
                      setIsWebMode(true);
                      return false;
                    }
                    return true;
                  }
                  // Block login redirects, app installs, and native intent hijackings
                  if (
                    reqUrl.includes('accounts/login') ||
                    reqUrl.includes('accounts/emailsignup') ||
                    reqUrl.startsWith('intent:') ||
                    reqUrl.startsWith('vnd.youtube:') ||
                    reqUrl.startsWith('market:') ||
                    reqUrl.startsWith('app:') ||
                    reqUrl.startsWith('instagram:') ||
                    reqUrl.startsWith('youtube:')
                  ) {
                    return false;
                  }
                  return true;
                }}
                renderLoading={() => (
                  <View style={[styles.loadingContainer, { backgroundColor: '#000000' }]}>
                    <ActivityIndicator size="large" color={badgeColor || colors.primary} />
                    <Text style={styles.loadingText}>Loading {badgeLabel} player...</Text>
                  </View>
                )}
                userAgent={isYouTube && isWebMode ? "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
              />
            </View>
          </View>

          {/* Bottom Dismiss Hint */}
          <View style={styles.bottomHintContainer}>
            <TouchableOpacity onPress={onClose} style={styles.doneBtn} activeOpacity={0.85}>
              <Text style={styles.doneBtnText}>Close Player</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const getStyles = (colors, insets) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 11, 22, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    paddingBottom: Math.max(insets.bottom, 16),
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    zIndex: 30,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  platformBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  bottomHintContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  doneBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
