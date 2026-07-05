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

import { colors, typography, spacing, globalStyles } from '../../theme/theme';
import Typography from '../../components/core/Typography';
import { useGetMessagesQuery, useGetInboxQuery, chatApi } from '../../services/chatApi';
import SocketService from '../../services/SocketService';
import { markConversationAsRead } from '../../store/slices/chatSlice';

export default function ChatScreen() {
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
  
  const displayName = resolvedParticipant?.artist_profiles?.full_name || resolvedParticipant?.display_name || resolvedParticipant?.hiring_profiles?.company_name || 'Chat';
  const avatarUrl = resolvedParticipant?.avatar_url || resolvedParticipant?.artist_profiles?.photo_urls?.[0] || resolvedParticipant?.hiring_profiles?.logo_url;

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
    const socket = SocketService.getSocket();
    if (!socket) return;
    
    socketRef.current = socket;

    socket.emit('join_conversation', conversationId);
    socket.emit('mark_read', { conversationId });
    dispatch(markConversationAsRead({ conversationId }));

    const handleReceiveMessage = (newMessage) => {
      setMessages((prevMessages) => {
        if (prevMessages.some(msg => msg.id === newMessage.id)) {
          return prevMessages;
        }
        return [newMessage, ...prevMessages];
      });
      
      // Optimistically update RTK Query cache so Inbox updates automatically
      dispatch(
        chatApi.util.updateQueryData('getInbox', undefined, (draft) => {
          const convo = draft.data.find((c) => c.id === conversationId);
          if (convo) {
            convo.last_message = newMessage.content;
            convo.last_message_at = newMessage.created_at;
            
            // Increment unread count if we are not the sender
            if (newMessage.sender_id !== user?.id) {
              if (convo.participant1_id === user?.id) {
                convo.participant1_unread = (convo.participant1_unread || 0) + 1;
              } else {
                convo.participant2_unread = (convo.participant2_unread || 0) + 1;
              }
            }
          }
        })
      );
    };
    
    socket.on('receive_message', handleReceiveMessage);

    const handleUserTyping = ({ isTyping }) => {
      setOtherUserTyping(isTyping);
    };
    
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [conversationId, dispatch, user?.id]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const messageData = {
      conversationId,
      content: inputText.trim()
    };

    socketRef.current?.emit('send_message', messageData, (response) => {
      if (response.success) {
        setInputText('');
        handleStopTyping();
      } else {
        console.error('Failed to send message:', response.error);
      }
    });
  };

  const handleTyping = (text) => {
    setInputText(text);
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current?.emit('typing', { conversationId, isTyping: true });
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    setIsTyping(false);
    socketRef.current?.emit('typing', { conversationId, isTyping: false });
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === myId;
    return (
      <View style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageThem]}>
        <Typography variant="body" style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
          {item.content}
        </Typography>
        <Typography variant="caption" style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeThem]}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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

        <View style={styles.iconButton} />
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
