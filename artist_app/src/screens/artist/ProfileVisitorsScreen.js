import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text } from "react-native";
import { colors, spacing, typography } from '../../theme/theme';
import { useGetProfileVisitorsQuery } from '../../services/profileApi';
import { timeAgo } from '../../utils/dateUtils';

const ProfileVisitorsScreen = ({ navigation }) => {
  const { data: response, isLoading, isError, refetch } = useGetProfileVisitorsQuery();
  const visitors = response?.data || [];

  const renderVisitorItem = ({ item }) => (
    <View style={styles.visitorCard}>
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
           <Text variant="body" style={styles.avatarPlaceholderText}>
            {item.name ? item.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
      )}
      <View style={styles.visitorInfo}>
         <Text variant="body" style={styles.visitorName}>{item.name}</Text>
         <Text variant="caption" style={styles.visitorRole}>
          {item.role === 'hiring' ? 'Recruiter' : item.role === 'artist' ? 'Artist' : 'User'}
        </Text>
      </View>
       <Text variant="caption" style={styles.visitTime}>
        {timeAgo(item.visited_at)}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="eye-off-outline" size={64} color={colors.textMutedLight} />
       <Text variant="h3" style={styles.emptyTitle}>No Visitors Yet</Text>
       <Text variant="body" style={styles.emptyText}>
        When someone views your profile, they will appear here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
         <Text variant="h2" style={styles.headerTitle}>Profile Visitors</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
           <Text variant="body" style={{ color: colors.error }}>Failed to load visitors.</Text>
          <TouchableOpacity onPress={refetch} style={{ marginTop: 12 }}>
             <Text variant="body" style={{ color: colors.primary }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visitors}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderVisitorItem}
          contentContainerStyle={visitors.length === 0 ? styles.flexGrow : styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.s,
  },
  headerTitle: {
    color: colors.textMainLight,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexGrow: {
    flexGrow: 1,
  },
  listContent: {
    padding: spacing.l,
  },
  visitorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: spacing.m,
    borderRadius: 12,
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  visitorInfo: {
    flex: 1,
    marginLeft: spacing.m,
  },
  visitorName: {
    fontWeight: '600',
    color: colors.textMainLight,
    marginBottom: 2,
  },
  visitorRole: {
    color: colors.textSecondaryLight,
  },
  visitTime: {
    color: colors.textMutedLight,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.m,
    marginBottom: spacing.s,
    color: colors.textMainLight,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondaryLight,
  },
});

export default ProfileVisitorsScreen;
