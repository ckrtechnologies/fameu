import { useGetUsersQuery } from '../store/api/adminEndpoints';
import { Ban, Trash2 } from 'lucide-react';

export default function UserManagement({ role = 'all' }) {
  const { data: response, isLoading: loading } = useGetUsersQuery(role);
  const users = response?.data || [];

  const title = role === 'artist' ? 'Artists' : role === 'hiring' ? 'Hiring Partners' : 'All Users';
  const subtitle = `View and manage all registered ${title.toLowerCase()}.`;

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500' }}>User</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500' }}>Role</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500' }}>Identifier</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500' }}>Joined</th>
              <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: '500' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center' }}>Loading...</td></tr>
            ) : users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.display_name}&background=random`} 
                    alt="avatar" 
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontWeight: '500' }}>{user.display_name || 'Unnamed User'}</span>
                </td>
                <td style={{ padding: '16px', textTransform: 'capitalize' }}>
                  <span className={`badge ${user.role === 'artist' ? 'badge-approved' : 'badge-pending'}`}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                  {user.email || user.mobile || 'N/A'}
                </td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px', marginRight: '8px' }} title="Ban User">
                    <Ban size={16} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '6px' }} title="Delete User">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
