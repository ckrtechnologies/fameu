import React from 'react';
import { X, Calendar, MapPin, Users, Briefcase, Video, Clock, CheckCircle, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function ExpandableText({ text, maxChars = 220 }) {
  const [expanded, setExpanded] = React.useState(false);
  if (!text) return null;
  const isLong = text.length > maxChars || (text.match(/\n/g) || []).length >= 4;
  const displayText = isLong && !expanded ? text.slice(0, maxChars) + '...' : text;

  return (
    <div>
      <p style={{ color: 'var(--text-primary)', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
        {displayText}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 0 0 0',
            fontSize: '13px'
          }}
        >
          {expanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  );
}

export default function AuditionDetailsModal({ audition, onClose }) {
  if (!audition) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div 
        className="drawer-panel" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '720px', 
          width: '100%', 
          height: '100vh',
          padding: '32px 28px',
          borderTopLeftRadius: '16px',
          borderBottomLeftRadius: '16px',
          background: '#ffffff'
        }}
      >
        <button onClick={onClose} className="btn-icon" style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
        }}>
          <X size={24} />
        </button>

        <div style={{ marginBottom: '24px', paddingRight: '36px' }}>
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
            <p style={{ margin: '0 0 8px 0' }}><strong>Time:</strong> {audition.audition_time || 'N/A'}</p>
            <p style={{ margin: '0' }}><strong>Post Validity:</strong> {audition.valid_from ? format(parseISO(audition.valid_from), 'dd MMM yyyy') : 'N/A'} - {audition.valid_till ? format(parseISO(audition.valid_till), 'dd MMM yyyy') : 'N/A'}</p>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Role Description</h4>
          <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px' }}>
            <ExpandableText text={audition.role_description || 'No description provided.'} />
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Character Requirements</h4>
          <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px' }}>
            <ExpandableText text={audition.character_req || 'No character requirements provided.'} />
          </div>
        </div>

        {audition.script_text && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Audition Script / Sides</h4>
            <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px' }}>
              {audition.script_text}
            </p>
          </div>
        )}

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
              <span style={{ color: 'var(--text-primary)' }}>
                {(() => {
                  if (!audition.instructions) return 'None';
                  try {
                    const parsed = JSON.parse(audition.instructions);
                    if (typeof parsed === 'string') return parsed;
                    if (parsed.instructions) return String(parsed.instructions);
                    if (parsed.notes) return String(parsed.notes);
                    if (parsed.description && parsed.description !== audition.role_description) return String(parsed.description);

                    // Filter out internal metadata already shown above
                    const knownKeys = ['budget', 'compensation', 'gender_req', 'gender', 'city', 'valid_from', 'valid_till', 'script_text', 'script', 'walk_in_venue'];
                    const remainingKeys = Object.entries(parsed).filter(([k, v]) => !knownKeys.includes(k) && v !== null && v !== undefined && v !== '');

                    if (remainingKeys.length === 0) return 'None';

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                        {remainingKeys.map(([k, v]) => (
                          <div key={k} style={{ fontSize: '13px', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                            <strong style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}:</strong> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                          </div>
                        ))}
                      </div>
                    );
                  } catch (e) {
                    return audition.instructions;
                  }
                })()}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
