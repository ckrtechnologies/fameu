import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image, Modal, TextInput, ScrollView, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AppIcon from '../../components/icons';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import { User, Filter } from 'lucide-react-native';

import { typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import SidebarFilterModal from '../../components/SidebarFilterModal';
import { useSearchArtistsQuery } from '../../services/discoveryApi';
import { useRefetchOnFocus } from '../../hooks/useRefetchOnFocus';
import { useGetProfessionsQuery } from '../../services/profileApi';
import { useTheme } from '../../theme/ThemeProvider';



const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

export default function FindTalentScreen() {
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
    
    if (params.gender === 'All' || (Array.isArray(params.gender) && params.gender.includes('All'))) delete params.gender;
    else if (Array.isArray(params.gender)) params.gender = params.gender.join(',');
    
    if (params.location === 'All Locations' || (Array.isArray(params.location) && params.location.includes('All Locations'))) delete params.location;
    else if (Array.isArray(params.location)) params.location = params.location.join(',');
    
    if (params.language === 'All Languages' || (Array.isArray(params.language) && params.language.includes('All Languages'))) delete params.language;
    else if (Array.isArray(params.language)) params.language = params.language.join(',');
    return params;
  }, [searchParams, professionsResponse]);

  const { data: searchResponse, isFetching, refetch } = useSearchArtistsQuery(apiParams);
  useRefetchOnFocus(refetch);
  const artists = searchResponse?.data || [];

  const { data: allArtistsResponse } = useSearchArtistsQuery({});
  const dynamicLocations = useMemo(() => {
    if (!allArtistsResponse?.data) return [{ label: 'All Locations', value: '' }];
    const locs = allArtistsResponse.data.map(a => a.location).filter(Boolean);
    const unique = [...new Set(locs)].sort();
    return [{ label: 'All Locations', value: '' }, ...unique.map(l => ({ label: l, value: l }))];
  }, [allArtistsResponse]);
  
  const LANGUAGES = [
    'All Languages', 'English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 
    'Malayalam', 'Kannada', 'Bengali', 'Punjabi', 'Gujarati', 'Odia', 'Bhojpuri', 'Urdu', 'Assamese'
  ];

  const filterConfig = [
    { key: 'category', label: 'Profession', type: 'select', options: CATEGORIES, multiSelect: true },
    { key: 'gender', label: 'Gender', type: 'select', options: ['All', 'Male', 'Female', 'Non-Binary', 'Other'], multiSelect: true },
    { key: 'age', label: 'Age Range', type: 'range', minKey: 'minAge', maxKey: 'maxAge' },
    { key: 'location', label: 'Location', type: 'select', options: dynamicLocations.map(l => l.label), multiSelect: true },
    { key: 'language', label: 'Language', type: 'select', options: LANGUAGES, multiSelect: true }
  ];

  const renderTalentCard = ({ item }) => {
    const mainImage = item.avatar_url || item.profile_image_url || ((item.photo_urls && item.photo_urls.length > 0) ? item.photo_urls[0] : null) || item.users?.avatar_url;
    
    return (
      <TouchableOpacity 
        style={styles.premiumCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ArtistProfileScreen', { id: item.id })}
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
                <Typography variant="h3" style={styles.userName} numberOfLines={1}>{item.full_name || 'Talent'}</Typography>
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

  const searchBarComponent = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.m, paddingBottom: 6 }}>
      <TouchableOpacity 
        style={[styles.searchContainer, { flex: 1, marginHorizontal: 0 }]} 
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.8}
      >
        <AppIcon name="search-outline" size={20} color={colors.textSecondaryLight} style={styles.searchIcon} />
        <Typography variant="body" style={styles.searchPlaceholder}>Search username/handle...</Typography>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
        <Filter size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ShrinkableHeader
        title="Find Talent"
        showBack={true}
        bottomComponent={searchBarComponent}
      />

      {isFetching && !artists.length ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={artists}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={renderTalentCard}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <User size={64} color={colors.borderLight} />
              <Typography variant="h4" style={styles.emptyText}>No talents found</Typography>
              <Typography variant="body" style={{ color: colors.textSecondaryLight, marginTop: 8 }}>
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
        defaultFilters={{ category: 'All', gender: 'All', location: 'All Locations', language: 'All Languages' }}
      />

    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundLight },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.m, paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight, backgroundColor: colors.surfaceLight
  },
  backButton: { padding: spacing.xs, marginRight: spacing.s },
  headerTitle: { flex: 1, color: colors.textMainLight },
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
    color: colors.textSecondaryLight,
  },
  filterButton: { padding: spacing.xs },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.l },
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
    height: 180,
    flex: 1,
    position: 'relative',
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
    padding: spacing.xs,
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surfaceLight, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.l, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.l },
  modalTitle: { color: colors.textMainLight },
  modalBody: { paddingBottom: spacing.xxl },
  filterSectionTitle: { color: colors.textMainLight, marginBottom: spacing.s, marginTop: spacing.m },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.borderLight },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { color: colors.textSecondaryLight },
  filterChipTextActive: { color: '#fff', fontWeight: 'bold' },
  ageInput: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.surfaceLight, paddingHorizontal: spacing.m, color: colors.textMainLight, ...typography.body },
  locationInput: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.surfaceLight, paddingHorizontal: spacing.m, color: colors.textMainLight, ...typography.body, marginBottom: spacing.m },
  modalFooter: { flexDirection: 'row', gap: spacing.m, paddingTop: spacing.m, borderTopWidth: 1, borderTopColor: colors.borderLight },
  clearBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight, alignItems: 'center' },
  clearBtnText: { color: colors.textMainLight, fontWeight: '600' },
  applyBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: 'bold' }
});
