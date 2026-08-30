import { useState, useEffect } from 'react';
import { useLoginMutation } from '../store/api/adminEndpoints';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading: loading }] = useLoginMutation();

  useEffect(() => {
    document.title = 'Sign In | FameU Admin';
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await login({ email, password }).unwrap();
      const { token } = response;
      dispatch(setCredentials({ user: { email }, token }));
      navigate('/');
    } catch (err) {
      setError(err?.data?.error || err.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', backgroundColor: 'var(--bg-dark)' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px', margin: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img 
            src="/logo.jpeg" 
            alt="Fameu Logo" 
            style={{ 
              width: '80px', height: '80px', 
              borderRadius: '16px',
              objectFit: 'cover',
              margin: '0 auto 16px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
              display: 'block'
            }} 
          />
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
