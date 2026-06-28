import express from 'express';
const router = express.Router();
import authController from './auth.controller.js';
import authMiddleware from '../../core/middlewares/auth.middleware.js';

// Public Routes
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/social-login', authController.socialLogin);

// Protected Routes
// Used immediately after signup to choose Artist or Hiring
router.post('/set-role', authMiddleware, authController.setRole);
router.delete('/delete-account', authMiddleware, authController.deleteAccount);

export default router;
