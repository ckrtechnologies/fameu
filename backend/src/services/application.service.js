import supabase from '../config/supabase.js';

class ApplicationService {
  /**
   * Artist applies to an audition
   */
  async applyToAudition(artistId, auditionId, applicationData) {
    // 1. Verify audition exists and is active
    const { data: audition } = await supabase
      .from('auditions')
      .select('status')
      .eq('id', auditionId)
      .single();

    if (!audition || audition.status !== 'active') {
      throw new Error('Audition is closed or does not exist');
    }

    // 2. Insert application
    const payload = {
      artist_id: artistId,
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
  async getArtistApplications(artistId) {
    const { data, error } = await supabase
      .from('applications')
      .select('*, auditions(title, venue_address, audition_date, hiring_profiles(company_name, logo_url))')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch applications: ${error.message}`);
    return data;
  }

  /**
   * Get applicants for a specific audition (for Hiring App ATS)
   */
  async getApplicantsForAudition(hiringId, auditionId) {
    // 1. Verify the hiring company owns this audition
    const { data: audition } = await supabase
      .from('auditions')
      .select('id')
      .eq('id', auditionId)
      .eq('hiring_id', hiringId)
      .single();

    if (!audition) throw new Error('Unauthorized or Audition not found');

    // 2. Fetch applicants
    const { data, error } = await supabase
      .from('applications')
      .select('*, artist_profiles(full_name, category, city, photo_urls, video_url)')
      .eq('audition_id', auditionId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch applicants: ${error.message}`);
    return data;
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
