import express from 'express';
const router = express.Router();
import dashboardController from './dashboard.controller.js';
import authMiddleware from '../../../core/middlewares/auth.middleware.js';

router.use(authMiddleware);

router.get('/', dashboardController.getDashboardData);

export default router;
