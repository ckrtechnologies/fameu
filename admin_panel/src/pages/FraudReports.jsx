import { useState } from 'react';
import { useGetFraudReportsQuery, useResolveFraudReportMutation } from '../store/api/adminEndpoints';
import DataTable from '../components/DataTable';

export default function FraudReports() {
  const { data: response, isLoading: loading } = useGetFraudReportsQuery();
  const [resolveFraudReport] = useResolveFraudReportMutation();
  const reports = response?.data || [];
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionText, setActionText] = useState('');

  const handleAction = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      await resolveFraudReport({
        id: selectedReport.id,
        action_taken: actionText
      }).unwrap();
      setSelectedReport(null);
      setActionText('');
    } catch (error) {
      console.error('Failed to update report:', error);
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
    { key: 'audition', label: 'Audition', render: (val, row) => row.audition?.title || 'N/A' },
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
          if (row.status !== 'resolved') setSelectedReport(row);
        }}
      />

      {selectedReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '400px', maxWidth: '90vw', margin: 0 }}>
            <h2 style={{marginBottom: '1rem'}}>Resolve Report</h2>
            <p style={{marginBottom: '1rem'}}>
              <strong>Reason:</strong> {selectedReport.reason}
            </p>
            <form onSubmit={handleAction}>
              <div className="input-group">
                <label>Action Taken Note:</label>
                <textarea 
                  className="input-field" 
                  rows="3" 
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="E.g., Audition removed and user banned."
                  required
                ></textarea>
              </div>
              <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1rem'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedReport(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Mark Resolved</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
