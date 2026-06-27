import express from 'express';
const router = express.Router();
import companyController from './company.controller.js';
import authMiddleware from '../../../core/middlewares/auth.middleware.js';
import { uploadHiringDocs  } from '../../../core/middlewares/upload.middleware.js';

// All hiring company routes require authentication
router.use(authMiddleware);

// Base Profile CRUD
router.get('/', companyController.getProfile);
router.post('/upsert', companyController.upsertProfile);

// Upload Logo
router.post('/logo', uploadHiringDocs.single('logo'), companyController.uploadLogo);

// Upload KYC Docs
router.post('/kyc', 
  uploadHiringDocs.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'company_reg', maxCount: 1 },
    { name: 'gst', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
  ]), 
  companyController.uploadKYC
);

export default router;
