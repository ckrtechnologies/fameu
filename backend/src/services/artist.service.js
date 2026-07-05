import supabase from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ArtistService {
  
  async checkUsernameAvailable(username, userId) {
    if (!username) return false;
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();
      
    if (!data) return true;
    return data.id === userId; // Available if it belongs to the current user
  }
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

    const allowedFields = [
      'full_name', 'categories', 'age', 'gender', 'height', 'weight', 
      'city', 'bio', 'experience', 'languages', 'skills', 'social_links', 
      'travel_available', 'avatar_url', 'photo_urls', 'video_url'
    ];
    
    const payload = { updated_at: new Date().toISOString() };
    if (!existing) {
      payload.user_id = userId;
    }

    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        payload[field] = profileData[field];
      }
    });

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
      // Update username in users table if provided
      if (profileData.username !== undefined) {
        await supabase
          .from('users')
          .update({ username: profileData.username })
          .eq('id', userId);
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
      if (profileData.username !== undefined) {
        await supabase.from('users').update({ username: profileData.username }).eq('id', userId);
      }
      return data;
    }
  }

  /**
   * Update dynamic category details (Actor, Singer, Model, etc)
   */
  async updateCategoryDetails(artistId, category, detailsData) {
    const payload = {
      artist_id: artistId,
      category_name: category,
      details: detailsData
    };

    const { data, error } = await supabase
      .from('artist_dynamic_details')
      .upsert(payload, { onConflict: 'artist_id, category_name' })
      .select()
      .single();

    if (error) throw new Error(`Failed to update details for ${category}: ${error.message}`);
    return data;
  }

  /**
   * Fetch full profile including dynamic category data
   */
  async getFullProfile(userId) {
    // Get base profile along with user data (followers, username)
    const { data: profile, error } = await supabase
      .from('artist_profiles')
      .select('*, users!inner(username, avatar_url, followers_count, following_count)')
      .eq('user_id', userId)
      .single();

    if (error || !profile) return null;

    let categoryDetails = {};
    
    if (profile.categories && profile.categories.length > 0) {
      const { data: details } = await supabase
        .from('artist_dynamic_details')
        .select('*')
        .eq('artist_id', profile.id)
        .in('category_name', profile.categories);
        
      if (details) {
        details.forEach(d => {
          categoryDetails[d.category_name] = d.details;
        });
      }
    }

    // Compute basic stats
    let applicationsCount = 0;
    let callbacksCount = 0;
    
    const { data: apps } = await supabase
      .from('applications')
      .select('status')
      .eq('artist_id', profile.id);
      
    if (apps) {
      applicationsCount = apps.length;
      callbacksCount = apps.filter(a => a.status === 'accepted').length;
    }

    const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
      supabase.from('connections').select('*', { count: 'exact', head: true }).eq('following_id', profile.user_id),
      supabase.from('connections').select('*', { count: 'exact', head: true }).eq('follower_id', profile.user_id)
    ]);
    
    if (profile.users) {
      profile.users.followers_count = followersCount || 0;
      profile.users.following_count = followingCount || 0;
    }

    return {
      ...profile,
      category_details: categoryDetails,
      stats: {
        applications: applicationsCount,
        callbacks: callbacksCount,
        views: profile.visit_count || 0
      }
    };
  }

  /**
   * Fetch full profile by artist_profiles.id
   */
  async getFullProfileByArtistId(artistId) {
    // Get base profile along with user data
    const { data: profile, error } = await supabase
      .from('artist_profiles')
      .select('*, users!inner(username, avatar_url, followers_count, following_count)')
      .eq('id', artistId)
      .single();

    if (error || !profile) return null;

    let categoryDetails = {};
    
    if (profile.categories && profile.categories.length > 0) {
      const { data: details } = await supabase
        .from('artist_dynamic_details')
        .select('*')
        .eq('artist_id', profile.id)
        .in('category_name', profile.categories);
        
      if (details) {
        details.forEach(d => {
          categoryDetails[d.category_name] = d.details;
        });
      }
    }

    // Compute basic stats
    let applicationsCount = 0;
    let callbacksCount = 0;
    
    const { data: apps } = await supabase
      .from('applications')
      .select('status')
      .eq('artist_id', profile.id);
      
    if (apps) {
      applicationsCount = apps.length;
      callbacksCount = apps.filter(a => a.status === 'accepted').length;
    }

    const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
      supabase.from('connections').select('*', { count: 'exact', head: true }).eq('following_id', profile.user_id),
      supabase.from('connections').select('*', { count: 'exact', head: true }).eq('follower_id', profile.user_id)
    ]);
    
    if (profile.users) {
      profile.users.followers_count = followersCount || 0;
      profile.users.following_count = followingCount || 0;
    }

    return {
      ...profile,
      category_details: categoryDetails,
      stats: {
        applications: applicationsCount,
        callbacks: callbacksCount,
        views: profile.visit_count || 0
      }
    };
  }

  /**
   * Upload media URLs (After Multer saves them)
   */
  async updateMediaUrls(userId, mediaUrls, replaceAvatar = false) {
    // 1. Ensure profile exists or create a blank one
    let { data: existingProfile } = await supabase
      .from('artist_profiles')
      .select('id, photo_urls, avatar_url, user_id')
      .eq('user_id', userId)
      .single();

    if (!existingProfile) {
      existingProfile = await this.createOrUpdateProfile(userId, {});
    }

    let newPhotoUrls = existingProfile?.photo_urls || [];
    let newAvatarUrl = existingProfile?.avatar_url || null;
    let existingVideosStr = existingProfile?.video_url || '';
    let newVideoUrls = existingVideosStr ? existingVideosStr.split(',') : [];

    if (mediaUrls.photos && mediaUrls.photos.length > 0) {
      if (replaceAvatar) {
        // Delete old avatar from disk if it exists
        if (newAvatarUrl) {
          try {
            const filename = newAvatarUrl.split('/').pop();
            const filePath = path.join(__dirname, '../../../uploads/artist', filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (e) {
            console.error('Failed to delete old avatar:', e);
          }
        }
        newAvatarUrl = mediaUrls.photos[0];
      } else {
        // Append all new photos to the gallery
        newPhotoUrls = [...newPhotoUrls, ...mediaUrls.photos];
        if (newPhotoUrls.length > 10) {
           throw new Error('Maximum of 10 photos allowed. Please delete some before uploading.');
        }
      }
    }
    
    if (mediaUrls.videos && mediaUrls.videos.length > 0) {
       newVideoUrls = [...newVideoUrls, ...mediaUrls.videos];
       if (newVideoUrls.length > 10) {
           throw new Error('Maximum of 10 videos allowed. Please delete some before uploading.');
       }
    }

    const { data, error } = await supabase
      .from('artist_profiles')
      .update({
        avatar_url: newAvatarUrl || undefined,
        photo_urls: newPhotoUrls,
        video_url: newVideoUrls.length > 0 ? newVideoUrls.join(',') : undefined,
        resume_url: mediaUrls.resume || undefined,
        audio_url: mediaUrls.audio || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingProfile.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update media: ${error.message}`);
    
    // Update base user avatar
    if (newAvatarUrl) {
      await supabase.from('users').update({ avatar_url: newAvatarUrl })
        .eq('id', data.user_id);
    }

    return data;
  }
}

export default new ArtistService();