import supabase from '../config/supabase.js';
import { INDIAN_CITIES } from '../constants/cities.js';

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
    const { project_type, duration_type, city, description_pdf_url, thumbnail_url, budget, gender_req, specific_start_date, specific_end_date, mode, video_link, ...restData } = auditionData;
    
    // Validate city if present
    if (city && !INDIAN_CITIES.includes(city)) {
      throw new Error(`Invalid city: ${city}`);
    }

    const extraMeta = JSON.stringify({
      project_type, duration_type, city, description_pdf_url, budget, gender_req, specific_start_date, specific_end_date, video_link
    });

    const payload = {
      hiring_id: hiringId,
      ...restData,
      compensation: budget || restData.compensation,
      instructions: extraMeta,
      thumbnail_url: thumbnail_url || restData.thumbnail_url || null,
      mode: mode || 'Offline',
      status: 'active',
      is_live: true
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
    const { project_type, duration_type, city, description_pdf_url, thumbnail_url, budget, gender_req, specific_start_date, specific_end_date, mode, video_link, ...restData } = auditionData;
    const extraMeta = JSON.stringify({
      project_type, duration_type, city, description_pdf_url, budget, gender_req, specific_start_date, specific_end_date, video_link
    });
    
    const payload = {
      ...restData,
      instructions: extraMeta,
      thumbnail_url: thumbnail_url || restData.thumbnail_url || null,
      mode: mode || undefined,
      updated_at: new Date().toISOString(),
      is_live: true
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
  /**
   * Discover Feed (Artist App)
   * Supports filtering by category, gender, project_type, duration_type, budget, mode, city, and sorting
   */
  async discoverAuditions(filters = {}, userId = null) {
    let query = supabase.from('auditions').select('*, hiring_profiles(company_name, logo_url, users(username, is_blacklisted))');
    
    if (filters.status) {
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
    } else if (!filters.hiring_id) {
      query = query.eq('status', 'active');
    }

    // Home Screen specific filters
    if (filters.filter === 'live' || filters.is_live === 'true' || filters.is_live === true) {
      // Use IST timezone to match user's local time accurately
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      query = query.eq('audition_date', today);
    }

    if (filters.filter === 'trending' || filters.sort_by === 'popular') {
      query = query.order('view_count', { ascending: false });
    }

    if (filters.filter === 'relevant' && userId) {
      // Fetch artist profile to match category
      const { data: profile } = await supabase.from('artist_profiles').select('categories').eq('user_id', userId).single();
      if (profile && Array.isArray(profile.categories) && profile.categories.length > 0) {
        filters.category = profile.categories.join(',');
      }
    }

    // Category Filter (Case-insensitive & Tokenized)
    if (filters.category && filters.category !== 'All' && filters.category !== 'Any') {
      let catArray = [];
      filters.category.split(',').forEach(c => {
        c.split('/').forEach(subC => {
          const trimmed = subC.trim().replace(/^#/, '');
          if (trimmed && trimmed.toLowerCase() !== 'all' && trimmed.toLowerCase() !== 'any') {
            catArray.push(trimmed);
          }
        });
      });
      
      if (catArray.length > 0) {
        const orQuery = catArray.map(c => `category.ilike.%${c}%`).join(',');
        query = query.or(orQuery);
      }
    }

    if (filters.hiring_id) query = query.eq('hiring_id', filters.hiring_id);

    // Simple Bounding Box approach for Google Maps
    if (filters.minLat && filters.maxLat && filters.minLng && filters.maxLng) {
      query = query
        .gte('lat', filters.minLat)
        .lte('lat', filters.maxLat)
        .gte('lng', filters.minLng)
        .lte('lng', filters.maxLng);
    }

    // Sorting
    const sort = (filters.sort_by || '').toLowerCase();
    if (sort === 'popular' || sort === 'trending') {
      query = query.order('view_count', { ascending: false });
    } else if (sort === 'expiring_soon') {
      query = query.order('audition_date', { ascending: true, nullsFirst: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.limit(200); // Fetch candidate pool for local enrichment & flexible filtering

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch discover feed: ${error.message}`);
    
    // Normalization helper
    const normalize = (str) => (str ? String(str).toLowerCase().replace(/[-_\s]/g, '') : '');

    let results = data.map(item => {
      let extraMeta = {};
      try { 
        if (item.instructions && typeof item.instructions === 'string' && item.instructions.startsWith('{')) {
          extraMeta = JSON.parse(item.instructions);
        } 
      } catch(e) {}
      return { ...item, ...extraMeta };
    });

    // 0. Comprehensive Universal Keyword Search (Role, City, Project Type, Company Name, Description)
    if (filters.search && filters.search.trim()) {
      const searchTerms = filters.search.trim().toLowerCase().split(/\s+/).filter(Boolean);
      results = results.filter(i => {
        const searchableCorpus = [
          i.title,
          i.role_description,
          i.category,
          i.project_type,
          i.city,
          i.venue_address,
          i.mode,
          i.audition_type,
          i.compensation,
          i.budget,
          i.gender_req,
          i.gender,
          i.hiring_profiles?.company_name,
          i.hiring_profiles?.users?.username,
          typeof i.instructions === 'string' ? i.instructions : JSON.stringify(i.instructions || {})
        ].filter(Boolean).join(' ').toLowerCase();

        // Every search term must match somewhere in the corpus (supports "actor mumbai", "lead feature", etc.)
        return searchTerms.every(term => searchableCorpus.includes(term));
      });
    }

    // 1. Filter out blacklisted hiring agencies
    results = results.filter(i => !i.hiring_profiles?.users?.is_blacklisted);

    // 2. Project Type (Case-insensitive & format-resilient)
    if (filters.project_type && filters.project_type !== 'All') {
      const targetProj = normalize(filters.project_type);
      results = results.filter(i => {
        const itemProj = normalize(i.project_type);
        return itemProj === targetProj || itemProj.includes(targetProj) || targetProj.includes(itemProj);
      });
    }

    // 3. Mode / Audition Type (Online vs Offline / In-Person vs Walk-in)
    if (filters.mode && filters.mode !== 'All') {
      const targetMode = normalize(filters.mode);
      results = results.filter(i => {
        const itemMode = normalize(i.mode || i.audition_type || i.project_type);
        if (targetMode === 'online') return itemMode.includes('online') || itemMode.includes('selftape') || itemMode.includes('remote');
        if (targetMode === 'offline' || targetMode === 'inperson') return itemMode.includes('offline') || itemMode.includes('inperson') || itemMode.includes('venue') || itemMode.includes('walkin');
        if (targetMode === 'walkin') return itemMode.includes('walkin');
        return itemMode === targetMode;
      });
    }

    // 4. City / Location (Checks both city field and venue address)
    if (filters.city && filters.city !== 'All') {
      const targetCity = filters.city.toLowerCase().trim();
      results = results.filter(i => {
        const itemCity = (i.city || '').toLowerCase();
        const itemVenue = (i.venue_address || '').toLowerCase();
        return itemCity.includes(targetCity) || itemVenue.includes(targetCity) || targetCity.includes(itemCity);
      });
    }

    // 5. Duration Type (Full-time, Part-time, Date Specific)
    if (filters.duration_type && filters.duration_type !== 'All') {
      const targetDuration = normalize(filters.duration_type);
      results = results.filter(i => normalize(i.duration_type) === targetDuration);
    }

    // 6. Compensation / Paid Filtering
    if (filters.is_paid === true || filters.is_paid === 'true' || filters.is_paid === 'paid' || filters.min_budget) {
      results = results.filter(i => {
        const comp = (i.compensation || i.budget || '').toLowerCase().trim();
        if (!comp || comp === '0' || comp.includes('unpaid') || comp.includes('tfp') || comp.includes('expenses only')) {
          return false;
        }
        return true;
      });
    }

    if (filters.min_budget) {
      const cleanMin = String(filters.min_budget).replace(/[^\d]/g, '');
      const minVal = parseInt(cleanMin, 10);
      if (!isNaN(minVal) && minVal > 0) {
        results = results.filter(i => {
          const compStr = String(i.compensation || i.budget || '');
          const numericMatch = compStr.replace(/[^\d]/g, '');
          if (numericMatch) {
            const parsedNum = parseInt(numericMatch, 10);
            return parsedNum >= minVal;
          }
          return false;
        });
      }
    }

    // 7. Gender Filter
    if (filters.gender_req && filters.gender_req !== 'All' && filters.gender_req !== 'Any') {
      const targetGender = filters.gender_req.toLowerCase().trim();
      results = results.filter(i => {
        const itemReq = (i.gender_req || i.gender || '').toLowerCase().trim();
        return !itemReq || itemReq === 'any' || itemReq === 'all' || itemReq === targetGender;
      });
    }

    // 8. Age Range Filter
    if (filters.age_min) {
      const actorMin = parseInt(filters.age_min, 10) || 0;
      results = results.filter(i => {
        const audMax = parseInt(i.age_max, 10) || 100;
        return audMax >= actorMin;
      });
    }
    if (filters.age_max) {
      const actorMax = parseInt(filters.age_max, 10) || 100;
      results = results.filter(i => {
        const audMin = parseInt(i.age_min, 10) || 0;
        return audMin <= actorMax;
      });
    }

    // Secondary local sorting if needed
    if (sort === 'budget_high') {
      results.sort((a, b) => {
        const getBudgetNum = (item) => {
          const m = String(item.compensation || item.budget || '').match(/\d[\d,]*/);
          return m ? parseInt(m[0].replace(/,/g, ''), 10) : 0;
        };
        return getBudgetNum(b) - getBudgetNum(a);
      });
    }
    
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
