import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import AuditionCard from '../../components/artist/AuditionCard';
import { useGetSavedAuditionsQuery } from '../../services/discoverApi';
import { useRefetchOnFocus } from '../../hooks/useRefetchOnFocus';

export default function SavedAuditionsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();

  const { data: savedResponse, isLoading, isError, refetch, isFetching } = useGetSavedAuditionsQuery();
  useRefetchOnFocus(refetch);

  const handleAuditionPress = (item) => {
    navigation.navigate('AuditionDetail', { id: item.id });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bookmark-outline" size={48} color={colors.textMutedLight} />
      <Text style={styles.emptyText}>You haven't saved any auditions yet.</Text>
    </View>
  );

  const auditions = savedResponse?.data || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Saved Auditions</Text>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Failed to load saved auditions</Text>
            <TouchableOpacity onPress={refetch} style={{ marginTop: 12 }}>
              <Text style={{ color: colors.primary }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={auditions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <AuditionCard 
                audition={item} 
                onPress={() => handleAuditionPress(item)} 
                style={{ width: '100%', marginBottom: spacing.l, marginRight: 0 }}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    backgroundColor: colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    flex: 1,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    padding: spacing.l,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    marginTop: 60,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMutedLight,
    marginTop: spacing.m,
    textAlign: 'center',
  },
});
