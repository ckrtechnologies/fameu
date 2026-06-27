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
      await supabase.from('hiring_profiles').update({ verification_status: status }).eq('id', doc.hiring_id);
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

export default router;
