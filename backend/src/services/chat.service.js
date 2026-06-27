import supabase from '../config/supabase.js';

class ChatService {
  /**
   * Get or Create a conversation between two users
   * Usually initiated by the Hiring App when shortlisting an artist
   */
  async getOrCreateConversation(user1Id, user2Id, auditionId = null) {
    // 1. Check if conversation already exists between these two users
    let query = supabase
      .from('conversations')
      .select('id')
      .or(`and(artist_id.eq.${user1Id},hiring_id.eq.${user2Id}),and(artist_id.eq.${user2Id},hiring_id.eq.${user1Id})`);
    
    if (auditionId) {
      query = query.eq('audition_id', auditionId);
    }

    const { data: existing, error: findErr } = await query.single();
    
    if (existing && !findErr) {
      return existing;
    }

    // 2. Determine who is who (assume user roles are checked elsewhere, but we can safely store them)
    // We will assume user1 is artist and user2 is hiring for simplicity, or we look it up.
    // For a robust system, we check their roles.
    const { data: user1 } = await supabase.from('users').select('role').eq('id', user1Id).single();
    const { data: user2 } = await supabase.from('users').select('role').eq('id', user2Id).single();
    
    const artistId = user1?.role === 'artist' ? user1Id : user2Id;
    const hiringId = user1?.role === 'hiring' ? user1Id : user2Id;

    if (!artistId || !hiringId) {
      throw new Error('Conversation must be between an artist and a hiring company');
    }

    // 3. Create it
    const { data: newConv, error: createErr } = await supabase
      .from('conversations')
      .insert([{ artist_id: artistId, hiring_id: hiringId, audition_id: auditionId }])
      .select()
      .single();

    if (createErr) throw new Error(`Failed to create conversation: ${createErr.message}`);
    return newConv;
  }

  /**
   * Fetch user's inbox
   */
  async getConversations(userId) {
    // A user can be either artist or hiring. We use OR.
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        artist:users!artist_id(display_name, avatar_url),
        hiring:users!hiring_id(display_name, avatar_url),
        audition:auditions(title)
      `)
      .or(`artist_id.eq.${userId},hiring_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch inbox: ${error.message}`);
    return data;
  }

  /**
   * Fetch messages for a conversation
   */
  async getMessages(conversationId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
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
    
    // Update the updated_at timestamp on the conversation for sorting the inbox
    await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
    
    return data;
  }
}

export default new ChatService();
