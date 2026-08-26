import { showError, showSuccess } from '../../utils/toast';
import React, { useCallback } from 'react';
import { View, StyleSheet, Animated, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, MessageCircle, Bell, BellOff } from 'lucide-react-native';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';

import { typography, spacing, globalStyles } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import { useTheme } from '../../theme/ThemeProvider';
import { 
  useGetNotificationsQuery, 
  useMarkNotificationReadMutation, 
  useMarkAllNotificationsReadMutation 
} from '../../services/hiringApi';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const { scrollY, onScroll, headerTitleSize, subtitleHeight, subtitleOpacity, headerElevation } = useShrinkableHeader();
  const { data: response, isLoading, isFetching, refetch } = useGetNotificationsQuery(undefined, {
    pollingInterval: 10000,
    skip: false,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

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
        navigation.navigate('ChatScreen', { conversationId });
      }
    } else if (notification.type === 'comment' || notification.type === 'comment_reply') {
      const data = typeof notification.data === 'string' ? JSON.parse(notification.data) : (notification.data || {});
      const targetId = data.targetId;
      const targetType = data.targetType;
      
      if (targetType === 'audition' && targetId) {
        navigation.navigate('AuditionDetails', { auditionId: targetId, scrollToComments: true });
      } else if (targetType === 'profile') {
        navigation.navigate('Drawer', { screen: 'Tabs', params: { screen: 'Profile', params: { scrollToComments: true } } });
      }
    } else if (notification.type === 'application') {
      const data = typeof notification.data === 'string' ? JSON.parse(notification.data) : (notification.data || {});
      const applicationId = data.targetId;
      const artistId = data.artistId;
      if (applicationId && artistId) {
        navigation.navigate('ArtistProfileScreen', { id: artistId, applicationId });
      }
    }
  };

  const renderNotification = ({ item }) => {
    const isUnread = !item.is_read;
    return (
      <TouchableOpacity 
        style={[styles.notificationCard, isUnread && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.iconContainer}>
          {item.type === 'message' || item.type === 'chat_message' ? (
            <MessageCircle size={24} color={colors.primary} />
          ) : (
            <Bell size={24} color={colors.primary} />
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
    <View style={globalStyles.container}>
      <ShrinkableHeader
        title="Notifications"
        showBack={true}
        scrollY={scrollY}
        headerTitleSize={headerTitleSize}
        subtitleHeight={subtitleHeight}
        subtitleOpacity={subtitleOpacity}
        headerElevation={headerElevation}
        rightActions={
          <TouchableOpacity onPress={handleMarkAllRead} style={{ padding: 4 }}>
            <Typography variant="body" style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>All read</Typography>
          </TouchableOpacity>
        }
      />

      {isLoading && !isFetching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <Animated.FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          onScroll={onScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <BellOff size={64} color={colors.textMutedLight} />
              <Typography variant="h3" style={styles.emptyText}>No notifications yet</Typography>
            </View>
          }
        />
      )}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
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
    ...typography.h2,
    color: colors.textMainLight,
    flex: 1,
    marginLeft: spacing.s,
  },
  markAllButton: {
    padding: spacing.xs,
  },
  markAllText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: spacing.m,
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
    padding: spacing.m,
    borderRadius: 12,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'flex-start',
  },
  unreadCard: {
    backgroundColor: 'rgba(0, 51, 255, 0.05)',
    borderColor: colors.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 51, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  contentContainer: {
    flex: 1,
  },
  titleText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMainLight,
    marginBottom: 4,
  },
  bodyText: {
    ...typography.caption,
    color: colors.textMutedLight,
    marginBottom: 6,
  },
  timeText: {
    ...typography.caption,
    color: colors.textMutedLight,
    fontSize: 10,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: spacing.s,
    marginLeft: spacing.s,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textMutedLight,
    marginTop: spacing.m,
  },
});
