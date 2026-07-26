import { useState } from 'react';
import { useGetFraudReportsQuery, useResolveFraudReportMutation, useDeleteFraudReportMutation, useBlacklistUserMutation } from '../store/api/adminEndpoints';
import DataTable from '../components/DataTable';
import UserDetailsModal from '../components/UserDetailsModal';
import { ExternalLink, ShieldAlert } from 'lucide-react';

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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '450px', maxWidth: '90vw', margin: 0 }}>
            <h2 style={{marginBottom: '1rem'}}>Resolve Report</h2>
            <p style={{marginBottom: '1rem'}}>
              <strong>Reason:</strong> {selectedReport.reason}
            </p>
            {selectedReport.reported_user_id && (
               <div style={{ marginBottom: '1rem', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                 <p style={{ margin: 0, color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <ShieldAlert size={16} /> 
                   This report targets a user. You can choose to block them permanently.
                 </p>
               </div>
            )}
            <form onSubmit={(e) => handleAction(e, false)}>
              <div className="input-group">
                <label>Action Taken Note:</label>
                <textarea 
                  className="input-field" 
                  rows="3" 
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="E.g., Warning issued, or no violation found."
                ></textarea>
              </div>
              <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1rem'}}>
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
