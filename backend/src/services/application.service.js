import supabase from '../config/supabase.js';

class ApplicationService {
  /**
   * Artist applies to an audition
   */
  async applyToAudition(userId, auditionId, applicationData) {
    // 1. Verify audition exists and is active
    const { data: audition } = await supabase
      .from('auditions')
      .select('status')
      .eq('id', auditionId)
      .single();

    if (!audition || audition.status !== 'active') {
      throw new Error('Audition is closed or does not exist');
    }

    // 2. Fetch the artist profile ID using the userId
    const { data: profile } = await supabase
      .from('artist_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (!profile) {
      throw new Error('Artist profile not found');
    }

    // 3. Insert application
    const payload = {
      artist_id: profile.id,
      audition_id: auditionId,
      cover_note: applicationData.cover_note,
      selected_video: applicationData.selected_video,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('applications')
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('You have already applied to this audition');
      throw new Error(`Application failed: ${error.message}`);
    }

    return data;
  }

  /**
   * Get applications submitted by an artist (for Artist App)
   */
  async getArtistApplications(userId) {
    const { data: profile } = await supabase
      .from('artist_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (!profile) {
      return [];
    }

    const { data, error } = await supabase
      .from('applications')
      .select('*, auditions(title, venue_address, audition_date, hiring_profiles(company_name, logo_url, users(username)))')
      .eq('artist_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch applications: ${error.message}`);
    return data;
  }

  /**
   * Get applicants for a specific audition (for Hiring App ATS)
   */
  async getApplicantsForAudition(hiringId, auditionId, filters = {}) {
    // 1. Verify the hiring company owns this audition
    const { data: audition } = await supabase
      .from('auditions')
      .select('id')
      .eq('id', auditionId)
      .eq('hiring_id', hiringId)
      .single();

    if (!audition) throw new Error('Unauthorized or Audition not found');

    // 2. Fetch applicants
    let query = supabase
      .from('applications')
      .select('*, artist_profiles!inner(user_id, full_name, categories, city, photo_urls, video_url, gender, age, users(avatar_url)), auditions!inner(hiring_id)')
      .eq('audition_id', auditionId);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.gender) query = query.eq('artist_profiles.gender', filters.gender);
    if (filters.city) query = query.ilike('artist_profiles.city', `%${filters.city}%`);

    if (filters.age_min || filters.age_max) {
      const today = new Date();
      if (filters.age_min) {
        const minDate = new Date(today.getFullYear() - filters.age_min, today.getMonth(), today.getDate()).toISOString().split('T')[0];
        query = query.gte('artist_profiles.age', filters.age_min);
      }
      if (filters.age_max) {
        query = query.lte('artist_profiles.age', filters.age_max);
      }
    }

    if (filters.sort_by === 'Recent') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch applicants: ${error.message}`);
    return data.map(app => {
      if (app.auditions && app.auditions.instructions) {
        try {
          const meta = typeof app.auditions.instructions === 'string' ? JSON.parse(app.auditions.instructions) : app.auditions.instructions;
          Object.assign(app.auditions, meta);
        } catch(e) {}
      }
      return app;
    });
  }

  /**
   * Get all applicants across all auditions for a specific hiring company
   */
  async getAllApplicantsForCompany(hiringId, filters = {}) {
    let query = supabase
      .from('applications')
      .select('*, artist_profiles!inner(user_id, full_name, categories, city, photo_urls, video_url, gender, age, users(avatar_url)), auditions!inner(id, title, hiring_id, audition_type, audition_date, instructions)')
      .eq('auditions.hiring_id', hiringId);

    // Apply Filters
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.audition_type) query = query.eq('auditions.audition_type', filters.audition_type);
    
    // Note: filtering on nested tables requires the !inner join which we have above.
    if (filters.gender) query = query.eq('artist_profiles.gender', filters.gender);
    if (filters.city) query = query.ilike('artist_profiles.city', `%${filters.city}%`);

    // For Age Range, it's complex to filter dob purely via Supabase PostgREST if it's string or date math without RPC, 
    // but we'll try to filter it post-query or assume a simple dob date filter.
    if (filters.age_min || filters.age_max) {
      const today = new Date();
      if (filters.age_min) {
        const minDate = new Date(today.getFullYear() - filters.age_min, today.getMonth(), today.getDate()).toISOString().split('T')[0];
        query = query.gte('artist_profiles.age', filters.age_min);
      }
      if (filters.age_max) {
        query = query.lte('artist_profiles.age', filters.age_max);
      }
    }

    // Apply Sorting
    if (filters.sort_by === 'Recent') {
      query = query.order('created_at', { ascending: false });
    } else {
      // default fallback
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch all applicants: ${error.message}`);
    return data.map(app => {
      if (app.auditions && app.auditions.instructions) {
        try {
          const meta = typeof app.auditions.instructions === 'string' ? JSON.parse(app.auditions.instructions) : app.auditions.instructions;
          Object.assign(app.auditions, meta);
        } catch(e) {}
      }
      return app;
    });
  }

  /**
   * Update Application Status (Hiring App ATS)
   * e.g., 'shortlisted', 'rejected', 'interview_scheduled', 'hired'
   */
  async updateApplicationStatus(hiringId, applicationId, statusData) {
    const { status, interview_date, interview_venue } = statusData;

    // Verify ownership indirectly by joining audition
    const { data: application } = await supabase
      .from('applications')
      .select('id, auditions!inner(hiring_id)')
      .eq('id', applicationId)
      .single();

    if (!application || application.auditions.hiring_id !== hiringId) {
      throw new Error('Unauthorized to update this application');
    }

    const { data, error } = await supabase
      .from('applications')
      .update({
        status,
        interview_date,
        interview_venue,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update status: ${error.message}`);
    
    // NOTE: This is where we would trigger Firebase Push Notifications to the Artist!
    
    return data;
  }
}

export default new ApplicationService();
