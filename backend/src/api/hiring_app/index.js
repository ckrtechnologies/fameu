import express from 'express';
const router = express.Router();

import companyRoutes from './company/company.routes.js';
import auditionRoutes from './auditions/audition.routes.js';
import artistsRoutes from './artists/artists.routes.js';
import chatRoutes from '../shared/chat/chat.routes.js';
import dashboardRoutes from './dashboard/dashboard.routes.js';

router.use('/company', companyRoutes);
router.use('/auditions', auditionRoutes);
router.use('/artists', artistsRoutes);
router.use('/chat', chatRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
