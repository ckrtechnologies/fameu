import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setConversations } from '../../store/slices/chatSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../../theme/theme';
import { useGetInboxQuery } from '../../services/chatApi';

export default function InboxScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { data: response, isLoading, isError, refetch } = useGetInboxQuery();
  
  const conversations = useSelector(state => state.chat.conversations);

  React.useEffect(() => {
    if (response?.data) {
      dispatch(setConversations(response.data));
    }
  }, [response, dispatch]);
  
  const [refreshing, setRefreshing] = React.useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleChatPress = (chat) => {
    navigation.navigate('Chat', {
      conversationId: chat.id,
      otherParticipant: chat.other_participant
    });
  };

  const renderItem = ({ item }) => {
    const { other_participant, last_message, updated_at } = item;
    
    // Fallback names
    const displayName = other_participant?.artist_profiles?.full_name || other_participant?.display_name || other_participant?.hiring_profiles?.company_name || 'Unknown User';
    
    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item)}>
        <View style={styles.avatar}>
          {other_participant?.avatar_url || other_participant?.artist_profiles?.photo_urls?.[0] || other_participant?.hiring_profiles?.logo_url ? (
            <Image 
              source={{ uri: other_participant?.avatar_url || other_participant?.artist_profiles?.photo_urls?.[0] || other_participant?.hiring_profiles?.logo_url }} 
              style={{ width: '100%', height: '100%', borderRadius: 25 }} 
            />
          ) : (
            <Icon name="person" size={24} color={colors.textMutedLight} />
          )}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{displayName}</Text>
            <Text style={styles.chatTime}>
              {updated_at ? new Date(updated_at).toLocaleDateString() : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.last_message || 'No messages yet'}
            </Text>
            {item.unread_count > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]} edges={['left', 'right']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={refetch}>
          <Icon name="refresh" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
      </View>
      
      {isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Failed to load messages</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.center}>
          <Icon name="chatbubble-ellipses-outline" size={64} color={colors.textMutedLight} />
          <Text style={styles.emptyText}>No conversations yet.</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.m,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textMainLight,
  },
  listContent: {
    paddingHorizontal: spacing.m,
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.textMutedLight + '20',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  chatTime: {
    ...typography.caption,
    color: colors.textMutedLight,
  },
  lastMessage: {
    ...typography.body,
    color: colors.textMutedLight,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMutedLight,
    marginTop: spacing.m,
  }
});
