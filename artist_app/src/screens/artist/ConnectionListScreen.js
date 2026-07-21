import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator , RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Users } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import { useGetFollowersQuery, useGetFollowingQuery } from '../../services/connectionsApi';

export default function ConnectionListScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const route = useRoute();
  
  // Params: type ('followers' or 'following'), userId (the user's profile UUID)
  const { type, userId } = route.params;

  // We conditionally call the appropriate query. RTK Query handles skipping if we provide `skip: true`.
  const followersQuery = useGetFollowersQuery(userId, { skip: type !== 'followers' });
  const followingQuery = useGetFollowingQuery(userId, { skip: type !== 'following' });

  const isFollowers = type === 'followers';
  const queryResult = isFollowers ? followersQuery : followingQuery;

  const { data: usersList, isLoading, isFetching, isError, error, refetch } = queryResult;

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => navigation.push('PublicProfile', { username: item.username || item.id })}
    >
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <User size={24} color={colors.primary} />
        </View>
      )}
      <View style={styles.userInfo}>
        <Typography variant="body" style={styles.nameText}>{item.name}</Typography>
        {item.username ? <Typography variant="caption" style={styles.handleText}>@{item.username}</Typography> : null}
      </View>
    </TouchableOpacity>
  );

  const listData = Array.isArray(usersList) ? usersList : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Typography variant="h3" style={styles.headerTitle}>
          {isFollowers ? 'Followers' : 'Following'}
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Typography variant="h4" style={styles.errorText}>Failed to load users.</Typography>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Typography variant="body" style={styles.retryButtonText}>Retry</Typography>
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
              <Users size={64} color={colors.borderLight} />
              <Typography variant="body" style={styles.emptyText}>
                {isFollowers ? "No followers yet" : "Not following anyone yet"}
              </Typography>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
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
    backgroundColor: 'rgba(0, 51, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: spacing.m,
  },
  nameText: {
    fontWeight: '600',
    color: colors.textMainLight,
  },
  handleText: {
    color: colors.textMutedLight,
  },
  errorText: {
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
    color: colors.textMutedLight,
    marginTop: spacing.m,
  }
});
