import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../store/api/axios';

export default function ProfessionsManagement() {
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessions();
  }, []);

  const fetchProfessions = async () => {
    try {
      const response = await api.get('/professions/admin');
      if (response.data?.success) {
        setProfessions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching professions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Artist Professions</h1>
          <p>Manage the 51+ professions and their dynamic onboarding fields.</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Profession
        </button>
      </div>

      <div className="glass-card">
        {loading ? (
          <p>Loading professions...</p>
        ) : (
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Priority</th>
                <th style={{ padding: '12px' }}>Profession Name</th>
                <th style={{ padding: '12px' }}>Form Logic Type</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {professions.map((prof) => (
                <tr key={prof.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}>{prof.priority || '-'}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>{prof.name}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                      {prof.form_type || 'default'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {prof.is_active ? <span style={{ color: 'var(--success)' }}>Active</span> : <span style={{ color: 'var(--danger)' }}>Inactive</span>}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} title="Edit Custom Fields">
                      <Settings size={18} />
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                      <Edit2 size={18} />
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
