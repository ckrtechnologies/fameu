import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, PowerOff, X, Filter, Search, ListPlus } from 'lucide-react';
import api from '../lib/api';

export default function ProfessionsManagement() {
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Profession Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    is_active: true
  });

  // Fields Modal State
  const [isFieldsModalOpen, setIsFieldsModalOpen] = useState(false);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [fieldFormData, setFieldFormData] = useState({
    field_label: '',
    field_type: 'text',
    is_required: true,
    options: ''
  });

  useEffect(() => {
    fetchProfessions();
  }, []);

  const fetchProfessions = async () => {
    try {
      const response = await api.get('/professions/admin');
      if (response.data?.success) {
        setProfessions(response.data.data);
        // If fields modal is open, update the selected profession so it re-renders the field list
        if (selectedProfession) {
          const updatedProf = response.data.data.find(p => p.id === selectedProfession.id);
          if (updatedProf) setSelectedProfession(updatedProf);
        }
      }
    } catch (error) {
      console.error('Error fetching professions:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Profession Handlers ---
  const handleOpenModal = (profession = null) => {
    if (profession) {
      setEditingId(profession.id);
      setFormData({
        name: profession.name,
        is_active: profession.is_active
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/professions/admin/${editingId}`, formData);
      } else {
        await api.post('/professions/admin', formData);
      }
      setIsModalOpen(false);
      fetchProfessions();
    } catch (error) {
      console.error('Error saving profession:', error);
      alert('Failed to save profession');
    }
  };

  const handleDeactivate = async (id, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this profession?`)) {
      try {
        await api.put(`/professions/admin/${id}`, { is_active: !currentStatus });
        fetchProfessions();
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }
  };

  const handleHardDelete = async (id) => {
    if (window.confirm('WARNING: Hard deleting this profession will permanently wipe it from the database. Any existing artists tied to this profession may encounter errors. Are you absolutely sure?')) {
      try {
        await api.delete(`/professions/admin/${id}`);
        fetchProfessions();
      } catch (error) {
        console.error('Error permanently deleting profession:', error);
        alert('Could not delete profession. It might be referenced by existing artist profiles.');
      }
    }
  };

  // --- Fields Handlers ---
  const handleOpenFieldsModal = (profession) => {
    setSelectedProfession(profession);
    setEditingFieldId(null);
    setFieldFormData({ field_label: '', field_type: 'text', is_required: true, options: '' });
    setIsFieldsModalOpen(true);
  };

  const handleEditFieldClick = (field) => {
    setEditingFieldId(field.id);
    setFieldFormData({
      field_label: field.field_label,
      field_type: field.field_type,
      is_required: field.is_required,
      options: field.options ? field.options.join(', ') : ''
    });
  };

  const handleSaveField = async (e) => {
    e.preventDefault();
    if (!selectedProfession) return;
    
    try {
      const payload = { ...fieldFormData };
      // Auto-generate the machine-readable field_name from the human-readable field_label
      payload.field_name = payload.field_label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');

      if (payload.field_type === 'select' || payload.field_type === 'multiselect') {
        payload.options = payload.options.split(',').map(s => s.trim()).filter(s => s);
      } else {
        payload.options = null;
      }

      if (editingFieldId) {
        await api.put(`/professions/admin/fields/${editingFieldId}`, payload);
      } else {
        await api.post(`/professions/admin/${selectedProfession.id}/fields`, payload);
      }

      setEditingFieldId(null);
      setFieldFormData({ field_label: '', field_type: 'text', is_required: true, options: '' });
      fetchProfessions(); // Refreshes everything and updates selectedProfession fields
    } catch (error) {
      console.error('Error saving field:', error);
      alert('Failed to save custom field');
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (window.confirm('Are you sure you want to delete this custom field?')) {
      try {
        await api.delete(`/professions/admin/fields/${fieldId}`);
        fetchProfessions();
      } catch (error) {
        console.error('Error deleting field:', error);
      }
    }
  };

  // Filter Logic
  const filteredProfessions = professions.filter(prof => {
    const matchesSearch = prof.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && prof.is_active) || 
                         (statusFilter === 'inactive' && !prof.is_active);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Artist Professions</h1>
          <p>Manage the 51+ professions in the platform.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Profession
        </button>
      </div>

      <div className="glass-card">
        {/* Filters Section */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 40px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#333' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} color="#64748b" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#333', outline: 'none' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading professions...</p>
        ) : (
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px', width: '60px' }}>#</th>
                <th style={{ padding: '12px' }}>Profession Name</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfessions.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No professions found matching your filters.</td>
                </tr>
              ) : (
                filteredProfessions.map((prof, index) => (
                  <tr key={prof.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '12px', color: '#64748b', fontWeight: '500' }}>{index + 1}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {prof.name}
                      {prof.profession_fields && prof.profession_fields.length > 0 && (
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>
                          ({prof.profession_fields.length} custom fields)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {prof.is_active ? 
                        <span style={{ color: 'var(--success)', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>Active</span> : 
                        <span style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>Inactive</span>
                      }
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={() => handleOpenFieldsModal(prof)} 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0369a1', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                      >
                        <ListPlus size={14} /> Fields
                      </button>

                      <button 
                        onClick={() => handleOpenModal(prof)} 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#334155', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      
                      <button 
                        onClick={() => handleDeactivate(prof.id, prof.is_active)} 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: prof.is_active ? '#fef3c7' : '#dcfce7', border: `1px solid ${prof.is_active ? '#fde68a' : '#bbf7d0'}`, borderRadius: '6px', color: prof.is_active ? '#b45309' : '#166534', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                      >
                        <PowerOff size={14} /> {prof.is_active ? "Deactivate" : "Activate"}
                      </button>

                      <button 
                        onClick={() => handleHardDelete(prof.id)} 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', color: '#b91c1c', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* CRUD Modal for Profession */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '400px', padding: '24px', background: '#ffffff', color: '#333', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>{editingId ? 'Edit Profession' : 'Add New Profession'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>Profession Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#333', borderRadius: '8px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <label style={{ fontSize: '14px', margin: 0, color: '#475569', fontWeight: '500' }}>Is Active (Visible to users)</label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Save Profession</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Fields Modal */}
      {isFieldsModalOpen && selectedProfession && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', background: '#ffffff', color: '#333', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1e293b' }}>Manage Custom Fields</h3>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>For {selectedProfession.name}</p>
              </div>
              <button onClick={() => setIsFieldsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', height: 'fit-content' }}>
                <X size={20} />
              </button>
            </div>
            
            {/* List Existing Fields */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#334155', marginBottom: '12px', fontSize: '15px' }}>Existing Fields</h4>
              {!selectedProfession.profession_fields || selectedProfession.profession_fields.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#94a3b8', fontStyle: 'italic', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>No custom fields added yet. The standard form will be used.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedProfession.profession_fields.map(field => (
                    <div key={field.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>{field.field_label} {field.is_required && <span style={{ color: 'var(--danger)' }}>*</span>}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                          Type: {field.field_type} {field.options && `| Options: ${field.options.join(', ')}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => handleEditFieldClick(field)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '4px' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteField(field.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '32px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
                {editingFieldId ? 'Edit Field' : 'Add New Field'}
              </h4>
              <form onSubmit={handleSaveField} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>Field Label (e.g. Skin Tone)</label>
                  <input 
                    type="text" 
                    value={fieldFormData.field_label}
                    onChange={(e) => setFieldFormData({...fieldFormData, field_label: e.target.value})}
                    style={{ width: '100%', padding: '8px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#333', borderRadius: '6px', outline: 'none', fontSize: '13px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>Field Type</label>
                  <select 
                    value={fieldFormData.field_type}
                    onChange={(e) => setFieldFormData({...fieldFormData, field_type: e.target.value})}
                    style={{ width: '100%', padding: '8px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#333', borderRadius: '6px', outline: 'none', fontSize: '13px' }}
                  >
                    <option value="text">Text (Short Answer)</option>
                    <option value="number">Number</option>
                    <option value="select">Dropdown (Single Select)</option>
                    <option value="multiselect">Dropdown (Multi Select)</option>
                    <option value="file">File Upload (e.g. Audio, Video, PDF)</option>
                  </select>
                </div>

                {(fieldFormData.field_type === 'select' || fieldFormData.field_type === 'multiselect') && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>Options (comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Fair, Medium, Dark"
                      value={fieldFormData.options}
                      onChange={(e) => setFieldFormData({...fieldFormData, options: e.target.value})}
                      style={{ width: '100%', padding: '8px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#333', borderRadius: '6px', outline: 'none', fontSize: '13px' }}
                      required
                    />
                  </div>
                )}

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={fieldFormData.is_required}
                    onChange={(e) => setFieldFormData({...fieldFormData, is_required: e.target.checked})}
                  />
                  Required Field
                </label>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button 
                    type="submit"
                    style={{ flex: 1, padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}
                  >
                    {editingFieldId ? 'Update Custom Field' : '+ Add Custom Field'}
                  </button>
                  {editingFieldId && (
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingFieldId(null);
                        setFieldFormData({ field_label: '', field_type: 'text', is_required: true, options: '' });
                      }}
                      style={{ padding: '10px 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
