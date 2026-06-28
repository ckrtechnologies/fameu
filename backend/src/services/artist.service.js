import supabase from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    const allowedFields = [
      'full_name', 'categories', 'age', 'gender', 'height', 'weight', 
      'city', 'bio', 'experience', 'languages', 'skills', 'social_links', 
      'travel_available', 'photo_urls', 'video_url'
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

    return {
      ...profile,
      category_details: categoryDetails,
      stats: {
        applications: applicationsCount,
        callbacks: callbacksCount,
        views: 0 // Placeholder for future views tracking
      }
    };
  }

  /**
   * Upload media URLs (After Multer saves them)
   */
  async updateMediaUrls(artistId, mediaUrls, replaceAvatar = false) {
    // Get existing profile to handle photo appending and file deletion
    const { data: existingProfile } = await supabase
      .from('artist_profiles')
      .select('photo_urls')
      .eq('id', artistId)
      .single();

    let newPhotoUrls = existingProfile?.photo_urls || [];

    if (mediaUrls.photos && mediaUrls.photos.length > 0) {
      if (replaceAvatar) {
        // Delete old avatar from disk if it exists
        if (newPhotoUrls.length > 0) {
          const oldAvatarUrl = newPhotoUrls[0];
          try {
            const filename = oldAvatarUrl.split('/').pop();
            const filePath = path.join(__dirname, '../../../uploads/artist', filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (e) {
            console.error('Failed to delete old avatar:', e);
          }
          // Replace first element
          newPhotoUrls[0] = mediaUrls.photos[0];
        } else {
          newPhotoUrls.unshift(mediaUrls.photos[0]);
        }
      } else {
        // Append all new photos to the gallery
        newPhotoUrls = [...newPhotoUrls, ...mediaUrls.photos];
      }
    }

    const { data, error } = await supabase
      .from('artist_profiles')
      .update({
        photo_urls: newPhotoUrls,
        video_url: mediaUrls.video || undefined,
        resume_url: mediaUrls.resume || undefined,
        audio_url: mediaUrls.audio || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', artistId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update media: ${error.message}`);
    
    // Update base user avatar if photo_urls[0] exists
    if (newPhotoUrls.length > 0) {
      await supabase.from('users').update({ avatar_url: newPhotoUrls[0] })
        .eq('id', data.user_id);
    }
    
    return data;
  }
}

export default new ArtistService();
