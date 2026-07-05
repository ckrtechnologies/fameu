import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator , RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../../theme/theme';
import { useGetAuditionDetailsQuery, useToggleBookmarkMutation } from '../../services/discoverApi';
import CustomButton from '../../components/forms/CustomButton';
import CommentsSection from '../../components/CommentsSection';

export default function AuditionDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id, scrollToComments } = route.params;

  const { data: response, isLoading, isError, refetch , isFetching} = useGetAuditionDetailsQuery(id)
  const audition = response?.data;
  const [toggleBookmark, { isLoading: isBookmarking }] = useToggleBookmarkMutation();
  const scrollViewRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollToComments && !isLoading && audition) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  }, [scrollToComments, isLoading, audition]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError || !audition) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]} edges={['top', 'bottom']}>
        <Text style={styles.errorText}>Failed to load audition details.</Text>
        <CustomButton title="Retry" onPress={refetch} variant="outline" style={{ marginTop: spacing.m }} />
      </SafeAreaView>
    );
  }

  const handleApply = () => {
    navigation.navigate('ApplyAudition', { auditionId: id });
  };

  const handleBookmark = async () => {
    try {
      await toggleBookmark(id).unwrap();
    } catch (err) {
      console.error('Failed to bookmark', err);
    }
  };

  const isWalkin = audition.audition_type === 'walkin';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Details</Text>
        <TouchableOpacity onPress={handleBookmark} style={styles.iconButton} disabled={isBookmarking}>
          <Icon name={audition.is_bookmarked ? "bookmark" : "bookmark-outline"} size={24} color={audition.is_bookmarked ? colors.primary : colors.textMainLight} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}>
        {/* Title Section */}
        <View style={styles.section}>
          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{audition.category}</Text>
            </View>
            {isWalkin && (
              <View style={[styles.tag, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[styles.tagText, { color: colors.warning }]}>Walk-In</Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{audition.title}</Text>
          {audition.project_type && <Text style={styles.projectTypeBadge}>{audition.project_type}</Text>}
          <Text style={styles.subtitle}>
            {audition.hiring_profiles?.company_name || 'Production House'}
          </Text>
        </View>

        {/* Quick Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Icon name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{new Date(audition.audition_date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoCol}>
            <Icon name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>{audition.audition_time}</Text>
          </View>
          <View style={styles.infoCol}>
            <Icon name="location-outline" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{audition.venue_address || 'TBA'}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Role Description</Text>
          <Text style={styles.bodyText}>{audition.role_description || 'No description provided.'}</Text>
        </View>

        {(audition.character_req || audition.age_min || audition.gender || audition.gender_req) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {(audition.gender || audition.gender_req) && <Text style={styles.bodyText}>• Gender: {audition.gender_req || audition.gender}</Text>}
            {(audition.age_min || audition.age_max) && (
              <Text style={styles.bodyText}>
                • Age: {audition.age_min || 0} - {audition.age_max || 'Any'}
              </Text>
            )}
            {audition.language && audition.language.length > 0 && (
              <Text style={styles.bodyText}>• Language: {audition.language.join(', ')}</Text>
            )}
            {audition.character_req && <Text style={styles.bodyText}>• {audition.character_req}</Text>}
          </View>
        )}

        {(audition.compensation || audition.budget || audition.duration_type || audition.city) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other Details</Text>
            {(audition.compensation || audition.budget) && <Text style={styles.bodyText}>• Compensation/Budget: {audition.budget || audition.compensation}</Text>}
            {audition.duration_type && <Text style={styles.bodyText}>• Duration Type: {audition.duration_type}</Text>}
            {audition.city && <Text style={styles.bodyText}>• City: {audition.city}</Text>}
          </View>
        )}

        {audition.instructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.bodyText}>{audition.instructions}</Text>
          </View>
        )}

        {audition.description_pdf_url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Documents</Text>
            <TouchableOpacity style={styles.pdfButton} onPress={() => Linking.openURL(audition.description_pdf_url)}>
              <Icon name="document-text" size={20} color={colors.primary} />
              <Text style={styles.pdfButtonText}>Download Brief (PDF)</Text>
            </TouchableOpacity>
          </View>
        )}

        <CommentsSection targetType="audition" targetId={id} />
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={styles.bottomBar}>
        {audition.has_applied ? (
          <CustomButton 
            title="Applied" 
            onPress={() => {}}
            style={{ width: '100%', backgroundColor: colors.success }}
            disabled={true}
          />
        ) : (
          <CustomButton 
            title="Apply Now" 
            onPress={handleApply}
            style={{ width: '100%' }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.s,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  tag: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary + '20',
    borderRadius: 100,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    ...typography.h1,
    color: colors.textMainLight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMutedLight,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.l,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.textMutedLight + '20',
    marginBottom: spacing.xl,
  },
  infoCol: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMainLight,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textMainLight,
    marginBottom: spacing.s,
  },
  bodyText: {
    ...typography.body,
    color: colors.textMainLight,
    lineHeight: 24,
    marginBottom: 4,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
  bottomBar: {
    padding: spacing.xl,
    backgroundColor: colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: colors.textMutedLight + '20',
  },
  projectTypeBadge: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: spacing.s,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pdfButtonText: {
    ...typography.body2,
    color: colors.primary,
    marginLeft: spacing.s,
    fontWeight: 'bold',
  }
});
