import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image, Modal, TextInput, ScrollView, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { ArrowLeft, User, Filter, X } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import CustomDropdown from '../../components/forms/CustomDropdown';
import { useSearchArtistsQuery } from '../../services/discoveryApi';
import { useGetProfessionsQuery } from '../../services/profileApi';



const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

export default function ArtistDiscoveryScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { data: professionsResponse } = useGetProfessionsQuery();

  const dynamicCategories = (professionsResponse?.data || []).map(p => capitalize(p.name));
  const CATEGORIES = ['All', ...(dynamicCategories.length > 0 ? dynamicCategories : ['Actor', 'Model', 'Singer', 'Dancer', 'Technician', 'Writer', 'Director'])];

  // Filters State
  const [filterCategories, setFilterCategories] = useState([]);
  const [filterGender, setFilterGender] = useState('All');
  const [filterMinAge, setFilterMinAge] = useState('');
  const [filterMaxAge, setFilterMaxAge] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // Active Search Params State (applied on submit)
  const [searchParams, setSearchParams] = useState({});

  const currentUser = useSelector(state => state.auth.user);
  const { data: searchResponse, isFetching, refetch } = useSearchArtistsQuery(searchParams);
  const artists = (searchResponse?.data || []).filter(artist => artist.user_id !== currentUser?.id);

  const { data: allArtistsResponse } = useSearchArtistsQuery({});
  const dynamicLocations = useMemo(() => {
    if (!allArtistsResponse?.data) return [{ label: 'All Locations', value: '' }];
    const locs = allArtistsResponse.data.map(a => a.location).filter(Boolean);
    const unique = [...new Set(locs)].sort();
    return [{ label: 'All Locations', value: '' }, ...unique.map(l => ({ label: l, value: l }))];
  }, [allArtistsResponse]);

  const handleApplyFilters = () => {
    const params = {};
    if (filterCategories.length > 0) params.category = filterCategories.join(',');
    if (filterGender !== 'All') params.gender = filterGender;
    if (filterMinAge) params.minAge = filterMinAge;
    if (filterMaxAge) params.maxAge = filterMaxAge;
    if (filterLocation) params.location = filterLocation;
    
    setSearchParams(params);
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    setFilterCategories([]);
    setFilterGender('All');
    setFilterMinAge('');
    setFilterMaxAge('');
    setFilterLocation('');
    setSearchParams({});
    setShowFilterModal(false);
  };

  const renderTalentCard = ({ item }) => {
    const mainImage = (item.photo_urls && item.photo_urls.length > 0) ? item.photo_urls[0] : item.avatar_url;
    
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
          <Typography variant="body" style={styles.searchPlaceholder}>Search username/handle...</Typography>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

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
              <Typography variant="body" style={{ color: colors.textMutedLight, marginTop: 8 }}>
                Try adjusting your filters
              </Typography>
            </View>
          }
        />
      )}

      <Modal visible={showFilterModal} animationType="slide" transparent={true} onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { marginTop: 'auto', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, maxHeight: '80%', paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.modalHeader}>
              <Typography variant="h2" style={styles.modalTitle}>Filters</Typography>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color={colors.textMainLight} />
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Typography variant="h4" style={styles.filterSectionTitle}>Profession</Typography>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.m }}>
                <View style={[styles.chipContainer, { flexDirection: 'column', height: 160, alignContent: 'flex-start', flexWrap: 'wrap' }]}>
                  {CATEGORIES.map(cat => {
                    const isActive = cat === 'All' ? filterCategories.length === 0 : filterCategories.includes(cat);
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.filterChip, isActive && styles.filterChipActive, { marginRight: 8 }]}
                        onPress={() => {
                          if (cat === 'All') {
                            setFilterCategories([]);
                          } else {
                            setFilterCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
                          }
                        }}
                      >
                        <Typography variant="body" style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{cat}</Typography>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <Typography variant="h4" style={styles.filterSectionTitle}>Gender</Typography>
              <View style={styles.chipContainer}>
                {['All', 'Male', 'Female', 'Non-Binary', 'Other'].map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.filterChip, filterGender === g && styles.filterChipActive]}
                    onPress={() => setFilterGender(g)}
                  >
                    <Typography variant="body" style={[styles.filterChipText, filterGender === g && styles.filterChipTextActive]}>{g}</Typography>
                  </TouchableOpacity>
                ))}
              </View>

              <Typography variant="h4" style={styles.filterSectionTitle}>Age Range</Typography>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.m }}>
                <TextInput
                  style={styles.ageInput}
                  placeholder="Min Age"
                  keyboardType="number-pad"
                  value={filterMinAge}
                  onChangeText={setFilterMinAge}
                  placeholderTextColor={colors.textMutedLight}
                />
                <Typography variant="body" style={{ marginHorizontal: spacing.s, color: colors.textMutedLight }}>-</Typography>
                <TextInput
                  style={styles.ageInput}
                  placeholder="Max Age"
                  keyboardType="number-pad"
                  value={filterMaxAge}
                  onChangeText={setFilterMaxAge}
                  placeholderTextColor={colors.textMutedLight}
                />
              </View>

              <Typography variant="h4" style={styles.filterSectionTitle}>Location / City</Typography>
              <CustomDropdown
                options={dynamicLocations}
                selectedValue={filterLocation}
                onSelect={(val) => setFilterLocation(val)}
                placeholder="Select city"
                searchable={true}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearBtn} onPress={handleClearFilters}>
                <Typography variant="body" style={styles.clearBtnText}>Clear All</Typography>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyFilters}>
                <Typography variant="body" style={styles.applyBtnText}>Apply Filters</Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
