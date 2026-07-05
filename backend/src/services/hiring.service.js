import supabase from '../config/supabase.js';

class HiringService {
  
  /**
   * Upsert the base hiring/company profile
   */
  async createOrUpdateProfile(userId, profileData) {
    const { data: existing } = await supabase
      .from('hiring_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    const payload = {
      user_id: userId,
      company_name: profileData.company_name,
      company_type: profileData.company_type,
      description: profileData.description,
      social_links: profileData.social_links,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      const { data, error } = await supabase
        .from('hiring_profiles')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw new Error(`Failed to update company profile: ${error.message}`);
      
      // Update display name
      if (profileData.company_name) {
        await supabase.from('users').update({ display_name: profileData.company_name }).eq('id', userId);
      }
      return data;
    } else {
      const { data, error } = await supabase
        .from('hiring_profiles')
        .insert([payload])
        .select()
        .single();
      if (error) throw new Error(`Failed to create company profile: ${error.message}`);
      
      if (profileData.company_name) {
        await supabase.from('users').update({ display_name: profileData.company_name }).eq('id', userId);
      }
      return data;
    }
  }

  /**
   * Fetch company profile
   */
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('hiring_profiles')
      .select('*, verification_documents(*)')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to fetch profile: ${error.message}`);
    
    if (data) {
      // Calculate stats
      const stats = {
        followers: 0,
        auditions_posted: 0,
        hired_artists: 0,
        profile_visits: data.profile_visits || 0
      };

      // 1. Followers Count
      const { count: followersCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);
      stats.followers = followersCount || 0;

      // 2. Auditions Posted
      const { count: auditionsCount } = await supabase
        .from('auditions')
        .select('*', { count: 'exact', head: true })
        .eq('hiring_id', data.id);
      stats.auditions_posted = auditionsCount || 0;

      // 3. Hired Artists
      // Fetch all auditions for this hiring profile
      const { data: auditions } = await supabase
        .from('auditions')
        .select('applications(status)')
        .eq('hiring_id', data.id);
      
      if (auditions) {
        let hiredCount = 0;
        auditions.forEach(aud => {
          if (aud.applications) {
            aud.applications.forEach(app => {
              if (app.status === 'hired') hiredCount++;
            });
          }
        });
        stats.hired_artists = hiredCount;
      }

      data.stats = stats;
    }

    return data;
  }

  /**
   * Update Company Logo URL
   */
  async updateLogo(hiringId, logoUrl) {
    const { data, error } = await supabase
      .from('hiring_profiles')
      .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
      .eq('id', hiringId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update logo: ${error.message}`);
    
    // Update base user avatar
    await supabase.from('users').update({ avatar_url: logoUrl }).eq('id', data.user_id);
    
    return data;
  }

  /**
   * Update KYC Verification Documents
   */
  async uploadVerificationDocs(hiringId, docsUrls) {
    // Upsert verification documents
    const payload = {
      hiring_id: hiringId,
      aadhaar_url: docsUrls.aadhaar_url,
      pan_url: docsUrls.pan_url,
      company_reg_url: docsUrls.company_reg_url,
      gst_url: docsUrls.gst_url,
      selfie_url: docsUrls.selfie_url,
      status: 'pending', // Reset status on re-upload
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('verification_documents')
      .upsert(payload, { onConflict: 'hiring_id' })
      .select()
      .single();

    if (error) throw new Error(`Failed to submit KYC documents: ${error.message}`);
    
    // Also update hiring_profiles status to pending
    await supabase.from('hiring_profiles').update({ verification_status: 'pending' }).eq('id', hiringId);

    return data;
  }
}

export default new HiringService();
