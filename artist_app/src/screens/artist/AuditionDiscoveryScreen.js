import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme/theme';
import CustomInput from '../../components/CustomInput';
import AuditionCard from '../../components/artist/AuditionCard';
import { useGetFeedQuery } from '../../services/discoverApi';

const CATEGORIES = ['All', 'Acting', 'Modeling', 'Voiceover', 'Dancing', 'Singing'];

export default function AuditionDiscoveryScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const { data: feedData, isLoading, isError, refetch } = useGetFeedQuery({ 
    search, 
    category: activeCategory !== 'All' ? activeCategory : undefined 
  });

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

  const auditions = Array.isArray(feedData) ? feedData : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Find your next big role.</Text>
          
          <View style={styles.searchContainer}>
            <CustomInput
              placeholder="Search by role, location, or production..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <FlatList
            data={CATEGORIES}
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
    padding: spacing.xl,
    paddingTop: spacing.l,
  },
  title: {
    ...typography.h1,
    color: colors.textMainLight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMutedLight,
    marginBottom: spacing.l,
  },
  searchContainer: {
    marginBottom: -spacing.m,
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
  }
});
