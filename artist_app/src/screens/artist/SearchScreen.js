import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator , RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme/theme';
import { useLazySearchUsersQuery } from '../../services/connectionsApi';

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerSearch, { data: searchResults, isFetching, error }] = useLazySearchUsersQuery();

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      triggerSearch(text);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => navigation.navigate('PublicProfile', { username: item.username })}
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.textSecondaryLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={colors.textSecondaryLight}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
              <Icon name="close-circle" size={20} color={colors.textSecondaryLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isFetching ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error fetching results. Please try again.</Text>
        </View>
      ) : (
        <FlatList
          data={searchQuery.length >= 2 ? (searchResults?.data || []) : []}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isFetching || false} onRefresh={() => triggerSearch(searchQuery)} tintColor={colors.primary} />}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            searchQuery.length >= 2 ? (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            ) : (
              <View style={styles.centerContainer}>
                <Icon name="search-outline" size={64} color={colors.borderLight} />
                <Text style={styles.promptText}>Search for artists and recruiters</Text>
              </View>
            )
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
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.s,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: spacing.s,
    height: 40,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textMainLight,
    padding: 0, // Remove default padding on Android
  },
  clearButton: {
    padding: spacing.xs,
  },
  listContainer: {
    flexGrow: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
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
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: spacing.m,
    flex: 1,
  },
  nameText: {
    ...typography.h4,
    fontWeight: '600',
    color: colors.textMainLight,
  },
  handleText: {
    ...typography.body,
    color: colors.textSecondaryLight,
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondaryLight,
  },
  promptText: {
    ...typography.h4,
    color: colors.textSecondaryLight,
    marginTop: spacing.m,
    textAlign: 'center',
  },
});
