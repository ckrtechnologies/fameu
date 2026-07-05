import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../../theme/theme';
import CustomInput from '../../components/forms/CustomInput';
import AuditionCard from '../../components/artist/AuditionCard';
import { useGetFeedQuery } from '../../services/discoverApi';

const CATEGORY_MAP = {
  'All': 'All',
  'Live Now': 'Live Now',
  'Acting': 'Actor',
  'Modeling': 'Model',
  'Singing': 'Singer',
  'Dancing': 'Dancer',
  'Crew': 'Technician'
};

const UI_CATEGORIES = Object.keys(CATEGORY_MAP);

export default function AuditionDiscoveryScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    project_type: 'All',
    duration_type: 'All',
    city: 'All',
    gender_req: 'All',
    age_min: '',
    age_max: '',
  });

  const [tempFilters, setTempFilters] = useState(filters);

  const PROJECT_TYPES = ['All', 'Audition', 'Casting call', 'Photo shoot', 'Shoot', 'Freelance project/assignment'];
  const DURATION_TYPES = ['All', 'Full-time', 'Part-time', 'Date Specific'];
  const CITIES = ['All', 'Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Chandigarh', 'Other'];
  const GENDERS = ['All', 'Male', 'Female', 'Other', 'Any'];

  const queryParams = { search };
  if (activeCategory === 'Live Now') {
    queryParams.is_live = true;
  } else if (activeCategory !== 'All') {
    queryParams.category = CATEGORY_MAP[activeCategory];
  }
  if (filters.project_type !== 'All') queryParams.project_type = filters.project_type;
  if (filters.duration_type !== 'All') queryParams.duration_type = filters.duration_type;
  if (filters.city !== 'All') queryParams.city = filters.city;
  if (filters.gender_req !== 'All') queryParams.gender_req = filters.gender_req;
  if (filters.age_min) queryParams.age_min = filters.age_min;
  if (filters.age_max) queryParams.age_max = filters.age_max;

  const { data: feedData, isLoading, isError, refetch } = useGetFeedQuery(queryParams);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAuditionPress = (id) => {
    navigation.navigate('AuditionDetail', { id });
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

        {isLoading ? (
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
            data={auditions}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
            }
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <AuditionCard 
                  audition={item} 
                  onPress={() => handleAuditionPress(item.id)} 
                  style={styles.fullWidthCard}
                />
              </View>
            )}
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent={true} onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Advanced Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="close" size={24} color={colors.textMainLight} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.filterSectionTitle}>Project Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptionsRow}>
                {PROJECT_TYPES.map(p => (
                  <TouchableOpacity key={p} style={[styles.filterOptionChip, tempFilters.project_type === p && styles.filterOptionChipActive]} onPress={() => setTempFilters({...tempFilters, project_type: p})}>
                    <Text style={[styles.filterOptionText, tempFilters.project_type === p && styles.filterOptionTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.filterSectionTitle}>Duration</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptionsRow}>
                {DURATION_TYPES.map(d => (
                  <TouchableOpacity key={d} style={[styles.filterOptionChip, tempFilters.duration_type === d && styles.filterOptionChipActive]} onPress={() => setTempFilters({...tempFilters, duration_type: d})}>
                    <Text style={[styles.filterOptionText, tempFilters.duration_type === d && styles.filterOptionTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.filterSectionTitle}>City</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptionsRow}>
                {CITIES.map(c => (
                  <TouchableOpacity key={c} style={[styles.filterOptionChip, tempFilters.city === c && styles.filterOptionChipActive]} onPress={() => setTempFilters({...tempFilters, city: c})}>
                    <Text style={[styles.filterOptionText, tempFilters.city === c && styles.filterOptionTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.filterSectionTitle}>Gender</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptionsRow}>
                {GENDERS.map(g => (
                  <TouchableOpacity key={g} style={[styles.filterOptionChip, tempFilters.gender_req === g && styles.filterOptionChipActive]} onPress={() => setTempFilters({...tempFilters, gender_req: g})}>
                    <Text style={[styles.filterOptionText, tempFilters.gender_req === g && styles.filterOptionTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.filterSectionTitle}>Age Range</Text>
              <View style={styles.ageRangeRow}>
                <TextInput style={styles.ageInput} placeholder="Min Age" placeholderTextColor={colors.textMutedLight} value={tempFilters.age_min} onChangeText={(val) => setTempFilters({...tempFilters, age_min: val})} keyboardType="number-pad" />
                <Text style={{ color: colors.textMainLight, marginHorizontal: spacing.m }}>to</Text>
                <TextInput style={styles.ageInput} placeholder="Max Age" placeholderTextColor={colors.textMutedLight} value={tempFilters.age_max} onChangeText={(val) => setTempFilters({...tempFilters, age_max: val})} keyboardType="number-pad" />
              </View>
            </ScrollView>

            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.clearFiltersBtn} onPress={() => {
                setFilters({ project_type: 'All', duration_type: 'All', city: 'All', gender_req: 'All', age_min: '', age_max: '' });
                setShowFilterModal(false);
              }}>
                <Text style={styles.clearFiltersText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyFiltersBtn} onPress={() => {
                setFilters(tempFilters);
                setShowFilterModal(false);
              }}>
                <Text style={styles.applyFiltersText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  cardWrapper: {
    marginBottom: spacing.l,
    alignItems: 'center',
  },
  fullWidthCard: {
    width: '100%',
    marginRight: 0,
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
    height: '80%',
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
    flex: 1,
  },
  filterSectionTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  filterOptionsRow: {
    flexDirection: 'row',
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
