import { MASTER_DATA } from '../../../constants/masterData.js';
import { professionService } from '../../../services/profession.service.js';

export const lookupsController = {
  /**
   * Get all master lookups (public for all apps)
   */
  async getAllLookups(req, res, next) {
    try {
      // Include professions dynamically from DB if available
      let professions = [];
      try {
        professions = await professionService.getProfessions();
      } catch (e) {
        professions = [];
      }

      return res.status(200).json({
        success: true,
        data: {
          ...MASTER_DATA,
          professions: professions || []
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get specific lookup by key
   */
  async getLookupByKey(req, res, next) {
    try {
      const { key } = req.params;
      const data = MASTER_DATA[key];
      if (!data) {
        return res.status(404).json({
          success: false,
          error: `Lookup key '${key}' not found`
        });
      }

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
};
