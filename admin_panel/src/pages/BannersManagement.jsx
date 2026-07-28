import React, { useState } from 'react';
import { useGetBannersQuery, useCreateBannerMutation, useUpdateBannerMutation, useDeleteBannerMutation, useUploadBannerImageMutation } from '../store/api/adminEndpoints';
import DataTable from '../components/DataTable';
import { Image, ExternalLink, Plus, Trash2, Power, Edit2 } from 'lucide-react';

export default function BannersManagement() {
  const { data: banners = [], isLoading } = useGetBannersQuery();
  const [createBanner] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();
  const [uploadBannerImage] = useUploadBannerImageMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newBanner, setNewBanner] = useState({ image_url: '', target_link: '', sort_order: 0, is_active: true });
  const [isUploading, setIsUploading] = useState(false);

  const handleAddOrEdit = async () => {
    if (!newBanner.image_url) {
      alert('Image URL is required');
      return;
    }
    try {
      if (editingId) {
        await updateBanner({ id: editingId, ...newBanner }).unwrap();
      } else {
        await createBanner(newBanner).unwrap();
      }
      setIsAdding(false);
      setEditingId(null);
      setNewBanner({ image_url: '', target_link: '', sort_order: 0, is_active: true });
    } catch (error) {
      alert('Failed to save banner');
    }
  };

  const startEdit = (banner) => {
    setNewBanner({
      image_url: banner.image_url,
      target_link: banner.target_link || '',
      sort_order: banner.sort_order || 0,
      is_active: banner.is_active
    });
    setEditingId(banner.id);
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewBanner({ image_url: '', target_link: '', sort_order: 0, is_active: true });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await uploadBannerImage(formData).unwrap();
      setNewBanner({ ...newBanner, image_url: response.url });
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await updateBanner({ id: banner.id, is_active: !banner.is_active }).unwrap();
    } catch (error) {
      alert('Failed to update banner');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner(id).unwrap();
      } catch (error) {
        alert('Failed to delete banner');
      }
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Preview',
      render: (val, row) => (
        <img src={row.image_url} alt="Banner Preview" style={{ width: 120, height: 60, objectFit: 'cover', borderRadius: 4, backgroundColor: '#f0f0f0' }} />
      )
    },
    {
      key: 'details',
      label: 'Details',
      render: (val, row) => (
        <div>
          <div style={{ wordBreak: 'break-all', fontSize: '0.9em' }}>{row.image_url}</div>
          {row.target_link && (
            <a href={row.target_link} target="_blank" rel="noreferrer" style={{ fontSize: '0.85em', color: 'var(--primary)', display: 'flex', alignItems: 'center', marginTop: 4 }}>
              <ExternalLink size={12} style={{ marginRight: 4 }} /> {row.target_link}
            </a>
          )}
        </div>
      )
    },
    { key: 'sort_order', label: 'Order' },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => (
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '12px', 
          fontSize: '0.85em', 
          backgroundColor: row.is_active ? '#e6f4ea' : '#fce8e6',
          color: row.is_active ? '#137333' : '#c5221f'
        }}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (val, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => startEdit(row)}
            style={{ padding: '6px', cursor: 'pointer', background: 'none', border: '1px solid #ccc', borderRadius: 4 }}
            title="Edit"
          >
            <Edit2 size={16} color="#000" />
          </button>
          <button 
            onClick={() => handleToggleActive(row)}
            style={{ padding: '6px', cursor: 'pointer', background: 'none', border: '1px solid #ccc', borderRadius: 4 }}
            title={row.is_active ? "Deactivate" : "Activate"}
          >
            <Power size={16} color={row.is_active ? "#c5221f" : "#137333"} />
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            style={{ padding: '6px', cursor: 'pointer', background: 'none', border: '1px solid #ffcdd2', borderRadius: 4 }}
          >
            <Trash2 size={16} color="#c5221f" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Home Banners</h1>
          <p className="page-subtitle">Manage promotional banners on the app home screen.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={isAdding ? cancelEdit : () => setIsAdding(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> {isAdding ? 'Cancel' : 'Add Banner'}
        </button>
      </div>

      {isAdding && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Banner' : 'Add New Banner'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Upload Banner Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
                style={{ marginBottom: '8px' }}
                disabled={isUploading}
              />
              {isUploading && <span style={{ marginLeft: 8, fontSize: '0.9em', color: 'gray' }}>Uploading...</span>}
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, left: 10, background: '#fff', padding: '0 4px', fontSize: '0.8em', color: 'gray' }}>OR</div>
              <hr style={{ borderTop: '1px solid #eee', marginBottom: 16 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Image URL (CDN Link)</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="https://your-cdn.com/banner.jpg"
                value={newBanner.image_url}
                onChange={e => setNewBanner({...newBanner, image_url: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Target Link (Optional)</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="https://fameu.app/offer"
                value={newBanner.target_link}
                onChange={e => setNewBanner({...newBanner, target_link: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Sort Order</label>
              <input 
                type="number" 
                className="input-field" 
                value={newBanner.sort_order}
                onChange={e => setNewBanner({...newBanner, sort_order: parseInt(e.target.value) || 0})}
              />
            </div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleAddOrEdit}>
              {editingId ? 'Update Banner' : 'Save Banner'}
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {isLoading ? (
          <p>Loading banners...</p>
        ) : (
          <DataTable 
            columns={columns} 
            data={banners} 
            keyExtractor={row => row.id} 
            emptyMessage="No banners uploaded yet."
          />
        )}
      </div>
    </div>
  );
}
