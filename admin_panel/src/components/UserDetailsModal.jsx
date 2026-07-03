import React from 'react';
import { useGetUserDetailsQuery } from '../store/api/adminEndpoints';
import { X, ExternalLink } from 'lucide-react';

export default function UserDetailsModal({ userId, onClose }) {
  const { data: response, isLoading, error } = useGetUserDetailsQuery(userId, {
    skip: !userId
  });

  if (!userId) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px'
      }}
      onClick={handleBackdropClick}
      className="animate-fade-in"
    >
      <div 
        className="card" 
        style={{ 
          width: '100%', 
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '32px'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading details...</div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Error loading user details.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <img 
                src={response?.data?.avatar_url || `https://ui-avatars.com/api/?name=${response?.data?.display_name || 'User'}&background=random&size=100`} 
                alt="avatar" 
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--border)' }}
              />
              <div>
                <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {response?.data?.display_name || 'Unnamed User'}
                </h2>
                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  <span style={{ textTransform: 'capitalize' }}>
                    <span className={`badge ${response?.data?.role === 'artist' ? 'badge-approved' : 'badge-pending'}`}>
                      {response?.data?.role}
                    </span>
                  </span>
                  {response?.data?.email && <span>📧 {response?.data?.email}</span>}
                  {response?.data?.mobile && <span>📱 {response?.data?.mobile}</span>}
                  <span>📅 Joined: {new Date(response?.data?.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border)', opacity: 0.5 }} />

            {/* Profile Info */}
            {response?.data?.profile ? (
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>Profile Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                  
                  {response?.data?.role === 'artist' ? (
                    <>
                      <InfoItem label="Full Name" value={response.data.profile.full_name} />
                      <InfoItem label="Gender" value={response.data.profile.gender} />
                      <InfoItem label="Date of Birth" value={response.data.profile.date_of_birth} />
                      <InfoItem label="Height" value={response.data.profile.height ? `${response.data.profile.height} cm` : null} />
                      <InfoItem label="Weight" value={response.data.profile.weight ? `${response.data.profile.weight} kg` : null} />
                      <InfoItem label="Bio" value={response.data.profile.bio} fullWidth />
                      <InfoItem label="Skills" value={response.data.profile.skills?.join(', ')} fullWidth />
                      <InfoItem label="Languages" value={response.data.profile.languages?.join(', ')} />
                    </>
                  ) : (
                    <>
                      <InfoItem label="Company Name" value={response.data.profile.company_name} />
                      <InfoItem label="Location" value={response.data.profile.location} />
                      <InfoItem label="Verification Status" value={
                         <span className={`badge ${response.data.profile.verification_status === 'approved' ? 'badge-approved' : response.data.profile.verification_status === 'rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                           {response.data.profile.verification_status || 'Pending'}
                         </span>
                      } />
                      <InfoItem label="Website" value={
                        response.data.profile.website ? (
                          <a href={response.data.profile.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Visit <ExternalLink size={14} />
                          </a>
                        ) : null
                      } />
                      <InfoItem label="Bio / Description" value={response.data.profile.bio} fullWidth />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>No detailed profile information available.</div>
            )}

            {/* Documents for Hiring Partners */}
            {response?.data?.role === 'hiring' && response?.data?.documents && (
              <>
                <hr style={{ borderColor: 'var(--border)', opacity: 0.5 }} />
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>Verification Documents</h3>
                  
                  {response.data.documents.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No documents uploaded yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {response.data.documents.map(doc => (
                        <div key={doc.id} style={{ padding: '16px', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                          <h4 style={{ fontSize: '14px', marginBottom: '8px', textTransform: 'capitalize' }}>
                            {doc.document_type.replace(/_/g, ' ')}
                          </h4>
                          <span style={{ fontSize: '12px', display: 'block', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                            Status: <span className={doc.status === 'approved' ? 'text-success' : 'text-warning'}>{doc.status}</span>
                          </span>
                          <a 
                            href={doc.document_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-secondary"
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '12px' }}
                          >
                            <ExternalLink size={14} /> View Document
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const InfoItem = ({ label, value, fullWidth = false }) => {
  if (!value) return null;
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
      <div style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
        {value}
      </div>
    </div>
  );
};
