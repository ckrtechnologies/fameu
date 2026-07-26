import authService from '../../services/auth.service.js';
import supabase from '../../config/supabase.js';

class AuthController {
  
  async sendOtp(req, res, next) {
    try {
      let { identifier } = req.body;
      if (!identifier) {
        return res.status(400).json({ success: false, error: 'Mobile or email (identifier) is required' });
      }
      identifier = identifier.toLowerCase().trim();

      const result = await authService.sendOtp(identifier);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      let { identifier, otp, role } = req.body;
      if (!identifier || !otp) {
        return res.status(400).json({ success: false, error: 'Identifier and OTP are required' });
      }
      identifier = identifier.toLowerCase().trim();

      const result = await authService.verifyOtp(identifier, otp, role);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      // If error is incorrect otp, return 400 instead of 500
      if (err.message === 'Incorrect OTP' || err.message === 'OTP has expired') {
        err.statusCode = 400;
      } else if (err.message.includes('suspended')) {
        err.statusCode = 403;
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
      else if (err.message.includes('suspended')) err.statusCode = 403;
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

  async acceptDisclaimer(req, res, next) {
    try {
      const userId = req.user.id;
      const { data, error } = await supabase
        .from('users')
        .update({ disclaimer_accepted: true })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async reportUser(req, res, next) {
    try {
      const reporterId = req.user.id;
      const { reported_user_id, reason } = req.body;
      
      if (!reported_user_id || !reason) {
        return res.status(400).json({ success: false, error: 'reported_user_id and reason are required' });
      }

      const { data, error } = await supabase
        .from('fraud_reports')
        .insert([{ reported_by: reporterId, reported_user_id, reason }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json({ success: true, data, message: 'Report submitted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ success: false, error: 'New password is required' });
      }
      
      // If using Supabase GoTrue Auth for passwords:
      // Note: This requires the user's JWT to be passed to Supabase to update their password.
      // Since this backend uses a custom JWT (or Supabase JWT), we can try to update it using the admin client,
      // but Supabase auth requires the user's access_token to change their own password directly via client.
      // Alternatively, we use admin API:
      const { data, error } = await supabase.auth.admin.updateUserById(
        req.user.id,
        { password: password }
      );

      if (error) throw error;
      res.status(200).json({ success: true, message: 'Password updated successfully' });
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
