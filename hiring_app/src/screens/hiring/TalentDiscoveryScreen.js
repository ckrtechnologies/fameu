import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image, Modal, TextInput, ScrollView, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { ArrowLeft, User, Filter, X, Briefcase } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import SidebarFilterModal from '../../components/SidebarFilterModal';
import { useSearchArtistsQuery } from '../../services/discoveryApi';
import { useRefetchOnFocus } from '../../hooks/useRefetchOnFocus';
import { useGetProfessionsQuery } from '../../services/profileApi';

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

export default function TalentDiscoveryScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { data: professionsResponse } = useGetProfessionsQuery();

  const dynamicCategories = (professionsResponse?.data || []).map(p => capitalize(p.name));
  const CATEGORIES = ['All', ...(dynamicCategories.length > 0 ? dynamicCategories : ['Actor', 'Model', 'Singer', 'Dancer', 'Technician', 'Writer', 'Director'])];

  // Active Search Params State (applied on submit)
  const [searchParams, setSearchParams] = useState({});

  const currentUser = useSelector(state => state.auth.user);
  
  // Format searchParams for API with case-resilient category expansion
  const apiParams = useMemo(() => {
    const params = { ...searchParams };
    if (params.category === 'All' || (Array.isArray(params.category) && params.category.includes('All'))) {
       delete params.category;
    } else if (params.category) {
       const selectedList = Array.isArray(params.category) ? params.category : [params.category];
       const expanded = [...new Set(selectedList.flatMap(c => {
         const matchProf = (professionsResponse?.data || []).find(p => 
           p.name?.toLowerCase().trim() === c.toLowerCase().trim() ||
           p.slug?.toLowerCase().trim() === c.toLowerCase().trim()
         );
         return [
           c,
           c.toLowerCase(),
           c.toUpperCase(),
           c.charAt(0).toUpperCase() + c.slice(1).toLowerCase(),
           matchProf?.name,
           matchProf?.slug
         ].filter(Boolean);
       }))];
       params.category = expanded.join(',');
    }

    if (params.language === 'All' || (Array.isArray(params.language) && params.language.includes('All'))) {
       delete params.language;
    } else if (Array.isArray(params.language)) {
       params.language = params.language.join(',');
    }

    if (params.gender === 'All') delete params.gender;
    if (params.location === 'All Locations') delete params.location;
    return params;
  }, [searchParams, professionsResponse]);

  const { data: searchResponse, isFetching: isFetchingArtists, refetch: refetchArtists } = useSearchArtistsQuery(apiParams);
  const artists = (searchResponse?.data || []).filter(artist => artist.user_id !== currentUser?.id);

  useRefetchOnFocus(refetchArtists);

  const { data: allArtistsResponse } = useSearchArtistsQuery({});
  const dynamicLocations = useMemo(() => {
    if (!allArtistsResponse?.data) return [{ label: 'All Locations', value: '' }];
    const locs = allArtistsResponse.data.map(a => a.location).filter(Boolean);
    const unique = [...new Set(locs)].sort();
    return [{ label: 'All Locations', value: '' }, ...unique.map(l => ({ label: l, value: l }))];
  }, [allArtistsResponse]);

  const filterConfig = [
    { key: 'category', label: 'Profession', type: 'select', options: CATEGORIES, multiSelect: true },
    { key: 'language', label: 'Language', type: 'select', options: ['All', 'Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Punjabi'], multiSelect: true },
    { key: 'gender', label: 'Gender', type: 'select', options: ['All', 'Male', 'Female', 'Non-Binary', 'Other'] },
    { key: 'age', label: 'Age Range', type: 'range', minKey: 'minAge', maxKey: 'maxAge' },
    { key: 'location', label: 'Location', type: 'select', options: dynamicLocations.map(l => l.label) }
  ];

  const renderTalentCard = ({ item }) => {
    const mainImage = item.avatar_url || item.profile_image_url || ((item.photo_urls && item.photo_urls.length > 0) ? item.photo_urls[0] : null) || item.users?.avatar_url;
    
    return (
      <TouchableOpacity 
        style={styles.premiumCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PublicProfile', { username: item.username || item.user_id })}
      >
        {mainImage ? (
          <Image source={{ uri: mainImage }} style={styles.cardCoverImage} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.cardCoverImage} />
        )}
        
        <LinearGradient 
          colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']} 
          style={styles.cardGradientOverlay}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                <Typography variant="h3" style={styles.userName} numberOfLines={1}>{item.user?.name || item.full_name || 'Talent'}</Typography>
              </View>
            </View>
            {item.categories && item.categories.length > 0 && (
              <View style={styles.categoryChips}>
                <View style={styles.chip}>
                  <Typography variant="caption" style={styles.chipText} numberOfLines={1}>{capitalize(item.categories[0])}</Typography>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.searchContainer} 
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.8}
        >
          <Icon name="search-outline" size={20} color={colors.textMutedLight} style={styles.searchIcon} />
          <Typography variant="body" style={styles.searchPlaceholder}>Search talents...</Typography>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isFetchingArtists && !artists.length ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={artists}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshControl={<RefreshControl refreshing={isFetchingArtists} onRefresh={refetchArtists} tintColor={colors.primary} />}
          renderItem={renderTalentCard}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <User size={64} color={colors.borderLight} />
              <Typography variant="h4" style={styles.emptyText}>No talents found</Typography>
              <Typography variant="body" style={{ color: colors.textMutedLight, marginTop: 8 }}>
                Try adjusting your filters
              </Typography>
            </View>
          }
        />
      )}

      <SidebarFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) => setSearchParams(filters)}
        filterConfig={filterConfig}
        initialFilters={searchParams}
        defaultFilters={{ category: 'All', language: 'All', gender: 'All', location: 'All Locations' }}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundLight },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.m, paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight, backgroundColor: colors.backgroundLight
  },
  headerTitle: { flex: 1, color: colors.textMainLight },
  backButton: { padding: spacing.xs, marginRight: spacing.s },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.m,
    height: 44,
    marginRight: spacing.s,
  },
  searchIcon: {
    marginRight: spacing.s,
  },
  searchPlaceholder: {
    color: colors.textMutedLight,
  },
  filterButton: { padding: spacing.xs },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  listContainer: {
    padding: spacing.s,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  premiumCard: {
    backgroundColor: '#000',
    borderRadius: 16,
    marginBottom: spacing.m,
    marginHorizontal: spacing.xs,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
    height: 280,
    flex: 1,
    position: 'relative',
    maxWidth: '48%',
  },
  cardCoverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardGradientOverlay: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    padding: spacing.m,
  },
  cardContent: {
    width: '100%',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  userInfo: { flex: 1 },
  userName: { color: '#fff', fontWeight: '800', fontSize: 16 },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 6, marginBottom: 6 },
  chipText: { color: '#fff', fontSize: 11 },
  emptyText: { color: colors.textMainLight, marginTop: spacing.m },
});
