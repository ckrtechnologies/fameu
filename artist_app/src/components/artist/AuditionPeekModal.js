import React, { useRef, useEffect, useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, FlatList, Dimensions, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ChevronLeft, ChevronRight, Eye, MapPin, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import ImageWithFallback from '../core/ImageWithFallback';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

export default function AuditionPeekModal({ visible, auditions = [], initialIndex = 0, onClose, onViewDetails }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const scrollLeft = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    }
  };

  const scrollRight = () => {
    if (currentIndex < auditions.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  useEffect(() => {
    if (visible && flatListRef.current && auditions.length > 0 && initialIndex > 0) {
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
        } catch (e) {}
      }, 150);
    }
  }, [visible, initialIndex, auditions.length]);

  if (!visible || auditions.length === 0) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        
        <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
          {/* Top Bar with Counter and Close Button */}
          <View style={styles.topBar}>
            <View style={styles.counterPill}>
              <Sparkles size={13} color="#60A5FA" style={{ marginRight: 5 }} />
              <Text style={styles.counterText}>{currentIndex + 1} of {auditions.length}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <X size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Carousel Body */}
          <View style={styles.carouselContainer} pointerEvents="box-none">
            <FlatList
              ref={flatListRef}
              data={auditions}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
              onScrollToIndexFailed={(info) => {
                const wait = new Promise(resolve => setTimeout(resolve, 300));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
              getItemLayout={(data, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              renderItem={({ item }) => {
                const isOnline = String(item.mode || item.audition_type || '').toLowerCase().includes('online');
                const isLive = item.is_live;
                const viewsCount = item.view_count || 0;
                const companyName = item.hiring_profiles?.company_name || 'Production House';
                const cityLocation = item.city || item.venue_address || 'India';
                const compText = item.compensation || item.budget || 'Negotiable';

                return (
                  <View style={styles.pageContainer}>
                    <View style={styles.cardContainer}>
                      {/* Hero Image Section */}
                      <View style={styles.imageWrapper}>
                        <ImageWithFallback
                          source={{ uri: item.thumbnail_url }}
                          fallbackSource={{ uri: item.hiring_profiles?.logo_url }}
                          style={styles.heroImage}
                        />
                        
                        {/* Top Badges */}
                        <View style={styles.badgeRow}>
                          {isLive && (
                            <View style={styles.liveBadge}>
                              <View style={styles.liveDot} />
                              <Text style={styles.liveText}>LIVE</Text>
                            </View>
                          )}
                          <View style={[styles.modeBadge, isOnline ? styles.onlineBadge : styles.offlineBadge]}>
                            <Text style={styles.modeText}>{isOnline ? '🌐 Online' : '📍 In-Person'}</Text>
                          </View>
                        </View>

                        {/* Views Badge */}
                        <View style={styles.viewsBadge}>
                          <Eye size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                          <Text style={styles.viewsText}>{viewsCount}</Text>
                        </View>
                      </View>

                      {/* Content Details */}
                      <View style={styles.contentBox}>
                        <Text style={styles.cardTitle} numberOfLines={2}>{item.title || 'Untitled Casting Call'}</Text>
                        <Text style={styles.companyText} numberOfLines={1}>{companyName}</Text>

                        {/* Location & Compensation Details */}
                        <View style={styles.metaRow}>
                          <View style={styles.metaItem}>
                            <MapPin size={13} color={colors.primary} style={{ marginRight: 4 }} />
                            <Text style={styles.metaLocation} numberOfLines={1}>{cityLocation}</Text>
                          </View>
                          <Text style={styles.metaBudget} numberOfLines={1}>💰 {compText}</Text>
                        </View>

                        {/* Status Tag */}
                        <View style={styles.statusRow}>
                          <View style={styles.activeTag}>
                            <Text style={styles.activeTagText}>active</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Bottom Action Bar with Flanking Arrows & Full Details Button */}
                    <View style={styles.actionBar}>
                      <TouchableOpacity 
                        style={[styles.navArrowBtn, currentIndex === 0 && styles.navArrowDisabled]} 
                        onPress={scrollLeft} 
                        disabled={currentIndex === 0}
                        activeOpacity={0.8}
                      >
                        <ChevronLeft size={22} color={currentIndex === 0 ? 'rgba(255,255,255,0.3)' : '#FFFFFF'} strokeWidth={2.5} />
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.detailsBtn} 
                        onPress={() => onViewDetails(item)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.detailsBtnText}>View Full Details</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.navArrowBtn, currentIndex === auditions.length - 1 && styles.navArrowDisabled]} 
                        onPress={scrollRight} 
                        disabled={currentIndex === auditions.length - 1}
                        activeOpacity={0.8}
                      >
                        <ChevronRight size={22} color={currentIndex === auditions.length - 1 ? 'rgba(255,255,255,0.3)' : '#FFFFFF'} strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const getStyles = (colors, insets) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 11, 22, 0.95)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: Math.max(insets.bottom, 16),
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 20,
  },
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardContainer: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  imageWrapper: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.28,
    backgroundColor: '#1E293B',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  onlineBadge: {
    backgroundColor: '#059669',
  },
  offlineBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  viewsBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  viewsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  contentBox: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 21,
    marginBottom: 4,
  },
  companyText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  metaLocation: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  metaBudget: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  activeTagText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    width: CARD_WIDTH,
    gap: 12,
  },
  navArrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrowDisabled: {
    opacity: 0.4,
  },
  detailsBtn: {
    flex: 1,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
