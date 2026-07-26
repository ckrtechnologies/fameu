import artistService from '../../../services/artist.service.js';

const AVAILABLE_LANGUAGES = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Punjabi', 'Gujarati', 'Odia', 'Bhojpuri', 'Urdu', 'Assamese'];

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

      if (profileData.languages && Array.isArray(profileData.languages)) {
        const invalidLanguages = profileData.languages.filter(lang => !AVAILABLE_LANGUAGES.includes(lang));
        if (invalidLanguages.length > 0) {
          return res.status(400).json({ success: false, error: `Invalid languages provided: ${invalidLanguages.join(', ')}` });
        }
      }

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

  async requestVerification(req, res, next) {
    try {
      const userId = req.user.id;
      const { documentUrl, socialLinks } = req.body;

      if (!socialLinks) {
        return res.status(400).json({ success: false, error: 'Social links are required for verification.' });
      }

      const result = await artistService.submitVerificationRequest(userId, { documentUrl, socialLinks });
      res.status(200).json(result);
    } catch (err) {
      if (err.message.includes('already have a pending')) {
        return res.status(400).json({ success: false, error: err.message });
      }
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

      const cdnUrl = process.env.CDN_URL ? (process.env.CDN_URL.startsWith('http') ? process.env.CDN_URL : `https://${process.env.CDN_URL}`) : null;
      const baseUrl = cdnUrl ? `${cdnUrl}/artist/` : `${process.env.API_URL || `${req.protocol}://${req.get('host')}`}/uploads/artist/`;
      const mediaUrls = { photos: [] };

      // Multer stores files in req.files if multiple fields used
      if (req.files) {
        if (req.files.photos) {
          for (const file of req.files.photos) {
            if (file.size > 5 * 1024 * 1024) {
              return res.status(400).json({ success: false, error: 'Each photo must be under 5MB' });
            }
          }
          mediaUrls.photos = req.files.photos.map(file => baseUrl + file.filename);
        }
        if (req.files.video) {
          for (const file of req.files.video) {
            if (file.size > 50 * 1024 * 1024) {
              return res.status(400).json({ success: false, error: 'Each video must be under 50MB' });
            }
          }
          mediaUrls.videos = req.files.video.map(file => baseUrl + file.filename);
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

  /**
   * Generic file upload (returns URL only)
   */
  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }
      const cdnUrl = process.env.CDN_URL ? (process.env.CDN_URL.startsWith('http') ? process.env.CDN_URL : `https://${process.env.CDN_URL}`) : null;
      const baseUrl = cdnUrl ? `${cdnUrl}/artist/` : `${process.env.API_URL || `${req.protocol}://${req.get('host')}`}/uploads/artist/`;
      const fileUrl = baseUrl + req.file.filename;
      res.status(200).json({ success: true, url: fileUrl });
    } catch (err) {
      next(err);
    }
  }
}

export default new ArtistProfileController();
