import jwt from 'jsonwebtoken';
import chatService from '../services/chat.service.js';

export default (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const secret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'super-secret-dev-key';
      const decoded = jwt.verify(token, secret);
      
      socket.user = {
        id: decoded.sub,
        role: decoded.role || 'artist'
      };
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User Connected: ${socket.user.id} (${socket.user.role})`);

    // 1. Join personal room (for global notifications / incoming chats)
    socket.join(socket.user.id);

    // 2. Join a specific conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.user.id} joined conversation: ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.user.id} left conversation: ${conversationId}`);
    });

    // 3. Send Message
    socket.on('send_message', async (data, callback) => {
      try {
        const { conversationId, content } = data;
        
        if (!conversationId || !content) {
          if (typeof callback === 'function') callback({ success: false, error: 'Missing data' });
          return;
        }

        // Check if the receiving user is currently in this conversation room
        let skipPushNotification = false;
        const room = io.sockets.adapter.rooms.get(conversationId);
        if (room) {
          for (const socketId of room) {
            const clientSocket = io.sockets.sockets.get(socketId);
            if (clientSocket && clientSocket.user.id !== socket.user.id) {
              // The receiver is actively connected to this chat room
              skipPushNotification = true;
              break;
            }
          }
        }

        // Save to Supabase DB via ChatService
        const savedMessage = await chatService.saveMessage(conversationId, socket.user.id, content, skipPushNotification);

        // Broadcast to everyone in that conversation room
        io.to(conversationId).emit('receive_message', savedMessage);
        
        // Also emit to the receiver's personal room so their global socket listener picks it up
        if (savedMessage.receiver_id) {
          io.to(savedMessage.receiver_id).emit('receive_message', savedMessage);
        }
        
        // Callback to sender for UI confirmation
        if (typeof callback === 'function') callback({ success: true, data: savedMessage });
        
      } catch (err) {
        console.error('Socket Send Message Error:', err);
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // 4. Mark Messages as Read
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        if (!conversationId) return;
        
        await chatService.markMessagesAsRead(conversationId, socket.user.id);
        
        // Notify the other user that their messages were read (optional, for read receipts feature)
        socket.to(conversationId).emit('messages_read', { 
          conversationId, 
          readByUserId: socket.user.id 
        });
      } catch (err) {
        console.error('Socket Mark Read Error:', err);
      }
    });

    // 5. Typing Indicators
    socket.on('typing', ({ conversationId, isTyping }) => {
      // Broadcast to the room, EXCEPT the sender
      socket.to(conversationId).emit('user_typing', { 
        userId: socket.user.id, 
        isTyping 
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User Disconnected: ${socket.user.id}`);
    });
  });
};
