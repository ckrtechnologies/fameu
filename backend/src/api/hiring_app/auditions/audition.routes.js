import express from 'express';
const router = express.Router();
import auditionController from './audition.controller.js';
import authMiddleware from '../../../core/middlewares/auth.middleware.js';

router.use(authMiddleware);

// Audition CRUD
router.post('/', auditionController.createAudition);
router.get('/', auditionController.getMyAuditions);
router.get('/:id', auditionController.getAuditionById);
router.put('/:id', auditionController.updateAudition);
router.delete('/:id', auditionController.deleteAudition);

// ATS routes
router.get('/applicants/all', auditionController.getAllApplicants);
router.get('/:auditionId/applicants', auditionController.getApplicants);
router.put('/applications/:applicationId/status', auditionController.updateApplicationStatus);

export default router;
