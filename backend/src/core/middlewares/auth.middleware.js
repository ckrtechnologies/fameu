import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    
    // Use SUPABASE_JWT_SECRET to verify, so it accepts both our custom OTP tokens 
    // and tokens minted directly by Supabase Auth
    const secret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'super-secret-dev-key';
    
    const decoded = jwt.verify(token, secret);
    
    // Attach user payload to request
    req.user = {
      id: decoded.sub,
      role: decoded.role || 'artist'
    };

    // Check if user is blacklisted in real-time
    import('../../config/supabase.js').then(async (m) => {
      try {
        const { data } = await m.default.from('users').select('is_blacklisted').eq('id', req.user.id).single();
        if (data && data.is_blacklisted) {
          return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact support.' });
        }
        next();
      } catch (dbErr) {
        next(); // If DB fails, fallback to letting them through rather than breaking the app
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Token expired or invalid' });
  }
};

export default authMiddleware;
