import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolateColor
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedBorderCard({ 
  children, 
  onPress, 
  color = '#3b82f6', 
  delay = 0,
  style
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Stagger the animation start time for each card to create a wave effect
    setTimeout(() => {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1, // infinite
        true // reverse
      );
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    // Pulsating border and subtle shadow glow
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(0,0,0,0.05)', color]
    );
    
    return {
      borderColor,
      borderWidth: 1.5,
      transform: [
        { scale: 1 + (progress.value * 0.015) } // Very subtle breathing effect
      ]
    };
  });

  return (
    <AnimatedTouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress} 
      style={[styles.card, style, animatedStyle]}
    >
      <View style={[styles.glowBackground, { backgroundColor: color, opacity: 0.03 }]} />
      {children}
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  glowBackground: {
    ...StyleSheet.absoluteFillObject,
  }
});
