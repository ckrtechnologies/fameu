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
        {/* Placeholder image for now */}
        <Image
          source={{ uri: audition.thumbnail_url || 'https://via.placeholder.com/150' }}
          style={styles.image}
        />
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
          {audition.role_title}
        </Text>
        <Text style={styles.productionName} numberOfLines={1}>
          {audition.production_name}
        </Text>
        
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>📍 {audition.location}</Text>
          <Text style={styles.detailText}>💰 {audition.compensation}</Text>
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
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    overflow: 'hidden',
    width: 260, // Fixed width for horizontal scroll
    marginRight: spacing.l,
    ...shadows.medium,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    backgroundColor: colors.textMutedLight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
