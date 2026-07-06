import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setConversations } from '../../store/slices/chatSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';

import { colors, typography, spacing, globalStyles } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import { useGetInboxQuery } from '../../services/chatApi';

export default function InboxScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { data: response, isLoading, isFetching, refetch } = useGetInboxQuery();
  const { user } = useSelector((state) => state.auth);
  const conversations = useSelector(state => state.chat.conversations);
  
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (response?.data) {
      dispatch(setConversations(response.data));
    }
  }, [response, dispatch]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim() || !conversations) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(item => {
      const otherParticipant = item.other_participant;
      const artistProfile = otherParticipant?.artist_profiles;
      const hiringProfile = otherParticipant?.hiring_profiles;
      const name = artistProfile?.full_name || otherParticipant?.display_name || hiringProfile?.company_name || otherParticipant?.username || otherParticipant?.email?.split('@')[0] || 'Unknown User';
      return name.toLowerCase().includes(query);
    });
  }, [conversations, searchQuery]);

  const renderConversationItem = ({ item }) => {
    const otherParticipant = item.other_participant;
    const artistProfile = Array.isArray(otherParticipant?.artist_profiles) ? otherParticipant.artist_profiles[0] : otherParticipant?.artist_profiles;
    const hiringProfile = Array.isArray(otherParticipant?.hiring_profiles) ? otherParticipant.hiring_profiles[0] : otherParticipant?.hiring_profiles;
    
    const unreadCount = item.unread_count || 0;

    const displayName = artistProfile?.full_name || otherParticipant?.display_name || hiringProfile?.company_name || otherParticipant?.username || otherParticipant?.email?.split('@')[0] || 'Unknown User';
    const avatarUrl = otherParticipant?.avatar_url || artistProfile?.photo_urls?.[0] || hiringProfile?.logo_url;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ChatScreen', { 
          conversationId: item.id, 
          otherParticipant: item.other_participant,
          auditionId: item.audition_id
        })}
      >
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image 
              source={{ uri: avatarUrl }} 
              style={{ width: '100%', height: '100%', borderRadius: 25 }} 
            />
          ) : (
            <Typography style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
            </Typography>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Typography variant="body" style={styles.name} numberOfLines={1}>
              {displayName}
            </Typography>
            {item.updated_at && (
              <Typography variant="caption" style={styles.timeText}>
                {format(new Date(item.updated_at), 'MMM dd')}
              </Typography>
            )}
          </View>
          
          <View style={styles.cardFooter}>
            <Typography variant="body" style={[styles.messageText, unreadCount > 0 && styles.unreadText]} numberOfLines={1}>
              {item.last_message || 'No messages yet'}
            </Typography>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Typography variant="caption" style={styles.badgeText}>{unreadCount}</Typography>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={colors.textMutedLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor={colors.textMutedLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Icon name="close-circle" size={20} color={colors.textMutedLight} />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name={searchQuery ? "search-outline" : "chatbubbles-outline"} size={48} color={colors.borderLight} />
            <Typography variant="h3" style={styles.emptyTitle}>{searchQuery ? "No Results" : "No Messages"}</Typography>
            <Typography variant="body" style={styles.emptyText}>{searchQuery ? "No chats match your search." : "You haven't started any conversations yet."}</Typography>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: spacing.m,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...typography.body1,
    color: colors.textMainLight,
    fontWeight: '700',
    flex: 1,
  },
  timeText: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginLeft: spacing.s,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageText: {
    ...typography.body2,
    color: colors.textMutedLight,
    flex: 1,
    marginRight: spacing.m,
  },
  unreadText: {
    color: colors.textMainLight,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    marginTop: 60,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  emptyText: {
    ...typography.body2,
    color: colors.textMutedLight,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  searchIcon: {
    marginRight: spacing.s,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    color: colors.textMainLight,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    padding: spacing.xs,
  },
});
