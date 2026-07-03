import React from 'react';
import { X, Calendar, MapPin, Users, Briefcase, Video, Clock, CheckCircle, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function AuditionDetailsModal({ audition, onClose }) {
  if (!audition) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', zIndex: 1000 
    }}>
      <div className="modal-content card" onClick={e => e.stopPropagation()} style={{ 
        width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', 
        padding: '24px', position: 'relative' 
      }}>
        
        <button onClick={onClose} className="btn-icon" style={{ 
          position: 'absolute', top: '16px', right: '16px', 
          background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' 
        }}>
          <X size={24} />
        </button>

        <div style={{ marginBottom: '24px', paddingRight: '32px' }}>
          <h2 style={{ marginBottom: '8px' }}>{audition.title}</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className={`badge badge-${audition.status === 'active' ? 'approved' : audition.status === 'cancelled' ? 'rejected' : 'pending'}`} style={{ textTransform: 'capitalize' }}>
              {audition.status}
            </span>
            <span className="badge" style={{ background: 'var(--bg-dark)' }}>
              {audition.category}
            </span>
            <span className="badge" style={{ background: 'var(--bg-dark)' }}>
              {audition.audition_type}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div className="info-box" style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={16} /> Company Details
            </h4>
            <p style={{ margin: '0 0 8px 0' }}><strong>Company Name:</strong> {audition.company_name || 'N/A'}</p>
            <p style={{ margin: '0' }}><strong>Compensation:</strong> {audition.compensation || 'N/A'}</p>
          </div>

          <div className="info-box" style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} /> Schedule
            </h4>
            <p style={{ margin: '0 0 8px 0' }}><strong>Date:</strong> {audition.audition_date ? format(parseISO(audition.audition_date), 'dd MMM yyyy') : 'N/A'}</p>
            <p style={{ margin: '0' }}><strong>Time:</strong> {audition.audition_time || 'N/A'}</p>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Role Description</h4>
          <p style={{ color: 'var(--text-primary)', lineHeight: '1.5', background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px' }}>
            {audition.role_description || 'No description provided.'}
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Character Requirements</h4>
          <p style={{ color: 'var(--text-primary)', lineHeight: '1.5', background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px' }}>
            {audition.character_req || 'No character requirements provided.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px' }}>
            <strong>Age Range:</strong> {audition.age_min} - {audition.age_max} years
          </div>
          <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px' }}>
            <strong>Gender:</strong> {audition.gender || 'Any'}
          </div>
          <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px' }}>
            <strong>Languages:</strong> {audition.language ? (Array.isArray(audition.language) ? audition.language.join(', ') : audition.language) : 'N/A'}
          </div>
        </div>

        {audition.venue_address && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} /> Venue Address
            </h4>
            <p style={{ color: 'var(--text-primary)', background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px' }}>
              {audition.venue_address}
            </p>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={16} /> Additional Information
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px' }}>
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Required Documents:</strong>
              <span style={{ color: 'var(--text-primary)' }}>{audition.required_docs || 'None'}</span>
            </div>
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Instructions:</strong>
              <span style={{ color: 'var(--text-primary)' }}>{audition.instructions || 'None'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
