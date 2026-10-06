import { useState } from 'react';
import { useGetFraudReportsQuery, useResolveFraudReportMutation, useDeleteFraudReportMutation, useBlacklistUserMutation } from '../store/api/adminEndpoints';
import DataTable from '../components/DataTable';
import UserDetailsModal from '../components/UserDetailsModal';
import { ExternalLink, ShieldAlert, X } from 'lucide-react';

export default function FraudReports() {
  const { data: response, isLoading: loading } = useGetFraudReportsQuery();
  const [resolveFraudReport] = useResolveFraudReportMutation();
  const [blacklistUser] = useBlacklistUserMutation();
  const [deleteFraudReport] = useDeleteFraudReportMutation();
  const reports = response?.data || [];
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionText, setActionText] = useState('');
  const [viewProfileId, setViewProfileId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fraud report permanently?')) return;
    try {
      await deleteFraudReport(id).unwrap();
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert('Failed to delete report.');
    }
  };

  const handleAction = async (e, block = false) => {
    e?.preventDefault();
    if (!selectedReport) return;
    try {
      if (block && selectedReport.reported_user_id) {
        await blacklistUser({
          user_id: selectedReport.reported_user_id,
          reason: `Blocked via Fraud Report: ${selectedReport.reason}`
        }).unwrap();
      }

      await resolveFraudReport({
        id: selectedReport.id,
        action_taken: actionText || (block ? 'User blocked and report resolved.' : 'Resolved without blocking.')
      }).unwrap();
      
      setSelectedReport(null);
      setActionText('');
    } catch (error) {
      console.error('Failed to update report or block user:', error);
      alert('Action failed. Please try again.');
    }
  };

  const columns = [
    { key: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { 
      key: 'reporter', 
      label: 'Reporter', 
      render: (val, row) => (
        <div>
          <div>{row.reporter?.display_name || 'N/A'}</div>
          <small style={{ color: 'var(--text-muted)' }}>{row.reporter?.email}</small>
        </div>
      )
    },
    { 
      key: 'target', 
      label: 'Reported Target', 
      render: (val, row) => {
        if (row.audition) {
          return <div><small>Audition:</small><br/><strong>{row.audition.title}</strong></div>;
        } else if (row.reported_user) {
          return (
            <div>
              <small>User:</small><br/>
              <strong>{row.reported_user.display_name}</strong>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setViewProfileId(row.reported_user_id); }}
                style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
              >
                <ExternalLink size={14} style={{ verticalAlign: 'middle' }}/>
              </button>
            </div>
          );
        }
        return 'N/A';
      }
    },
    { key: 'reason', label: 'Reason' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val, row) => (
        <span className={`badge badge-${row.status === 'resolved' ? 'approved' : 'pending'}`} style={{ textTransform: 'capitalize' }}>
          {row.status}
        </span>
      )
    },
    { key: 'action_taken', label: 'Action Taken', render: (val) => val || '-' }
  ];

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading reports...</div>;

  return (
    <>
      <DataTable 
        title="Fraud Reports"
        subtitle="Review reports of scams or inappropriate content submitted by users."
        columns={columns}
        data={reports}
        filterConfig={{ status: ['pending', 'resolved'] }}
        onEdit={(row) => {
          setSelectedReport(row);
          if (row.action_taken) {
            setActionText(row.action_taken);
          } else {
            setActionText('');
          }
        }}
        onDelete={(row) => handleDelete(row.id)}
      />

      {viewProfileId && (
        <UserDetailsModal 
          userId={viewProfileId} 
          onClose={() => setViewProfileId(null)} 
        />
      )}

      {selectedReport && (
        <div 
          className="drawer-backdrop"
          onClick={() => setSelectedReport(null)}
        >
          <div 
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: '100%', 
              maxWidth: '540px', 
              height: '100vh',
              borderTopLeftRadius: '16px',
              borderBottomLeftRadius: '16px',
              background: '#ffffff',
              padding: '32px 28px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Resolve Report</h2>
              <button 
                onClick={() => setSelectedReport(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            <p style={{ marginBottom: '1.25rem', background: 'var(--bg-dark)', padding: '12px 14px', borderRadius: '8px', fontSize: '14px' }}>
              <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>Reason:</strong>
              {selectedReport.reason}
            </p>

            {selectedReport.reported_user_id && (
              <div style={{ marginBottom: '1.25rem', padding: '12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <p style={{ margin: 0, color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={16} /> 
                  This report targets a user. You can choose to block them permanently.
                </p>
              </div>
            )}

            <form onSubmit={(e) => handleAction(e, false)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="input-group">
                <label>Action Taken Note:</label>
                <textarea 
                  className="input-field" 
                  rows="4" 
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="E.g., Warning issued, or no violation found."
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedReport(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Mark Resolved</button>
                {selectedReport.reported_user_id && (
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ background: '#ef4444', color: 'white', border: 'none' }}
                    onClick={() => {
                      if (window.confirm("Are you sure you want to block this user and resolve the report?")) {
                        handleAction(null, true);
                      }
                    }}
                  >
                    Block User & Resolve
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
