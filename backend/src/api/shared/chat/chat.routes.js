import express from 'express';
const router = express.Router();
import chatController from './chat.controller.js';
import authMiddleware from '../../../core/middlewares/auth.middleware.js';

router.use(authMiddleware);

// Inbox
router.get('/', chatController.getInbox);

// Create / Start Conversation
router.post('/start', chatController.startConversation);

// Get Messages
router.get('/:conversationId/messages', chatController.getMessages);

export default router;
