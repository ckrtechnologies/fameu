import express from 'express';
const router = express.Router();
import notificationController from './notification.controller.js';
import authMiddleware from '../../core/middlewares/auth.middleware.js';

router.use(authMiddleware);

router.post('/fcm-token', notificationController.registerFcmToken);
router.get('/', notificationController.getNotifications);
router.put('/read-all', notificationController.markAllRead);
router.put('/:id/read', notificationController.markRead);

export default router;
