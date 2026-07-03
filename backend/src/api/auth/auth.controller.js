import authService from '../../services/auth.service.js';
import supabase from '../../config/supabase.js';

class AuthController {
  
  async sendOtp(req, res, next) {
    try {
      const { identifier } = req.body;
      if (!identifier) {
        return res.status(400).json({ success: false, error: 'Mobile or email (identifier) is required' });
      }

      const result = await authService.sendOtp(identifier);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const { identifier, otp } = req.body;
      if (!identifier || !otp) {
        return res.status(400).json({ success: false, error: 'Identifier and OTP are required' });
      }

      const result = await authService.verifyOtp(identifier, otp);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      // If error is incorrect otp, return 400 instead of 500
      if (err.message === 'Incorrect OTP' || err.message === 'OTP has expired') {
        err.statusCode = 400;
      }
      next(err);
    }
  }

  async socialLogin(req, res, next) {
    try {
      const { supabase_token } = req.body;
      if (!supabase_token) {
        return res.status(400).json({ success: false, error: 'supabase_token is required' });
      }

      const result = await authService.socialLogin(supabase_token);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      if (err.message.includes('Invalid')) err.statusCode = 401;
      next(err);
    }
  }

  // Used for updating the role (Artist vs Hiring) if the user is new
  async setRole(req, res, next) {
    try {
      const { role } = req.body;
      const userId = req.user.id; // from auth middleware

      if (!['artist', 'hiring'].includes(role)) {
        return res.status(400).json({ success: false, error: 'Invalid role' });
      }

      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await authService.deleteAccount(userId);
      res.status(200).json({ success: true, data: result, message: 'Account deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
