import connectionService from '../../services/connection.service.js';

class ConnectionsController {
  async followUser(req, res, next) {
    try {
      const followerId = req.user.id;
      const followingId = req.params.userId;
      
      const result = await connectionService.followUser(followerId, followingId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async unfollowUser(req, res, next) {
    try {
      const followerId = req.user.id;
      const followingId = req.params.userId;
      
      const result = await connectionService.unfollowUser(followerId, followingId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getFollowers(req, res, next) {
    try {
      const userId = req.params.userId;
      const followers = await connectionService.getFollowers(userId);
      res.status(200).json({ success: true, data: followers });
    } catch (error) {
      next(error);
    }
  }

  async getFollowing(req, res, next) {
    try {
      const userId = req.params.userId;
      const following = await connectionService.getFollowing(userId);
      res.status(200).json({ success: true, data: following });
    } catch (error) {
      next(error);
    }
  }

  async searchUsers(req, res, next) {
    try {
      const query = req.query.q;
      const currentUserId = req.user.id;
      const results = await connectionService.searchUsers(query, currentUserId);
      res.status(200).json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  }

  async getPublicProfile(req, res, next) {
    try {
      const username = req.params.username;
      const currentUserId = req.user ? req.user.id : null;
      const profile = await connectionService.getPublicProfile(username, currentUserId);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async recordProfileVisit(req, res, next) {
    try {
      const profileUserId = req.params.userId;
      const viewerId = req.user ? req.user.id : null;
      await connectionService.recordProfileVisit(profileUserId, viewerId);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
  async getProfileVisitors(req, res, next) {
    try {
      const userId = req.user.id; // User must be authenticated to see their own visitors
      const visitors = await connectionService.getProfileVisitors(userId);
      res.status(200).json({ success: true, data: visitors });
    } catch (error) {
      next(error);
    }
  }
}

export default new ConnectionsController();
