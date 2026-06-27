import express from 'express';
const router = express.Router();

import profileRoutes from './profile/profile.routes.js';
import discoverRoutes from './discover/discover.routes.js';
import chatRoutes from '../shared/chat/chat.routes.js';

router.use('/profile', profileRoutes);
router.use('/discover', discoverRoutes);
router.use('/chat', chatRoutes);

export default router;
