import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import AuditionCard from '../../components/artist/AuditionCard';
import AuditionPeekModal from '../../components/artist/AuditionPeekModal';
import SidebarFilterModal from '../../components/SidebarFilterModal';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import ImageWithFallback from '../../components/core/ImageWithFallback';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';
import { useGetFeedQuery } from '../../services/discoverApi';
import { useRefetchOnFocus } from '../../hooks/useRefetchOnFocus';
import { useGetProfessionsQuery, useGetProfileQuery } from '../../services/profileApi';
import {
  CATEGORY_MAP,
  UI_CATEGORIES,
  QUICK_FILTER_CAPSULES,
  DEFAULT_FILTERS,
  COMPANY_TYPES_WITH_ALL,
  SORT_OPTIONS,
  COMPENSATION_OPTIONS,
  AUDITION_MODES_WITH_ALL,
  PROJECT_TYPES_WITH_ALL,
  DURATION_TYPES_WITH_ALL,
  TOP_CITIES_WITH_ALL,
  ALL_CITIES_WITH_ALL,
  GENDERS_WITH_ALL,
} from '../../constants/masterData';
import { SEARCH_PLACEHOLDERS } from '../../constants/formPlaceholders';

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '');

export default function AuditionDiscoveryScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useSelector((state) => state.auth);
  const { data: userProfileData } = useGetProfileQuery();
  const artistProfile = userProfileData?.data?.profile || userProfileData?.profile || {};

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(route.params?.initialCategory || 'All');

  useEffect(() => {
    if (route.params?.initialCategory) {
      setActiveCategory(route.params.initialCategory);
    }
  }, [route.params?.initialCategory]);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [tempFilters, setTempFilters] = useState(DEFAULT_FILTERS);

  const { data: professionsResponse } = useGetProfessionsQuery();
  const dynamicCategories = (professionsResponse?.data || []).map(p => capitalize(p.name));
  const CATEGORIES = ['All', ...(dynamicCategories.length > 0 ? dynamicCategories : ['Actor', 'Model', 'Singer', 'Dancer', 'Technician', 'Writer', 'Director'])];

  // Construct Query Params for API
  const queryParams = { search };

  // 1. Top Category Tabs
  if (activeCategory === 'Live' || activeCategory === 'Live (Today)') {
    queryParams.is_live = true;
  } else if (activeCategory === 'Recommended' || activeCategory === '✨ Matches Profile') {
    queryParams.filter = 'recommended';
    if (artistProfile.categories && artistProfile.categories.length > 0) {
      queryParams.category = artistProfile.categories.join(',');
    }
    if (artistProfile.gender) {
      queryParams.gender_req = artistProfile.gender;
    }
    if (artistProfile.city || user?.city) {
      queryParams.city = artistProfile.city || user?.city;
    }
  } else if (activeCategory === 'Trending') {
    queryParams.filter = 'trending';
  } else if (activeCategory === 'All') {
    // Show all casting opportunities
  } else if (CATEGORY_MAP[activeCategory]) {
    queryParams.category = CATEGORY_MAP[activeCategory];
  }
  
  // 2. Filter Modal Overrides
  if (filters?.category && filters.category !== 'All' && filters.category !== 'Any') {
    const selectedList = Array.isArray(filters.category) ? filters.category : [filters.category];
    const validSelected = selectedList.filter(c => c && c !== 'All' && c !== 'Any');
    if (validSelected.length > 0) {
      queryParams.category = validSelected.join(',');
    }
  }

  if (filters.company_type && filters.company_type !== 'All') {
    queryParams.company_type = Array.isArray(filters.company_type) ? filters.company_type.join(',') : filters.company_type;
  }
  if (filters.project_type && filters.project_type !== 'All') queryParams.project_type = filters.project_type;
  if (filters.mode && filters.mode !== 'All') queryParams.mode = filters.mode;
  if (filters.duration_type && filters.duration_type !== 'All') queryParams.duration_type = filters.duration_type;
  if (filters.city && filters.city !== 'All') queryParams.city = filters.city;
  if (filters.gender_req && filters.gender_req !== 'All') queryParams.gender_req = filters.gender_req;
  
  // Compensation filter fix
  if (filters.min_budget && filters.min_budget !== 'All') {
    if (filters.min_budget === 'Paid Only') {
      queryParams.is_paid = true;
    } else {
      const parsedNum = filters.min_budget.replace(/[^\d]/g, '');
      if (parsedNum) {
        queryParams.min_budget = parsedNum;
        queryParams.is_paid = true;
      }
    }
  }
  if (filters.is_paid === 'Paid Only') {
    queryParams.is_paid = true;
  }

  if (filters.sort_by) {
    if (filters.sort_by === 'Expiring Soon') queryParams.sort_by = 'expiring_soon';
    else if (filters.sort_by === 'Popular') queryParams.sort_by = 'popular';
    else if (filters.sort_by === 'Highest Budget') queryParams.sort_by = 'budget_high';
    else queryParams.sort_by = 'recent';
  }

  if (filters.age_min) queryParams.age_min = filters.age_min;
  if (filters.age_max) queryParams.age_max = filters.age_max;

  const filterConfig = [
    { key: 'sort_by', label: 'Sort By', type: 'select', options: SORT_OPTIONS },
    { key: 'company_type', label: 'Company Type', type: 'select', options: COMPANY_TYPES_WITH_ALL, multiSelect: true },
    { key: 'min_budget', label: 'Compensation', type: 'select', options: COMPENSATION_OPTIONS },
    { key: 'mode', label: 'Audition Mode', type: 'select', options: AUDITION_MODES_WITH_ALL },
    { key: 'category', label: 'Profession', type: 'select', options: CATEGORIES, multiSelect: true },
    { key: 'project_type', label: 'Project Type', type: 'select', options: PROJECT_TYPES_WITH_ALL },
    { key: 'city', label: 'City', type: 'select', options: ALL_CITIES_WITH_ALL },
    { key: 'duration_type', label: 'Duration', type: 'select', options: DURATION_TYPES_WITH_ALL },
    { key: 'gender_req', label: 'Gender', type: 'select', options: GENDERS_WITH_ALL },
    { key: 'age', label: 'Age Range', type: 'range', minKey: 'age_min', maxKey: 'age_max' }
  ];

  // Active Filter Pills Calculation
  const getActiveFilterPills = () => {
    const pills = [];
    if (filters.sort_by && filters.sort_by !== 'Recent') {
      pills.push({ key: 'sort_by', label: `Sort: ${filters.sort_by}`, onRemove: () => setFilters(p => ({ ...p, sort_by: 'Recent' })) });
    }
    if (filters.min_budget && filters.min_budget !== 'All') {
      pills.push({ key: 'min_budget', label: `💰 ${filters.min_budget}`, onRemove: () => setFilters(p => ({ ...p, min_budget: '' })) });
    }
    if (filters.mode && filters.mode !== 'All') {
      pills.push({ key: 'mode', label: `🎬 ${filters.mode}`, onRemove: () => setFilters(p => ({ ...p, mode: 'All' })) });
    }
    if (filters.category && filters.category !== 'All' && filters.category !== 'Any') {
      const catText = Array.isArray(filters.category) ? filters.category.join(', ') : filters.category;
      pills.push({ key: 'category', label: `🎭 ${catText}`, onRemove: () => setFilters(p => ({ ...p, category: 'All' })) });
    }
    if (filters.project_type && filters.project_type !== 'All') {
      pills.push({ key: 'project_type', label: filters.project_type, onRemove: () => setFilters(p => ({ ...p, project_type: 'All' })) });
    }
    if (filters.city && filters.city !== 'All') {
      pills.push({ key: 'city', label: `📍 ${filters.city}`, onRemove: () => setFilters(p => ({ ...p, city: 'All' })) });
    }
    if (filters.duration_type && filters.duration_type !== 'All') {
      pills.push({ key: 'duration_type', label: filters.duration_type, onRemove: () => setFilters(p => ({ ...p, duration_type: 'All' })) });
    }
    if (filters.company_type && filters.company_type !== 'All') {
      const compText = Array.isArray(filters.company_type) ? filters.company_type.join(', ') : filters.company_type;
      pills.push({ key: 'company_type', label: `🏢 ${compText}`, onRemove: () => setFilters(p => ({ ...p, company_type: 'All' })) });
    }
    if (filters.gender_req && filters.gender_req !== 'All') {
      pills.push({ key: 'gender_req', label: `Gender: ${filters.gender_req}`, onRemove: () => setFilters(p => ({ ...p, gender_req: 'All' })) });
    }
    if (filters.age_min || filters.age_max) {
      pills.push({ key: 'age', label: `Age: ${filters.age_min || 0} - ${filters.age_max || '100+'}`, onRemove: () => setFilters(p => ({ ...p, age_min: '', age_max: '' })) });
    }
    return pills;
  };

  const activePills = getActiveFilterPills();
  const activeFiltersCount = activePills.length;

  const { data: feedData, isLoading, isError, refetch } = useGetFeedQuery(queryParams);
  
  // Peek Modal State
  const [peekVisible, setPeekVisible] = useState(false);
  const [peekAuditions, setPeekAuditions] = useState([]);
  const [peekIndex, setPeekIndex] = useState(0);

  useRefetchOnFocus(refetch);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewAuditionDetails = (auditionOrId) => {
    const id = typeof auditionOrId === 'object' && auditionOrId !== null ? auditionOrId.id : auditionOrId;
    navigation.navigate('AuditionDetail', { id });
  };

  const handleAuditionPress = (item, list = []) => {
    if (list && list.length > 0) {
      const index = list.findIndex(a => a.id === item.id);
      setPeekAuditions(list);
      setPeekIndex(index !== -1 ? index : 0);
      setPeekVisible(true);
    } else {
      handleViewAuditionDetails(item);
    }
  };

  const getCategoryLabel = (cat) => {
    if (cat === 'Live') return '🔴 Live';
    if (cat === 'Recommended') return '⭐ Recommended';
    return cat;
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity 
      style={[styles.categoryChip, activeCategory === item && styles.activeCategoryChip]}
      onPress={() => setActiveCategory(item)}
      activeOpacity={0.75}
    >
      <Text style={[styles.categoryText, activeCategory === item && styles.activeCategoryText]}>
        {getCategoryLabel(item)}
      </Text>
    </TouchableOpacity>
  );

  const {
    onScroll,
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    headerElevation,
  } = useShrinkableHeader();

  const auditions = useMemo(() => {
    let list = Array.isArray(feedData?.data) ? feedData.data : [];
    if (filters.company_type && filters.company_type !== 'All') {
      const selectedTypes = Array.isArray(filters.company_type) ? filters.company_type : [filters.company_type];
      const normalizedTargets = selectedTypes.map(t => String(t).toLowerCase().replace(/[-_\s]/g, ''));
      list = list.filter(item => {
        const cType = String(item.hiring_profiles?.company_type || '').toLowerCase().replace(/[-_\s]/g, '');
        return normalizedTargets.some(target => cType === target || cType.includes(target) || target.includes(cType));
      });
    }
    return list;
  }, [feedData?.data, filters.company_type]);
  const loading = isLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ShrinkableHeader 
          title="Auditions"
          subtitle={`${auditions.length} active casting opportunities`}
          showMenu={true}
          onMenuPress={() => navigation.openDrawer()}
          headerTitleSize={headerTitleSize}
          subtitleHeight={subtitleHeight}
          subtitleOpacity={subtitleOpacity}
          headerElevation={headerElevation}
          rightActions={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                style={[
                  styles.filterBtn, 
                  { 
                    backgroundColor: activeFiltersCount > 0 ? 'rgba(227, 176, 75, 0.16)' : 'rgba(227, 176, 75, 0.08)', 
                    borderColor: activeFiltersCount > 0 ? '#E3B04B' : 'rgba(227, 176, 75, 0.3)',
                    marginRight: 10,
                  }
                ]} 
                onPress={() => {
                  setTempFilters(filters);
                  setShowFilterModal(true);
                }}
                activeOpacity={0.8}
              >
                <Icon name="options-outline" size={19} color="#E3B04B" />
                {activeFiltersCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigation.openDrawer()} 
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View style={styles.topRightAvatar}>
                  {user?.avatar_url ? (
                    <ImageWithFallback source={{ uri: user.avatar_url }} style={styles.fullImage} />
                  ) : (
                    <Text style={styles.avatarInitial}>{user?.full_name?.charAt(0)?.toUpperCase() || 'A'}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          }
          bottomComponent={
            <View style={{ marginTop: 4, marginBottom: 2 }}>
              {/* Search input */}
              <View style={[styles.compactSearchRow, { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(227, 176, 75, 0.3)' }]}>
                <Icon name="search" size={16} color="#E3B04B" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder={SEARCH_PLACEHOLDERS.AUDITIONS}
                  placeholderTextColor="#9CA3AF"
                  value={search}
                  onChangeText={setSearch}
                  style={[styles.compactSearchInput, { color: '#FFFFFF' }]}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Icon name="close-circle" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Horizontal Category Chips */}
              <FlatList
                data={QUICK_FILTER_CAPSULES}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={renderCategory}
                keyExtractor={item => item}
                contentContainerStyle={{ paddingVertical: 4 }}
              />

              {/* Active Filter Pills Bar */}
              {activePills.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={styles.activePillsContainer}
                >
                  {activePills.map((pill) => (
                    <View key={pill.key} style={styles.activePill}>
                      <Text style={styles.activePillText} numberOfLines={1}>{pill.label}</Text>
                      <TouchableOpacity onPress={pill.onRemove} style={styles.pillRemoveBtn}>
                        <Icon name="close" size={13} color="#1A1200" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity 
                    onPress={() => setFilters(DEFAULT_FILTERS)} 
                    style={styles.clearAllPill}
                  >
                    <Text style={styles.clearAllPillText}>Reset All</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          }
        />

        <View style={styles.container}>
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.centerContent}>
            <Text style={{ color: colors.danger, fontWeight: '600' }}>Failed to load auditions.</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : auditions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="search-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Matching Auditions</Text>
            <Text style={styles.emptySubtitle}>
              We couldn't find any casting calls with your current search or active filters.
            </Text>
            <View style={styles.emptyActionsRow}>
              {activeFiltersCount > 0 && (
                <TouchableOpacity 
                  style={styles.emptyPrimaryBtn}
                  onPress={() => setFilters(DEFAULT_FILTERS)}
                >
                  <Text style={styles.emptyPrimaryBtnText}>Clear All Filters</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.emptySecondaryBtn}
                onPress={() => {
                  setActiveCategory('Relevant');
                  setSearch('');
                  setFilters(DEFAULT_FILTERS);
                }}
              >
                <Text style={styles.emptySecondaryBtnText}>View All Auditions</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            key={'grid_2_cols'}
            data={auditions}
            numColumns={2}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            onScroll={onScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
            }
            renderItem={({ item }) => (
              <View style={styles.gridCardWrapper}>
                <AuditionCard 
                  audition={item} 
                  onPress={() => handleAuditionPress(item, auditions)} 
                  style={styles.gridCard}
                  compact
                />
              </View>
            )}
          />
        )}
      </View>

      {/* Filter Modal */}
      <SidebarFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(newFilters) => setFilters(newFilters)}
        filterConfig={filterConfig}
        initialFilters={filters}
        defaultFilters={DEFAULT_FILTERS}
      />

      <AuditionPeekModal
        visible={peekVisible}
        auditions={peekAuditions}
        initialIndex={peekIndex}
        onClose={() => setPeekVisible(false)}
        onViewDetails={(item) => {
          setPeekVisible(false);
          handleViewAuditionDetails(item);
        }}
      />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  container: {
    flex: 1,
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  compactSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  compactSearchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    height: '100%',
  },
  categoryChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(227, 176, 75, 0.25)',
    marginRight: 6,
  },
  activeCategoryChip: {
    backgroundColor: '#E3B04B',
    borderColor: '#E3B04B',
  },
  categoryText: {
    fontSize: 13.5,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#1A1200',
    fontWeight: '800',
  },
  activePillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    gap: 6,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activePillText: {
    color: '#1A1200',
    fontSize: 11.5,
    fontWeight: '800',
    marginRight: 4,
  },
  pillRemoveBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(26, 18, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearAllPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  clearAllPillText: {
    color: colors.textMutedLight,
    fontSize: 11.5,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xxl,
    paddingTop: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gridCardWrapper: {
    flex: 1,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.m,
    maxWidth: '48.5%',
  },
  gridCard: {
    width: '100%',
    marginRight: 0,
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  retryBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body2,
    color: colors.textMutedLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  emptyPrimaryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyPrimaryBtnText: {
    color: '#1A1200',
    fontSize: 13,
    fontWeight: '800',
  },
  emptySecondaryBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptySecondaryBtnText: {
    color: colors.textMainLight,
    fontSize: 13,
    fontWeight: '600',
  },
  topRightAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E3B04B',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: '#1A1200',
    fontSize: 14,
    fontWeight: '800',
  },
});
