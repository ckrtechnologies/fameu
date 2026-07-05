import { io } from 'socket.io-client';
import { BASE_URL } from './apiSlice';
import { store } from '../store/store';
import { incrementUnreadCount, updateConversationLastMessage } from '../store/slices/chatSlice';

import { chatApi } from './chatApi';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    // Replace /api if baseUrl has it (e.g. http://10.0.2.2:3001/api -> http://10.0.2.2:3001)
    const socketUrl = BASE_URL.replace('/api', '');

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Global Socket connected:', this.socket.id);
    });

    // Listen to global receive_message event
    this.socket.on('receive_message', (message) => {
      // 1. Update last message in the store
      store.dispatch(updateConversationLastMessage({
        conversationId: message.conversation_id,
        lastMessage: message.content
      }));

      // 2. Increment unread count (if the message is not from us)
      const currentUserId = store.getState().auth.user?.id;
      if (message.sender_id !== currentUserId) {
        store.dispatch(incrementUnreadCount({ conversationId: message.conversation_id }));
      }
      
      // 3. Invalidate chat cache so Inbox updates and recalcs unread properly
      store.dispatch(chatApi.util.invalidateTags(['Chat']));

      // 4. Show Toast notification if we received a message from someone else
      // and we are not currently on that ChatScreen
      if (message.sender_id !== currentUserId) {
        const { navigationRef } = require('../../App');
        const currentRoute = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
        
        const isCurrentlyViewingChat = 
          currentRoute?.name === 'ChatScreen' && 
          currentRoute?.params?.conversationId === message.conversation_id;

        console.log('SocketService: currentRoute', currentRoute?.name, currentRoute?.params);
        console.log('SocketService: message.conversation_id', message.conversation_id);

        if (!isCurrentlyViewingChat) {
          const Toast = require('react-native-toast-message').default;
          Toast.show({
            type: 'customNotification',
            text1: `New message from ${message.sender?.display_name || 'Someone'}`,
            text2: message.content,
            onPress: () => {
              if (navigationRef.isReady()) {
                navigationRef.navigate('ChatScreen', {
                  conversationId: message.conversation_id,
                  otherUserName: message.sender?.display_name || 'User',
                });
              }
            },
          });
        }
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Global Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
