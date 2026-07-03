import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator , RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme/theme';
import { useGetFollowersQuery, useGetFollowingQuery } from '../../services/connectionsApi';

export default function ConnectionListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Params: type ('followers' or 'following'), userId (the user's profile UUID)
  const { type, userId } = route.params;

  // We conditionally call the appropriate query. RTK Query handles skipping if we provide `skip: true`.
  const followersQuery = useGetFollowersQuery(userId, { skip: type !== 'followers' });
  const followingQuery = useGetFollowingQuery(userId, { skip: type !== 'following' });

  const isFollowers = type === 'followers';
  const queryResult = isFollowers ? followersQuery : followingQuery;

  const { data: usersList, isLoading, isError, error, refetch } = queryResult;

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => navigation.push('PublicProfile', { username: item.username })}
    >
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Icon name="person" size={24} color={colors.textSecondaryLight} />
        </View>
      )}
      <View style={styles.userInfo}>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.handleText}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  const listData = Array.isArray(usersList) ? usersList : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isFollowers ? 'Followers' : 'Following'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load users.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, index) => item.id || index.toString()}
          refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={64} color={colors.borderLight} />
              <Text style={styles.emptyText}>
                {isFollowers ? "No followers yet" : "Not following anyone yet"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingTop: spacing.s,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: spacing.m,
  },
  nameText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMainLight,
  },
  handleText: {
    ...typography.caption,
    color: colors.textSecondaryLight,
  },
  errorText: {
    ...typography.h4,
    color: colors.error,
    marginBottom: spacing.s,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.backgroundLight,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondaryLight,
    marginTop: spacing.m,
  }
});
