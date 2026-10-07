import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';

import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing, globalStyles } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';
import { useGetInboxQuery } from '../../services/chatApi';
import { useRefetchOnFocus } from '../../hooks/useRefetchOnFocus';

export default function InboxScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { data: response, isLoading, isFetching, refetch } = useGetInboxQuery();
  useRefetchOnFocus(refetch);
  const { user } = useSelector((state) => state.auth);
  const conversations = useSelector(state => state.chat.conversations);
  
  const {
    scrollY,
    onScroll,
    headerPaddingVertical,
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    avatarSize,
    avatarRadius,
    headerElevation,
  } = useShrinkableHeader();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim() || !conversations) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(item => {
      const otherParticipant = item.other_participant;
      const artistProfile = Array.isArray(otherParticipant?.artist_profiles) ? otherParticipant.artist_profiles[0] : otherParticipant?.artist_profiles;
      const hiringProfile = Array.isArray(otherParticipant?.hiring_profiles) ? otherParticipant.hiring_profiles[0] : otherParticipant?.hiring_profiles;
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
        onPress={() => navigation.navigate('Chat', { 
          conversationId: item.id, 
          otherParticipant: item.other_participant
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
      <View style={[globalStyles.container, styles.center, { backgroundColor: colors.backgroundLight }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: colors.backgroundLight }]} edges={['left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ShrinkableHeader 
          title="Messages"
          subtitle={`${filteredConversations?.length || 0} active conversations`}
          avatarUrl={user?.avatar_url}
          avatarText={user?.full_name?.charAt(0) || 'U'}
          onAvatarPress={() => navigation.openDrawer()}
          headerPaddingVertical={headerPaddingVertical}
          headerTitleSize={headerTitleSize}
          subtitleHeight={subtitleHeight}
          subtitleOpacity={subtitleOpacity}
          avatarSize={avatarSize}
          avatarRadius={avatarRadius}
          headerElevation={headerElevation}
          bottomComponent={
            <View style={[styles.searchContainer, { marginHorizontal: 0, marginTop: 4 }]}>
              <Icon name="search" size={20} color={colors.primary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search chats..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Icon name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          }
        />

        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.listContent}
          onScroll={onScroll}
          scrollEventThrottle={16}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
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
    ...typography.body,
    fontSize: 16.5,
    color: colors.textMainLight,
    fontWeight: '700',
    flex: 1,
  },
  timeText: {
    ...typography.caption,
    fontSize: 12.5,
    color: colors.textMutedLight,
    marginLeft: spacing.s,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageText: {
    ...typography.body,
    fontSize: 14.5,
    color: colors.textMutedLight,
    flex: 1,
    marginRight: spacing.m,
  },
  unreadText: {
    color: colors.textMainLight,
    fontWeight: '700',
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
    color: '#1A1200',
    fontSize: 12,
    fontWeight: '800',
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
    ...typography.body,
    fontSize: 14.5,
    color: colors.textMutedLight,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(227,176,75,0.25)',
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#FFFFFF',
    paddingVertical: 0,
    height: '100%',
  },
  clearButton: {
    padding: 2,
  },
});
