import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Linking, ImageBackground } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import { useGetAuditionDetailsQuery, useToggleBookmarkMutation } from '../../services/discoverApi';
import CustomButton from '../../components/forms/CustomButton';
import CommentsSection from '../../components/CommentsSection';

export default function AuditionDetailScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id, scrollToComments } = route.params;

  const { data: response, isLoading, isError, refetch, isFetching } = useGetAuditionDetailsQuery(id);
  const audition = response?.data;

  let parsedInstructions = {};
  if (audition?.instructions) {
    try {
      parsedInstructions = JSON.parse(audition.instructions);
    } catch(e) {}
  }
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
      <View style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !audition) {
    return (
      <View style={[styles.safeArea, styles.center]}>
        <Text style={styles.errorText}>Failed to load audition details.</Text>
        <CustomButton title="Retry" onPress={refetch} variant="outline" style={{ marginTop: spacing.m }} />
      </View>
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
  const heroImage = audition.thumbnail_url || parsedInstructions.thumbnail_url || 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=800&auto=format&fit=crop';

  return (
    <View style={styles.safeArea}>
      <ScrollView 
        ref={scrollViewRef} 
        style={styles.container} 
        showsVerticalScrollIndicator={false} 
        refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* Hero Image */}
        <ImageBackground 
          source={{ uri: heroImage }} 
          style={styles.heroImage}
        >
          {/* Subtle gradient overlay could go here if needed */}
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} />
        </ImageBackground>

        {/* Content Card overlapping the image */}
        <View style={styles.contentCard}>
          {/* Title Section */}
          <View style={styles.headerSection}>
            <View style={styles.tagContainer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{audition.category}</Text>
              </View>
              {isWalkin && (
                <View style={[styles.tag, { backgroundColor: colors.warning + '20' }]}>
                  <Text style={[styles.tagText, { color: colors.warning }]}>Walk-In</Text>
                </View>
              )}
              {audition.project_type && (
                <View style={[styles.tag, { backgroundColor: colors.secondary + '20' }]}>
                  <Text style={[styles.tagText, { color: colors.secondary }]}>{audition.project_type}</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.title}>{audition.title}</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity 
                style={styles.companyRow}
                onPress={() => {
                  const profileParam = audition.hiring_profiles?.users?.username || audition.hiring_profiles?.user_id;
                  if (profileParam) {
                    navigation.navigate('PublicProfile', { username: profileParam });
                  }
                }}
              >
                {audition.hiring_profiles?.logo_url ? (
                  <ImageBackground 
                    source={{ uri: audition.hiring_profiles.logo_url }}
                    style={styles.companyLogo}
                    imageStyle={{ borderRadius: 16 }}
                  />
                ) : (
                  <View style={[styles.companyLogo, { backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }]}>
                    <Icon name="business" size={16} color={colors.primary} />
                  </View>
                )}
                <Text style={styles.companyName}>
                  {audition.hiring_profiles?.company_name || 'Production House'}
                </Text>
              </TouchableOpacity>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="eye-outline" size={16} color={colors.textMutedLight} />
                <Text style={{ marginLeft: 4, ...typography.caption, color: colors.textMutedLight, fontWeight: '600' }}>
                  {audition.view_count || 0}
                </Text>
              </View>
            </View>
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
              {(audition.gender || audition.gender_req || parsedInstructions.gender_req) && (
                <View style={styles.detailRow}>
                  <Icon name="male-female" size={18} color={colors.textMutedLight} style={styles.detailIcon} />
                  <Text style={styles.detailText}>Gender: <Text style={{ color: colors.textMainLight, fontWeight: '600' }}>{audition.gender_req || parsedInstructions.gender_req || audition.gender}</Text></Text>
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
                  <Text style={styles.detailText}>Compensation: <Text style={{ color: colors.textMainLight, fontWeight: '600' }}>{audition.budget || parsedInstructions.budget || audition.compensation}</Text></Text>
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
          {(audition.description_pdf_url || parsedInstructions.description_pdf_url) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Documents</Text>
              <TouchableOpacity style={styles.pdfButton} onPress={() => Linking.openURL(audition.description_pdf_url || parsedInstructions.description_pdf_url)}>
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

          <CommentsSection targetType="audition" targetId={id} />
        </View>
      </ScrollView>

      {/* Floating Header Buttons */}
      <View style={[styles.floatingHeader, { top: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.floatingIconButton}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBookmark} style={styles.floatingIconButton} disabled={isBookmarking}>
          <Icon name={audition.is_bookmarked ? "bookmark" : "bookmark-outline"} size={24} color={audition.is_bookmarked ? colors.primary : "#FFF"} />
        </TouchableOpacity>
      </View>

      {/* Sticky Bottom Action */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {audition.has_applied ? (
          <CustomButton 
            title="Application Submitted" 
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
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
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
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginBottom: spacing.m,
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
  title: {
    ...typography.h1,
    color: colors.textMainLight,
    marginBottom: spacing.m,
    lineHeight: 34,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  companyName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
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
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
  bottomBar: {
    padding: spacing.l,
    backgroundColor: colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  }
});
