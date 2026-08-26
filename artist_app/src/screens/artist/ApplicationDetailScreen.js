import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import CustomButton from '../../components/forms/CustomButton';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';

export default function ApplicationDetailScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute();
  const navigation = useNavigation();
  const { application } = route.params || {};

  const {
    scrollY,
    onScroll,
    headerPaddingVertical,
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    headerElevation,
  } = useShrinkableHeader();

  if (!application) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textMainLight }}>Application details not available.</Text>
      </View>
    );
  }

  const audition = application.auditions || application;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()?.trim()) {
      case 'shortlisted':
      case 'accepted':
      case 'hired':
        return colors.success;
      case 'rejected':
        return colors.danger;
      case 'interview_scheduled':
        return colors.primary;
      case 'pending':
      default:
        return colors.warning;
    }
  };

  const statusColor = getStatusColor(application.status);

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ShrinkableHeader 
        title="Application Status"
        subtitle={audition.title || 'Role Details'}
        showBack={true}
        onBack={() => navigation.goBack()}
        headerPaddingVertical={headerPaddingVertical}
        headerTitleSize={headerTitleSize}
        subtitleHeight={subtitleHeight}
        subtitleOpacity={subtitleOpacity}
        headerElevation={headerElevation}
      />

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Current Status</Text>
          <Text style={[styles.statusValue, { color: statusColor }]}>
            {(application.status || 'Pending').toUpperCase()}
          </Text>
          
          {application.status === 'interview_scheduled' && (
            <View style={styles.interviewDetails}>
              <Text style={styles.interviewText}>
                <Text style={{ fontWeight: '700' }}>Date: </Text> 
                {new Date(application.interview_date).toLocaleString()}
              </Text>
              <Text style={styles.interviewText}>
                <Text style={{ fontWeight: '700' }}>Venue: </Text> 
                {application.interview_venue}
              </Text>
            </View>
          )}
        </View>

        {/* Applied Role Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Role Details</Text>
          <Text style={styles.title}>{audition.title}</Text>
          <TouchableOpacity 
            onPress={() => {
              if (audition.hiring_profiles?.users?.username) {
                navigation.navigate('PublicProfile', { username: audition.hiring_profiles.users.username });
              }
            }}
          >
            <Text style={[styles.subtitle, { color: colors.primary, textDecorationLine: 'underline' }]}>
              {audition.hiring_profiles?.company_name || 'Production House'}
            </Text>
          </TouchableOpacity>
          <CustomButton 
            title="View Full Audition" 
            onPress={() => navigation.navigate('AuditionDetail', { id: application.audition_id })}
            variant="outline"
            style={{ marginTop: spacing.m }}
          />
        </View>

        {/* Application Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Application</Text>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Applied On</Text>
            <Text style={styles.dataValue}>
              {new Date(application.created_at).toLocaleDateString()}
            </Text>
          </View>
          {application.cover_note ? (
            <View style={[styles.dataRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
              <Text style={[styles.dataLabel, { marginBottom: spacing.xs }]}>Cover Note</Text>
              <Text style={[styles.dataValue, { lineHeight: 22 }]}>{application.cover_note}</Text>
            </View>
          ) : null}
        </View>

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
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.textMutedLight + '20',
  },
  iconButton: {
    padding: spacing.s,
    width: 48,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    flex: 1,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  statusCard: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.l,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.textMutedLight + '20',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  statusLabel: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginBottom: spacing.xs,
  },
  statusValue: {
    ...typography.h1,
    marginBottom: spacing.m,
  },
  interviewDetails: {
    width: '100%',
    padding: spacing.m,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    marginTop: spacing.s,
  },
  interviewText: {
    ...typography.body,
    color: colors.textMainLight,
    marginBottom: 4,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textMainLight,
    marginBottom: spacing.m,
  },
  title: {
    ...typography.h2,
    color: colors.textMainLight,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMutedLight,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.textMutedLight + '20',
  },
  dataLabel: {
    ...typography.body,
    color: colors.textMutedLight,
  },
  dataValue: {
    ...typography.body,
    color: colors.textMainLight,
    fontWeight: '500',
  }
});
