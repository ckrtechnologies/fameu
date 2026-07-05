import { showError, showSuccess } from '../../utils/toast';
import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle, Bell, BellOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';

import { colors, typography, spacing, globalStyles } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import { 
  useGetNotificationsQuery, 
  useMarkNotificationReadMutation, 
  useMarkAllNotificationsReadMutation 
} from '../../services/notificationsApi';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { data: response, isLoading, isFetching, refetch } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = response?.data || [];

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
    } catch (error) {
      showError('', 'Failed to mark all as read');
    }
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.is_read) {
      try {
        await markRead(notification.id).unwrap();
      } catch (error) {
        console.error('Failed to mark read', error);
      }
    }
    
    if (notification.type === 'message' || notification.type === 'chat_message') {
      const data = typeof notification.data === 'string' ? JSON.parse(notification.data) : (notification.data || {});
      const conversationId = data.conversationId;
      if (conversationId) {
        navigation.navigate('Chat', { conversationId });
      }
    } else if (notification.type === 'comment' || notification.type === 'comment_reply') {
      const data = typeof notification.data === 'string' ? JSON.parse(notification.data) : (notification.data || {});
      const targetId = data.targetId;
      const targetType = data.targetType;
      
      if (targetType === 'audition' && targetId) {
        navigation.navigate('AuditionDetail', { id: targetId, scrollToComments: true });
      } else if (targetType === 'profile' && targetId) {
        navigation.navigate('PublicProfile', { username: targetId, scrollToComments: true });
      }
    }
  };

  const renderNotification = ({ item }) => {
    const isUnread = !item.is_read;
    const isMessage = item.type === 'message' || item.type === 'chat_message';
    let dataObj = {};
    try {
      dataObj = typeof item.data === 'string' ? JSON.parse(item.data) : (item.data || {});
    } catch(e) {}

    return (
      <TouchableOpacity 
        style={[styles.notificationCard, isUnread && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.iconContainer}>
          {isMessage && dataObj.avatarUrl ? (
            <Image source={{ uri: dataObj.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
          ) : isMessage ? (
             <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceDark, justifyContent: 'center', alignItems: 'center' }}>
               <MessageCircle size={20} color={colors.primary} />
             </View>
          ) : (
            <Image source={require('../../assets/images/logo.jpeg')} style={{ width: 40, height: 40, borderRadius: 20 }} />
          )}
        </View>
        <View style={styles.contentContainer}>
          <Typography variant="body" style={styles.titleText}>{item.title}</Typography>
          <Typography variant="caption" style={styles.bodyText}>{item.body}</Typography>
          <Typography variant="caption" style={styles.timeText}>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </Typography>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Typography variant="h3" style={styles.headerTitle}>Notifications</Typography>
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllRead}>
          <Typography variant="caption" style={styles.markAllText}>Mark all read</Typography>
        </TouchableOpacity>
      </View>

      {isLoading && !isFetching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <BellOff size={48} color={colors.textMutedLight} />
              <Typography variant="body" style={styles.emptyText}>No notifications yet</Typography>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    flex: 1,
    marginLeft: spacing.s,
  },
  markAllButton: {
    padding: spacing.xs,
    backgroundColor: 'rgba(0,51,255,0.1)',
    borderRadius: 8,
  },
  markAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: spacing.s,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    padding: spacing.s,
    borderRadius: 8,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'flex-start',
  },
  unreadCard: {
    backgroundColor: 'rgba(0, 51, 255, 0.05)',
    borderColor: colors.primary,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 51, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  contentContainer: {
    flex: 1,
  },
  titleText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMainLight,
    marginBottom: 2,
  },
  bodyText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMutedLight,
    marginBottom: 4,
  },
  timeText: {
    ...typography.caption,
    color: colors.textMutedLight,
    fontSize: 10,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMutedLight,
    marginTop: spacing.s,
  },
});
