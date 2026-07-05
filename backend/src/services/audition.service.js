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
    // For MVP testing, bypassing credit checks:
    // if (profile.credits <= 0) throw new Error('Insufficient credits to post an audition');

    // 2. Insert Audition
    const { project_type, duration_type, city, description_pdf_url, thumbnail_url, budget, gender_req, specific_start_date, specific_end_date, ...restData } = auditionData;
    const extraMeta = JSON.stringify({
      project_type, duration_type, city, description_pdf_url, budget, gender_req, specific_start_date, specific_end_date
    });

    const payload = {
      hiring_id: hiringId,
      ...restData,
      compensation: budget || restData.compensation,
      instructions: extraMeta,
      thumbnail_url: thumbnail_url || restData.thumbnail_url || null,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('auditions')
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(`Failed to create audition: ${error.message}`);

    // 3. Deduct credit (Simple approach for MVP)
    // await supabase.from('hiring_profiles').update({ credits: profile.credits - 1 }).eq('id', hiringId);

    return data;
  }

  /**
   * Update an existing audition
   */
  async updateAudition(hiringId, auditionId, auditionData) {
    const { project_type, duration_type, city, description_pdf_url, thumbnail_url, budget, gender_req, specific_start_date, specific_end_date, ...restData } = auditionData;
    const extraMeta = JSON.stringify({
      project_type, duration_type, city, description_pdf_url, budget, gender_req, specific_start_date, specific_end_date
    });
    
    const payload = {
      ...restData,
      instructions: extraMeta,
      thumbnail_url: thumbnail_url || restData.thumbnail_url || null,
      updated_at: new Date().toISOString()
    };
    if (budget) payload.compensation = budget;

    const { data, error } = await supabase
      .from('auditions')
      .update(payload)
      .eq('id', auditionId)
      .eq('hiring_id', hiringId) // Security check
      .select()
      .single();

    if (error) throw new Error(`Failed to update audition: ${error.message}`);
    return data;
  }

  /**
   * Delete an audition and its related records
   */
  async deleteAudition(hiringId, auditionId) {
    // Manually delete dependent records to ensure cascade behavior
    await supabase.from('applications').delete().eq('audition_id', auditionId);
    await supabase.from('bookmarks').delete().eq('audition_id', auditionId);
    await supabase.from('checkins').delete().eq('audition_id', auditionId);

    const { data, error } = await supabase
      .from('auditions')
      .delete()
      .eq('id', auditionId)
      .eq('hiring_id', hiringId)
      .select()
      .single();

    if (error) throw new Error(`Failed to delete audition: ${error.message}`);
    return data;
  }

  /**
   * Fetch all auditions posted by a specific hiring company
   */
  async getCompanyAuditions(hiringId) {
    const { data, error } = await supabase
      .from('auditions')
      .select('*, applications(count)')
      .eq('hiring_id', hiringId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch auditions: ${error.message}`);
    
    return data.map(item => {
      const applicant_count = item.applications?.[0]?.count || 0;
      delete item.applications;
      let extraMeta = {};
      try { if (item.instructions && item.instructions.startsWith('{')) extraMeta = JSON.parse(item.instructions); } catch(e) {}
      return {
        ...item,
        ...extraMeta,
        applicant_count
      };
    });
  }

  /**
   * Discover Feed (Artist App)
   * Supports filtering by category, gender, and geographic bounding box (for map)
   */
  async discoverAuditions(filters = {}) {
    let query = supabase.from('auditions').select('*, hiring_profiles(company_name, logo_url, users(username))').eq('status', 'active');

    // Existing Filters
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.audition_type) query = query.eq('audition_type', filters.audition_type);
    if (filters.hiring_id) query = query.eq('hiring_id', filters.hiring_id);
    if (filters.is_live === 'true' || filters.is_live === true) query = query.eq('is_live', true);
    
    // Note: project_type, city, duration_type, budget are stored in JSON inside instructions
    // we will filter them in JS below.
    if (filters.gender_req) query = query.eq('gender', filters.gender_req);
    if (filters.age_min) query = query.lte('age_min', filters.age_min);
    if (filters.age_max) query = query.gte('age_max', filters.age_max);

    // Simple Bounding Box approach for Google Maps
    if (filters.minLat && filters.maxLat && filters.minLng && filters.maxLng) {
      query = query
        .gte('lat', filters.minLat)
        .lte('lat', filters.maxLat)
        .gte('lng', filters.minLng)
        .lte('lng', filters.maxLng);
    }

    // Sorting
    if (filters.sort_by === 'Popular') {
      // For popular, we would sort by applicant_count or views if tracked.
      // Since we don't track applicant_count in auditions table directly without aggregation, 
      // fallback to basic created_at or if you have a view_count column:
      query = query.order('created_at', { ascending: false }); 
    } else if (filters.sort_by === 'Recent') {
      query = query.order('created_at', { ascending: false });
    } else {
      // 'Relevant' or default
      query = query.order('created_at', { ascending: false });
    }

    query = query.limit(200); // fetch more to filter locally

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch discover feed: ${error.message}`);
    
    let results = data.map(item => {
      let extraMeta = {};
      try { if (item.instructions && item.instructions.startsWith('{')) extraMeta = JSON.parse(item.instructions); } catch(e) {}
      return { ...item, ...extraMeta };
    });

    if (filters.project_type) results = results.filter(i => i.project_type === filters.project_type);
    if (filters.city) results = results.filter(i => i.city && i.city.toLowerCase() === filters.city.toLowerCase());
    if (filters.duration_type) results = results.filter(i => i.duration_type === filters.duration_type);
    if (filters.budget) results = results.filter(i => i.budget === filters.budget || i.compensation === filters.budget);
    
    return results.slice(0, 50);
  }

  /**
   * Get Single Audition Details (Increment view count)
   */
  async getAuditionDetails(auditionId, userId = null) {
    const { data, error } = await supabase
      .from('auditions')
      .select('*, hiring_profiles(user_id, company_name, description, logo_url, is_verified, users(username)), applications(count)')
      .eq('id', auditionId)
      .single();
      
    if (data) {
      try { if (data.instructions && data.instructions.startsWith('{')) Object.assign(data, JSON.parse(data.instructions)); } catch(e) {}
    }

    if (error) throw new Error('Audition not found');

    let has_applied = false;
    let is_bookmarked = false;

    if (userId) {
      const { data: profile } = await supabase
        .from('artist_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
        
      if (profile) {
        const { data: app } = await supabase
          .from('applications')
          .select('id')
          .eq('artist_id', profile.id)
          .eq('audition_id', auditionId)
          .limit(1);
        if (app && app.length > 0) has_applied = true;

        const { data: bookmark } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('artist_id', profile.id)
          .eq('audition_id', auditionId)
          .limit(1);
        if (bookmark && bookmark.length > 0) is_bookmarked = true;
      }
    }

    // Increment views async (don't await to save latency)
    supabase.rpc('increment_audition_view', { audition_row_id: auditionId }).then(() => {}).catch(() => {});

    const applicant_count = data.applications?.[0]?.count || 0;
    delete data.applications;

    return {
      ...data,
      applicant_count,
      has_applied,
      is_bookmarked,
    };
  }

  /**
   * Bookmark an audition
   */
  async toggleBookmark(userId, auditionId) {
    const { data: profile } = await supabase
      .from('artist_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (!profile) throw new Error('Artist profile not found');
    const artistProfileId = profile.id;

    // Check if exists
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('artist_id', artistProfileId)
      .eq('audition_id', auditionId)
      .single();

    if (existing) {
      await supabase.from('bookmarks').delete().eq('id', existing.id);
      return { bookmarked: false };
    } else {
      await supabase.from('bookmarks').insert([{ artist_id: artistProfileId, audition_id: auditionId }]);
      return { bookmarked: true };
    }
  }

  /**
   * Walk-in Check-in
   */
  async checkInWalkin(userId, auditionId, lat, lng) {
    const { data: profile } = await supabase
      .from('artist_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (!profile) throw new Error('Artist profile not found');
    const artistProfileId = profile.id;

    const { data, error } = await supabase
      .from('checkins')
      .insert([{ artist_id: artistProfileId, audition_id: auditionId, lat, lng }])
      .select()
      .single();

    if (error) throw new Error(`Check-in failed: ${error.message}`);
    return data;
  }
  /**
   * Get saved auditions
   */
  async getSavedAuditions(userId) {
    const { data: profile } = await supabase
      .from('artist_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (!profile) return [];

    const { data, error } = await supabase
      .from('bookmarks')
      .select('audition_id, created_at, auditions(*, hiring_profiles(company_name, logo_url))')
      .eq('artist_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch bookmarks: ${error.message}`);
    
    // Transform into standard audition feed format and filter out nulls
    return data
      .filter(b => b.auditions != null)
      .map(b => ({
        ...b.auditions,
        bookmarked_at: b.created_at,
        is_bookmarked: true
      }));
  }
}

export default new AuditionService();
