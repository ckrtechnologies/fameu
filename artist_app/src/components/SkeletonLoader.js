import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/theme';

const SkeletonLoader = ({ width = '100%', height = 60, borderRadius = 8, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

const getStyles = (colors) => StyleSheet.create({
  skeleton: {
    backgroundColor: colors.textMutedLight,
    marginBottom: spacing.m,
  },
});

export default SkeletonLoader;
