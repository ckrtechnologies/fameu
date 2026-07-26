import express from 'express';
const router = express.Router();
import discoverController from './discover.controller.js';
import authMiddleware from '../../../core/middlewares/auth.middleware.js';

router.use(authMiddleware);

// Discovery Feed & Details
router.get('/feed', discoverController.getFeed);
router.get('/hiring-agencies', discoverController.searchHiringAgencies);
router.get('/:id', discoverController.getAuditionDetails);

// Applications
router.post('/:id/apply', discoverController.applyToAudition);
router.get('/my-applications/list', discoverController.getMyApplications);

// Saved Auditions
router.get('/saved/list', discoverController.getSavedAuditions);

// Interactions
router.post('/:id/bookmark', discoverController.toggleBookmark);
router.post('/:id/check-in', discoverController.checkIn);

export default router;
