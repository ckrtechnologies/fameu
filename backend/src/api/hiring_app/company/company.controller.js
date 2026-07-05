import hiringService from '../../../services/hiring.service.js';

class HiringCompanyController {
  
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await hiringService.getProfile(userId); console.log("FETCHED PROFILE FOR USER", userId, "IS", profile);
      
      if (!profile) {
        return res.status(404).json({ success: false, error: 'Company profile not found' });
      }
      
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  async upsertProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profileData = req.body; 

      const result = await hiringService.createOrUpdateProfile(userId, profileData);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async uploadLogo(req, res, next) {
    try {
      let { hiringId } = req.body;
      if (!hiringId) {
        const profile = await hiringService.getProfile(req.user.id);
        if (!profile) return res.status(404).json({ success: false, error: 'Hiring profile not found' });
        hiringId = profile.id;
      }

      if (!req.file) return res.status(400).json({ success: false, error: 'Logo image is required' });

      const baseUrl = process.env.CDN_URL || process.env.API_URL || `${req.protocol}://${req.get('host')}`;
      const logoUrl = `${baseUrl}/uploads/hiring/${req.file.filename}`;
      const result = await hiringService.updateLogo(hiringId, logoUrl);
      
      res.status(200).json({ success: true, data: result, message: 'Logo uploaded successfully' });
    } catch (err) {
      next(err);
    }
  }

  async uploadKYC(req, res, next) {
    try {
      let { hiringId } = req.body;
      if (!hiringId) {
        const profile = await hiringService.getProfile(req.user.id);
        if (!profile) return res.status(404).json({ success: false, error: 'Hiring profile not found' });
        hiringId = profile.id;
      }

      const baseUrl = `${process.env.CDN_URL || process.env.API_URL || `${req.protocol}://${req.get('host')}`}/uploads/hiring/`;
      const docsUrls = {};

      if (req.files) {
        if (req.files.aadhaar && req.files.aadhaar[0]) docsUrls.aadhaar_url = baseUrl + req.files.aadhaar[0].filename;
        if (req.files.pan && req.files.pan[0]) docsUrls.pan_url = baseUrl + req.files.pan[0].filename;
        if (req.files.company_reg && req.files.company_reg[0]) docsUrls.company_reg_url = baseUrl + req.files.company_reg[0].filename;
        if (req.files.gst && req.files.gst[0]) docsUrls.gst_url = baseUrl + req.files.gst[0].filename;
        if (req.files.selfie && req.files.selfie[0]) docsUrls.selfie_url = baseUrl + req.files.selfie[0].filename;
      }

      if (Object.keys(docsUrls).length === 0) {
        return res.status(400).json({ success: false, error: 'At least one KYC document is required' });
      }

      const result = await hiringService.uploadVerificationDocs(hiringId, docsUrls);
      res.status(200).json({ success: true, data: result, message: 'KYC documents submitted for review' });
    } catch (err) {
      next(err);
    }
  }
}

export default new HiringCompanyController();
