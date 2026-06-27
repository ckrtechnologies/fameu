import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors, typography, spacing } from '../../theme/theme';
import AuditionCard from '../../components/artist/AuditionCard';
import { useGetFeedQuery } from '../../services/discoverApi';

export default function ArtistDashboardScreen() {
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  
  const { data: feedData, isLoading, isError, refetch } = useGetFeedQuery();

  const handleAuditionPress = (id) => {
    navigation.navigate('AuditionDetail', { id });
  };

  const name = user?.full_name || user?.email?.split('@')[0] || 'Artist';

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // Assuming feedData is an array of auditions. We will split it into two for display purposes 
  // (or backend could return { nearby: [], trending: [] })
  // For now, if it's a flat array, we just show it under "Recommended"
  const auditions = Array.isArray(feedData) ? feedData : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {name} 👋</Text>
          <Text style={styles.subtitle}>Here are your matches for today</Text>
        </View>

        {isError && (
          <View style={{ padding: spacing.xl }}>
            <Text style={{ color: colors.danger }}>Failed to load auditions.</Text>
            <Text onPress={refetch} style={{ color: colors.primary, marginTop: spacing.s }}>Retry</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Auditions</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          
          {auditions.length === 0 && !isError ? (
            <Text style={styles.emptyText}>No auditions available right now.</Text>
          ) : (
            <FlatList
              data={auditions}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <AuditionCard 
                  audition={item} 
                  onPress={() => handleAuditionPress(item.id)} 
                />
              )}
            />
          )}
        </View>
        
        {/* Bottom padding for tab bar */}
        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingTop: spacing.xxl,
  },
  greeting: {
    ...typography.h1,
    color: colors.textMainLight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMutedLight,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.m,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textMainLight,
  },
  seeAll: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    paddingHorizontal: spacing.xl,
    ...typography.body,
    color: colors.textMutedLight,
  },
});
