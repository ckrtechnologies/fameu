import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../../theme/theme';

// Calculate massive circle size to cover the entire screen
const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = Math.max(width, height) * 1.5;

export default function SplashScreen() {
  const navigation = useNavigation();

  // Animation Values
  const blueBgScale = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Spring in the circular logo (over the solid blue background)
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // 2. After 1.5 seconds, scale down the blue background and fade out the logo to reveal the real images
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(blueBgScale, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      ]).start();
    }, 1500);

    // 3. Navigate to Onboarding
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigation, blueBgScale, logoScale, logoOpacity, textOpacity]);

  return (
    <View style={styles.container}>
      {/* 1. Base Layer: The highly realistic photo collage */}
      <ImageBackground
        source={require('../../assets/images/splash_bg.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      {/* Dark overlay so the white text pops perfectly */}
      <View style={styles.overlay} />

      {/* 2. Text Layer: Perfectly crisp native text, NO AI cropping */}
      <Animated.View style={[styles.textOverlayContainer, { opacity: textOpacity }]}>
        <Text style={styles.tagline}>Discover</Text>
        <Text style={styles.taglineHighlight}>Top Talent</Text>
      </Animated.View>

      {/* 3. Reveal Layer: Solid blue circular background that scales down */}
      <Animated.View
        style={[
          styles.blueCircle,
          { transform: [{ scale: blueBgScale }] }
        ]}
      />

      {/* 4. Logo Layer: Circular logo that springs in and fades out */}
      <Animated.View
        style={[
          styles.circularLogo,
          { transform: [{ scale: logoScale }], opacity: logoOpacity }
        ]}
      >
        <Image 
          source={require('../../assets/images/logo.jpeg')} 
          style={styles.logoImage} 
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  textOverlayContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  tagline: {
    ...typography.h1,
    fontFamily: 'Comic Sans MS',
    fontSize: 30,
    color: '#E2E8F0', // Premium soft silver/off-white
    fontWeight: '400',
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  taglineHighlight: {
    ...typography.h1,
    fontFamily: 'Comic Sans MS',
    fontSize: 44,
    color: '#FBBF24', // Premium gold that pops beautifully on dark backgrounds
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  blueCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.primary,
    top: '50%',
    left: '50%',
    marginTop: -CIRCLE_SIZE / 2,
    marginLeft: -CIRCLE_SIZE / 2,
  },
  circularLogo: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
  },
});
