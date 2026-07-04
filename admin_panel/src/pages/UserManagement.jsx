import { useState } from 'react';
import { useGetUsersQuery, useDeleteUserMutation } from '../store/api/adminEndpoints';
import DataTable from '../components/DataTable';
import UserDetailsModal from '../components/UserDetailsModal';
import EditUserModal from '../components/EditUserModal';
import { getImageUrl } from '../lib/api';

export default function UserManagement({ role = 'all' }) {
  const { data: response, isLoading: loading } = useGetUsersQuery(role);
  const [deleteUser] = useDeleteUserMutation();
  const users = response?.data || [];
  
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editUserId, setEditUserId] = useState(null);

  const title = role === 'artist' ? 'Artists' : role === 'hiring' ? 'Hiring Partners' : 'All Users';
  const subtitle = `View and manage all registered ${title.toLowerCase()}.`;

  const columns = [
    { 
      key: 'user', 
      label: 'User', 
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={getImageUrl(row.avatar_url) || `https://ui-avatars.com/api/?name=${row.display_name || 'User'}&background=random`} 
            alt="avatar" 
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${row.display_name || 'User'}&background=random`;
            }}
          />
          <span style={{ fontWeight: '500' }}>{row.display_name || 'Unnamed User'}</span>
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'Role', 
      render: (val, row) => (
        <span className={`badge ${row.role === 'artist' ? 'badge-approved' : 'badge-pending'}`} style={{ textTransform: 'capitalize' }}>
          {row.role}
        </span>
      )
    },
    { 
      key: 'identifier', 
      label: 'Identifier', 
      render: (val, row) => row.email || row.mobile || 'N/A'
    },
    { 
      key: 'created_at', 
      label: 'Joined', 
      render: (val, row) => new Date(row.created_at).toLocaleDateString()
    }
  ];

  // Prepare a dynamic filter config. Since the route might be 'artist' or 'hiring', we only show 'role' filter if viewing 'All Users'
  const filterConfig = role === 'all' ? { role: ['artist', 'hiring'] } : {};

  if (loading) {
    return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading data...</div>;
  }

  return (
    <>
      <DataTable 
        title={title}
        subtitle={subtitle}
        columns={columns}
        data={users}
        filterConfig={filterConfig}
        onView={(row) => setSelectedUserId(row.id)}
        onEdit={(row) => setEditUserId(row.id)}
        onDelete={async (row) => {
          if(window.confirm(`Are you sure you want to permanently delete ${row.display_name || 'this user'}? This action cannot be undone.`)) {
            try {
              await deleteUser(row.id).unwrap();
              alert('User deleted successfully.');
            } catch (error) {
              alert(`Failed to delete user: ${error.message || 'Unknown error'}`);
            }
          }
        }}
      />
      {selectedUserId && (
        <UserDetailsModal 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      )}
      {editUserId && (
        <EditUserModal 
          userId={editUserId} 
          onClose={() => setEditUserId(null)} 
        />
      )}
    </>
  );
}
