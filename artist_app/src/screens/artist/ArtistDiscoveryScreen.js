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
import { useSearchArtistsQuery, useSearchHiringAgenciesQuery } from '../../services/discoveryApi';
import { useGetProfessionsQuery } from '../../services/profileApi';

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

export default function ArtistDiscoveryScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState('Talents'); // 'Talents' | 'Agencies'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { data: professionsResponse } = useGetProfessionsQuery();

  const dynamicCategories = (professionsResponse?.data || []).map(p => capitalize(p.name));
  const CATEGORIES = ['All', ...(dynamicCategories.length > 0 ? dynamicCategories : ['Actor', 'Model', 'Singer', 'Dancer', 'Technician', 'Writer', 'Director'])];

  // Active Search Params State (applied on submit)
  const [searchParams, setSearchParams] = useState({});

  const currentUser = useSelector(state => state.auth.user);
  
  // Format searchParams for API
  const apiParams = useMemo(() => {
    const params = { ...searchParams };
    if (params.category === 'All' || (Array.isArray(params.category) && params.category.includes('All'))) {
       delete params.category;
    } else if (Array.isArray(params.category)) {
       params.category = params.category.join(',');
    }

    if (params.gender === 'All') delete params.gender;
    if (params.location === 'All Locations') delete params.location;
    if (params.company_type === 'All') delete params.company_type;
    if (params.verification_status === 'All') delete params.verification_status;
    return params;
  }, [searchParams]);

  const { data: searchResponse, isFetching: isFetchingArtists, refetch: refetchArtists } = useSearchArtistsQuery(apiParams, { skip: activeTab !== 'Talents' });
  const artists = (searchResponse?.data || []).filter(artist => artist.user_id !== currentUser?.id);

  const { data: agencyResponse, isFetching: isFetchingAgencies, refetch: refetchAgencies } = useSearchHiringAgenciesQuery(apiParams, { skip: activeTab !== 'Agencies' });
  const agencies = agencyResponse?.data || [];

  const { data: allArtistsResponse } = useSearchArtistsQuery({});
  const dynamicLocations = useMemo(() => {
    if (!allArtistsResponse?.data) return [{ label: 'All Locations', value: '' }];
    const locs = allArtistsResponse.data.map(a => a.location).filter(Boolean);
    const unique = [...new Set(locs)].sort();
    return [{ label: 'All Locations', value: '' }, ...unique.map(l => ({ label: l, value: l }))];
  }, [allArtistsResponse]);

  const filterConfig = activeTab === 'Talents' ? [
    { key: 'category', label: 'Profession', type: 'select', options: CATEGORIES, multiSelect: true },
    { key: 'gender', label: 'Gender', type: 'select', options: ['All', 'Male', 'Female', 'Non-Binary', 'Other'] },
    { key: 'age', label: 'Age Range', type: 'range', minKey: 'minAge', maxKey: 'maxAge' },
    { key: 'location', label: 'Location', type: 'select', options: dynamicLocations.map(l => l.label) }
  ] : [
    { key: 'company_type', label: 'Agency Type', type: 'select', options: ['All', 'Production House', 'Casting Agency', 'Ad Agency', 'Event Management', 'Record Label', 'Other'] },
    { key: 'verification_status', label: 'Verification', type: 'select', options: ['All', 'Verified Only'] }
  ];

  const renderTalentCard = ({ item }) => {
    const mainImage = item.avatar_url || ((item.photo_urls && item.photo_urls.length > 0) ? item.photo_urls[0] : null);
    
    return (
      <TouchableOpacity 
        style={styles.premiumCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PublicProfile', { username: item.user_id })}
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

  const renderAgencyCard = ({ item }) => {
    const mainImage = item.logo_url || null;
    return (
      <TouchableOpacity 
        style={styles.agencyCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PublicProfile', { username: item.user_id })}
      >
        <View style={styles.agencyCardHeader}>
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.agencyAvatar} />
          ) : (
            <View style={[styles.agencyAvatar, { backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }]}>
              <Briefcase size={24} color={colors.textMutedLight} />
            </View>
          )}
          <View style={styles.agencyInfo}>
            <Typography variant="h4" style={{ color: colors.textMainLight, fontWeight: 'bold' }}>{item.company_name}</Typography>
            <Typography variant="body2" style={{ color: colors.textMutedLight }}>{item.city || 'No Location'}</Typography>
          </View>
        </View>
        {item.description && (
          <Typography variant="body2" numberOfLines={2} style={styles.agencyDesc}>
            {item.description}
          </Typography>
        )}
      </TouchableOpacity>
    );
  };

  const isFetching = activeTab === 'Talents' ? isFetchingArtists : isFetchingAgencies;
  const listData = activeTab === 'Talents' ? artists : agencies;
  const refetch = activeTab === 'Talents' ? refetchArtists : refetchAgencies;

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
          <Typography variant="body" style={styles.searchPlaceholder}>Search {activeTab.toLowerCase()}...</Typography>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Talents' && styles.tabButtonActive]}
          onPress={() => setActiveTab('Talents')}
        >
          <Typography variant="h4" style={[styles.tabText, activeTab === 'Talents' && styles.tabTextActive]}>Talents</Typography>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Agencies' && styles.tabButtonActive]}
          onPress={() => setActiveTab('Agencies')}
        >
          <Typography variant="h4" style={[styles.tabText, activeTab === 'Agencies' && styles.tabTextActive]}>Hiring Agencies</Typography>
        </TouchableOpacity>
      </View>

      {isFetching && !listData.length ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          numColumns={activeTab === 'Talents' ? 2 : 1}
          key={activeTab} // Force re-render on tab change for numColumns
          columnWrapperStyle={activeTab === 'Talents' ? styles.row : undefined}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={activeTab === 'Talents' ? renderTalentCard : renderAgencyCard}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <User size={64} color={colors.borderLight} />
              <Typography variant="h4" style={styles.emptyText}>No {activeTab.toLowerCase()} found</Typography>
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
        defaultFilters={{ category: 'All', gender: 'All', location: 'All Locations' }}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundLight },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.m, paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight, backgroundColor: '#fff'
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
  tabsContainer: { flexDirection: 'row', paddingHorizontal: spacing.m, borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: '#fff' },
  tabButton: { flex: 1, paddingVertical: spacing.m, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabButtonActive: { borderBottomColor: colors.primary },
  tabText: { color: colors.textMutedLight },
  tabTextActive: { color: colors.primary, fontWeight: 'bold' },
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
  
  agencyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.m,
    marginBottom: spacing.m,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  agencyCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.s },
  agencyAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: spacing.m },
  agencyInfo: { flex: 1 },
  agencyDesc: { color: colors.textMainLight, marginTop: spacing.xs, lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surfaceLight, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.l, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.l },
  modalTitle: { color: colors.textMainLight },
  modalBody: { paddingBottom: spacing.xxl },
  filterSectionTitle: { color: colors.textMainLight, marginBottom: spacing.s, marginTop: spacing.m },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.borderLight },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { color: colors.textMutedLight },
  filterChipTextActive: { color: '#fff', fontWeight: 'bold' },
  ageInput: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: '#fff', paddingHorizontal: spacing.m, color: colors.textMainLight, ...typography.body },
  locationInput: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: '#fff', paddingHorizontal: spacing.m, color: colors.textMainLight, ...typography.body, marginBottom: spacing.m },
  modalFooter: { flexDirection: 'row', gap: spacing.m, paddingTop: spacing.m, borderTopWidth: 1, borderTopColor: colors.borderLight },
  clearBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight, alignItems: 'center' },
  clearBtnText: { color: colors.textMainLight, fontWeight: '600' },
  applyBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: 'bold' }
});
