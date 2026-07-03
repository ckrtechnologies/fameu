import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [], // Will hold list of conversations with unread_count
  totalUnreadCount: 0,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
      // Recalculate total unread
      state.totalUnreadCount = action.payload.reduce((total, conv) => total + (conv.unread_count || 0), 0);
    },
    updateConversationLastMessage: (state, action) => {
      const { conversationId, lastMessage } = action.payload;
      const conv = state.conversations.find(c => c.id === conversationId);
      if (conv) {
        conv.last_message = lastMessage;
        conv.updated_at = new Date().toISOString();
      }
      
      // Sort conversations by updated_at desc
      state.conversations.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    },
    incrementUnreadCount: (state, action) => {
      const { conversationId } = action.payload;
      const conv = state.conversations.find(c => c.id === conversationId);
      if (conv) {
        conv.unread_count = (conv.unread_count || 0) + 1;
      }
      state.totalUnreadCount += 1;
    },
    markConversationAsRead: (state, action) => {
      const { conversationId } = action.payload;
      const conv = state.conversations.find(c => c.id === conversationId);
      if (conv && conv.unread_count > 0) {
        state.totalUnreadCount -= conv.unread_count;
        conv.unread_count = 0;
      }
    }
  },
});

export const { 
  setConversations, 
  updateConversationLastMessage, 
  incrementUnreadCount, 
  markConversationAsRead 
} = chatSlice.actions;

export default chatSlice.reducer;
