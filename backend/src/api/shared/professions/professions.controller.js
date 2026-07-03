import { professionService } from '../../../services/profession.service.js';

export const professionsController = {
  /**
   * Get all active professions (Public/All Apps)
   */
  async getProfessions(req, res, next) {
    try {
      const professions = await professionService.getProfessions();
      return res.status(200).json({
        success: true,
        data: professions
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all professions (Admin only)
   */
  async getAllProfessionsAdmin(req, res, next) {
    try {
      const professions = await professionService.getAllProfessionsAdmin();
      return res.status(200).json({
        success: true,
        data: professions
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new profession (Admin only)
   */
  async createProfession(req, res, next) {
    try {
      const profession = await professionService.createProfession(req.body);
      return res.status(201).json({
        success: true,
        data: profession
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a profession (Admin only)
   */
  async updateProfession(req, res, next) {
    try {
      const profession = await professionService.updateProfession(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        data: profession
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Hard Delete a profession (Admin only)
   */
  async deleteProfession(req, res, next) {
    try {
      await professionService.deleteProfession(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Profession permanently deleted'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add a dynamic field to a profession (Admin only)
   */
  async addProfessionField(req, res, next) {
    try {
      const field = await professionService.addProfessionField(req.params.id, req.body);
      return res.status(201).json({
        success: true,
        data: field
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a dynamic field (Admin only)
   */
  async updateProfessionField(req, res, next) {
    try {
      const field = await professionService.updateProfessionField(req.params.fieldId, req.body);
      return res.status(200).json({
        success: true,
        data: field
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a dynamic field (Admin only)
   */
  async deleteProfessionField(req, res, next) {
    try {
      await professionService.deleteProfessionField(req.params.fieldId);
      return res.status(200).json({
        success: true,
        message: 'Field deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};
