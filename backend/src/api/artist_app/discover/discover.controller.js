import auditionService from '../../../services/audition.service.js';
import applicationService from '../../../services/application.service.js';
import supabase from '../../../config/supabase.js';

class ArtistDiscoverController {
  
  /**
   * Search for hiring agencies/casting directors
   */
  async searchHiringAgencies(req, res, next) {
    try {
      const { q, company_type, verification_status } = req.query;
      
      let query = supabase
        .from('hiring_profiles')
        .select(`
          *,
          users!inner (
            display_name,
            username
          )
        `)
        .eq('users.is_blacklisted', false);

      if (company_type) query = query.eq('company_type', company_type);
      if (verification_status === 'Verified Only') query = query.eq('is_verified', true);

      if (q) {
        query = query.or(`company_name.ilike.%${q}%,description.ilike.%${q}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get the discovery feed based on filters (e.g., lat/lng bounding box, category)
   */
  async getFeed(req, res, next) {
    try {
      const filters = req.query; // ?category=actor&minLat=...&maxLat=...
      const result = await auditionService.discoverAuditions(filters, req.user?.id);
      res.status(200).json({ success: true, debug_filters: filters, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get specific audition details (also increments view count)
   */
  async getAuditionDetails(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const result = await auditionService.getAuditionDetails(id, userId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Apply to an audition
   */
  async applyToAudition(req, res, next) {
    try {
      const { id } = req.params;
      const artistId = req.user.id; // From auth token
      const applicationData = req.body; // { cover_note, selected_video }

      const result = await applicationService.applyToAudition(artistId, id, applicationData);
      res.status(201).json({ success: true, data: result, message: 'Application submitted successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get My Applications (For tracking status)
   */
  async getMyApplications(req, res, next) {
    try {
      const artistId = req.user.id;
      const result = await applicationService.getArtistApplications(artistId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Toggle Bookmark
   */
  async toggleBookmark(req, res, next) {
    try {
      const { id } = req.params;
      const artistId = req.user.id;

      const result = await auditionService.toggleBookmark(artistId, id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Walk-in Check-in
   */
  async checkIn(req, res, next) {
    try {
      const { id } = req.params;
      const { lat, lng } = req.body;
      const artistId = req.user.id;

      if (!lat || !lng) return res.status(400).json({ success: false, error: 'Location (lat/lng) is required for check-in' });

      const result = await auditionService.checkInWalkin(artistId, id, lat, lng);
      res.status(200).json({ success: true, data: result, message: 'Checked in successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get Saved Auditions (Bookmarks)
   */
  async getSavedAuditions(req, res, next) {
    try {
      const artistId = req.user.id;
      const result = await auditionService.getSavedAuditions(artistId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export default new ArtistDiscoverController();
