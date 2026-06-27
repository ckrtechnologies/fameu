import auditionService from '../../../services/audition.service.js';
import applicationService from '../../../services/application.service.js';

class HiringAuditionController {
  
  async createAudition(req, res, next) {
    try {
      // Hiring Profile ID (company) is required. Assuming hiringId is sent, or fetched via user.
      const { hiringId, ...auditionData } = req.body;
      if (!hiringId) return res.status(400).json({ success: false, error: 'hiringId is required' });

      const result = await auditionService.createAudition(hiringId, auditionData);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateAudition(req, res, next) {
    try {
      const { id } = req.params;
      const { hiringId, ...auditionData } = req.body;
      
      const result = await auditionService.updateAudition(hiringId, id, auditionData);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getMyAuditions(req, res, next) {
    try {
      const { hiringId } = req.query;
      const result = await auditionService.getCompanyAuditions(hiringId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ATS: Get applicants for a specific audition
  async getApplicants(req, res, next) {
    try {
      const { auditionId } = req.params;
      const { hiringId } = req.query;
      
      const result = await applicationService.getApplicantsForAudition(hiringId, auditionId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ATS: Update applicant status
  async updateApplicationStatus(req, res, next) {
    try {
      const { applicationId } = req.params;
      const { hiringId, status, interview_date, interview_venue } = req.body;
      
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
