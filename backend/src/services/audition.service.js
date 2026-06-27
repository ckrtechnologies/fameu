import supabase from '../config/supabase.js';

class AuditionService {
  /**
   * Create a new audition (Hiring App)
   */
  async createAudition(hiringId, auditionData) {
    // 1. Check if they have credits
    const { data: profile, error: profErr } = await supabase
      .from('hiring_profiles')
      .select('credits')
      .eq('id', hiringId)
      .single();

    if (profErr || !profile) throw new Error('Hiring profile not found');
    if (profile.credits <= 0) throw new Error('Insufficient credits to post an audition');

    // 2. Insert Audition
    const payload = {
      hiring_id: hiringId,
      ...auditionData,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('auditions')
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(`Failed to create audition: ${error.message}`);

    // 3. Deduct credit (Simple approach for MVP)
    await supabase.from('hiring_profiles').update({ credits: profile.credits - 1 }).eq('id', hiringId);

    return data;
  }

  /**
   * Update an existing audition
   */
  async updateAudition(hiringId, auditionId, auditionData) {
    const { data, error } = await supabase
      .from('auditions')
      .update({ ...auditionData, updated_at: new Date().toISOString() })
      .eq('id', auditionId)
      .eq('hiring_id', hiringId) // Security check
      .select()
      .single();

    if (error) throw new Error(`Failed to update audition: ${error.message}`);
    return data;
  }

  /**
   * Fetch all auditions posted by a specific hiring company
   */
  async getCompanyAuditions(hiringId) {
    const { data, error } = await supabase
      .from('auditions')
      .select('*')
      .eq('hiring_id', hiringId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch auditions: ${error.message}`);
    return data;
  }

  /**
   * Discover Feed (Artist App)
   * Supports filtering by category, gender, and geographic bounding box (for map)
   */
  async discoverAuditions(filters = {}) {
    let query = supabase.from('auditions').select('*, hiring_profiles(company_name, logo_url)').eq('status', 'active');

    if (filters.category) query = query.eq('category', filters.category);
    if (filters.gender) query = query.eq('gender', filters.gender);
    if (filters.audition_type) query = query.eq('audition_type', filters.audition_type);
    
    // Simple Bounding Box approach for Google Maps
    if (filters.minLat && filters.maxLat && filters.minLng && filters.maxLng) {
      query = query
        .gte('lat', filters.minLat)
        .lte('lat', filters.maxLat)
        .gte('lng', filters.minLng)
        .lte('lng', filters.maxLng);
    }

    query = query.order('created_at', { ascending: false }).limit(50);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch discover feed: ${error.message}`);
    return data;
  }

  /**
   * Get Single Audition Details (Increment view count)
   */
  async getAuditionDetails(auditionId) {
    const { data, error } = await supabase
      .from('auditions')
      .select('*, hiring_profiles(company_name, description, logo_url, is_verified)')
      .eq('id', auditionId)
      .single();

    if (error) throw new Error('Audition not found');

    // Increment views async (don't await to save latency)
    supabase.rpc('increment_audition_view', { audition_row_id: auditionId }).catch(() => {});

    return data;
  }

  /**
   * Bookmark an audition
   */
  async toggleBookmark(artistId, auditionId) {
    // Check if exists
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('artist_id', artistId)
      .eq('audition_id', auditionId)
      .single();

    if (existing) {
      await supabase.from('bookmarks').delete().eq('id', existing.id);
      return { bookmarked: false };
    } else {
      await supabase.from('bookmarks').insert([{ artist_id: artistId, audition_id: auditionId }]);
      return { bookmarked: true };
    }
  }

  /**
   * Walk-in Check-in
   */
  async checkInWalkin(artistId, auditionId, lat, lng) {
    const { data, error } = await supabase
      .from('checkins')
      .insert([{ artist_id: artistId, audition_id: auditionId, lat, lng }])
      .select()
      .single();

    if (error) throw new Error(`Check-in failed: ${error.message}`);
    return data;
  }
}

export default new AuditionService();
