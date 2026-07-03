import React, { useState, useEffect } from 'react';
import { useGetUserDetailsQuery, useUpdateUserMutation } from '../store/api/adminEndpoints';
import { X } from 'lucide-react';

export default function EditUserModal({ userId, onClose }) {
  const { data: response, isLoading } = useGetUserDetailsQuery(userId, { skip: !userId });
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  
  const [formData, setFormData] = useState({
    display_name: '',
    mobile: ''
  });

  useEffect(() => {
    if (response?.data) {
      setFormData({
        display_name: response.data.display_name || '',
        mobile: response.data.mobile || ''
      });
    }
  }, [response]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ id: userId, ...formData }).unwrap();
      onClose();
    } catch (err) {
      alert(`Failed to update user: ${err.message || 'Unknown error'}`);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!userId) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px'
      }}
      onClick={handleBackdropClick}
      className="animate-fade-in"
    >
      <div 
        className="card" 
        style={{ 
          width: '100%', 
          maxWidth: '500px',
          position: 'relative',
          padding: '32px'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>Edit User</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Update user's basic information.</p>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px' }}>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.display_name}
                onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isUpdating}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
