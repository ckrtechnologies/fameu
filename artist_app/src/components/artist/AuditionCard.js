import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme/theme';

const AuditionCard = ({ audition, onPress, style }) => {
  if (!audition) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <View style={styles.imageContainer}>
        {audition.thumbnail_url || audition.hiring_profiles?.logo_url ? (
          <Image
            source={{ uri: audition.thumbnail_url || audition.hiring_profiles.logo_url }}
            style={styles.image}
          />
        ) : (
          <View style={styles.categoryPlaceholder}>
            <Text style={styles.categoryText}>{audition.category || 'Audition'}</Text>
          </View>
        )}
        {audition.is_urgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>URGENT</Text>
          </View>
        )}
        {audition.is_live && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.roleTitle} numberOfLines={1}>
          {audition.title || 'Untitled Audition'}
        </Text>
        <Text style={styles.productionName} numberOfLines={1}>
          {audition.hiring_profiles?.company_name || 'Production House'}
        </Text>
        
        <View style={styles.detailsRow}>
          <Text numberOfLines={1} style={[styles.detailText, {flex: 1, marginRight: 8}]}>📍 {audition.venue_address || audition.city || 'TBA'}</Text>
          <Text style={styles.detailText} numberOfLines={1}>💰 {audition.compensation || 'Unpaid / TFP'}</Text>
        </View>

        {/* Optional status pill if used in Applications view */}
        {audition.status && (
          <View style={[
            styles.statusBadge, 
            audition.status === 'Accepted' ? styles.statusAccepted : 
            audition.status === 'Rejected' ? styles.statusRejected : styles.statusPending
          ]}>
            <Text style={[
              styles.statusText,
              audition.status === 'Accepted' ? styles.textAccepted : 
              audition.status === 'Rejected' ? styles.textRejected : styles.textPending
            ]}>
              {audition.status}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: 260, // Fixed width for horizontal scroll
    marginRight: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    backgroundColor: colors.surfaceLight,
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary + '20', // Light primary color
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  urgentBadge: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    ...typography.caption,
    color: colors.backgroundLight,
    fontWeight: '800',
  },
  liveBadge: {
    position: 'absolute',
    top: spacing.s,
    left: spacing.s,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444', // red-500
    marginRight: 4,
  },
  liveText: {
    ...typography.caption,
    color: colors.backgroundLight,
    fontWeight: '800',
    fontSize: 10,
  },
  content: {
    padding: spacing.m,
  },
  roleTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    marginBottom: 4,
  },
  productionName: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginBottom: spacing.s,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  detailText: {
    ...typography.caption,
    color: colors.textMainLight,
    fontWeight: '600',
  },
  statusBadge: {
    marginTop: spacing.m,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  statusPending: {
    backgroundColor: '#FEF3C7', // amber-100
  },
  statusAccepted: {
    backgroundColor: '#D1FAE5', // emerald-100
  },
  statusRejected: {
    backgroundColor: '#FEE2E2', // red-100
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  textPending: {
    color: '#D97706', // amber-600
  },
  textAccepted: {
    color: '#059669', // emerald-600
  },
  textRejected: {
    color: '#DC2626', // red-600
  },
});

export default AuditionCard;
