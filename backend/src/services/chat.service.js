import supabase from '../config/supabase.js';

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

    // Map to an easier format for the frontend (which expects 'other_participant' and last_message)
    const formattedData = data.map(conv => {
      const isParticipant1 = conv.participant1_id === userId;
      const otherParticipant = isParticipant1 ? conv.participant2 : conv.participant1;

      return {
        id: conv.id,
        updated_at: conv.updated_at,
        last_message: conv.last_message,
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
  async saveMessage(conversationId, senderId, content) {
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
    await supabase
      .from('conversations')
      .update({ 
        updated_at: new Date().toISOString(),
        last_message: content
      })
      .eq('id', conversationId);
    
    return data;
  }
}

export default new ChatService();
