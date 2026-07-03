import express from 'express';
import supabase from '../../config/supabase.js';
import jwt from 'jsonwebtoken';
import authMiddleware from '../../core/middlewares/auth.middleware.js';

const router = express.Router();

// Admin Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) return res.status(401).json({ success: false, error: error.message });
    
    // Verify role in our users table using service_role bypass
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();
      
    if (userRecord?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access Denied: You do not have administrator privileges.' });
    }
    
    // Issue a custom JWT for the admin session
    const token = jwt.sign(
      { id: data.user.id, role: 'admin' }, 
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify Admin Session
router.get('/auth/me', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Unauthorized' });
  }
  res.json({ success: true, user: req.user });
});

// --- PROTECTED ADMIN ROUTES BELOW ---
router.use(authMiddleware);

// Middleware to strictly enforce Admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};
router.use(requireAdmin);

// Fetch Pending KYC Documents
router.get('/kyc/pending', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('verification_documents')
      .select('*, hiring_profiles(company_name)')
      .eq('status', 'pending');
      
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update KYC Status
router.put('/kyc/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await supabase.from('verification_documents').update({ status }).eq('id', id);
    
    // Fetch hiring_id to update profile too
    const { data: doc } = await supabase.from('verification_documents').select('hiring_id').eq('id', id).single();
    if (doc) {
      const isVerified = status === 'approved';
      await supabase.from('hiring_profiles').update({ verification_status: status, is_verified: isVerified }).eq('id', doc.hiring_id);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fetch Users
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    let query = supabase.from('users').select('*').order('created_at', { ascending: false }).limit(100);
    
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fetch User Details
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get base user
    const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', id).single();
    if (userError) throw userError;
    
    let profile = null;
    let documents = [];
    
    if (user.role === 'artist') {
      const { data } = await supabase.from('artist_profiles').select('*').eq('id', id).single();
      profile = data;
    } else if (user.role === 'hiring') {
      const { data } = await supabase.from('hiring_profiles').select('*').eq('id', id).single();
      profile = data;
      
      if (profile) {
        const { data: docs } = await supabase.from('verification_documents').select('*').eq('hiring_id', profile.id);
        documents = docs || [];
      }
    }
    
    res.json({ success: true, data: { ...user, profile, documents } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update User Basic Details
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { display_name, mobile } = req.body;
    
    const { error } = await supabase.from('users').update({ display_name, mobile }).eq('id', id);
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete User completely
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Auth admin API allows fully deleting the user from Auth, 
    // which cascades to public.users and everything else because of ON DELETE CASCADE
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fetch all conversations for monitoring
router.get('/conversations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:users!fk_participant1(id, display_name, email, role),
        participant2:users!fk_participant2(id, display_name, email, role)
      `)
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fetch messages for a specific conversation
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(display_name)')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- NEW ADMIN MODULES ---

// Analytics
router.get('/analytics', async (req, res) => {
  try {
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: auditionsCount } = await supabase.from('auditions').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: applicationsCount } = await supabase.from('applications').select('*', { count: 'exact', head: true });
    const { data: payments } = await supabase.from('payments').select('amount').eq('status', 'success');
    const revenue = payments ? payments.reduce((sum, p) => sum + Number(p.amount), 0) : 0;
    
    res.json({ 
      success: true, 
      data: { 
        totalUsers: usersCount || 0, 
        activeAuditions: auditionsCount || 0, 
        totalApplications: applicationsCount || 0, 
        totalRevenue: revenue 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Auditions
router.get('/auditions', async (req, res) => {
  try {
    const { data, error } = await supabase.from('auditions').select('*, hiring_profiles(company_name)').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/auditions/:id/flag', async (req, res) => {
  try {
    const { error } = await supabase.from('auditions').update({ status: 'cancelled' }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/auditions/:id/suspend', async (req, res) => {
  try {
    // The database only accepts specific statuses (like 'cancelled' or 'active').
    // Since 'suspended' is not allowed by the check constraint, we use 'cancelled' 
    // to effectively remove it from active listings.
    const { error } = await supabase.from('auditions').update({ status: 'cancelled', is_live: false }).eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/auditions/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('auditions').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fraud Reports
router.get('/fraud-reports', async (req, res) => {
  try {
    const { data, error } = await supabase.from('fraud_reports').select('*, reporter:users(display_name, email), audition:auditions(title)').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/fraud-reports/:id/action', async (req, res) => {
  try {
    const { action_taken, status } = req.body;
    const { error } = await supabase.from('fraud_reports').update({ action_taken, status }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Blacklist
router.post('/blacklist', async (req, res) => {
  try {
    const { user_id, reason } = req.body;
    await supabase.from('blacklist').insert([{ user_id, reason, added_by: req.user.id }]);
    await supabase.from('users').update({ is_blacklisted: true }).eq('id', user_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/blacklist/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    await supabase.from('users').update({ is_blacklisted: false }).eq('id', userId);
    await supabase.from('blacklist').delete().eq('user_id', userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Applications
router.get('/applications', async (req, res) => {
  try {
    const { data: rawData, error } = await supabase
      .from('applications')
      .select('*, artist:artist_profiles(full_name, user:users(display_name, email, mobile)), audition:auditions(title, category)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const data = rawData.map(app => ({
      ...app,
      artist: {
        display_name: app.artist?.full_name || app.artist?.user?.display_name || 'N/A',
        email: app.artist?.user?.email || 'N/A',
        mobile: app.artist?.user?.mobile || 'N/A'
      }
    }));
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Payments
router.get('/payments', async (req, res) => {
  try {
    const { data, error } = await supabase.from('payments').select('*, hiring_profiles(company_name)').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CMS
router.get('/cms', async (req, res) => {
  try {
    const { data, error } = await supabase.from('cms_content').select('*');
    if (error) throw error;
    const cmsMap = {};
    data.forEach(item => cmsMap[item.key] = item.value);
    res.json({ success: true, data: cmsMap });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/cms', async (req, res) => {
  try {
    const { key, value } = req.body;
    const { error } = await supabase.from('cms_content').update({ value }).eq('key', key);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Notification Management System (NMS)
router.post('/notifications/send', async (req, res) => {
  try {
    const { title, body, target, targetUserId, deepLink } = req.body;
    let query = supabase.from('users').select('id, fcm_token').not('fcm_token', 'is', null);
    
    if (target === 'artists') {
      query = query.eq('role', 'artist');
    } else if (target === 'hiring') {
      query = query.eq('role', 'hiring');
    } else if (target === 'specific' && targetUserId) {
      query = query.eq('id', targetUserId);
    }

    const { data: users, error } = await query;
    if (error) throw error;

    const tokens = users.map(u => u.fcm_token).filter(t => t);
    
    // Import notification service dynamically to avoid circular dependencies if any
    const notificationService = (await import('../../services/notification.service.js')).default;
    
    let result = { successCount: 0, failureCount: 0 };
    if (tokens.length > 0) {
      result = await notificationService.sendBulkPushNotification(tokens, title, body, {
        type: 'admin_broadcast',
        deepLink: deepLink || '',
      });
    }

    // Save broadcast history to notifications table using admin's user_id
    await supabase.from('notifications').insert([{
      user_id: req.user.id,
      title,
      body,
      type: 'admin_broadcast',
      data: {
        target,
        targetUserId,
        deepLink,
        successCount: result.successCount,
        failureCount: result.failureCount,
        totalAttempted: tokens.length
      }
    }]);

    res.json({ success: true, data: { ...result, totalAttempted: tokens.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/notifications/history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'admin_broadcast')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
