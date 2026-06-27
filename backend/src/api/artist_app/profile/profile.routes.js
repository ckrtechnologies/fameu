import express from 'express';
const router = express.Router();
import profileController from './profile.controller.js';
import authMiddleware from '../../../core/middlewares/auth.middleware.js';
import { uploadArtistMedia  } from '../../../core/middlewares/upload.middleware.js';

// All artist profile routes require authentication
router.use(authMiddleware);

// Base Profile CRUD
router.get('/', profileController.getProfile);
router.post('/upsert', profileController.upsertProfile);

// Dynamic Category Update (Actor, Singer, etc)
router.post('/category', profileController.updateCategoryDetails);

// Media Uploads via Multer
// Expects form-data with fields: photos (multiple), video, resume, audio
router.post('/upload', 
  uploadArtistMedia.fields([
    { name: 'photos', maxCount: 5 },
    { name: 'video', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]), 
  profileController.uploadMedia
);

export default router;
