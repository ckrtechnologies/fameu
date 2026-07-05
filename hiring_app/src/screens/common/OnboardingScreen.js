import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Animated, ImageBackground, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../theme/theme';
import CustomButton from '../../components/forms/CustomButton';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'POST AUDITIONS',
    description: 'Instantly broadcast your casting calls to thousands of verified artists.',
    image: require('../../assets/images/onboarding_1.png'),
  },
  {
    id: '2',
    title: 'REVIEW PORTFOLIOS',
    description: 'Browse rich media portfolios, showreels, and filter talent effortlessly.',
    image: require('../../assets/images/onboarding_2.png'),
  },
  {
    id: '3',
    title: 'HIRE TOP TALENT',
    description: 'Manage applications, shortlist candidates, and find your perfect star.',
    image: require('../../assets/images/onboarding_3.png'),
  }
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width
    ];

    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [-width * 0.7, 0, width * 0.7],
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [1.2, 1, 1.2],
    });

    return (
      <View style={styles.slide}>
        <View style={StyleSheet.absoluteFillObject}>
          <Animated.Image
            source={item.image}
            style={[styles.image, { transform: [{ translateX }, { scale }] }]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(0,0,0,0.8)', '#000000']}
            locations={[0, 0.4, 0.7, 1]}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderPaginator = () => {
    return (
      <View style={styles.paginatorContainer}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 30, 10],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i.toString()}
              style={[styles.dot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <Animated.FlatList
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />
      
      <SafeAreaView edges={['bottom']} style={styles.bottomOverlay}>
        {renderPaginator()}
        <View style={styles.footer}>
          <CustomButton
            title={currentIndex === SLIDES.length - 1 ? "GET STARTED" : "NEXT"}
            onPress={handleNext}
            style={styles.button}
            textStyle={styles.buttonText}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width,
    height,
  },
  image: {
    width,
    height,
  },
  contentContainer: {
    position: 'absolute',
    bottom: height * 0.18,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Comic Sans MS',
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.m,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontFamily: 'Comic Sans MS',
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: spacing.xxl,
  },
  paginatorContainer: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBBF24',
    marginHorizontal: 6,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.s,
  },
  button: {
    backgroundColor: '#FBBF24',
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#000000',
    fontWeight: '700',
    letterSpacing: 1,
  }
});
