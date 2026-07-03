import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../../theme/theme';
import { useGetMessagesQuery, chatApi } from '../../services/chatApi';
import SocketService from '../../services/SocketService';
import { markConversationAsRead } from '../../store/slices/chatSlice';

// Use the same base URL as API
// Removed hardcoded SOCKET_URL

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { conversationId, otherParticipant } = route.params;

  const token = useSelector((state) => state.auth.token);
  const myId = useSelector((state) => state.auth.user?.id);

  const { data: messagesResponse, isLoading } = useGetMessagesQuery(conversationId);
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const flatListRef = useRef(null);

  const displayName = otherParticipant?.artist_profiles?.full_name || otherParticipant?.display_name || otherParticipant?.hiring_profiles?.company_name || 'Chat';

  // Set initial messages from API
  useEffect(() => {
    if (messagesResponse?.data) {
      // API returns desc order usually for chats (newest first). Let's keep it that way for inverted FlatList
      setMessages(messagesResponse.data);
    }
  }, [messagesResponse]);

  // Setup Socket Listeners
  useEffect(() => {
    const socket = SocketService.getSocket();
    if (!socket) return;
    
    socketRef.current = socket;

    socket.emit('join_conversation', conversationId);
    socket.emit('mark_read', { conversationId });
    dispatch(markConversationAsRead({ conversationId }));

    const handleReceiveMessage = (newMessage) => {
      // Prepend to messages (newest first)
      setMessages((prev) => {
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev;
        }
        return [newMessage, ...prev];
      });
      
      // Also invalidate inbox cache so the last message updates
      dispatch(chatApi.util.invalidateTags(['Chat']));
    };
    
    socket.on('receive_message', handleReceiveMessage);

    const handleUserTyping = ({ userId, isTyping: typingStatus }) => {
      if (userId !== myId) {
        setOtherUserTyping(typingStatus);
      }
    };
    
    socket.on('user_typing', handleUserTyping);

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [conversationId, dispatch]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const msgContent = inputText.trim();
    
    // Clear input immediately for better UX
    setInputText('');
    handleStopTyping(); // Stop typing indicator
    
    // Optimistic UI update could go here, but we'll wait for the broadcast for simplicity and accuracy
    
    socketRef.current?.emit('send_message', {
      conversationId,
      content: msgContent
    }, (response) => {
      if (!response.success) {
        console.error('Failed to send message:', response.error);
        // Could show a toast here
      }
    });
  };

  const handleTyping = (text) => {
    setInputText(text);
    
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current?.emit('typing', { conversationId, isTyping: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1500);
  };

  const handleStopTyping = () => {
    setIsTyping(false);
    socketRef.current?.emit('typing', { conversationId, isTyping: false });
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === myId;
    return (
      <View style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageThem]}>
        <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
          {item.content}
        </Text>
        <Text style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeThem]}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{displayName}</Text>
          {otherUserTyping && <Text style={styles.typingText}>typing...</Text>}
        </View>
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
    alignItems: 'center',
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
    padding: spacing.m,
    borderRadius: 16,
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
    borderColor: colors.textMutedLight + '20',
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
    borderTopWidth: 1,
    borderTopColor: colors.textMutedLight + '20',
    backgroundColor: colors.backgroundLight,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: spacing.m,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 40,
    maxHeight: 100,
    ...typography.body,
    color: colors.textMainLight,
    borderWidth: 1,
    borderColor: colors.textMutedLight + '20',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.s,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMutedLight,
  }
});
