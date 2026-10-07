import supabase from '../config/supabase.js';
import { INDIAN_CITIES } from '../constants/cities.js';

class AuditionService {
  _normalizeAuditionType(type) {
    if (!type) return 'walkin';
    const t = String(type).trim().toLowerCase();
    if (t === 'walk-in' || t === 'walkin') return 'walkin';
    if (t === 'scheduled') return 'scheduled';
    if (t === 'online') return 'online';
    return t;
  }

  _parseCompensationNumbers(text) {
    if (!text) return [];
    // Match number sequences, handling Indian/international comma notation (e.g. "1,00,000", "25,000", "5000", "200")
    const matches = String(text).match(/\b\d{1,3}(?:,\d{2,3})*\b|\b\d+\b/g);
    if (!matches) return [];
    return matches.map(m => parseInt(m.replace(/,/g, ''), 10)).filter(n => !isNaN(n) && n > 0);
  }

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
    const { 
      title, role_description, character_req, category, gender, gender_req,
      age_min, age_max, audition_type, venue_address, lat, lng,
      audition_date, date, audition_time, compensation, budget,
      thumbnail_url, mode, status, is_live,
      valid_from, valid_till, expiry_date,
      script_text, script,
      ...extraProps 
    } = auditionData;
    
    // Validate city against backend constant variable (prevent typos/spelling mistakes)
    const rawCity = extraProps.city || auditionData.city;
    let canonicalCity = null;
    if (rawCity) {
      const trimmed = String(rawCity).trim();
      const matched = INDIAN_CITIES.find(c => c.toLowerCase() === trimmed.toLowerCase());
      if (!matched) {
        throw new Error(`Invalid city: "${rawCity}". Please select a valid city from the supported cities list.`);
      }
      canonicalCity = matched;
      extraProps.city = matched;
      if (auditionData.city) auditionData.city = matched;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const computedValidFrom = valid_from || todayStr;
    const computedValidTill = valid_till || expiry_date || date || null;
    const finalScriptText = script_text !== undefined ? script_text : (script !== undefined ? script : (extraProps.script_text || null));

    const extraMeta = JSON.stringify({
      budget: budget || compensation,
      gender_req: gender_req || gender,
      city,
      valid_from: computedValidFrom,
      valid_till: computedValidTill,
      script_text: finalScriptText,
      ...extraProps
    });

    const payload = {
      hiring_id: hiringId,
      title,
      role_description: role_description || character_req || '',
      character_req: character_req || role_description || '',
      category: Array.isArray(category) ? category.join(', ') : (category || 'Actor'),
      gender: gender || gender_req || 'Any',
      age_min: age_min !== undefined && age_min !== null ? Number(age_min) : 0,
      age_max: age_max !== undefined && age_max !== null ? Number(age_max) : 75,
      audition_type: this._normalizeAuditionType(audition_type),
      venue_address: venue_address || extraProps.walk_in_venue || null,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      audition_date: audition_date || date || null,
      date: date || computedValidTill || audition_date || null,
      valid_from: computedValidFrom,
      valid_till: computedValidTill,
      script_text: finalScriptText,
      audition_time: audition_time || null,
      compensation: budget || compensation || null,
      instructions: extraMeta,
      thumbnail_url: thumbnail_url || null,
      mode: mode || 'Offline',
      status: status || 'active',
      is_live: is_live !== undefined ? is_live : true
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
    const { 
      title, role_description, character_req, category, gender, gender_req,
      age_min, age_max, audition_type, venue_address, lat, lng,
      audition_date, date, audition_time, compensation, budget,
      thumbnail_url, mode, status, is_live,
      valid_from, valid_till, expiry_date,
      script_text, script,
      ...extraProps 
    } = auditionData;

    const rawCity = extraProps.city || auditionData.city;
    let city = undefined;
    if (rawCity !== undefined) {
      const trimmed = String(rawCity).trim();
      const matched = INDIAN_CITIES.find(c => c.toLowerCase() === trimmed.toLowerCase());
      if (!matched) {
        throw new Error(`Invalid city: "${rawCity}". Please select a valid city from the supported cities list.`);
      }
      city = matched;
      extraProps.city = matched;
      if (auditionData.city !== undefined) auditionData.city = matched;
    }
    const finalValidFrom = valid_from !== undefined ? valid_from : extraProps.valid_from;
    const finalValidTill = valid_till !== undefined ? valid_till : (expiry_date !== undefined ? expiry_date : extraProps.valid_till);
    const finalScriptText = script_text !== undefined ? script_text : (script !== undefined ? script : extraProps.script_text);

    const extraMeta = JSON.stringify({
      budget: budget || compensation,
      gender_req: gender_req || gender,
      city,
      ...(finalValidFrom !== undefined ? { valid_from: finalValidFrom } : {}),
      ...(finalValidTill !== undefined ? { valid_till: finalValidTill } : {}),
      ...(finalScriptText !== undefined ? { script_text: finalScriptText } : {}),
      ...extraProps
    });
    
    const payload = {
      instructions: extraMeta,
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) payload.title = title;
    if (role_description !== undefined) payload.role_description = role_description;
    if (character_req !== undefined) payload.character_req = character_req;
    if (category !== undefined) payload.category = Array.isArray(category) ? category.join(', ') : category;
    if (gender !== undefined || gender_req !== undefined) payload.gender = gender || gender_req;
    if (age_min !== undefined) payload.age_min = Number(age_min);
    if (age_max !== undefined) payload.age_max = Number(age_max);
    if (audition_type !== undefined) payload.audition_type = this._normalizeAuditionType(audition_type);
    if (venue_address !== undefined) payload.venue_address = venue_address;
    if (lat !== undefined) payload.lat = parseFloat(lat);
    if (lng !== undefined) payload.lng = parseFloat(lng);
    if (audition_date !== undefined) payload.audition_date = audition_date;
    if (date !== undefined) payload.date = date;
    if (finalValidFrom !== undefined) payload.valid_from = finalValidFrom;
    if (finalValidTill !== undefined) {
      payload.valid_till = finalValidTill;
      if (date === undefined) payload.date = finalValidTill;
    }
    if (finalScriptText !== undefined) payload.script_text = finalScriptText;
    if (audition_time !== undefined) payload.audition_time = audition_time;
    if (budget !== undefined || compensation !== undefined) payload.compensation = budget || compensation;
    if (thumbnail_url !== undefined) payload.thumbnail_url = thumbnail_url;
    if (mode !== undefined) payload.mode = mode;
    if (status !== undefined) payload.status = status;
    if (is_live !== undefined) payload.is_live = is_live;

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
    // Normalization helper
    const normalize = (str) => (str ? String(str).toLowerCase().replace(/[-_\s]/g, '') : '');

    let query = supabase.from('auditions').select('*, hiring_profiles(company_name, company_type, logo_url, users(username, is_blacklisted))');
    
    if (filters.status) {
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
    } else if (!filters.hiring_id) {
      query = query.eq('status', 'active');
    }

    // Home Screen specific filters
    if (filters.filter === 'live' || filters.is_live === 'true' || filters.is_live === true) {
      // Use IST timezone to match user's local time accurately, or check is_live flag
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      query = query.or(`audition_date.eq.${today},is_live.eq.true`);
    }

    if (filters.filter === 'trending' || filters.sort_by === 'popular') {
      query = query.order('view_count', { ascending: false });
    }

    let relevantCategories = [];
    if ((filters.filter === 'relevant' || filters.filter === 'recommended') && userId) {
      const { data: profile } = await supabase.from('artist_profiles').select('categories, gender, city').eq('user_id', userId).single();
      if (profile && Array.isArray(profile.categories) && profile.categories.length > 0) {
        relevantCategories = profile.categories.map(c => normalize(c)).filter(Boolean);
      }
    }

    // Explicit Category Filter (Case-insensitive & Tokenized)
    const hasExplicitCategory = Boolean(filters.category && filters.category !== 'All' && filters.category !== 'Any');
    if (hasExplicitCategory) {
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
          i.hiring_profiles?.company_type,
          i.hiring_profiles?.users?.username,
          typeof i.instructions === 'string' ? i.instructions : JSON.stringify(i.instructions || {})
        ].filter(Boolean).join(' ').toLowerCase();

        // Every search term must match somewhere in the corpus (supports "actor mumbai", "lead feature", etc.)
        return searchTerms.every(term => searchableCorpus.includes(term));
      });
    }

    // 1. Filter out blacklisted hiring agencies
    results = results.filter(i => !i.hiring_profiles?.users?.is_blacklisted);

    // 2. Category Filter (Case-insensitive & Tokenized)
    if (hasExplicitCategory) {
      const selectedCats = filters.category.split(',').map(c => normalize(c)).filter(Boolean);
      if (selectedCats.length > 0) {
        results = results.filter(i => {
          const itemCat = normalize(i.category || i.role || i.title);
          return selectedCats.some(sc => itemCat.includes(sc) || sc.includes(itemCat));
        });
      }
    } else if (filters.filter === 'relevant' && relevantCategories.length > 0) {
      results.sort((a, b) => {
        const aCat = normalize(a.category || a.role || a.title);
        const bCat = normalize(b.category || b.role || b.title);
        const aMatch = relevantCategories.some(rc => aCat.includes(rc) || rc.includes(aCat)) ? 1 : 0;
        const bMatch = relevantCategories.some(rc => bCat.includes(rc) || rc.includes(bCat)) ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    // 3. Project Type (Case-insensitive & format-resilient)
    if (filters.project_type && filters.project_type !== 'All') {
      const targetProj = normalize(filters.project_type);
      results = results.filter(i => {
        const itemProj = normalize(i.project_type || i.title);
        return itemProj === targetProj || itemProj.includes(targetProj) || targetProj.includes(itemProj);
      });
    }

    // 4. Mode / Audition Type (Online vs Offline / In-Person vs Walk-in)
    if (filters.mode && filters.mode !== 'All') {
      const targetMode = normalize(filters.mode);
      results = results.filter(i => {
        const itemMode = normalize(i.mode || i.audition_type || i.project_type || '');
        if (targetMode.includes('online') || targetMode.includes('selftape') || targetMode.includes('remote')) {
          return itemMode.includes('online') || itemMode.includes('selftape') || itemMode.includes('remote');
        }
        if (targetMode.includes('offline') || targetMode.includes('inperson') || targetMode.includes('studio') || targetMode.includes('venue')) {
          return itemMode.includes('offline') || itemMode.includes('inperson') || itemMode.includes('studio') || itemMode.includes('venue') || itemMode.includes('walkin') || !itemMode;
        }
        if (targetMode.includes('walkin')) {
          return itemMode.includes('walkin') || itemMode.includes('walk');
        }
        return itemMode === targetMode || itemMode.includes(targetMode) || targetMode.includes(itemMode);
      });
    }

    // 5. City / Location (Checks city field, venue address, and instructions)
    if (filters.city && filters.city !== 'All') {
      const rawTarget = filters.city.toLowerCase().trim();
      const targetKeywords = rawTarget.split(/[\s\-_/]+/).filter(kw => kw && kw !== 'all' && kw !== 'ncr');
      results = results.filter(i => {
        const itemCity = (i.city || '').toLowerCase();
        const itemVenue = (i.venue_address || '').toLowerCase();
        const itemInst = typeof i.instructions === 'string' ? i.instructions.toLowerCase() : '';
        const corpus = `${itemCity} ${itemVenue} ${itemInst}`;
        return targetKeywords.some(kw => corpus.includes(kw));
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
        if (i.is_paid === false) return false;
        const comp = (i.compensation || i.budget || '').toLowerCase().trim();
        if (comp && (comp === '0' || comp.includes('unpaid') || comp.includes('tfp') || comp.includes('expenses only'))) {
          return false;
        }
        if (filters.min_budget && filters.min_budget !== 'All') {
          if (filters.min_budget === 'Paid Only') {
            return !comp.includes('unpaid') && !comp.includes('tfp') && comp !== '0';
          }
          const cleanMin = String(filters.min_budget).replace(/[^\d]/g, '');
          const minVal = parseInt(cleanMin, 10);
          if (!isNaN(minVal) && minVal > 0) {
            const nums = this._parseCompensationNumbers(i.compensation || i.budget);
            if (nums.length > 0) {
              const maxWage = Math.max(...nums);
              return maxWage >= minVal;
            }
            return false;
          }
        }
        return true;
      });
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

    // 9. Company Type Filter (supports single string, comma-separated or array)
    if (filters.company_type && filters.company_type !== 'All') {
      const typesList = (Array.isArray(filters.company_type)
        ? filters.company_type
        : String(filters.company_type).split(',')
      ).map(t => normalize(t)).filter(Boolean);

      if (typesList.length > 0 && !typesList.includes('all')) {
        results = results.filter(i => {
          const itemType = normalize(i.hiring_profiles?.company_type || '');
          return typesList.some(targetType => itemType === targetType || itemType.includes(targetType) || targetType.includes(itemType));
        });
      }
    }

    // Secondary local sorting if needed
    if (sort === 'budget_high') {
      results.sort((a, b) => {
        const getBudgetNum = (item) => {
          const nums = this._parseCompensationNumbers(item.compensation || item.budget);
          return nums.length ? Math.max(...nums) : 0;
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
