import { useGetPendingKYCQuery, useUpdateKYCStatusMutation } from '../store/api/adminEndpoints';
import { CheckCircle, XCircle, FileText, ExternalLink } from 'lucide-react';

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

  const getDocLinks = (doc) => {
    return [
      { label: 'PAN Card', url: doc.pan_url, mandatory: true },
      { label: 'Driving License', url: doc.driving_license_url, mandatory: true },
      { label: 'GST Certificate', url: doc.gst_url, mandatory: false },
      { label: 'Company Reg Cert', url: doc.company_reg_url, mandatory: false },
      { label: 'Aadhaar Card', url: doc.aadhaar_url, mandatory: false },
      { label: 'Passport', url: doc.passport_url, mandatory: false },
      { label: 'Voter ID', url: doc.voter_id_url, mandatory: false },
      { label: 'Auth Selfie', url: doc.selfie_url, mandatory: false },
    ];
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
          {documents.map((doc) => {
            const docList = getDocLinks(doc);
            const availableDocs = docList.filter(d => Boolean(d.url));

            return (
              <div key={doc.id} className="glass-card" style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0 }}>{doc.hiring_profiles?.company_name || 'Unknown Company'}</h3>
                    <span className="badge badge-pending">{doc.status}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    {availableDocs.length} of {docList.length} documents provided
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
                    {docList.map((item, idx) => {
                      const cleanUrl = item.url ? item.url.replace('10.0.2.2', 'localhost') : null;
                      return cleanUrl ? (
                        <a 
                          key={idx}
                          href={cleanUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-secondary" 
                          style={{ 
                            padding: '10px 14px', 
                            fontSize: '13px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            border: item.mandatory ? '1px solid rgba(239, 68, 68, 0.4)' : undefined
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={14} color={item.mandatory ? 'var(--danger, #ef4444)' : 'var(--primary)'} />
                            {item.label}
                          </span>
                          <ExternalLink size={14} opacity={0.7} />
                        </a>
                      ) : (
                        <div 
                          key={idx}
                          style={{ 
                            padding: '10px 14px', 
                            fontSize: '13px', 
                            opacity: 0.45, 
                            border: '1px dashed var(--border-color)', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between' 
                          }}
                        >
                          <span>{item.label}</span>
                          <span style={{ fontSize: '11px' }}>Not Provided</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px', minWidth: '150px' }}>
                  <button onClick={() => handleAction(doc.id, 'approved')} className="btn" style={{ background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <CheckCircle size={18} /> Approve
                  </button>
                  <button onClick={() => handleAction(doc.id, 'rejected')} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

