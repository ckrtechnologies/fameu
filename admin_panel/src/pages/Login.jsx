import { useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/admin_panel/auth/login', {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem('admin_token', token);
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', height: '64px', 
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)'
          }}>
            <ShieldAlert color="white" size={32} />
          </div>
          <h2>Fameu Admin</h2>
          <p style={{ marginTop: '8px' }}>Sign in to access the control panel</p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239,68,68,0.1)', 
            border: '1px solid rgba(239,68,68,0.2)', 
            color: 'var(--danger)', 
            padding: '12px', 
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="admin@fameu.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Authenticating...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>
      </div>
    </div>
  );
}
