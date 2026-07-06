import { io } from 'socket.io-client';
import { BASE_URL } from './apiSlice';
import { store } from '../store/store';
import { incrementUnreadCount, updateConversationLastMessage } from '../store/slices/chatSlice';

import { chatApi } from './chatApi';

class SocketService {
  constructor() {
    this.socket = null;
    this._listeners = {}; // internal event bus for service-level events
  }

  // ─── Internal event bus ──────────────────────────────────────────────────────
  _emit(event, ...args) {
    if (this._listeners[event]) {
      this._listeners[event].forEach(fn => fn(...args));
    }
  }

  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
    return () => this.off(event, fn); // returns an unsubscribe function
  }

  off(event, fn) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(f => f !== fn);
    }
  }
  // ─────────────────────────────────────────────────────────────────────────────

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Build socket URL: strip /api suffix, keep protocol as https/http (socket.io handles ws upgrade)
    const socketUrl = BASE_URL.replace(/\/api$/, '');

    console.log('[SocketService] Connecting to:', socketUrl);

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('[SocketService] Connected:', this.socket.id);
      this._emit('connected', this.socket);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SocketService] connect_error:', error.message);
      this._emit('connect_error', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SocketService] Disconnected:', reason);
      this._emit('disconnected', reason);
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

      // 4. Show Toast notification if not currently viewing that chat
      if (message.sender_id !== currentUserId) {
        const { navigationRef } = require('../../App');
        const currentRoute = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
        
        const isCurrentlyViewingChat = 
          currentRoute?.name === 'Chat' && 
          currentRoute?.params?.conversationId === message.conversation_id;

        if (!isCurrentlyViewingChat) {
          const Toast = require('react-native-toast-message').default;
          Toast.show({
            type: 'customNotification',
            text1: `New message from ${message.sender?.display_name || 'Someone'}`,
            text2: message.content,
            onPress: () => {
              if (navigationRef.isReady()) {
                navigationRef.navigate('Chat', {
                  conversationId: message.conversation_id,
                  otherParticipant: message.sender,
                });
              }
            },
          });
        }
      }
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

  isConnected() {
    return this.socket?.connected === true;
  }
}

export default new SocketService();
