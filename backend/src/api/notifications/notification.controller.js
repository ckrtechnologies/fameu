import notificationService from '../../services/notification.service.js';
import supabase from '../../config/supabase.js';

const notificationController = {
  // Register FCM Token
  registerFcmToken: async (req, res, next) => {
    try {
      const { fcm_token } = req.body;
      const userId = req.user.id;

      if (!fcm_token) {
        return res.status(400).json({ success: false, error: 'fcm_token is required' });
      }

      const { error } = await supabase
        .from('users')
        .update({ fcm_token })
        .eq('id', userId);

      if (error) throw error;
      res.status(200).json({ success: true, message: 'FCM token registered' });
    } catch (error) {
      next(error);
    }
  },

  // Get User's Notifications
  getNotifications: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  // Mark Notification as Read
  markRead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', req.user.id);

      if (error) throw error;
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  // Mark All Notifications as Read
  markAllRead: async (req, res, next) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', req.user.id);

      if (error) throw error;
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};

export default notificationController;
