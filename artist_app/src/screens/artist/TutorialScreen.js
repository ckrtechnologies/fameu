import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Typography from '../../components/core/Typography';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, typography } from '../../theme/theme';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    title: 'Complete Your Profile',
    description: 'Add your best photos, an intro video, and details about your skills and measurements to stand out to casting directors.',
    icon: 'person-circle-outline',
    color: '#3b82f6'
  },
  {
    title: 'Browse & Apply',
    description: 'Search for auditions that match your profile, read the requirements, and submit your application with one tap.',
    icon: 'search-outline',
    color: '#f59e0b'
  },
  {
    title: 'Communicate & Get Hired',
    description: 'Chat directly with casting directors, send additional media if requested, and land your next big role!',
    icon: 'chatbubbles-outline',
    color: '#8b5cf6'
  }
];

export default function TutorialScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();

  const {
    scrollY,
    onScroll,
    headerPaddingVertical,
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    headerElevation,
  } = useShrinkableHeader();

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ShrinkableHeader 
        title="How it Works"
        subtitle="Quick starter guide for artists"
        showBack={true}
        onBack={() => navigation.goBack()}
        headerPaddingVertical={headerPaddingVertical}
        headerTitleSize={headerTitleSize}
        subtitleHeight={subtitleHeight}
        subtitleOpacity={subtitleOpacity}
        headerElevation={headerElevation}
      />

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Typography variant="body" style={styles.description}>
          Welcome to Fameu! Here is a quick overview of how you can use this app to jumpstart your career.
        </Typography>

        <View style={styles.stepsContainer}>
          {STEPS.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={[styles.iconContainer, { backgroundColor: step.color + '15' }]}>
                <Icon name={step.icon} size={32} color={step.color} />
              </View>
              <View style={styles.stepTextContainer}>
                <Typography variant="h3" style={styles.stepTitle}>{step.title}</Typography>
                <Typography variant="body" style={styles.stepDescription}>{step.description}</Typography>
              </View>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.goBack()}>
          <Typography variant="h3" style={styles.actionBtnText}>Get Started</Typography>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    color: colors.textMainLight,
  },
  content: {
    padding: spacing.l,
  },
  description: {
    color: colors.textMutedLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  stepsContainer: {
    marginTop: spacing.m,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.l,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    color: colors.textMainLight,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    color: colors.textMutedLight,
    lineHeight: 20,
    fontSize: 14,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.l,
    marginBottom: spacing.xxl,
  },
  actionBtnText: {
    color: '#fff',
  }
});
