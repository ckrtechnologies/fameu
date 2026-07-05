import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Image , RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, globalStyles } from '../../theme/theme';
import { useGetCompanyProfileQuery } from '../../services/hiringApi';
import { useSearchArtistsQuery } from '../../services/discoveryApi';
import FilterModal from '../../components/FilterModal';
import CustomButton from '../../components/forms/CustomButton';
import EmptyState from '../../components/EmptyState';
import SkeletonLoader from '../../components/SkeletonLoader';
import { useSelector } from 'react-redux';

export default function TalentSearchScreen({ navigation }) {
  const user = useSelector(state => state.auth.user);
  const { data: profileResponse, isLoading: isProfileLoading , isFetching: isProfileFetching, refetch} = useGetCompanyProfileQuery(user?.id);
  const profile = profileResponse?.data;
  const isVerified = profile?.is_verified;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: artistsResponse, isLoading: isArtistsLoading, isFetching } = useSearchArtistsQuery(
    { ...filters, q: debouncedQuery },
    { skip: !isVerified }
  );

  const artists = artistsResponse?.data || [];

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  if (isProfileLoading) {
    return (
      <View style={[globalStyles.container, styles.center, { padding: spacing.xl }]}>
        <SkeletonLoader height={100} style={{ marginBottom: spacing.m }} />
        <SkeletonLoader height={100} style={{ marginBottom: spacing.m }} />
        <SkeletonLoader height={100} />
      </View>
    );
  }


  const renderArtistCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ArtistProfileScreen', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        {item.profile_image_url ? (
          <Image source={{ uri: item.profile_image_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <Text style={styles.placeholderText}>{item.user?.name?.charAt(0) || 'A'}</Text>
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.artistName}>{item.user?.name || 'Unknown Artist'}</Text>
          <Text style={styles.categoryText}>{item.category || 'Unspecified Category'}</Text>
          <View style={styles.locationRow}>
            <Icon name="location-outline" size={14} color={colors.textMutedLight} />
            <Text style={styles.locationText}>{item.location || 'Location not specified'}</Text>
          </View>
        </View>
      </View>
      {item.skills && (
        <View style={styles.skillsContainer}>
          {item.skills.split(',').slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill.trim()}</Text>
            </View>
          ))}
          {item.skills.split(',').length > 3 && (
            <Text style={styles.moreSkillsText}>+{item.skills.split(',').length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color={colors.textMutedLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search artists by name, skills..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={colors.textMutedLight} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setIsFilterVisible(true)}>
          <Icon name="options-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isArtistsLoading || isFetching ? (
        <View style={styles.listContent}>
          <SkeletonLoader height={120} />
          <SkeletonLoader height={120} />
          <SkeletonLoader height={120} />
        </View>
      ) : (
        <FlatList
          data={artists}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={renderArtistCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState 
              title="No artists found" 
              message="Try adjusting your filters or search query to find more talent." 
              iconName="account-search-outline" 
            />
          }
        />
      )}

      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    padding: spacing.m,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: spacing.m,
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    ...typography.body1,
    fontFamily: typography.fontFamily,
    color: colors.textMainLight,
    paddingVertical: 0, // for Android
  },
  filterButton: {
    padding: 8,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  listContent: {
    padding: spacing.m,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.m,
  },
  placeholderAvatar: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    ...typography.h2,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  artistName: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  categoryText: {
    ...typography.body2,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginLeft: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.m,
    alignItems: 'center',
  },
  skillBadge: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: {
    ...typography.caption,
    color: colors.textMainLight,
  },
  moreSkillsText: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginLeft: 4,
  },
});
