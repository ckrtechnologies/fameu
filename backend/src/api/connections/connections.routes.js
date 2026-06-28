import { Router } from 'express';
import connectionsController from './connections.controller.js';
import authMiddleware from '../../core/middlewares/auth.middleware.js';

const router = Router();

// Routes for logged in users
router.use(authMiddleware);

router.post('/follow/:userId', connectionsController.followUser);
router.post('/unfollow/:userId', connectionsController.unfollowUser);

router.get('/:userId/followers', connectionsController.getFollowers);
router.get('/:userId/following', connectionsController.getFollowing);

router.get('/search/users', connectionsController.searchUsers);
router.get('/profile/:username', connectionsController.getPublicProfile);

export default router;
