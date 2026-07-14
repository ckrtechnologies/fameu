import express from 'express';
const router = express.Router();
import profileController from './profile.controller.js';
import authMiddleware from '../../../core/middlewares/auth.middleware.js';
import { uploadArtistMedia  } from '../../../core/middlewares/upload.middleware.js';

// All artist profile routes require authentication
router.use(authMiddleware);

// Base Profile CRUD
router.get('/', profileController.getProfile);
router.get('/check-username/:username', profileController.checkUsername);
router.post('/upsert', profileController.upsertProfile);

// Dynamic Category Update (Actor, Singer, etc)
router.post('/category', profileController.updateCategoryDetails);

// Request Verification
router.post('/verify', profileController.requestVerification);

// Media Uploads via Multer
// Expects form-data with fields: photos (multiple), video, resume, audio
router.post('/upload', 
  uploadArtistMedia.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'video', maxCount: 10 },
    { name: 'resume', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]), 
  profileController.uploadMedia
);

router.post('/upload-file',
  uploadArtistMedia.single('file'),
  profileController.uploadFile
);

export default router;
