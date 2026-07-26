import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { typography, spacing, globalStyles } from '../../theme/theme';
import { useGetCompanyProfileQuery } from '../../services/hiringApi';
import { useRefetchOnFocus } from '../../hooks/useRefetchOnFocus';
import { useGetMyAuditionsQuery } from '../../services/auditionApi';
import Typography from '../../components/core/Typography';
import CommentsSection from '../../components/CommentsSection';
import { useTheme } from '../../theme/ThemeProvider';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = (width - spacing.xl * 2 - (COLUMN_COUNT - 1) * spacing.xs) / COLUMN_COUNT;

export default function CompanyProfileScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  
  const { data: profileResponse, isLoading: isProfileLoading, refetch: refetchProfile } = useGetCompanyProfileQuery(user?.id);
  const { data: auditionsResponse, isLoading: isAuditionsLoading, refetch: refetchAuditions } = useGetMyAuditionsQuery();

  useRefetchOnFocus(refetchProfile);
  useRefetchOnFocus(refetchAuditions);

  const profile = profileResponse?.data;
  const auditions = auditionsResponse?.data || [];
  const stats = profile?.stats || {};

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchAuditions()]);
    setRefreshing(false);
  }, [refetchProfile, refetchAuditions]);

  if (isProfileLoading) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.logoContainer}>
          {profile?.logo_url ? (
            <Image source={{ uri: profile.logo_url }} style={styles.logoImage} />
          ) : (
            <Icon name="business-outline" size={40} color={colors.textMutedLight} />
          )}
        </View>
        
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('MyAuditions')}>
            <Typography variant="h3" style={styles.statValue}>{stats.auditions_posted || 0}</Typography>
            <Typography variant="caption" style={styles.statLabel}>Posts</Typography>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statItem} onPress={() => profile?.user_id && navigation.navigate('ConnectionList', { type: 'followers', userId: profile.user_id })}>
            <Typography variant="h3" style={styles.statValue}>{stats.followers || 0}</Typography>
            <Typography variant="caption" style={styles.statLabel}>Followers</Typography>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Applicants', { initialTab: 'hired' })}>
            <Typography variant="h3" style={styles.statValue}>{stats.hired_artists || 0}</Typography>
            <Typography variant="caption" style={styles.statLabel}>Hired</Typography>
          </TouchableOpacity>

          <View style={styles.statItem}>
            <Typography variant="h3" style={styles.statValue}>{stats.profile_visits || 0}</Typography>
            <Typography variant="caption" style={styles.statLabel}>Visits</Typography>
          </View>
        </View>
      </View>

      <View style={styles.bioContainer}>
        <Typography variant="h4" style={styles.companyName}>{profile?.company_name || 'Company Name'}</Typography>
        <Typography variant="body2" style={{ color: colors.primary, marginBottom: 4 }}>@{profile?.users?.username || user?.username}</Typography>
        <Typography variant="body2" style={styles.companyType}>{profile?.company_type || 'Company Type'}</Typography>
        {profile?.description && (
          <Typography variant="body2" style={styles.description}>{profile.description}</Typography>
        )}
      </View>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => navigation.navigate('EditCompanyProfile')}
        >
          <Typography variant="body2" style={styles.editButtonText}>Edit Profile</Typography>
        </TouchableOpacity>
      </View>
      
      <View style={styles.divider} />
    </View>
  );

  const renderHorizontalItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.horizontalItem}
      onPress={() => navigation.navigate('AuditionDetails', { auditionId: item.id })}
    >
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: (item.thumbnail_url && item.thumbnail_url !== 'null' && item.thumbnail_url.trim() !== '') ? item.thumbnail_url : ((profile?.logo_url && profile.logo_url !== 'null' && profile.logo_url.trim() !== '') ? profile.logo_url : 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=800&auto=format&fit=crop') }} 
          style={styles.thumbnailImage} 
        />
        <View style={styles.thumbnailOverlay}>
          <Typography variant="caption" style={[styles.horizontalItemText, { color: '#fff' }]} numberOfLines={2}>{item.title}</Typography>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Typography variant="h3" style={styles.categoryTitle}>{item.category}s</Typography>
        {item.total > 5 && (
          <TouchableOpacity>
            <Typography variant="body2" style={styles.seeMoreText}>See all</Typography>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={item.data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderHorizontalItem}
        contentContainerStyle={styles.horizontalListContent}
      />
    </View>
  );

  const grouped = (auditions || []).reduce((acc, curr) => {
    const cat = curr.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  const categoriesData = Object.keys(grouped).map(key => ({
    category: key.charAt(0).toUpperCase() + key.slice(1),
    data: grouped[key].slice(0, 5),
    total: grouped[key].length
  }));

  const renderFooter = () => {
    if (!profile?.id) return null;
    return (
      <View style={{ marginHorizontal: spacing.xl, marginBottom: 24, marginTop: spacing.l }}>
        <CommentsSection targetType="profile" targetId={profile.id} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={categoriesData}
        keyExtractor={(item) => item.category}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        renderItem={renderCategory}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isAuditionsLoading ? (
          <View style={styles.emptyContainer}>
            <Icon name="camera-outline" size={48} color={colors.borderLight} />
            <Typography variant="body2" style={styles.emptyText}>No posts yet</Typography>
          </View>
        ) : <ActivityIndicator style={{ marginTop: spacing.xl }} />}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: spacing.l,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: spacing.l,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: colors.textDark,
  },
  statLabel: {
    color: colors.textMainLight,
  },
  bioContainer: {
    marginBottom: spacing.l,
  },
  companyName: {
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 2,
  },
  companyType: {
    color: colors.textMuted,
    marginBottom: 4,
  },
  description: {
    color: colors.textDark,
    lineHeight: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginBottom: spacing.l,
  },
  editButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontWeight: '600',
    color: colors.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.s,
  },
  categorySection: {
    marginBottom: spacing.m,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  categoryTitle: {
    fontWeight: 'bold',
    color: colors.textDark,
  },
  seeMoreText: {
    color: colors.primary,
    fontWeight: '600',
  },
  horizontalListContent: {
    paddingRight: spacing.m,
  },
  horizontalItem: {
    width: 140,
    height: 140,
    marginRight: spacing.m,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: spacing.xs,
  },
  horizontalItemPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.s,
  },
  horizontalItemText: {
    marginTop: spacing.xs,
    textAlign: 'center',
    color: colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: spacing.s,
  }
});
