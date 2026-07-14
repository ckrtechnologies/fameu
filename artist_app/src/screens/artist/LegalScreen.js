import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { colors, typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import { LEGAL_TEXT } from '../../constants/LegalText';

export default function LegalScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { type } = route.params || { type: 'terms' };
  
  const isTerms = type === 'terms';
  const title = isTerms ? 'Terms of Service' : 'Privacy Policy';

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
          <Text style={styles.placeholderText}>
            {LEGAL_TEXT}
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#fff',
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
  placeholderText: {
    ...typography.body,
    color: colors.textSecondaryLight,
    lineHeight: 24,
  },
  bottomSpacer: {
    height: 100,
  }
});
