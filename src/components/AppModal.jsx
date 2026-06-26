import React, { useState, useEffect, useRef } from 'react';

export default function AppModal({ isOpen, initialRole, onClose }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('Artist');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(59);
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPhone('');
      setOtp('');
      setTimer(59);
      if (initialRole) {
        setRole(initialRole);
      }
    } else {
      clearInterval(timerRef.current);
    }
  }, [isOpen, initialRole]);

  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimer(59);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    setStep(2);
    startTimer();
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp !== '123456') {
      alert('Invalid OTP. Please enter 123456 to test.');
      return;
    }
    clearInterval(timerRef.current);
    setStep(3);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-window">
        <div className="modal-header">
          <h3 className="modal-title">Get Started on Fameuget</h3>
          <span className="modal-close" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body">
          {/* Step 1: Input details */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Enter your mobile number to sign up or log in. We will send you an OTP to verify your account.
              </p>
              
              <div className="form-group">
                <label htmlFor="modalRole">Select Your Role</label>
                <select 
                  id="modalRole" 
                  className="form-control" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Artist">Artist (Actor, Singer, Dancer, etc.)</option>
                  <option value="Hiring">Hiring (Production House / Director)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="modalPhone">Mobile Number</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>+91</span>
                  <input 
                    type="tel" 
                    id="modalPhone" 
                    className="form-control" 
                    placeholder="Enter 10-digit mobile" 
                    style={{ flex: 1 }} 
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Send OTP</button>
              
              <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                By continuing, you agree to Fameuget's Terms of Service & Privacy Policy.
              </div>
            </form>
          )}

          {/* Step 2: Verification code */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                We've sent a 6-digit verification code to your mobile number. Enter '123456' to test.
              </p>
              <div className="form-group">
                <label htmlFor="modalOtp">6-Digit Verification Code</label>
                <input 
                  type="text" 
                  id="modalOtp" 
                  className="form-control" 
                  placeholder="Enter 6-digit code" 
                  maxLength={6} 
                  style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.5em' }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '1rem' }}>Verify & Proceed</button>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {timer > 0 ? `Resend OTP in 0:${timer < 10 ? `0${timer}` : timer}` : 'OTP expired'}
                </span>
                <a 
                  href="#" 
                  style={{ color: 'var(--accent-gold)' }} 
                  onClick={(e) => { e.preventDefault(); setStep(1); }}
                >
                  Change Number
                </a>
              </div>
            </form>
          )}

          {/* Step 3: Success state */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>Welcome to Fameuget!</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Your account is verified. To complete setting up your {role === 'Artist' ? 'portfolio' : 'agency profile'}, download the Fameuget mobile app.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="btn btn-primary" onClick={() => alert('Downloading Android App...')}>Get Fameuget for Android</button>
                <button className="btn btn-secondary" onClick={() => alert('Downloading iOS App...')}>Get Fameuget for iOS</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
