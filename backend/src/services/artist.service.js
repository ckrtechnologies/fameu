import supabase from '../config/supabase.js';

class ArtistService {
  
  /**
   * Upsert the base artist profile
   */
  async createOrUpdateProfile(userId, profileData) {
    // 1. Get existing profile to see if we are updating or creating
    const { data: existing } = await supabase
      .from('artist_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    const payload = {
      user_id: userId,
      full_name: profileData.full_name,
      categories: profileData.categories,
      age: profileData.age,
      gender: profileData.gender,
      height: profileData.height,
      weight: profileData.weight,
      city: profileData.city,
      bio: profileData.bio,
      experience: profileData.experience,
      languages: profileData.languages,
      skills: profileData.skills,
      social_links: profileData.social_links,
      travel_available: profileData.travel_available,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('artist_profiles')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw new Error(`Failed to update profile: ${error.message}`);
      
      // Update user display name for chat
      if (profileData.full_name) {
        await supabase.from('users').update({ display_name: profileData.full_name }).eq('id', userId);
      }
      return data;
    } else {
      // Create
      const { data, error } = await supabase
        .from('artist_profiles')
        .insert([payload])
        .select()
        .single();
      if (error) throw new Error(`Failed to create profile: ${error.message}`);
      
      if (profileData.full_name) {
        await supabase.from('users').update({ display_name: profileData.full_name }).eq('id', userId);
      }
      return data;
    }
  }

  /**
   * Update dynamic category details (Actor, Singer, Model, etc)
   */
  async updateCategoryDetails(artistId, category, detailsData) {
    let tableName = '';
    
    switch (category?.toLowerCase()) {
      case 'actor': tableName = 'actor_details'; break;
      case 'singer': tableName = 'singer_details'; break;
      case 'model': tableName = 'model_details'; break;
      case 'dancer': tableName = 'dancer_details'; break;
      case 'technician': tableName = 'technician_details'; break;
      default: throw new Error(`Unsupported category: ${category}`);
    }

    const payload = {
      artist_id: artistId,
      ...detailsData
    };

    const { data, error } = await supabase
      .from(tableName)
      .upsert(payload, { onConflict: 'artist_id' })
      .select()
      .single();

    if (error) throw new Error(`Failed to update ${tableName}: ${error.message}`);
    return data;
  }

  /**
   * Fetch full profile including dynamic category data
   */
  async getFullProfile(userId) {
    // Get base profile
    const { data: profile, error } = await supabase
      .from('artist_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) return null;

    let categoryDetails = {};
    
    if (profile.categories && profile.categories.length > 0) {
      await Promise.all(profile.categories.map(async (cat) => {
        let tableName = '';
        switch (cat.toLowerCase()) {
          case 'actor': tableName = 'actor_details'; break;
          case 'singer': tableName = 'singer_details'; break;
          case 'model': tableName = 'model_details'; break;
          case 'dancer': tableName = 'dancer_details'; break;
          case 'technician': tableName = 'technician_details'; break;
        }

        if (tableName) {
          const { data: details } = await supabase
            .from(tableName)
            .select('*')
            .eq('artist_id', profile.id)
            .single();
          if (details) {
            categoryDetails[cat.toLowerCase()] = details;
          }
        }
      }));
    }

    return {
      ...profile,
      category_details: categoryDetails
    };
  }

  /**
   * Upload media URLs (After Multer saves them)
   */
  async updateMediaUrls(artistId, mediaUrls) {
    const { data, error } = await supabase
      .from('artist_profiles')
      .update({
        photo_urls: mediaUrls.photos,
        video_url: mediaUrls.video,
        resume_url: mediaUrls.resume,
        audio_url: mediaUrls.audio,
        updated_at: new Date().toISOString()
      })
      .eq('id', artistId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update media: ${error.message}`);
    
    // Update base user avatar if photo_urls[0] exists
    if (mediaUrls.photos && mediaUrls.photos.length > 0) {
      await supabase.from('users').update({ avatar_url: mediaUrls.photos[0] })
        .eq('id', data.user_id);
    }
    
    return data;
  }
}

export default new ArtistService();
