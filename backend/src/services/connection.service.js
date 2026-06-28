import supabase from '../config/supabase.js';

class ConnectionService {
  /**
   * Follow a user
   */
  async followUser(followerId, followingId) {
    if (followerId === followingId) {
      throw new Error('You cannot follow yourself');
    }

    const { error } = await supabase
      .from('connections')
      .insert({ follower_id: followerId, following_id: followingId });

    if (error) {
      if (error.code === '23505') {
        throw new Error('You are already following this user');
      }
      throw new Error(error.message);
    }
    return { success: true };
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId, followingId) {
    const { error } = await supabase
      .from('connections')
      .delete()
      .match({ follower_id: followerId, following_id: followingId });

    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  }

  /**
   * Get followers of a user
   */
  async getFollowers(userId) {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        follower_id,
        users!connections_follower_id_fkey(id, username, display_name, avatar_url, artist_profiles(full_name), hiring_profiles(company_name))
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Flatten the nested relation
    return data.map(conn => {
      const u = conn.users;
      return {
        id: u.id,
        username: u.username,
        avatar_url: u.avatar_url,
        name: u.display_name || u.artist_profiles?.full_name || u.hiring_profiles?.company_name || 'User'
      };
    });
  }

  /**
   * Get users someone is following
   */
  async getFollowing(userId) {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        following_id,
        users!connections_following_id_fkey(id, username, display_name, avatar_url, artist_profiles(full_name), hiring_profiles(company_name))
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map(conn => {
      const u = conn.users;
      return {
        id: u.id,
        username: u.username,
        avatar_url: u.avatar_url,
        name: u.display_name || u.artist_profiles?.full_name || u.hiring_profiles?.company_name || 'User'
      };
    });
  }

  /**
   * Search users by handle or name (wildcard)
   */
  async searchUsers(query, currentUserId) {
    if (!query || query.length < 2) return [];

    const searchTerm = `%${query}%`;
    
    // We will query 'users' directly.
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, 
        username, 
        display_name, 
        avatar_url,
        artist_profiles (full_name),
        hiring_profiles (company_name)
      `)
      .neq('id', currentUserId)
      .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
      .limit(50);

    if (error) throw new Error(error.message);
    
    const { data: artistData, error: artistErr } = await supabase
      .from('artist_profiles')
      .select('user_id')
      .ilike('full_name', searchTerm);
      
    let additionalIds = [];
    if (!artistErr && artistData) {
        additionalIds = artistData.map(a => a.user_id);
    }
    
    // Fetch those additional users if any
    let combinedData = [...data];
    if (additionalIds.length > 0) {
        const existingIds = new Set(data.map(u => u.id));
        const idsToFetch = additionalIds.filter(id => !existingIds.has(id));
        
        if (idsToFetch.length > 0) {
            const { data: extraUsers } = await supabase
              .from('users')
              .select('id, username, display_name, avatar_url, artist_profiles(full_name), hiring_profiles(company_name)')
              .in('id', idsToFetch);
              
            if (extraUsers) {
                combinedData = [...combinedData, ...extraUsers];
            }
        }
    }

    return combinedData.map(u => ({
      id: u.id,
      username: u.username,
      avatar_url: u.avatar_url,
      name: u.display_name || u.artist_profiles?.full_name || u.hiring_profiles?.company_name || 'User'
    }));
  }

  /**
   * Get public profile by username
   */
  async getPublicProfile(username, currentUserId) {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, username, display_name, avatar_url, followers_count, following_count, role,
        artist_profiles (full_name, bio, categories, city, photo_urls, video_url, audio_url),
        hiring_profiles (company_name, description, logo_url)
      `)
      .eq('username', username)
      .single();

    if (error || !user) throw new Error('User not found');

    // Check if current user is following this profile
    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const { data: conn } = await supabase
        .from('connections')
        .select('created_at')
        .match({ follower_id: currentUserId, following_id: user.id })
        .single();
        
      if (conn) isFollowing = true;
    }

    return {
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      name: user.display_name || user.artist_profiles?.full_name || user.hiring_profiles?.company_name || 'User',
      followers_count: user.followers_count || 0,
      following_count: user.following_count || 0,
      is_following: isFollowing,
      role: user.role,
      profile: user.role === 'artist' ? user.artist_profiles : user.hiring_profiles
    };
  }
}

export default new ConnectionService();
