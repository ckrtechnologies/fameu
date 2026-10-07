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
    if (query && query.length === 1) return []; // Require at least 2 chars if typing

    let dbQuery = supabase
      .from('users')
      .select(`
        id, 
        username, 
        display_name, 
        avatar_url,
        artist_profiles (full_name),
        hiring_profiles (company_name)
      `)
      .eq('is_blacklisted', false)
      .neq('id', currentUserId);

    if (query) {
      const searchTerm = `%${query}%`;
      dbQuery = dbQuery.or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm},email.ilike.${searchTerm},mobile.ilike.${searchTerm}`);
    }

    const { data, error } = await dbQuery.limit(50);
    if (error) throw new Error(error.message);
    
    let combinedData = [...data];

    // Additional search in profiles only if there is a query
    if (query) {
      const searchTerm = `%${query}%`;
      const { data: artistData, error: artistErr } = await supabase
        .from('artist_profiles')
        .select('user_id')
        .ilike('full_name', searchTerm);

      const { data: hiringData, error: hiringErr } = await supabase
        .from('hiring_profiles')
        .select('user_id')
        .ilike('company_name', searchTerm);
        
      let additionalIds = [];
      if (!artistErr && artistData) {
          additionalIds = additionalIds.concat(artistData.map(a => a.user_id));
      }
      if (!hiringErr && hiringData) {
          additionalIds = additionalIds.concat(hiringData.map(a => a.user_id));
      }
      
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
  /**
   * Record a profile visit — directly increments visit_count on the profile table.
   * Skips self-visits. Requires only: ALTER TABLE artist_profiles ADD COLUMN visit_count INTEGER DEFAULT 0;
   *                                    ALTER TABLE hiring_profiles ADD COLUMN visit_count INTEGER DEFAULT 0;
   */
  async recordProfileVisit(profileUserId, viewerId) {
    if (!profileUserId) return;

    try {
      let resolvedUserId = profileUserId;
      let userRole = null;

      // 1. Try resolving directly from users table
      const { data: userRow } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', profileUserId)
        .maybeSingle();

      if (userRow) {
        resolvedUserId = userRow.id;
        userRole = userRow.role;
      } else {
        // 2. Check if profileUserId is an artist_profiles id
        const { data: apRow } = await supabase
          .from('artist_profiles')
          .select('id, user_id')
          .eq('id', profileUserId)
          .maybeSingle();

        if (apRow) {
          resolvedUserId = apRow.user_id;
          userRole = 'artist';
        } else {
          // 3. Check if profileUserId is a hiring_profiles id
          const { data: hpRow } = await supabase
            .from('hiring_profiles')
            .select('id, user_id')
            .eq('id', profileUserId)
            .maybeSingle();

          if (hpRow) {
            resolvedUserId = hpRow.user_id;
            userRole = 'hiring';
          }
        }
      }

      // If userRole couldn't be determined, query artist_profiles fallback
      if (!userRole) {
        const { data: apFallback } = await supabase
          .from('artist_profiles')
          .select('id, user_id')
          .eq('user_id', resolvedUserId)
          .maybeSingle();
        if (apFallback) userRole = 'artist';
      }

      // Skip self-visits (don't increment stats or record self as a visitor)
      if (!viewerId || viewerId === resolvedUserId) {
        return;
      }

      if (userRole === 'artist') {
        const { data: ap } = await supabase
          .from('artist_profiles')
          .select('visit_count')
          .eq('user_id', resolvedUserId)
          .maybeSingle();

        const newCount = (ap?.visit_count || 0) + 1;
        await supabase
          .from('artist_profiles')
          .update({ visit_count: newCount })
          .eq('user_id', resolvedUserId);

      } else if (userRole === 'hiring') {
        const { data: hp } = await supabase
          .from('hiring_profiles')
          .select('visit_count')
          .eq('user_id', resolvedUserId)
          .maybeSingle();

        const newCount = (hp?.visit_count || 0) + 1;
        await supabase
          .from('hiring_profiles')
          .update({ visit_count: newCount })
          .eq('user_id', resolvedUserId);
      }

      // Track individual visitor and their visit frequency
      const { data: existingVisit } = await supabase
        .from('profile_visits')
        .select('id, visit_count')
        .eq('profile_user_id', resolvedUserId)
        .eq('viewer_id', viewerId)
        .maybeSingle();

      if (existingVisit) {
        const nextCount = (existingVisit.visit_count || 1) + 1;
        await supabase
          .from('profile_visits')
          .update({
            visit_count: nextCount,
            visit_date: new Date().toISOString()
          })
          .eq('id', existingVisit.id);
      } else {
        await supabase
          .from('profile_visits')
          .insert({
            profile_user_id: resolvedUserId,
            viewer_id: viewerId,
            visit_count: 1,
            visit_date: new Date().toISOString()
          });
      }
    } catch (err) {
      console.warn('recordProfileVisit error:', err.message);
    }
  }

  /**
   * Get public profile by username
   */
  async getPublicProfile(username, currentUserId) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
    const queryColumn = isUUID ? 'id' : 'username';

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, username, display_name, email, mobile, avatar_url, followers_count, following_count, role,
        artist_profiles (*),
        hiring_profiles (*)
      `)
      .eq(queryColumn, username)
      .single();

    if (error || !user) throw new Error('User not found');

    let rawProfile = user.role === 'artist' ? user.artist_profiles : user.hiring_profiles;
    let profile = Array.isArray(rawProfile) ? (rawProfile[0] || null) : (rawProfile || null);

    if (user.role === 'artist' && profile) {
      profile.category_details = {};
      if (profile.categories && profile.categories.length > 0) {
        const { data: details } = await supabase
          .from('artist_dynamic_details')
          .select('*')
          .eq('artist_id', profile.id)
          .in('category_name', profile.categories);
          
        if (details) {
          details.forEach(d => {
            profile.category_details[d.category_name] = d.details;
          });
        }
      }
    }

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

    const [{ count: followersCount }, { count: followingCount }, { count: visitorsCount }] = await Promise.all([
      supabase.from('connections').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
      supabase.from('connections').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
      supabase.from('profile_visits').select('*', { count: 'exact', head: true }).eq('profile_user_id', user.id)
    ]);

    const totalViews = Math.max(Number(profile?.visit_count || 0), Number(visitorsCount || 0));

    return {
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      name: user.display_name || user.artist_profiles?.full_name || user.hiring_profiles?.company_name || 'User',
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
      visit_count: totalViews,
      is_following: isFollowing,
      role: user.role,
      email: user.email,
      mobile: user.mobile,
      profile: profile
    };
  }

  /**
   * Get list of profile visitors
   */
  async getProfileVisitors(userId) {
    // Get visitors from profile_visits joined with users
    const { data, error } = await supabase
      .from('profile_visits')
      .select(`
        visit_date,
        visit_count,
        users!profile_visits_viewer_id_fkey (
          id,
          display_name,
          avatar_url,
          role,
          artist_profiles ( full_name ),
          hiring_profiles ( company_name )
        )
      `)
      .eq('profile_user_id', userId)
      .order('visit_date', { ascending: false });

    if (error) {
      console.error('Error fetching profile visitors:', error);
      throw new Error('Failed to fetch profile visitors');
    }

    // Format the response
    return data.map(v => {
      const user = v.users;
      let name = user?.display_name;
      if (!name) {
        if (user?.role === 'artist' && user?.artist_profiles?.[0]) name = user.artist_profiles[0].full_name;
        else if (user?.role === 'hiring' && user?.hiring_profiles?.[0]) name = user.hiring_profiles[0].company_name;
        else name = 'User';
      }
      return {
        id: user?.id,
        name: name,
        avatar_url: user?.avatar_url,
        role: user?.role,
        visited_at: v.visit_date,
        visit_count: v.visit_count || 1
      };
    });
  }
}

export default new ConnectionService();

