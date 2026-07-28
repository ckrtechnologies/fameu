import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing, globalStyles } from '../../theme/theme';
import AuditionCard from '../../components/artist/AuditionCard';
import AuditionPeekModal from '../../components/artist/AuditionPeekModal';
import SidebarFilterModal from '../../components/SidebarFilterModal';
import CustomInput from '../../components/forms/CustomInput';
import { useGetFeedQuery } from '../../services/discoverApi';
import { useRefetchOnFocus } from '../../hooks/useRefetchOnFocus';
import { useGetProfessionsQuery } from '../../services/profileApi';

const CATEGORY_MAP = {
  'Relevant': 'Relevant',
  'Live (Today)': 'Live (Today)',
  'Trending': 'Trending',
  'Acting': 'Actor',
  'Modeling': 'Model',
  'Singing': 'Singer',
  'Dancing': 'Dancer',
  'Crew': 'Technician'
};

const UI_CATEGORIES = Object.keys(CATEGORY_MAP);

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

export default function AuditionDiscoveryScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const route = useRoute();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(route.params?.initialCategory || 'Relevant');

  useEffect(() => {
    if (route.params?.initialCategory) {
      setActiveCategory(route.params.initialCategory);
    }
  }, [route.params?.initialCategory]);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    project_type: 'All',
    duration_type: 'All',
    city: 'All',
    gender_req: 'All',
    age_min: '',
    age_max: '',
  });

  const [tempFilters, setTempFilters] = useState(filters);

  const { data: professionsResponse } = useGetProfessionsQuery();
  const dynamicCategories = (professionsResponse?.data || []).map(p => capitalize(p.name));
  const CATEGORIES = ['All', ...(dynamicCategories.length > 0 ? dynamicCategories : ['Actor', 'Model', 'Singer', 'Dancer', 'Technician', 'Writer', 'Director'])];

  const PROJECT_TYPES = ['All', 'Audition', 'Casting call', 'Photo shoot', 'Shoot', 'Freelance project/assignment'];
  const DURATION_TYPES = ['All', 'Full-time', 'Part-time', 'Date Specific'];
  const CITIES = ['All', 'Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Chandigarh', 'Other'];
  const GENDERS = ['All', 'Male', 'Female', 'Other', 'Any'];

  const queryParams = { search };
  
  if (activeCategory === 'Live (Today)') {
    queryParams.is_live = true;
  } else if (activeCategory === 'Trending') {
    queryParams.filter = 'trending';
  } else if (activeCategory === 'Relevant') {
    if (!search) {
      queryParams.filter = 'relevant';
    }
  } else if (CATEGORY_MAP[activeCategory]) {
    queryParams.category = CATEGORY_MAP[activeCategory];
  }
  
  if (filters?.category && filters.category !== 'All' && filters.category !== 'Any') {
     // override the tab category if filter modal has one selected
     if (Array.isArray(filters.category)) {
        if (!filters.category.includes('All') && !filters.category.includes('Any') && filters.category.length > 0) {
            queryParams.category = filters.category.join(',');
        }
     } else if (typeof filters.category === 'string') {
        queryParams.category = filters.category;
     }
  }

  if (filters.project_type !== 'All') queryParams.project_type = filters.project_type;
  if (filters.duration_type !== 'All') queryParams.duration_type = filters.duration_type;
  if (filters.city !== 'All') queryParams.city = filters.city;
  if (filters.gender_req !== 'All') queryParams.gender_req = filters.gender_req;
  if (filters.age_min) queryParams.age_min = filters.age_min;
  if (filters.age_max) queryParams.age_max = filters.age_max;

  const filterConfig = [
    { key: 'category', label: 'Profession', type: 'select', options: CATEGORIES, multiSelect: true },
    { key: 'project_type', label: 'Project Type', type: 'select', options: PROJECT_TYPES },
    { key: 'duration_type', label: 'Duration', type: 'select', options: DURATION_TYPES },
    { key: 'city', label: 'City', type: 'select', options: CITIES },
    { key: 'gender_req', label: 'Gender', type: 'select', options: GENDERS },
    { key: 'age', label: 'Age Range', type: 'range', minKey: 'age_min', maxKey: 'age_max' }
  ];

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

  const renderCategory = ({ item }) => (
    <TouchableOpacity 
      style={[styles.categoryChip, activeCategory === item && styles.activeCategoryChip]}
      onPress={() => setActiveCategory(item)}
    >
      <Text style={[styles.categoryText, activeCategory === item && styles.activeCategoryText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const auditions = Array.isArray(feedData?.data) ? feedData.data : [];

  const loading = isLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <CustomInput
              placeholder="Search by role, location..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => {
            setTempFilters(filters);
            setShowFilterModal(true);
          }}>
            <Icon name="filter" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesContainer}>
          <FlatList
            data={UI_CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderCategory}
            keyExtractor={item => item}
            contentContainerStyle={styles.categoriesContent}
          />
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.centerContent}>
            <Text style={{ color: colors.danger }}>Failed to load auditions.</Text>
            <TouchableOpacity onPress={refetch}>
              <Text style={{ color: colors.primary, marginTop: spacing.s }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : auditions.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={{ color: colors.textMutedLight }}>No auditions match your criteria.</Text>
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
        defaultFilters={{ category: 'All', project_type: 'All', duration_type: 'All', city: 'All', gender_req: 'All', age_min: '', age_max: '' }}
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    flex: 1,
    marginRight: spacing.m,
  },
  filterBtn: {
    padding: spacing.s,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoriesContainer: {
    marginBottom: spacing.m,
  },
  categoriesContent: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.textMutedLight + '40', // transparent border
    marginRight: spacing.s,
  },
  activeCategoryChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    ...typography.body,
    color: colors.textMainLight,
  },
  activeCategoryText: {
    color: colors.backgroundLight,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: spacing.l, // slightly less padding to maximize space
    paddingBottom: spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gridCardWrapper: {
    flex: 1,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.m,
    maxWidth: '48%', // Ensure 2 columns fit evenly
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textMainLight,
  },
  modalBody: {
    flexShrink: 1,
  },
  filterSectionTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.s,
  },
  filterOptionChip: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  filterOptionChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    ...typography.caption,
    color: colors.textMutedLight,
  },
  filterOptionTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  ageRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  ageInput: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: spacing.m,
    color: colors.textMainLight,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.m,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  clearFiltersBtn: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  clearFiltersText: {
    ...typography.body2,
    color: colors.textMutedLight,
    fontWeight: 'bold',
  },
  applyFiltersBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  applyFiltersText: {
    ...typography.body2,
    color: '#FFF',
    fontWeight: 'bold',
  },
});
