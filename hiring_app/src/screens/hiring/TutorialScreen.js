import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Typography from '../../components/core/Typography';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, typography } from '../../theme/theme';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    title: 'Set Up Your Company',
    description: 'Create your company profile, upload your logo, and complete KYC verification to build trust with talent.',
    icon: 'business-outline',
    color: '#3b82f6'
  },
  {
    title: 'Post Auditions',
    description: 'Create detailed casting calls, specify the roles you need, and set your budget and shooting dates.',
    icon: 'megaphone-outline',
    color: '#10b981'
  },
  {
    title: 'Review Talent',
    description: 'Browse through applications, view artist portfolios, videos, and use our smart filters to find the perfect match.',
    icon: 'people-circle-outline',
    color: '#f59e0b'
  },
  {
    title: 'Shortlist & Hire',
    description: 'Shortlist candidates, chat with them directly, request self-tapes, and finalize your casting securely.',
    icon: 'briefcase-outline',
    color: '#8b5cf6'
  }
];

export default function TutorialScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Typography variant="h2" style={styles.title}>How it Works</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Typography variant="body" style={styles.description}>
          Welcome to Fameu! Here is a quick overview of how you can use this app to streamline your casting process.
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
