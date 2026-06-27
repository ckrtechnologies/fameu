import { useState } from 'react';
import { useGetFraudReportsQuery, useResolveFraudReportMutation } from '../store/api/adminEndpoints';

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

  if (loading) return <div className="loading">Loading reports...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Fraud Reports</h1>
        <p className="page-subtitle">Review reports of scams or inappropriate content submitted by users.</p>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reporter</th>
                <th>Audition</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action Taken</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign: 'center'}}>No fraud reports found.</td></tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td>{new Date(report.created_at).toLocaleDateString()}</td>
                    <td>
                      <div>{report.reporter?.display_name || 'N/A'}</div>
                      <small className="text-muted">{report.reporter?.email}</small>
                    </td>
                    <td>{report.audition?.title || 'N/A'}</td>
                    <td>{report.reason}</td>
                    <td>
                      <span className={`status-badge status-${report.status.toLowerCase()}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>{report.action_taken || '-'}</td>
                    <td>
                      {report.status !== 'resolved' && (
                        <button className="btn btn-primary" onClick={() => setSelectedReport(report)}>Resolve</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReport && (
        <div className="modal-overlay">
          <div className="card" style={{width: '400px', maxWidth: '90vw'}}>
            <h2 style={{marginBottom: '1rem'}}>Resolve Report</h2>
            <p style={{marginBottom: '1rem'}}>
              <strong>Reason:</strong> {selectedReport.reason}
            </p>
            <form onSubmit={handleAction}>
              <div className="form-group">
                <label>Action Taken Note:</label>
                <textarea 
                  className="input" 
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
    </div>
  );
}
