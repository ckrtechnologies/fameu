import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '../../constants/LegalText';

export default function LegalScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const route = useRoute();
  const { type } = route.params || { type: 'terms' };
  
  const isTerms = type === 'terms';
  const title = isTerms ? 'Terms of Service' : 'Privacy Policy';
  const legalText = isTerms ? TERMS_OF_SERVICE : PRIVACY_POLICY;

  const renderFormattedText = (text) => {
    return text.split('\n').map((line, index) => {
      if (!line.trim()) {
        return <View key={index} style={{ height: spacing.m }} />;
      }
      
      // Main Headings (e.g., 1. Eligibility)
      if (/^\d+\.\s/.test(line)) {
        return (
          <Text key={index} style={styles.headingText}>
            {line}
          </Text>
        );
      }
      
      // Subheadings (e.g., A. Personal Data:)
      if (/^[A-Z]\.\s/.test(line)) {
        return (
          <Text key={index} style={styles.subheadingText}>
            {line}
          </Text>
        );
      }
      
      // Bullet points
      if (line.startsWith('- ')) {
        return (
          <View key={index} style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>{line.replace(/^- /, '')}</Text>
          </View>
        );
      }
      
      // Default text
      return (
        <Text key={index} style={styles.paragraphText}>
          {line}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.textMainLight} />
        </TouchableOpacity>
        <Typography variant="h2" style={styles.headerTitle}>{title}</Typography>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Typography variant="h3" style={styles.sectionTitle}>
          {isTerms ? 'FameU Master Agreement' : 'FameU Privacy Policy'}
        </Typography>
        
        <View style={styles.placeholderContainer}>
          {renderFormattedText(legalText)}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: colors.textMainLight,
  },
  contentContainer: {
    flex: 1,
    padding: spacing.xl,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: colors.textMainLight,
    marginBottom: spacing.l,
    textAlign: 'center'
  },
  placeholderContainer: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.l,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headingText: {
    ...typography.h3,
    color: colors.textMainLight,
    marginTop: spacing.l,
    marginBottom: spacing.s,
    fontWeight: 'bold',
  },
  subheadingText: {
    ...typography.h4,
    color: colors.textMainLight,
    marginTop: spacing.m,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  paragraphText: {
    ...typography.body,
    color: colors.textMutedLight,
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    paddingLeft: spacing.m,
    paddingRight: spacing.m,
  },
  bulletPoint: {
    ...typography.body,
    color: colors.textMutedLight,
    marginRight: spacing.s,
    lineHeight: 24,
  },
  bulletText: {
    ...typography.body,
    color: colors.textMutedLight,
    lineHeight: 24,
    flex: 1,
  },
  bottomSpacer: {
    height: 100,
  }
});
