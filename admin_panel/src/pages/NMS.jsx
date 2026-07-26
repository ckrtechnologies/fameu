import { useState } from 'react';
import { 
  useSendNotificationMutation, 
  useGetNotificationHistoryQuery,
  useGetUsersQuery
} from '../store/api/adminEndpoints';
import { format } from 'date-fns';

export default function NMS() {
  const [sendNotification, { isLoading: isSending }] = useSendNotificationMutation();
  const { data: historyData, isLoading: isLoadingHistory, refetch } = useGetNotificationHistoryQuery();
  const { data: usersData } = useGetUsersQuery('all');
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [targetUserId, setTargetUserId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [deepLink, setDeepLink] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      setMessage({ text: 'Title and body are required.', type: 'error' });
      return;
    }
    if (target === 'specific' && !targetUserId) {
      setMessage({ text: 'Target User ID is required.', type: 'error' });
      return;
    }

    try {
      const res = await sendNotification({ title, body, target, targetUserId, deepLink }).unwrap();
      setMessage({ text: `Successfully sent to ${res.data.successCount} users.`, type: 'success' });
      setTitle('');
      setBody('');
      setTargetUserId('');
      setDeepLink('');
      refetch();
    } catch (err) {
      setMessage({ text: err.data?.error || 'Failed to send notification.', type: 'error' });
    }
  };
  const filteredUsers = userSearch.trim() === '' 
    ? [] 
    : (usersData?.data || []).filter(u => {
        const term = userSearch.toLowerCase();
        return (u.display_name?.toLowerCase().includes(term) || 
                u.email?.toLowerCase().includes(term) || 
                u.mobile?.includes(term));
      }).slice(0, 10);

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
        <h1 className="page-title">Notification Management</h1>
        <p className="page-subtitle">Broadcast push notifications to users.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Composer Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Compose Message</h2>
          
          {message.text && (
            <div style={{ 
              padding: '1rem', 
              marginBottom: '1rem', 
              borderRadius: '8px', 
              background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: message.type === 'error' ? 'var(--danger)' : 'var(--success)',
              border: `1px solid ${message.type === 'error' ? 'var(--danger)' : 'var(--success)'}`
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Title</label>
              <input 
                type="text" 
                className="input-field"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Notification Title"
              />
            </div>
            
            <div className="input-group">
              <label>Body</label>
              <textarea 
                className="input-field"
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Notification Body..."
                rows="4"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="input-group">
              <label>Target Audience</label>
              <select 
                className="input-field"
                value={target}
                onChange={e => setTarget(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="artists">Artists Only</option>
                <option value="hiring">Hiring Managers Only</option>
                <option value="specific">Specific User</option>
              </select>
            </div>

            {target === 'specific' && (
              <div className="input-group" style={{ position: 'relative' }}>
                <label>Search Target User</label>
                
                {targetUserId ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-light)', border: '1px solid var(--primary)', borderRadius: '6px' }}>
                    <div style={{ flex: 1, fontSize: '0.9rem' }}>
                      {(() => {
                        const u = usersData?.data?.find(u => u.id === targetUserId);
                        return u ? `${u.display_name} (${u.email || u.mobile})` : targetUserId;
                      })()}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setTargetUserId('');
                        setUserSearch('');
                      }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem', padding: '0 4px' }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <input 
                      type="text" 
                      className="input-field"
                      value={userSearch}
                      onChange={e => {
                        setUserSearch(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="Search by name, email, or phone..."
                      autoComplete="off"
                    />
                    {isDropdownOpen && userSearch.trim() !== '' && (
                      <div style={{ 
                        position: 'absolute', top: '100%', left: 0, right: 0, 
                        background: 'var(--bg-dark)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '6px', 
                        marginTop: '4px', 
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        maxHeight: '250px', overflowY: 'auto'
                      }}>
                        {filteredUsers.length === 0 ? (
                          <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No users found.</div>
                        ) : (
                          filteredUsers.map(u => (
                            <div 
                              key={u.id} 
                              onClick={() => {
                                setTargetUserId(u.id);
                                setIsDropdownOpen(false);
                                setUserSearch('');
                              }}
                              className="hover-bg-light"
                              style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}
                            >
                              <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{u.display_name || 'Unknown'} <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--bg-light)', borderRadius: '4px', marginLeft: '6px' }}>{u.role}</span></span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email || u.mobile}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="input-group">
              <label>Deep Link (Optional)</label>
              <input 
                type="text" 
                className="input-field"
                value={deepLink}
                onChange={e => setDeepLink(e.target.value)}
                placeholder="fameu://app/Auditions"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSending}
              style={{ 
                justifyContent: 'center',
                padding: '12px', 
                cursor: isSending ? 'not-allowed' : 'pointer',
                opacity: isSending ? 0.7 : 1,
                marginTop: '1rem'
              }}
            >
              {isSending ? 'Sending...' : 'Broadcast Notification'}
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Broadcast History</h2>
          
          {isLoadingHistory ? (
            <p>Loading history...</p>
          ) : (
            <div className="table-container">
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Date</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Title</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Recipient</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Success</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData?.data?.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>No broadcasts yet.</td></tr>
                  ) : (
                    historyData?.data?.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                          {format(new Date(item.created_at), 'MMM dd, HH:mm')}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: '500' }}>{item.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.body.substring(0, 40)}{item.body.length > 40 ? '...' : ''}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {item.users ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                                {item.users.display_name || 'No Name'}
                                <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--bg-light)', borderRadius: '4px', marginLeft: '6px' }}>{item.users.role}</span>
                              </span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.users.email || item.users.mobile}</span>
                              {item.data?.target && (
                                <span style={{ 
                                  alignSelf: 'flex-start',
                                  marginTop: '4px',
                                  padding: '2px 6px', 
                                  borderRadius: '4px', 
                                  background: 'rgba(255,255,255,0.05)', 
                                  fontSize: '0.7rem',
                                  textTransform: 'capitalize'
                                }}>
                                  Target: {item.data.target}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              background: 'rgba(255,255,255,0.1)', 
                              fontSize: '0.8rem',
                              textTransform: 'capitalize'
                            }}>
                              {item.data?.target || 'unknown'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ color: '#10b981', fontWeight: '600' }}>{item.data?.successCount || 0}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>of {item.data?.totalAttempted || 0} attempted</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
