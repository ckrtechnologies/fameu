import React, { useState, useMemo } from 'react';
import { 
  useGetKYCDocumentsQuery, 
  useUpdateKYCStatusMutation 
} from '../store/api/adminEndpoints';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  ExternalLink, 
  Search, 
  Filter, 
  Eye, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Check, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  FileCheck2,
  RefreshCw,
  Maximize2
} from 'lucide-react';

const DOC_DEFINITIONS = [
  { key: 'pan_url', label: 'PAN Card', icon: '💳', mandatory: true, hint: 'Company or Director PAN' },
  { key: 'driving_license_url', label: 'Driving License', icon: '🚗', mandatory: true, hint: 'Director / Authorized Signatory' },
  { key: 'gst_url', label: 'GST Certificate', icon: '📑', mandatory: false, hint: 'Goods & Services Tax Reg.' },
  { key: 'company_reg_url', label: 'Company Reg. Cert', icon: '🏢', mandatory: false, hint: 'CIN / Trade License / COI' },
  { key: 'aadhaar_url', label: 'Aadhaar (F&B)', icon: '🆔', mandatory: false, hint: 'Front & Back Photo ID' },
  { key: 'passport_url', label: 'Passport', icon: '✈️', mandatory: false, hint: 'Director / Signatory Passport' },
  { key: 'voter_id_url', label: 'Voter ID', icon: '🗳️', mandatory: false, hint: 'Electoral Photo ID Card' },
  { key: 'selfie_url', label: 'Auth. Selfie', icon: '🤳', mandatory: false, hint: 'Live face verification photo' },
];

export default function KYCVerification() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);
  const [rejectionModalDoc, setRejectionModalDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: response, isLoading, isFetching, refetch } = useGetKYCDocumentsQuery();
  const [updateKYCStatus, { isLoading: isUpdating }] = useUpdateKYCStatusMutation();

  const allDocuments = useMemo(() => response?.data || [], [response]);

  // Status counts
  const counts = useMemo(() => {
    const total = allDocuments.length;
    const pending = allDocuments.filter(d => d.status === 'pending').length;
    const approved = allDocuments.filter(d => d.status === 'approved').length;
    const rejected = allDocuments.filter(d => d.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [allDocuments]);

  // Filtered list
  const filteredDocuments = useMemo(() => {
    return allDocuments.filter((doc) => {
      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
      
      const companyName = doc.hiring_profiles?.company_name?.toLowerCase() || '';
      const email = doc.hiring_profiles?.users?.email?.toLowerCase() || '';
      const phone = doc.hiring_profiles?.phone || doc.hiring_profiles?.users?.mobile || doc.hiring_profiles?.users?.phone || '';
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || 
        companyName.includes(query) || 
        email.includes(query) || 
        phone.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [allDocuments, selectedStatus, searchQuery]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateKYCStatus({ id, status }).unwrap();
      if (rejectionModalDoc) {
        setRejectionModalDoc(null);
        setRejectionReason('');
      }
    } catch (err) {
      console.error('Failed to update KYC status:', err);
      alert(err?.data?.error || 'Failed to update KYC status');
    }
  };

  const getCleanUrl = (url) => {
    if (!url) return null;
    return url.replace('10.0.2.2', 'localhost');
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCheck2 size={28} color="var(--primary)" />
            Hiring Agency KYC Verification Hub
          </h1>
          <p className="page-subtitle">Review, inspect, and approve or reject KYC verification documents submitted by casting & hiring agencies.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => refetch()} 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            disabled={isFetching}
          >
            <RefreshCw size={16} className={isFetching ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div 
          onClick={() => setSelectedStatus('all')}
          className="card" 
          style={{ 
            cursor: 'pointer', 
            padding: '18px 20px', 
            borderRadius: '12px',
            border: selectedStatus === 'all' ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: selectedStatus === 'all' ? 'var(--primary-light)' : 'var(--bg-card)',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>TOTAL AGENCIES</span>
            <Building2 size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)' }}>{counts.total}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>All submitted KYC records</div>
        </div>

        <div 
          onClick={() => setSelectedStatus('pending')}
          className="card" 
          style={{ 
            cursor: 'pointer', 
            padding: '18px 20px', 
            borderRadius: '12px',
            border: selectedStatus === 'pending' ? '2px solid var(--warning)' : '1px solid var(--border)',
            background: selectedStatus === 'pending' ? '#FEF3C7' : 'var(--bg-card)',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#D97706' }}>PENDING ACTION</span>
            <Clock size={20} color="#D97706" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#D97706' }}>{counts.pending}</div>
          <div style={{ fontSize: '12px', color: '#B45309', marginTop: '4px' }}>Awaiting admin approval</div>
        </div>

        <div 
          onClick={() => setSelectedStatus('approved')}
          className="card" 
          style={{ 
            cursor: 'pointer', 
            padding: '18px 20px', 
            borderRadius: '12px',
            border: selectedStatus === 'approved' ? '2px solid var(--success)' : '1px solid var(--border)',
            background: selectedStatus === 'approved' ? '#D1FAE5' : 'var(--bg-card)',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--success)' }}>VERIFIED / APPROVED</span>
            <CheckCircle2 size={20} color="var(--success)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success)' }}>{counts.approved}</div>
          <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>Full casting & messaging unlocked</div>
        </div>

        <div 
          onClick={() => setSelectedStatus('rejected')}
          className="card" 
          style={{ 
            cursor: 'pointer', 
            padding: '18px 20px', 
            borderRadius: '12px',
            border: selectedStatus === 'rejected' ? '2px solid var(--danger)' : '1px solid var(--border)',
            background: selectedStatus === 'rejected' ? '#FEE2E2' : 'var(--bg-card)',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--danger)' }}>REJECTED</span>
            <XCircle size={20} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--danger)' }}>{counts.rejected}</div>
          <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '4px' }}>Rejected documents requiring re-submission</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card" style={{ padding: '16px 20px', borderRadius: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Submissions', count: counts.total },
              { id: 'pending', label: 'Pending Review', count: counts.pending, color: '#D97706' },
              { id: 'approved', label: 'Approved', count: counts.approved, color: '#059669' },
              { id: 'rejected', label: 'Rejected', count: counts.rejected, color: '#DC2626' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`btn ${selectedStatus === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: selectedStatus === tab.id ? '600' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{tab.label}</span>
                <span 
                  style={{
                    backgroundColor: selectedStatus === tab.id ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                    color: selectedStatus === tab.id ? '#fff' : (tab.color || 'var(--text-main)'),
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 280px', maxWidth: '420px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Search company, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px', height: '40px', borderRadius: '20px' }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={14} color="var(--text-muted)" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Content List */}
      {isLoading ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <RefreshCw size={32} className="spin" color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h3>Loading KYC Submissions...</h3>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '16px' }}>
          <CheckCircle2 size={54} color="var(--success)" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No KYC submissions found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
            {searchQuery 
              ? `No records matching "${searchQuery}" in ${selectedStatus} status.`
              : `There are currently no agencies in "${selectedStatus}" status.`}
          </p>
          {selectedStatus !== 'all' && (
            <button onClick={() => setSelectedStatus('all')} className="btn btn-secondary" style={{ marginTop: '16px' }}>
              View All Submissions
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {filteredDocuments.map((doc) => {
            const profile = doc.hiring_profiles || {};
            const user = profile.users || {};
            
            // Build doc items
            const docItems = DOC_DEFINITIONS.map(def => ({
              ...def,
              url: doc[def.key],
              cleanUrl: getCleanUrl(doc[def.key]),
              isUploaded: Boolean(doc[def.key]),
            }));

            const uploadedCount = docItems.filter(d => d.isUploaded).length;
            const mandatoryCount = docItems.filter(d => d.mandatory && d.isUploaded).length;
            const isMandatoryReady = mandatoryCount >= 2; // PAN + Driving License

            const statusClass = doc.status === 'approved' 
              ? 'badge-approved' 
              : doc.status === 'rejected' 
                ? 'badge-rejected' 
                : 'badge-pending';

            const statusText = doc.status === 'approved' 
              ? 'Verified & Approved' 
              : doc.status === 'rejected' 
                ? 'Rejected' 
                : 'Pending Review';

            return (
              <div 
                key={doc.id} 
                className="card" 
                style={{ 
                  borderRadius: '16px', 
                  border: doc.status === 'pending' ? '1.5px solid #FDE68A' : '1px solid var(--border)',
                  padding: '24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}
              >
                {/* Agency Top Info Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '18px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {profile.logo_url ? (
                      <img 
                        src={getCleanUrl(profile.logo_url)} 
                        alt="Logo" 
                        style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }} 
                      />
                    ) : (
                      <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px' }}>
                        {(profile.company_name || 'C').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700' }}>
                          {profile.company_name || user.display_name || user.username || 'Hiring Agency'}
                        </h2>
                        <span className={`badge ${statusClass}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {doc.status === 'approved' && <Check size={12} />}
                          {doc.status === 'rejected' && <X size={12} />}
                          {doc.status === 'pending' && <Clock size={12} />}
                          {statusText}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {profile.company_type && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building2 size={14} /> {profile.company_type}
                          </span>
                        )}
                        {user.email && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={14} /> {user.email}
                          </span>
                        )}
                        {(profile.phone || user.mobile || user.phone) && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={14} /> {profile.phone || user.mobile || user.phone}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} /> Updated {new Date(doc.updated_at || doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {doc.status !== 'approved' && (
                      <button 
                        onClick={() => handleStatusChange(doc.id, 'approved')}
                        disabled={isUpdating}
                        className="btn" 
                        style={{ background: 'var(--success)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: '600' }}
                      >
                        <CheckCircle2 size={16} /> Approve Agency
                      </button>
                    )}

                    {doc.status !== 'rejected' && (
                      <button 
                        onClick={() => {
                          setRejectionModalDoc(doc);
                          setRejectionReason(doc.rejection_reason || '');
                        }}
                        disabled={isUpdating}
                        className="btn btn-danger" 
                        style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#ef4444', color: '#fff' }}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    )}

                    {doc.status !== 'pending' && (
                      <button 
                        onClick={() => handleStatusChange(doc.id, 'pending')}
                        disabled={isUpdating}
                        className="btn btn-secondary" 
                        style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px' }}
                      >
                        Reset to Pending
                      </button>
                    )}
                  </div>
                </div>

                {/* Document Completeness Progress Bar */}
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                      UPLOADED DOCUMENTS: {uploadedCount} of {docItems.length}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        padding: '2px 8px', 
                        borderRadius: '6px',
                        backgroundColor: isMandatoryReady ? '#DCFCE7' : '#FEE2E2',
                        color: isMandatoryReady ? '#16A34A' : '#DC2626'
                      }}
                    >
                      {isMandatoryReady ? '✓ Mandatory Ready (2/2)' : '⚠️ Mandatory Incomplete'}
                    </span>
                  </div>

                  {doc.rejection_reason && (
                    <div style={{ fontSize: '12px', color: '#DC2626', fontWeight: '600', backgroundColor: '#FEE2E2', padding: '4px 10px', borderRadius: '6px' }}>
                      Rejection Reason: {doc.rejection_reason}
                    </div>
                  )}
                </div>

                {/* 8 Document Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                  {docItems.map((item, idx) => {
                    const isUploaded = item.isUploaded;

                    return (
                      <div 
                        key={idx}
                        style={{
                          border: isUploaded 
                            ? (item.mandatory ? '1.5px solid #93C5FD' : '1px solid #E2E8F0') 
                            : '1px dashed #CBD5E1',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          backgroundColor: isUploaded ? '#FAFCFF' : '#F8FAFC',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: '120px',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                      >
                        {/* Card Top */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '18px' }}>{item.icon}</span>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>{item.label}</span>
                            </div>
                            <span 
                              style={{ 
                                fontSize: '10px', 
                                fontWeight: '700', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                backgroundColor: item.mandatory ? '#FEE2E2' : '#F1F5F9',
                                color: item.mandatory ? '#EF4444' : '#64748B'
                              }}
                            >
                              {item.mandatory ? 'Mandatory' : 'Optional'}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                            {item.hint}
                          </div>
                        </div>

                        {/* Card Bottom / Action */}
                        {isUploaded ? (
                          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                            <button
                              onClick={() => setActivePreviewDoc({ title: item.label, url: item.cleanUrl, company: profile.company_name })}
                              className="btn btn-secondary"
                              style={{ 
                                flex: 1, 
                                padding: '6px 10px', 
                                fontSize: '12px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '6px',
                                backgroundColor: '#EFF6FF',
                                borderColor: '#BFDBFE',
                                color: 'var(--primary)'
                              }}
                            >
                              <Eye size={14} /> Preview Doc
                            </button>
                            <a 
                              href={item.cleanUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary"
                              style={{ padding: '6px 8px', fontSize: '12px' }}
                              title="Open Original in New Tab"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        ) : (
                          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '12px', fontWeight: '500' }}>
                            <Clock size={13} /> Not Uploaded
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Document Preview Modal */}
      {activePreviewDoc && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setActivePreviewDoc(null)}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{activePreviewDoc.title}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activePreviewDoc.company || 'Agency Document'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <a 
                  href={activePreviewDoc.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ExternalLink size={14} /> Full View
                </a>
                <button 
                  onClick={() => setActivePreviewDoc(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} color="var(--text-muted)" />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
              <img 
                src={activePreviewDoc.url} 
                alt={activePreviewDoc.title} 
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none', textAlign: 'center', padding: '40px' }}>
                <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                <p>This file cannot be previewed directly as an image.</p>
                <a href={activePreviewDoc.url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Open / Download Document
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModalDoc && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setRejectionModalDoc(null)}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ backgroundColor: '#FEE2E2', padding: '8px', borderRadius: '10px' }}>
                <AlertTriangle size={20} color="#EF4444" />
              </div>
              <h3 style={{ margin: 0, fontSize: '17px' }}>Reject Agency KYC</h3>
            </div>
            
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Please specify the reason for rejecting <strong>{rejectionModalDoc.hiring_profiles?.company_name || 'this agency'}</strong>. This note helps the company fix their submission.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {['Blurry / Unreadable ID', 'PAN name mismatch', 'Driving license expired', 'Aadhaar back missing', 'Fake or invalid document'].map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => setRejectionReason(template)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11.5px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: rejectionReason === template ? '#EFF6FF' : '#F8FAFC',
                    color: rejectionReason === template ? 'var(--primary)' : 'var(--text-main)',
                    cursor: 'pointer'
                  }}
                >
                  {template}
                </button>
              ))}
            </div>

            <textarea 
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason or feedback..."
              className="input-field"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', marginBottom: '20px', resize: 'vertical' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setRejectionModalDoc(null)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleStatusChange(rejectionModalDoc.id, 'rejected')}
                disabled={isUpdating}
                className="btn btn-danger"
                style={{ backgroundColor: '#EF4444', color: '#fff' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
