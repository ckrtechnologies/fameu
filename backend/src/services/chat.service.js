import supabase from '../config/supabase.js';
import notificationService from './notification.service.js';

class ChatService {
  /**
   * Get or Create a conversation between two users
   */
  async getOrCreateConversation(user1Id, user2Id) {
    // Ensure consistent order so we don't have duplicate (A,B) and (B,A)
    const p1 = user1Id < user2Id ? user1Id : user2Id;
    const p2 = user1Id < user2Id ? user2Id : user1Id;

    // 1. Check if conversation already exists
    const { data: existing, error: findErr } = await supabase
      .from('conversations')
      .select('*')
      .eq('participant1_id', p1)
      .eq('participant2_id', p2)
      .single();
    
    if (existing && !findErr) {
      return existing;
    }

    // 2. Create it
    const { data: newConv, error: createErr } = await supabase
      .from('conversations')
      .insert([{ participant1_id: p1, participant2_id: p2 }])
      .select()
      .single();

    if (createErr) throw new Error(`Failed to create conversation: ${createErr.message}`);
    return newConv;
  }

  /**
   * Fetch user's inbox
   */
  async getConversations(userId) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:users!fk_participant1(id, email, role, display_name, avatar_url, artist_profiles(full_name, photo_urls), hiring_profiles(company_name, logo_url)),
        participant2:users!fk_participant2(id, email, role, display_name, avatar_url, artist_profiles(full_name, photo_urls), hiring_profiles(company_name, logo_url))
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch inbox: ${error.message}`);

    // Fetch unread messages count for this user
    const { data: unreadMessages } = await supabase
      .from('messages')
      .select('conversation_id')
      .neq('sender_id', userId)
      .eq('is_read', false);

    const unreadMap = {};
    if (unreadMessages) {
      unreadMessages.forEach(msg => {
        unreadMap[msg.conversation_id] = (unreadMap[msg.conversation_id] || 0) + 1;
      });
    }

    // Map to an easier format for the frontend (which expects 'other_participant' and last_message)
    const formattedData = data.map(conv => {
      const isParticipant1 = conv.participant1_id === userId;
      const otherParticipant = isParticipant1 ? conv.participant2 : conv.participant1;

      return {
        id: conv.id,
        updated_at: conv.updated_at,
        last_message: conv.last_message,
        unread_count: unreadMap[conv.id] || 0,
        other_participant: otherParticipant
      };
    });

    return formattedData;
  }

  /**
   * Fetch messages for a conversation
   */
  async getMessages(conversationId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false }) // frontend expects newest first usually
      .limit(100);

    if (error) throw new Error(`Failed to fetch messages: ${error.message}`);
    return data;
  }

  /**
   * Save a new message (Used by Socket.io)
   */
  async saveMessage(conversationId, senderId, content, skipPushNotification = false) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: senderId,
        content: content
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to save message: ${error.message}`);
    
    // Update the last_message and updated_at on conversations
    const { data: conv } = await supabase
      .from('conversations')
      .update({ 
        updated_at: new Date().toISOString(),
        last_message: content
      })
      .eq('id', conversationId)
      .select('participant1_id, participant2_id')
      .single();
    
    let receiverId = null;
    if (conv) {
      receiverId = conv.participant1_id === senderId ? conv.participant2_id : conv.participant1_id;
      
      if (!skipPushNotification) {
        const { data: sender } = await supabase.from('users').select('display_name, avatar_url, artist_profiles(photo_urls), hiring_profiles(logo_url)').eq('id', senderId).single();
        const senderName = sender?.display_name || 'Someone';
        const senderAvatar = sender?.avatar_url || sender?.artist_profiles?.photo_urls?.[0] || sender?.hiring_profiles?.logo_url || null;

        // Count unread messages in this conversation for the receiver
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conversationId)
          .eq('sender_id', senderId)
          .eq('is_read', false);

        const title = unreadCount && unreadCount > 1 
          ? `${unreadCount} new messages from ${senderName}` 
          : `New message from ${senderName}`;

        await notificationService.sendPushNotification(
          receiverId,
          title,
          content,
          { 
            type: 'chat_message', 
            conversationId: String(conversationId),
            avatarUrl: senderAvatar || ''
          }
        );
      }
    }
    
    return { ...data, receiver_id: receiverId };
  }

  /**
   * Mark messages as read in a conversation
   */
  async markMessagesAsRead(conversationId, userId) {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false)
      .select();

    if (error) throw new Error(`Failed to mark messages as read: ${error.message}`);
    return data;
  }
}

export default new ChatService();
