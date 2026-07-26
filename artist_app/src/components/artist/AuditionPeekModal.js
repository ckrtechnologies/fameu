import React, { useRef, useEffect, useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, FlatList, Dimensions, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import AuditionCard from './AuditionCard';

const { width } = Dimensions.get('window');

export default function AuditionPeekModal({ visible, auditions, initialIndex = 0, onClose, onViewDetails }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
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
      }, 200);
    }
  }, [visible, initialIndex, auditions.length]);

  if (!visible || auditions.length === 0) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
          <View style={styles.header} pointerEvents="box-none">
            <Text style={styles.title}>Auditions</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={28} color={colors.textMainLight} />
            </TouchableOpacity>
          </View>

        <View style={styles.listContainer} pointerEvents="box-none">
          <FlatList
            ref={flatListRef}
            data={auditions}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
            onScrollToIndexFailed={(info) => {
              const wait = new Promise(resolve => setTimeout(resolve, 500));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
              });
            }}
            getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={({ item }) => (
              <View style={styles.pageContainer}>
                <View style={styles.cardWrapper}>
                  <AuditionCard 
                    audition={item} 
                    onPress={() => {}} // disable direct card press since we have the button below
                    style={{ width: '100%', height: '100%', marginRight: 0 }}
                    imageContainerStyle={{ flex: 1, height: undefined }}
                  />
                </View>
                
                <TouchableOpacity 
                  style={styles.detailsBtn} 
                  onPress={() => onViewDetails(item)}
                >
                  <Text style={styles.detailsBtnText}>View Full Details</Text>
                </TouchableOpacity>
              </View>
            )}
          />

          {currentIndex > 0 && (
            <TouchableOpacity style={styles.leftArrow} onPress={scrollLeft}>
              <Icon name="chevron-back" size={32} color={colors.textMainLight} />
            </TouchableOpacity>
          )}

          {currentIndex < auditions.length - 1 && (
            <TouchableOpacity style={styles.rightArrow} onPress={scrollRight}>
              <Icon name="chevron-forward" size={32} color={colors.textMainLight} />
            </TouchableOpacity>
          )}
        </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const getStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
  },
  title: {
    ...typography.h2,
    color: colors.textMainLight,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  pageContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  cardWrapper: {
    width: width * 0.85, // 85% of screen width
    height: '60%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xxl,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
  },
  detailsBtnText: {
    ...typography.h3,
    color: '#fff',
  },
  listContainer: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  leftArrow: {
    position: 'absolute',
    left: spacing.xs,
    top: '40%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    padding: spacing.xs,
    zIndex: 10,
  },
  rightArrow: {
    position: 'absolute',
    right: spacing.xs,
    top: '40%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    padding: spacing.xs,
    zIndex: 10,
  }
});
