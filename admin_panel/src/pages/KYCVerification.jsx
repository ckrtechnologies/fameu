import { useGetPendingKYCQuery, useUpdateKYCStatusMutation } from '../store/api/adminEndpoints';
import { CheckCircle, XCircle } from 'lucide-react';

export default function KYCVerification() {
  const { data: response, isLoading: loading } = useGetPendingKYCQuery();
  const [updateKYCStatus] = useUpdateKYCStatusMutation();

  const documents = response?.data || [];

  const handleAction = async (id, status) => {
    try {
      await updateKYCStatus({ id, status }).unwrap();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">KYC Verification Hub</h1>
        <p>Review and verify documents submitted by Hiring Companies.</p>
      </div>

      {loading ? (
        <p>Loading documents...</p>
      ) : documents.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '16px' }} />
          <h3>All caught up!</h3>
          <p>There are no pending KYC documents to review.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '24px' }}>
          {documents.map((doc) => (
            <div key={doc.id} className="glass-card" style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '8px' }}>{doc.hiring_profiles?.company_name || 'Unknown Company'}</h3>
                <span className="badge badge-pending" style={{ marginBottom: '16px', display: 'inline-block' }}>{doc.status}</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  <a href={doc.aadhaar_url?.replace('10.0.2.2', 'localhost')} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '8px' }}>View Aadhaar</a>
                  <a href={doc.pan_url?.replace('10.0.2.2', 'localhost')} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '8px' }}>View PAN</a>
                  <a href={doc.company_reg_url?.replace('10.0.2.2', 'localhost')} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '8px' }}>View Reg Cert</a>
                  <a href={doc.gst_url?.replace('10.0.2.2', 'localhost')} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '8px' }}>View GST</a>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
                <button onClick={() => handleAction(doc.id, 'approved')} className="btn" style={{ background: 'var(--success)', color: 'white' }}>
                  <CheckCircle size={18} /> Approve
                </button>
                <button onClick={() => handleAction(doc.id, 'rejected')} className="btn btn-danger">
                  <XCircle size={18} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
