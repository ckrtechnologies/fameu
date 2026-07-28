import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  AppState
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import { typography, spacing, globalStyles } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import { useGetMessagesQuery, useGetInboxQuery, chatApi } from '../../services/chatApi';
import SocketService from '../../services/SocketService';
import { markConversationAsRead } from '../../store/slices/chatSlice';
import { useBlockArtistMutation } from '../../services/discoveryApi';
import { GlobalAlert } from '../../components/core/GlobalAlert';
import { showError, showSuccess } from '../../utils/toast';
import CustomButton from '../../components/forms/CustomButton';
import { Modal } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export default function ChatScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { conversationId, otherParticipant } = route.params;
  const { user } = useSelector((state) => state.auth);
  const myId = user?.id;

  const { data: messagesResponse, isLoading, refetch } = useGetMessagesQuery(conversationId);
  const { data: inboxData } = useGetInboxQuery();

  // Find otherParticipant from inbox if missing in route params (e.g. opened from notification)
  const resolvedParticipant = otherParticipant || 
    inboxData?.data?.find(c => String(c.id) === String(conversationId))?.other_participant;
  
  const artistProfile = Array.isArray(resolvedParticipant?.artist_profiles) ? resolvedParticipant.artist_profiles[0] : resolvedParticipant?.artist_profiles;
  const hiringProfile = Array.isArray(resolvedParticipant?.hiring_profiles) ? resolvedParticipant.hiring_profiles[0] : resolvedParticipant?.hiring_profiles;

  const displayName = artistProfile?.full_name || resolvedParticipant?.display_name || hiringProfile?.company_name || resolvedParticipant?.username || resolvedParticipant?.email?.split('@')[0] || 'Chat';
  const avatarUrl = resolvedParticipant?.avatar_url || artistProfile?.photo_urls?.[0] || hiringProfile?.logo_url;

  const handleHeaderPress = () => {
    console.log('Header pressed, resolvedParticipant:', resolvedParticipant);
    if (resolvedParticipant?.artist_profiles?.id) {
      navigation.navigate('ArtistProfileScreen', { id: resolvedParticipant.artist_profiles.id });
    }
  };

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  
  const [blockArtist, { isLoading: isBlocking }] = useBlockArtistMutation();

  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Sync initial messages from RTK Query
  useEffect(() => {
    if (messagesResponse?.data) {
      setMessages(messagesResponse.data);
    }
  }, [messagesResponse]);

  // Refetch messages when app comes to foreground to catch missed socket events
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        refetch();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refetch]);

  // Initialize Socket Connection
  useEffect(() => {
    let activeSocket = null;

    const attachListeners = (socket) => {
      if (!socket) return;
      
      // Detach from previous socket first
      if (activeSocket && activeSocket !== socket) {
        activeSocket.emit('leave_conversation', conversationId);
        activeSocket.off('receive_message', handleReceiveMessage);
        activeSocket.off('user_typing', handleUserTyping);
      }
      
      activeSocket = socket;
      socketRef.current = socket;
      
      socket.emit('join_conversation', conversationId);
      socket.emit('mark_read', { conversationId });
      dispatch(markConversationAsRead({ conversationId }));

      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.on('receive_message', handleReceiveMessage);
      socket.on('user_typing', handleUserTyping);
    };

    const handleReceiveMessage = (newMessage) => {
      setMessages((prev) => {
        if (prev.some(msg => msg.id === newMessage.id)) return prev;
        return [newMessage, ...prev];
      });
      dispatch(chatApi.util.invalidateTags(['Chat', { type: 'ChatMessages', id: conversationId }]));
    };

    const handleUserTyping = ({ userId, isTyping: typingStatus }) => {
      if (userId !== myId) setOtherUserTyping(typingStatus);
    };

    // Attach immediately if socket already connected
    const currentSocket = SocketService.getSocket();
    if (currentSocket && currentSocket.connected) {
      attachListeners(currentSocket);
    } else if (currentSocket) {
      currentSocket.once('connect', () => attachListeners(currentSocket));
    }

    // Subscribe to future (re)connections via SocketService event bus
    const unsubConnect = SocketService.on('connected', (newSocket) => {
      attachListeners(newSocket);
      refetch();
    });

    return () => {
      unsubConnect();
      if (activeSocket) {
        activeSocket.emit('leave_conversation', conversationId);
        activeSocket.off('receive_message', handleReceiveMessage);
        activeSocket.off('user_typing', handleUserTyping);
      }
    };
  }, [conversationId, dispatch, user?.id]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const messageData = {
      conversationId,
      content: inputText.trim()
    };

    // Always use the live socket (handles reconnection scenario)
    const socket = socketRef.current || SocketService.getSocket();
    if (!socket || !socket.connected) {
      console.error('Socket not connected, cannot send message');
      return;
    }

    // Clear input immediately for better UX
    setInputText('');
    handleStopTyping();

    socket.emit('send_message', messageData, (response) => {
      if (response && !response.success) {
        console.error('Failed to send message:', response.error);
      }
    });
  };

  const handleTyping = (text) => {
    setInputText(text);
    if (!isTyping) {
      setIsTyping(true);
      const socket = socketRef.current || SocketService.getSocket();
      socket?.emit('typing', { conversationId, isTyping: true });
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    setIsTyping(false);
    const socket = socketRef.current || SocketService.getSocket();
    socket?.emit('typing', { conversationId, isTyping: false });
  };

  const handleBlockSubmit = async () => {
    if (!resolvedParticipant?.artist_profiles?.user_id && !resolvedParticipant?.user_id) {
      showError('', 'Unable to identify artist user ID.');
      return;
    }
    
    try {
      const targetUserId = resolvedParticipant?.artist_profiles?.user_id || resolvedParticipant?.user_id;
      await blockArtist({ id: targetUserId, reason: blockReason }).unwrap();
      showSuccess('', 'Artist blocked successfully.');
      setIsBlockModalVisible(false);
      setBlockReason('');
      navigation.goBack(); // Go back since we can't chat with blocked users
    } catch (err) {
      showError('', err?.data?.error || 'Failed to block artist.');
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === myId;
    
    // Parse [AUDITION_INVITE:id|title|image_url]
    const inviteMatch = item.content.match(/\[AUDITION_INVITE:([^|\]]+)(?:\|([^|\]]+))?(?:\|([^|\]]*))?\]/);
    let displayText = item.content;
    let auditionId = null;
    let auditionTitle = null;
    let auditionImage = null;
    
    if (inviteMatch) {
      auditionId = inviteMatch[1];
      auditionTitle = inviteMatch[2] || 'Audition Details';
      auditionImage = inviteMatch[3];
      displayText = item.content.replace(inviteMatch[0], '').trim();
    }

    return (
      <View style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageThem]}>
        {displayText ? (
          <Typography variant="body" style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
            {displayText}
          </Typography>
        ) : null}
        
        {auditionId && (
          <TouchableOpacity 
            style={[styles.auditionCardButton, { backgroundColor: isMe ? 'rgba(255,255,255,0.1)' : colors.surface }]}
            onPress={() => navigation.navigate('AuditionDetails', { auditionId })}
            activeOpacity={0.8}
          >
            {auditionImage ? (
              <Image source={{ uri: auditionImage }} style={styles.auditionCardImage} />
            ) : (
              <View style={[styles.auditionCardImagePlaceholder, { backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : colors.borderLight }]}>
                <Icon name="image-outline" size={32} color={isMe ? colors.white : colors.textMutedLight} />
              </View>
            )}
            <View style={styles.auditionCardContent}>
              <Typography variant="body2" style={{ color: isMe ? colors.white : colors.textMainLight, fontWeight: 'bold' }} numberOfLines={2}>
                {auditionTitle}
              </Typography>
              <Typography variant="caption" style={{ color: isMe ? 'rgba(255,255,255,0.7)' : colors.textMutedLight, marginTop: 4 }}>
                View Audition Details &rarr;
              </Typography>
            </View>
          </TouchableOpacity>
        )}
        <Typography variant="caption" style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeThem]}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerTitleContainer}
          onPress={handleHeaderPress}
          activeOpacity={0.7}
        >
          {avatarUrl && !imageError ? (
            <Image 
              source={{ uri: avatarUrl }} 
              style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
              <Typography style={{ color: colors.backgroundLight, fontWeight: 'bold' }}>
                {displayName.charAt(0).toUpperCase()}
              </Typography>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Typography variant="h3" style={styles.headerTitle} numberOfLines={1}>{displayName}</Typography>
            {otherUserTyping && <Typography variant="caption" style={styles.typingText}>typing...</Typography>}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => setIsBlockModalVisible(true)}>
          <Icon name="ban" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            inverted // Messages typically newest at bottom
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMutedLight}
            value={inputText}
            onChangeText={handleTyping}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Icon name="send" size={20} color={colors.backgroundLight} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={isBlockModalVisible} transparent={true} animationType="slide" onRequestClose={() => setIsBlockModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Typography variant="h3" style={{ marginBottom: 16, color: colors.error }}>Block Artist</Typography>
            <Typography variant="body" style={{ color: colors.textSecondaryLight, marginBottom: 12 }}>Are you sure you want to block {displayName}? You won't be able to send or receive messages.</Typography>
            <View style={{ borderWidth: 1, borderColor: colors.borderLight, borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <TextInput
                style={{ minHeight: 100, textAlignVertical: 'top', color: colors.textMainLight }}
                placeholder="Reason for blocking (optional)..."
                placeholderTextColor={colors.textMutedLight}
                multiline
                value={blockReason}
                onChangeText={setBlockReason}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <CustomButton title="Cancel" variant="outline" onPress={() => setIsBlockModalVisible(false)} style={{ flex: 1 }} />
              <CustomButton title="Block" onPress={handleBlockSubmit} isLoading={isBlocking} disabled={isBlocking} style={{ flex: 1, backgroundColor: colors.error, borderColor: colors.error }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.textMutedLight + '20',
  },
  iconButton: {
    padding: spacing.s,
    width: 48,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  typingText: {
    ...typography.caption,
    color: colors.primary,
    fontStyle: 'italic',
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.l,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: 20,
    marginBottom: spacing.s,
  },
  messageMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageThem: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLight,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  messageText: {
    ...typography.body,
  },
  messageTextMe: {
    color: colors.backgroundLight,
  },
  messageTextThem: {
    color: colors.textMainLight,
  },
  messageTime: {
    ...typography.caption,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageTimeThem: {
    color: colors.textMutedLight,
  },
  auditionCardButton: {
    marginTop: spacing.m,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    width: 240,
  },
  auditionCardImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.borderLight,
  },
  auditionCardImagePlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  auditionCardContent: {
    padding: spacing.s,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.m,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 24,
    paddingHorizontal: spacing.l,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 44,
    maxHeight: 100,
    ...typography.body,
    fontFamily: typography.fontFamily,
    color: colors.textMainLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.s,
    marginBottom: 0,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMutedLight,
  }
});
