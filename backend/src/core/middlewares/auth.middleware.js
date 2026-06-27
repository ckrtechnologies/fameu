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

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Token expired or invalid' });
  }
};

export default authMiddleware;
