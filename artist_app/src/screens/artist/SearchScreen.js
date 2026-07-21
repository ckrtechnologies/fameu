import React, { useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator , RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, XCircle, User, Search as SearchOutline } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import { useLazySearchUsersQuery } from '../../services/connectionsApi';

export default function SearchScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
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
      onPress={() => navigation.navigate('PublicProfile', { username: item.username || item.id })}
    >
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <User size={24} color={colors.primary} />
        </View>
      )}
      <View style={styles.userInfo}>
        <Typography variant="h4" style={styles.nameText}>{item.name}</Typography>
        {item.username ? <Typography variant="body" style={styles.handleText}>@{item.username}</Typography> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textMutedLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={colors.textMutedLight}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
              <XCircle size={20} color={colors.textMutedLight} />
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
          <Typography variant="body" style={styles.errorText}>Error fetching results. Please try again.</Typography>
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
                <Typography variant="body" style={styles.emptyText}>No users found</Typography>
              </View>
            ) : (
              <View style={styles.centerContainer}>
                <SearchOutline size={64} color={colors.borderLight} />
                <Typography variant="h4" style={styles.promptText}>Search for artists and recruiters</Typography>
              </View>
            )
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
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.m,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.s,
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
    backgroundColor: 'rgba(0, 51, 255, 0.05)',
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
    color: colors.textMutedLight,
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
  },
  emptyText: {
    color: colors.textMutedLight,
  },
  promptText: {
    color: colors.textMutedLight,
    marginTop: spacing.m,
    textAlign: 'center',
  },
});
