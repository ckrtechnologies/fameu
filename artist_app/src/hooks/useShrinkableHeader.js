import { useRef } from 'react';
import { Animated } from 'react-native';

export function useShrinkableHeader({
  threshold = 40,
  initialTitleSize = 17.5,
  minTitleSize = 15,
  initialSubtitleHeight = 15,
  avatarSize = 36,
  avatarRadius = 18,
} = {}) {
  const scrollYRef = useRef(null);
  if (!scrollYRef.current) {
    scrollYRef.current = new Animated.Value(0);
  }
  const scrollY = scrollYRef.current;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Font shrinks dynamically on scroll, header structure stays fixed & stable
  const headerTitleSize = scrollY.interpolate({
    inputRange: [0, threshold],
    outputRange: [initialTitleSize, minTitleSize],
    extrapolate: 'clamp',
  });

  const subtitleHeight = scrollY.interpolate({
    inputRange: [0, threshold * 0.7],
    outputRange: [initialSubtitleHeight, 0],
    extrapolate: 'clamp',
  });

  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, threshold * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerBorderOpacity = scrollY.interpolate({
    inputRange: [0, threshold * 0.4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerElevation = scrollY.interpolate({
    inputRange: [0, threshold],
    outputRange: [0, 2],
    extrapolate: 'clamp',
  });

  return {
    scrollY,
    onScroll,
    headerPaddingVertical: 8, // Fixed padding, no header container squishing
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    avatarSize,
    avatarRadius,
    headerBorderOpacity,
    headerElevation,
  };
}

export default useShrinkableHeader;
