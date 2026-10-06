import { useState } from 'react';
import { useGetUsersQuery, useBlacklistUserMutation, useRemoveBlacklistMutation } from '../store/api/adminEndpoints';
import DataTable from '../components/DataTable';
import { X } from 'lucide-react';

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
        <div 
          className="drawer-backdrop"
          onClick={() => setShowAddForm(false)}
        >
          <div 
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: '100%', 
              maxWidth: '520px', 
              height: '100vh',
              borderTopLeftRadius: '16px',
              borderBottomLeftRadius: '16px',
              background: '#ffffff',
              padding: '32px 28px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Ban User</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>
            
            <form onSubmit={handleAddBlacklist} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label>Reason:</label>
                <textarea 
                  className="input-field" 
                  rows="4" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for blacklisting..."
                  required
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '20px' }}>
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
