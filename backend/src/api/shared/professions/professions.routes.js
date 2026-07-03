import express from 'express';
import { professionsController } from './professions.controller.js';

const router = express.Router();

// Public route (for Artist App and Hiring App)
router.get('/', professionsController.getProfessions);

// Admin routes
// Normally these would be protected by admin auth middleware
router.get('/admin', professionsController.getAllProfessionsAdmin);
router.post('/admin', professionsController.createProfession);
router.put('/admin/:id', professionsController.updateProfession);
router.delete('/admin/:id', professionsController.deleteProfession);

// Manage Dynamic Fields
router.post('/admin/:id/fields', professionsController.addProfessionField);
router.put('/admin/fields/:fieldId', professionsController.updateProfessionField);
router.delete('/admin/fields/:fieldId', professionsController.deleteProfessionField);

export default router;
