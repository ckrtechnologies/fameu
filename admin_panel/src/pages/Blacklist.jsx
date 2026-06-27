import { useState } from 'react';
import { useGetUsersQuery, useBlacklistUserMutation, useRemoveBlacklistMutation } from '../store/api/adminEndpoints';
import DataTable from '../components/DataTable';

export default function Blacklist() {
  const { data: response, isLoading: loading } = useGetUsersQuery('all');
  const [blacklistUser] = useBlacklistUserMutation();
  const [removeBlacklist] = useRemoveBlacklistMutation();
  
  const users = (response?.data || []).filter(u => u.is_blacklisted);
  
  // For the Add to Blacklist form
  const [showAddForm, setShowAddForm] = useState(false);
  const [userId, setUserId] = useState('');
  const [reason, setReason] = useState('');

  const handleAddBlacklist = async (e) => {
    e.preventDefault();
    try {
      await blacklistUser({ user_id: userId, reason }).unwrap();
      setUserId('');
      setReason('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add to blacklist:', error);
      alert('Failed to add user to blacklist. Ensure the UUID is correct.');
    }
  };

  const handleRemove = async (userIdToRemove) => {
    if (!window.confirm('Are you sure you want to remove this user from the blacklist?')) return;
    try {
      await removeBlacklist(userIdToRemove).unwrap();
    } catch (error) {
      console.error('Failed to remove from blacklist:', error);
      alert('Failed to remove from blacklist.');
    }
  };

  const columns = [
    { key: 'id', label: 'User ID', render: (val) => <small>{val.substring(0, 8)}...</small> },
    { key: 'display_name', label: 'Name', render: (val) => val || 'N/A' },
    { 
      key: 'contact', 
      label: 'Email / Phone', 
      render: (val, row) => (
        <div>
          <div>{row.email || 'N/A'}</div>
          <small style={{ color: 'var(--text-muted)' }}>{row.mobile}</small>
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'Role', 
      render: (val) => <span className={`badge badge-${val === 'artist' ? 'pending' : val === 'hiring_partner' ? 'approved' : 'rejected'}`}>{val}</span>
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: () => <span className="badge badge-rejected">Blacklisted</span>
    }
  ];

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading blacklist...</div>;

  return (
    <>
      <DataTable 
        title="Blacklist"
        subtitle="Manage blocked users who are banned from accessing the platform."
        columns={columns}
        data={users}
        filterConfig={{ role: ['artist', 'hiring_partner', 'admin'] }}
        onDelete={(row) => handleRemove(row.id)}
        headerAction={
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>Add User to Blacklist</button>
        }
      />

      {showAddForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '400px', maxWidth: '90vw', margin: 0 }}>
            <h2 style={{marginBottom: '1rem'}}>Ban User</h2>
            <form onSubmit={handleAddBlacklist}>
              <div className="input-group" style={{ marginBottom: '16px' }}>
                <label>User UUID:</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  required
                />
              </div>
              <div className="input-group">
                <label>Reason:</label>
                <textarea 
                  className="input-field" 
                  rows="3" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for blacklisting..."
                  required
                ></textarea>
              </div>
              <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1rem'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Confirm Ban</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
