import express from 'express';
const router = express.Router();
import artistsController from './artists.controller.js';
import authMiddleware from '../../../core/middlewares/auth.middleware.js';

router.use(authMiddleware);

// Browse and Search Artists
router.get('/', artistsController.searchArtists);
router.get('/search', artistsController.searchArtists);
router.get('/:id', artistsController.getArtistDetails);
router.post('/:id/invite', artistsController.inviteArtist);
router.post('/:id/block', artistsController.blockArtist);
router.post('/:id/report', artistsController.reportArtist);

export default router;
