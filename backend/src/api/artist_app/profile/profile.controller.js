import artistService from '../../../services/artist.service.js';

class ArtistProfileController {
  
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await artistService.getFullProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }
      
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }
  async checkUsername(req, res, next) {
    try {
      const { username } = req.params;
      const isAvailable = await artistService.checkUsernameAvailable(username, req.user.id);
      res.status(200).json({ success: true, data: { available: isAvailable } });
    } catch (err) {
      next(err);
    }
  }

  async upsertProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profileData = req.body; // e.g., { full_name, category, age, city... }

      const result = await artistService.createOrUpdateProfile(userId, profileData);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateCategoryDetails(req, res, next) {
    try {
      let { artistId, category, detailsData } = req.body;
      
      // Basic check
      if (!category) {
        return res.status(400).json({ success: false, error: 'category is required' });
      }
      
      if (!artistId) {
        const profile = await artistService.getFullProfile(req.user.id);
        if (!profile) return res.status(404).json({ success: false, error: 'Artist profile not found' });
        artistId = profile.id;
      }

      const result = await artistService.updateCategoryDetails(artistId, category, detailsData);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handle media uploads directly to local Express server via Multer
   */
  async uploadMedia(req, res, next) {
    try {
      const { replaceAvatar } = req.body;
      const userId = req.user.id;

      const baseUrl = `${req.protocol}://${req.get('host')}/uploads/artist/`;
      const mediaUrls = { photos: [] };

      // Multer stores files in req.files if multiple fields used
      if (req.files) {
        if (req.files.photos) {
          mediaUrls.photos = req.files.photos.map(file => baseUrl + file.filename);
        }
        if (req.files.video && req.files.video[0]) {
          mediaUrls.video = baseUrl + req.files.video[0].filename;
        }
        if (req.files.resume && req.files.resume[0]) {
          mediaUrls.resume = baseUrl + req.files.resume[0].filename;
        }
        if (req.files.audio && req.files.audio[0]) {
          mediaUrls.audio = baseUrl + req.files.audio[0].filename;
        }
      }

      const isReplace = replaceAvatar === 'true' || replaceAvatar === true;
      const result = await artistService.updateMediaUrls(userId, mediaUrls, isReplace);
      res.status(200).json({ success: true, data: result, message: 'Media uploaded successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export default new ArtistProfileController();
