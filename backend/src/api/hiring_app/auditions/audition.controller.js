import auditionService from '../../../services/audition.service.js';
import applicationService from '../../../services/application.service.js';
import hiringService from '../../../services/hiring.service.js';

class HiringAuditionController {
  
  async createAudition(req, res, next) {
    try {
      // Hiring Profile ID (company) is required. Assuming hiringId is sent, or fetched via user.
      let { hiringId, ...auditionData } = req.body;
      if (!hiringId) {
        const profile = await hiringService.getProfile(req.user.id);
        if (!profile) return res.status(404).json({ success: false, error: 'Hiring profile not found' });
        hiringId = profile.id;
      }

      const result = await auditionService.createAudition(hiringId, auditionData);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateAudition(req, res, next) {
    try {
      const { id } = req.params;
      let { hiringId, ...auditionData } = req.body;
      if (!hiringId) {
        const profile = await hiringService.getProfile(req.user.id);
        if (!profile) return res.status(404).json({ success: false, error: 'Hiring profile not found' });
        hiringId = profile.id;
      }
      
      const result = await auditionService.updateAudition(hiringId, id, auditionData);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async deleteAudition(req, res, next) {
    try {
      const { id } = req.params;
      const profile = await hiringService.getProfile(req.user.id);
      if (!profile) return res.status(404).json({ success: false, error: 'Hiring profile not found' });
      const hiringId = profile.id;
      
      const result = await auditionService.deleteAudition(hiringId, id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getMyAuditions(req, res, next) {
    try {
      let { hiringId } = req.query;
      if (!hiringId) {
        const profile = await hiringService.getProfile(req.user.id);
        if (!profile) return res.status(404).json({ success: false, error: 'Hiring profile not found' });
        hiringId = profile.id;
      }
      const result = await auditionService.getCompanyAuditions(hiringId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getAuditionById(req, res, next) {
    try {
      const { id } = req.params;
      let { hiringId } = req.query;
      
      if (!hiringId) {
        const profile = await hiringService.getProfile(req.user.id);
        if (!profile) return res.status(404).json({ success: false, error: 'Hiring profile not found' });
        hiringId = profile.id;
      }
      
      const result = await auditionService.getAuditionDetails(id);
      
      // Ensure the audition belongs to the authenticated hiring profile
      if (result && result.hiring_id !== hiringId) {
         return res.status(403).json({ success: false, error: 'Unauthorized to view this audition' });
      }
      
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ATS: Get all applicants across all auditions
  async getAllApplicants(req, res, next) {
    try {
      let { hiringId, ...filters } = req.query;
      
      if (!hiringId) {
        const profile = await hiringService.getProfile(req.user.id);
        if (!profile) return res.status(404).json({ success: false, error: 'Hiring profile not found' });
        hiringId = profile.id;
      }
      
      const result = await applicationService.getAllApplicantsForCompany(hiringId, filters);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ATS: Get applicants for a specific audition
  async getApplicants(req, res, next) {
    try {
      const { auditionId } = req.params;
      let { hiringId, ...filters } = req.query;
      
      if (!hiringId) {
        const profile = await hiringService.getProfile(req.user.id);
        if (!profile) return res.status(404).json({ success: false, error: 'Hiring profile not found' });
        hiringId = profile.id;
      }
      
      const result = await applicationService.getApplicantsForAudition(hiringId, auditionId, filters);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // Upload PDF for Audition
  async uploadDescriptionPdf(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No PDF file provided' });
      }
      const baseUrl = process.env.CDN_URL ? `${process.env.CDN_URL}/hiring` : `${process.env.API_URL || `${req.protocol}://${req.get('host')}`}/uploads/hiring`;
      const fileUrl = `${baseUrl}/${req.file.filename}`;
      res.status(200).json({ success: true, data: { url: fileUrl } });
    } catch (err) {
      next(err);
    }
  }

  // Upload Thumbnail for Audition
  async uploadThumbnail(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No image file provided' });
      }
      const baseUrl = process.env.CDN_URL ? `${process.env.CDN_URL}/hiring` : `${process.env.API_URL || `${req.protocol}://${req.get('host')}`}/uploads/hiring`;
      const fileUrl = `${baseUrl}/${req.file.filename}`;
      res.status(200).json({ success: true, data: { url: fileUrl } });
    } catch (err) {
      next(err);
    }
  }

  // ATS: Update applicant status
  async updateApplicationStatus(req, res, next) {
    try {
      const { applicationId } = req.params;
      let { hiringId, status, interview_date, interview_venue } = req.body;
      
      if (!hiringId) {
        const profile = await hiringService.getProfile(req.user.id);
        if (!profile) return res.status(404).json({ success: false, error: 'Hiring profile not found' });
        hiringId = profile.id;
      }
      
      const result = await applicationService.updateApplicationStatus(hiringId, applicationId, {
        status, interview_date, interview_venue
      });
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export default new HiringAuditionController();
