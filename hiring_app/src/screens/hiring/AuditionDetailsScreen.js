import { GlobalAlert } from '../../components/core/GlobalAlert';
import { showError, showSuccess } from '../../utils/toast';
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Linking, ImageBackground } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';

import { typography, spacing, globalStyles } from '../../theme/theme';
import { useGetAuditionDetailsQuery, useDeleteAuditionMutation } from '../../services/auditionApi';
import SkeletonLoader from '../../components/SkeletonLoader';
import CustomButton from '../../components/forms/CustomButton';
import CommentsSection from '../../components/CommentsSection';
import { useTheme } from '../../theme/ThemeProvider';

export default function AuditionDetailsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { auditionId, scrollToComments } = route.params;
  const { data: response, isLoading, error, isFetching, refetch } = useGetAuditionDetailsQuery(auditionId);
  const [deleteAudition] = useDeleteAuditionMutation();
  const scrollViewRef = useRef(null);
  const [heroImageError, setHeroImageError] = useState(false);

  useEffect(() => {
    if (scrollToComments && !isLoading && response?.data) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  }, [scrollToComments, isLoading, response]);

  const audition = response?.data;

  let parsedInstructions = {};
  if (audition?.instructions) {
    try {
      parsedInstructions = JSON.parse(audition.instructions);
    } catch(e) {}
  }

  const handleDelete = () => {
    GlobalAlert.show('Delete Audition', 'Are you sure you want to delete this audition? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteAudition(auditionId).unwrap();
            navigation.goBack();
          } catch (err) {
            showError('', 'Failed to delete audition.');
          }
      }}
    ]);
  };

  if (isLoading) {
    return (
      <View style={[globalStyles.container, { padding: spacing.m }]}>
        <View style={[styles.appBar, { paddingTop: Math.max(insets.top, spacing.xl) + 10 }]}>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
        </View>
        <View style={{ marginTop: spacing.xxl }}>
          <SkeletonLoader width="70%" height={32} style={{ marginBottom: spacing.m }} />
          <SkeletonLoader width="40%" height={20} style={{ marginBottom: spacing.xl }} />
          <SkeletonLoader width="100%" height={120} style={{ marginBottom: spacing.xl }} />
          <SkeletonLoader width="100%" height={60} style={{ marginBottom: spacing.m }} />
          <SkeletonLoader width="100%" height={60} />
        </View>
      </View>
    );
  }

  if (error || !audition) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <Text style={typography.body1}>Failed to load audition details.</Text>
        <CustomButton variant="ghost" title="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: spacing.m }} />
      </View>
    );
  }

  const isWalkin = audition.audition_type === 'walkin';
  const initialHeroImage = audition.thumbnail_url || parsedInstructions.thumbnail_url;
  const fallbackImg = 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=800&auto=format&fit=crop';
  const heroImage = heroImageError || !initialHeroImage || initialHeroImage === 'null' || initialHeroImage.trim() === '' ? fallbackImg : initialHeroImage;

  return (
    <View style={globalStyles.container}>
      <ScrollView 
        ref={scrollViewRef} 
        contentContainerStyle={{ paddingBottom: 40 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* Hero Image */}
        <ImageBackground 
          source={{ uri: heroImage }} 
          style={styles.heroImage}
          onError={() => setHeroImageError(true)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} />
        </ImageBackground>

        {/* Content Card overlapping the image */}
        <View style={styles.contentCard}>
          {/* Title Section */}
          <View style={styles.headerSection}>
            <View style={styles.topRow}>
              <View style={styles.tagContainer}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{audition.category}</Text>
                </View>
                {isWalkin && (
                  <View style={[styles.tag, { backgroundColor: colors.warning + '20' }]}>
                    <Text style={[styles.tagText, { color: colors.warning }]}>Walk-In</Text>
                  </View>
                )}
                {parsedInstructions.project_type && (
                  <View style={[styles.tag, { backgroundColor: colors.secondary + '20' }]}>
                    <Text style={[styles.tagText, { color: colors.secondary }]}>{parsedInstructions.project_type}</Text>
                  </View>
                )}
              </View>
              <View style={[styles.statusBadge, audition.status === 'active' ? styles.statusActive : styles.statusClosed]}>
                <Text style={[styles.statusText, audition.status === 'active' ? styles.statusActiveText : styles.statusClosedText]}>
                  {audition.status === 'active' ? 'Active' : 'Closed'}
                </Text>
              </View>
            </View>

            <Text style={styles.title}>{audition.title}</Text>
            <Text style={styles.postedDate}>
              Posted on {format(new Date(audition.created_at), 'MMM dd, yyyy')}
            </Text>
          </View>

          {/* Quick Info Grid */}
          <View style={styles.quickInfoGrid}>
            <View style={styles.quickInfoCard}>
              <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '15' }]}>
                <Icon name="calendar" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{new Date(audition.audition_date).toLocaleDateString()}</Text>
              </View>
            </View>
            <View style={styles.quickInfoCard}>
              <View style={[styles.iconWrapper, { backgroundColor: colors.secondary + '15' }]}>
                <Icon name="time" size={20} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{audition.audition_time}</Text>
              </View>
            </View>
            <View style={[styles.quickInfoCard, { width: '100%' }]}>
              <View style={[styles.iconWrapper, { backgroundColor: colors.success + '15' }]}>
                <Icon name="location" size={20} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{audition.venue_address || 'TBA'}</Text>
              </View>
            </View>
          </View>

          {/* Role Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Role Description</Text>
            <Text style={styles.bodyText}>{audition.role_description || 'No description provided.'}</Text>
          </View>

          {/* Requirements & Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements & Details</Text>
            <View style={styles.detailsCard}>
              {(audition.gender || parsedInstructions.gender_req) && (
                <View style={styles.detailRow}>
                  <Icon name="male-female" size={18} color={colors.textMutedLight} style={styles.detailIcon} />
                  <Text style={styles.detailText}>Gender: <Text style={{ color: colors.textMainLight, fontWeight: '600' }}>{parsedInstructions.gender_req || audition.gender}</Text></Text>
                </View>
              )}
              
              {(audition.age_min || audition.age_max) && (
                <View style={styles.detailRow}>
                  <Icon name="person" size={18} color={colors.textMutedLight} style={styles.detailIcon} />
                  <Text style={styles.detailText}>Age: <Text style={{ color: colors.textMainLight, fontWeight: '600' }}>{audition.age_min || 0} - {audition.age_max || 'Any'}</Text></Text>
                </View>
              )}

              {(audition.city || parsedInstructions.city) && (
                <View style={styles.detailRow}>
                  <Icon name="business" size={18} color={colors.textMutedLight} style={styles.detailIcon} />
                  <Text style={styles.detailText}>City: <Text style={{ color: colors.textMainLight, fontWeight: '600' }}>{audition.city || parsedInstructions.city}</Text></Text>
                </View>
              )}
              
              {(audition.budget || audition.compensation || parsedInstructions.budget) && (
                <View style={styles.detailRow}>
                  <Icon name="cash" size={18} color={colors.textMutedLight} style={styles.detailIcon} />
                  <Text style={styles.detailText}>Compensation: <Text style={{ color: colors.textMainLight, fontWeight: '600' }}>{parsedInstructions.budget || audition.budget || audition.compensation}</Text></Text>
                </View>
              )}
              
              {(audition.duration_type || parsedInstructions.duration_type) && (
                <View style={styles.detailRow}>
                  <Icon name="hourglass" size={18} color={colors.textMutedLight} style={styles.detailIcon} />
                  <Text style={styles.detailText}>Duration: <Text style={{ color: colors.textMainLight, fontWeight: '600' }}>{audition.duration_type || parsedInstructions.duration_type}</Text></Text>
                </View>
              )}
              
              {((audition.specific_start_date || parsedInstructions.specific_start_date) && (audition.specific_end_date || parsedInstructions.specific_end_date)) && (
                <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
                  <Icon name="calendar" size={18} color={colors.textMutedLight} style={styles.detailIcon} />
                  <Text style={styles.detailText}>Dates: <Text style={{ color: colors.textMainLight, fontWeight: '600' }}>{audition.specific_start_date || parsedInstructions.specific_start_date} to {audition.specific_end_date || parsedInstructions.specific_end_date}</Text></Text>
                </View>
              )}
            </View>
          </View>

          {/* Additional Documents */}
          {parsedInstructions.description_pdf_url && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Documents</Text>
              <TouchableOpacity style={styles.pdfButton} onPress={() => Linking.openURL(parsedInstructions.description_pdf_url)}>
                <View style={[styles.iconWrapper, { backgroundColor: colors.danger + '15', marginRight: 12 }]}>
                  <Icon name="document-text" size={20} color={colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pdfButtonTitle}>Download Brief</Text>
                  <Text style={styles.pdfButtonSubtitle}>PDF Document</Text>
                </View>
                <Icon name="download-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          <CommentsSection targetType="audition" targetId={auditionId} />
        </View>
      </ScrollView>

      {/* Floating Header Buttons */}
      <View style={[styles.floatingHeader, { top: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.floatingIconButton}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate('CreateAudition', { audition })} style={[styles.floatingIconButton, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
            <Icon name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={[styles.floatingIconButton, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
            <Icon name="trash" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <CustomButton 
          title={`View Applicants (${audition.applicant_count || 0})`} 
          onPress={() => navigation.navigate('ApplicantTracking', { auditionId: audition.id, auditionTitle: audition.title })} 
        />
      </View>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  },
  heroImage: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
  },
  floatingHeader: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  floatingIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  contentCard: {
    marginTop: -30,
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    paddingTop: 32,
    minHeight: 500,
  },
  headerSection: {
    marginBottom: spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    flex: 1,
  },
  tag: {
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
    backgroundColor: colors.primary + '15',
    borderRadius: 20,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: spacing.s,
  },
  statusActive: {
    backgroundColor: colors.success + '20',
  },
  statusClosed: {
    backgroundColor: colors.textMutedLight + '20',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusActiveText: {
    color: colors.success,
  },
  statusClosedText: {
    color: colors.textMutedLight,
  },
  title: {
    ...typography.h1,
    color: colors.textMainLight,
    marginBottom: 4,
    lineHeight: 34,
  },
  postedDate: {
    ...typography.caption,
    color: colors.textMutedLight,
  },
  quickInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: spacing.xl,
  },
  quickInfoCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: spacing.m,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.body2,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    marginBottom: spacing.m,
  },
  bodyText: {
    ...typography.body,
    color: colors.textMutedLight,
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailText: {
    ...typography.body,
    color: colors.textMutedLight,
    flex: 1,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pdfButtonTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  pdfButtonSubtitle: {
    ...typography.caption,
    color: colors.textMutedLight,
  },
  footer: {
    padding: spacing.l,
    backgroundColor: colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
});
