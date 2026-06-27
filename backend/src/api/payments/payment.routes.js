import express from 'express';
const router = express.Router();
import paymentController from './payment.controller.js';
import authMiddleware from '../../core/middlewares/auth.middleware.js';

// Public route for Cashfree webhook
router.post('/webhook', paymentController.webhook);

// Protected routes
router.use(authMiddleware);
router.post('/initiate', paymentController.initiatePayment);
router.get('/transactions', paymentController.getTransactions);

export default router;
