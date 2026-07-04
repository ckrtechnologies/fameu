import express from 'express';
import * as commentsController from './comments.controller.js';
import authMiddleware from '../../core/middlewares/auth.middleware.js';

const router = express.Router();

// Public route to view comments
router.get('/:type/:targetId', commentsController.getComments);

// Protected routes to add, edit, and delete comments
router.post('/:type/:targetId', authMiddleware, commentsController.addComment);
router.put('/:type/:commentId', authMiddleware, commentsController.updateComment);
router.delete('/:type/:commentId', authMiddleware, commentsController.deleteComment);

export default router;
