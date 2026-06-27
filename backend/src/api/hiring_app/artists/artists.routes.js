import express from 'express';
const router = express.Router();
import artistsController from './artists.controller.js';
import authMiddleware from '../../../core/middlewares/auth.middleware.js';

router.use(authMiddleware);

// Browse and Search Artists
router.get('/search', artistsController.searchArtists);
router.get('/:id', artistsController.getArtistDetails);

export default router;
