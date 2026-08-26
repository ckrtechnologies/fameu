import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Text, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import ImageWithFallback from './ImageWithFallback';

export default function ShrinkableHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  showMenu = false,
  onMenuPress,
  avatarUrl,
  avatarText,
  onAvatarPress,
  rightActions,
  bottomComponent,
  headerTitleSize,
  subtitleHeight,
  subtitleOpacity,
  avatarSize = 34,
  avatarRadius = 17,
  headerElevation,
  headerBorderOpacity,
  scrollY,
  style,
}) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  // Ensure header has clean, comfortable distance from the top status bar / camera notch
  const statusBarHeight = StatusBar.currentHeight || 24;
  const topPadding = Platform.OS === 'android'
    ? Math.max(insets.top, statusBarHeight) + 6
    : Math.max(insets.top, 14);

  // Dynamic morph between Hamburger Menu and Avatar DP on scroll
  const isDynamicMorph = (showMenu || onMenuPress) && (avatarUrl || avatarText) && scrollY;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundLight,
          paddingTop: topPadding,
          paddingBottom: 8,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderLight,
        },
        headerElevation && {
          elevation: headerElevation,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 3,
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        {/* Left Section: Back button, Hamburger menu, or Dynamic Morphing Avatar */}
        <View style={styles.leftContainer}>
          {showBack ? (
            <TouchableOpacity onPress={handleBack} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="arrow-back" size={24} color={colors.textMainLight} />
            </TouchableOpacity>
          ) : isDynamicMorph ? (
            <TouchableOpacity
              onPress={onMenuPress || onAvatarPress || (() => navigation.openDrawer())}
              style={styles.morphContainer}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {/* Hamburger Icon: Visible at top, smoothly fades out as you scroll down */}
              <Animated.View
                style={[
                  styles.iconButton,
                  {
                    position: 'absolute',
                    opacity: scrollY.interpolate({
                      inputRange: [0, 50, 90],
                      outputRange: [1, 0.3, 0],
                      extrapolate: 'clamp',
                    }),
                    transform: [{
                      scale: scrollY.interpolate({
                        inputRange: [0, 50, 90],
                        outputRange: [1, 0.8, 0.5],
                        extrapolate: 'clamp',
                      }),
                    }],
                  }
                ]}
              >
                <Icon name="menu-outline" size={26} color={colors.textMainLight} />
              </Animated.View>

              {/* Avatar DP: Hidden at top, smoothly scales/fades in as user scrolls down */}
              <Animated.View
                style={{
                  opacity: scrollY.interpolate({
                    inputRange: [0, 50, 90],
                    outputRange: [0, 0.7, 1],
                    extrapolate: 'clamp',
                  }),
                  transform: [{
                    scale: scrollY.interpolate({
                      inputRange: [0, 50, 90],
                      outputRange: [0.5, 0.85, 1],
                      extrapolate: 'clamp',
                    }),
                  }],
                }}
              >
                <View
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarRadius,
                    overflow: 'hidden',
                    backgroundColor: colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: colors.borderLight,
                  }}
                >
                  {avatarUrl ? (
                    <ImageWithFallback source={{ uri: avatarUrl }} style={styles.fullImage} />
                  ) : (
                    <Text style={styles.avatarInitial}>{avatarText || 'C'}</Text>
                  )}
                </View>
              </Animated.View>
            </TouchableOpacity>
          ) : (showMenu || onMenuPress) ? (
            <TouchableOpacity onPress={onMenuPress || (() => navigation.openDrawer())} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="menu-outline" size={26} color={colors.textMainLight} />
            </TouchableOpacity>
          ) : (avatarUrl || avatarText) ? (
            <TouchableOpacity onPress={onAvatarPress || (() => navigation.openDrawer())} style={{ marginRight: 8 }}>
              <View
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarRadius,
                  overflow: 'hidden',
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {avatarUrl ? (
                  <ImageWithFallback source={{ uri: avatarUrl }} style={styles.fullImage} />
                ) : (
                  <Text style={styles.avatarInitial}>{avatarText || 'C'}</Text>
                )}
              </View>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Center Section: Title & Subtitle (Only font shrinks on scroll) */}
        <View style={styles.centerContainer}>
          {title ? (
            <Animated.Text
              style={[
                styles.title,
                {
                  color: colors.textMainLight,
                  fontSize: headerTitleSize || 17,
                },
              ]}
              numberOfLines={1}
            >
              {title}
            </Animated.Text>
          ) : null}

          {subtitle ? (
            <Animated.View
              style={{
                height: subtitleHeight || 15,
                opacity: subtitleOpacity !== undefined ? subtitleOpacity : 1,
                overflow: 'hidden',
              }}
            >
              <Text style={[styles.subtitle, { color: colors.textMutedLight }]} numberOfLines={1}>
                {subtitle}
              </Text>
            </Animated.View>
          ) : null}
        </View>

        {/* Right Section: Custom action buttons */}
        <View style={styles.rightContainer}>
          {rightActions}
        </View>
      </View>

      {/* Optional Bottom Component (Search bar, Filter Chips, Tabs) */}
      {bottomComponent && (
        <View style={styles.bottomRow}>
          {bottomComponent}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 38,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 40,
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 1,
  },
  iconButton: {
    padding: 4,
    borderRadius: 20,
  },
  morphContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomRow: {
    marginTop: 6,
  },
});
