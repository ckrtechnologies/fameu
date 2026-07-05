import { showError, showSuccess } from '../../utils/toast';
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert , RefreshControl, Linking, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';

import { colors, typography, spacing, globalStyles } from '../../theme/theme';
import { useGetAuditionDetailsQuery, useDeleteAuditionMutation } from '../../services/auditionApi';
import SkeletonLoader from '../../components/SkeletonLoader';
import CustomButton from '../../components/forms/CustomButton';
import CommentsSection from '../../components/CommentsSection';
export default function AuditionDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { auditionId, scrollToComments } = route.params;
  const { data: response, isLoading, error , isFetching, refetch} = useGetAuditionDetailsQuery(auditionId)
  const [deleteAudition] = useDeleteAuditionMutation();
  const scrollViewRef = useRef(null);

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
    Alert.alert('Delete Audition', 'Are you sure you want to delete this audition? This action cannot be undone.', [
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

  return (
    <View style={globalStyles.container}>
      <View style={[styles.appBar, { paddingTop: Math.max(insets.top, spacing.xl) + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Audition Details</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => navigation.navigate('CreateAudition', { audition })} style={styles.actionBtn}>
            <Icon name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
            <Icon name="trash" size={20} color={colors.error || 'red'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}>
        {/* Thumbnail Section */}
        {(audition.thumbnail_url || parsedInstructions.thumbnail_url) && (
          <Image 
            source={{ uri: audition.thumbnail_url || parsedInstructions.thumbnail_url }} 
            style={{ width: '100%', height: 200, resizeMode: 'cover', borderRadius: 8, marginBottom: spacing.m }} 
          />
        )}

        {/* Title Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>{audition.title}</Text>
          <View style={[styles.statusBadge, audition.status === 'active' ? styles.statusActive : styles.statusClosed]}>
            <Text style={[styles.statusText, audition.status === 'active' ? styles.statusActiveText : styles.statusClosedText]}>
              {audition.status === 'active' ? 'Active' : 'Closed'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.postedDate}>
          Posted on {format(new Date(audition.created_at), 'MMM dd, yyyy')}
        </Text>

        <View style={styles.tagsContainer}>
          {audition.category && (
            <View style={styles.tag}>
              <Icon name="star-outline" size={14} color={colors.primary} />
              <Text style={styles.tagText}>{audition.category}</Text>
            </View>
          )}
          {audition.audition_type && (
            <View style={styles.tag}>
              <Icon name="videocam-outline" size={14} color={colors.primary} />
              <Text style={styles.tagText}>{audition.audition_type}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Role Description</Text>
          <Text style={styles.bodyText}>{audition.role_description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements & Details</Text>
          
          <View style={styles.infoRow}>
            <Icon name="male-female-outline" size={20} color={colors.textMutedLight} />
            <Text style={styles.infoText}>Gender: {parsedInstructions.gender_req || audition.gender || 'Any'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="person-outline" size={20} color={colors.textMutedLight} />
            <Text style={styles.infoText}>
              Age: {audition.age_min ? `${audition.age_min} - ${audition.age_max || '+'}` : 'Any'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="location-outline" size={20} color={colors.textMutedLight} />
            <Text style={styles.infoText}>Location: {parsedInstructions.city || audition.location || 'Remote / Any'}</Text>
          </View>
          
          {(parsedInstructions.budget || audition.compensation) && (
            <View style={styles.infoRow}>
              <Icon name="cash-outline" size={20} color={colors.textMutedLight} />
              <Text style={styles.infoText}>Compensation: {parsedInstructions.budget || audition.compensation}</Text>
            </View>
          )}

          {parsedInstructions.project_type && (
            <View style={styles.infoRow}>
              <Icon name="videocam-outline" size={20} color={colors.textMutedLight} />
              <Text style={styles.infoText}>Project Type: {parsedInstructions.project_type}</Text>
            </View>
          )}

          {parsedInstructions.duration_type && (
            <View style={styles.infoRow}>
              <Icon name="time-outline" size={20} color={colors.textMutedLight} />
              <Text style={styles.infoText}>Duration: {parsedInstructions.duration_type}</Text>
            </View>
          )}

          {parsedInstructions.duration_type === 'Date Specific' && parsedInstructions.specific_start_date && (
            <View style={styles.infoRow}>
              <Icon name="calendar-outline" size={20} color={colors.textMutedLight} />
              <Text style={styles.infoText}>Dates: {parsedInstructions.specific_start_date} to {parsedInstructions.specific_end_date}</Text>
            </View>
          )}
        </View>

        {parsedInstructions.description_pdf_url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Documents</Text>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.borderLight }} 
              onPress={() => Linking.openURL(parsedInstructions.description_pdf_url)}
            >
              <Icon name="document-text" size={24} color={colors.primary} />
              <Text style={{ marginLeft: 8, color: colors.primary, fontWeight: '600' }}>Download Brief (PDF)</Text>
            </TouchableOpacity>
          </View>
        )}

        <CommentsSection targetType="audition" targetId={auditionId} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}>
        <CustomButton 
          title={`View Applicants (${audition.applicant_count || 0})`} 
          onPress={() => navigation.navigate('ApplicantTracking', { auditionId: audition.id, auditionTitle: audition.title })} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  backBtn: {
    padding: 4,
  },
  actionBtn: {
    padding: 4,
    marginLeft: spacing.m,
  },
  appBarTitle: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.s,
  },
  title: {
    ...typography.h2,
    color: colors.textMainLight,
    flex: 1,
    marginRight: spacing.m,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: colors.success + '20',
  },
  statusClosed: {
    backgroundColor: colors.textMutedLight + '20',
  },
  statusText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  statusActiveText: {
    color: colors.success,
  },
  statusClosedText: {
    color: colors.textMutedLight,
  },
  postedDate: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginBottom: spacing.m,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xxl,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    marginBottom: spacing.m,
  },
  bodyText: {
    ...typography.body1,
    color: colors.textMainLight,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  infoText: {
    ...typography.body1,
    color: colors.textMainLight,
    marginLeft: spacing.m,
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  },
});
