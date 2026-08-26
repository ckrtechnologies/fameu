import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { differenceInDays, isToday, startOfDay, parseISO } from 'date-fns';
import { CheckCircle2, Clock, Sparkles, XCircle, Calendar } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing, shadows } from '../../theme/theme';
import ImageWithFallback from '../core/ImageWithFallback';

const AuditionCard = ({ audition, onPress, style, imageContainerStyle, compact }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  if (!audition) return null;

  const renderLiveBadge = () => {
    if (!audition.is_live) return null;

    const targetDateStr = audition.audition_date || audition.date || audition.specific_start_date || audition.start_date;
    
    if (targetDateStr) {
      try {
        const today = startOfDay(new Date());
        const targetDate = startOfDay(parseISO(targetDateStr));
        
        if (isToday(targetDate)) {
          return (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          );
        }
        
        if (targetDate > today) {
          const days = differenceInDays(targetDate, today);
          return (
            <View style={[styles.liveBadge, { backgroundColor: 'rgba(59, 130, 246, 0.8)' }]}>
               <Text style={styles.liveText}>LIVE IN {days} {days === 1 ? 'DAY' : 'DAYS'}</Text>
            </View>
          );
        }
        
        // If in the past, don't show LIVE badge
        return null;
      } catch (e) {
        // Fallback
      }
    }

    return (
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress && onPress(audition)}
      style={[styles.container, style]}
    >
      <View style={[styles.imageContainer, imageContainerStyle, compact && { height: 90 }]}>
        <ImageWithFallback
          source={{ uri: audition.thumbnail_url }}
          fallbackSource={{ uri: audition.hiring_profiles?.logo_url }}
          style={styles.image}
        />
        {audition.is_urgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>URGENT</Text>
          </View>
        )}
        {renderLiveBadge()}
        
        {/* View Count Badge */}
        <View style={styles.viewsBadge}>
          <Text style={styles.viewsText}>👁 {audition.view_count || 0}</Text>
        </View>

        {/* Mode Badge (Online vs In-Person) */}
        {(audition.mode || audition.audition_type) && (
          <View style={[
            styles.modeBadge,
            String(audition.mode || audition.audition_type).toLowerCase().includes('online') ? styles.onlineBadge : styles.offlineBadge
          ]}>
            <Text style={styles.modeBadgeText}>
              {String(audition.mode || audition.audition_type).toLowerCase().includes('online') ? '🌐 Online' : '📍 In-Person'}
            </Text>
          </View>
        )}
      </View>
      
      <View style={[styles.content, compact && { padding: 8 }]}>
        <Text style={[styles.roleTitle, compact && { fontSize: 14 }]} numberOfLines={2}>
          {audition.title || 'Untitled Audition'}
        </Text>
        <Text style={styles.productionName} numberOfLines={1}>
          {audition.hiring_profiles?.company_name || 'Production House'}
        </Text>
        
        <View style={[styles.detailsRow, compact && { flexDirection: 'column', alignItems: 'flex-start' }]}>
          <Text numberOfLines={1} style={[styles.detailText, compact ? { marginBottom: 2, fontSize: 11 } : { flex: 1, marginRight: 8 }]}>
            📍 {audition.city && audition.venue_address && !audition.venue_address.toLowerCase().includes(audition.city.toLowerCase())
                ? `${audition.city} • ${audition.venue_address}`
                : (audition.venue_address || audition.city || 'TBA')}
          </Text>
          <Text style={[styles.detailText, compact && { fontSize: 11 }, audition.compensation && !audition.compensation.toLowerCase().includes('unpaid') && { color: colors.primary, fontWeight: '700' }]} numberOfLines={1}>💰 {audition.compensation || 'Unpaid / TFP'}</Text>
        </View>

        {/* Optional status pill if used in Applications view */}
        {audition.status && (() => {
          const s = String(audition.status).toLowerCase().trim();
          let bg = '#FEF3C7';
          let borderColor = '#FDE68A';
          let textColor = '#B45309';
          let label = 'In Review';
          let IconComponent = Clock;

          if (s === 'hired') {
            bg = '#DCFCE7';
            borderColor = '#BBF7D0';
            textColor = '#15803D';
            label = 'Hired';
            IconComponent = CheckCircle2;
          } else if (s === 'shortlisted' || s === 'accepted') {
            bg = '#DBEAFE';
            borderColor = '#BFDBFE';
            textColor = '#1D4ED8';
            label = 'Shortlisted';
            IconComponent = Sparkles;
          } else if (s === 'interview_scheduled') {
            bg = '#E0E7FF';
            borderColor = '#C7D2FE';
            textColor = '#4338CA';
            label = 'Interview Scheduled';
            IconComponent = Calendar;
          } else if (s === 'rejected') {
            bg = '#FEE2E2';
            borderColor = '#FECACA';
            textColor = '#B91C1C';
            label = 'Not Selected';
            IconComponent = XCircle;
          }

          return (
            <View style={[styles.statusBadge, { backgroundColor: bg, borderColor, borderWidth: 1 }]}>
              <IconComponent size={13} color={textColor} strokeWidth={2.5} style={{ marginRight: 5 }} />
              <Text style={[styles.statusText, { color: textColor }]}>
                {label}
              </Text>
            </View>
          );
        })()}
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    width: 220, // Reduced from 260
    marginRight: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  imageContainer: {
    height: 100, // Reduced from 120
    width: '100%',
    backgroundColor: colors.surfaceLight,
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
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
  viewsBadge: {
    position: 'absolute',
    bottom: spacing.s,
    right: spacing.s,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewsText: {
    ...typography.caption,
    color: colors.backgroundLight,
    fontWeight: '700',
    fontSize: 11,
  },
  modeBadge: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  onlineBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  offlineBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  modeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  content: {
    padding: spacing.xs,
    flex: 1,
    justifyContent: 'space-between',
  },
  roleTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    marginBottom: 2,
  },
  productionName: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginBottom: 4,
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
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
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

export default React.memo(AuditionCard);
