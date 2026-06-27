import { useState, useEffect } from 'react';
import { useGetCMSQuery, useUpdateCMSMutation } from '../store/api/adminEndpoints';

export default function CMS() {
  const { data: response, isLoading: loading } = useGetCMSQuery();
  const [updateCMS, { isLoading: saving }] = useUpdateCMSMutation();
  
  const [cmsData, setCmsData] = useState({
    terms: '',
    privacy: '',
    faq: '[]',
    banner: '[]'
  });
  const [activeTab, setActiveTab] = useState('terms'); // 'terms', 'privacy', 'faq', 'banner'

  useEffect(() => {
    if (response?.data) {
      setCmsData({
        terms: response.data.terms || '',
        privacy: response.data.privacy || '',
        faq: typeof response.data.faq === 'string' ? response.data.faq : JSON.stringify(response.data.faq, null, 2),
        banner: typeof response.data.banner === 'string' ? response.data.banner : JSON.stringify(response.data.banner, null, 2)
      });
    }
  }, [response]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let valueToSave = cmsData[activeTab];
      
      // Attempt to parse JSON if it's faq or banner to ensure it's valid JSON
      if (activeTab === 'faq' || activeTab === 'banner') {
        valueToSave = JSON.parse(valueToSave);
      }

      await updateCMS({
        key: activeTab,
        value: valueToSave
      }).unwrap();
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Failed to save CMS content:', error);
      alert('Failed to save. If editing JSON (FAQ/Banner), ensure the syntax is strictly valid JSON.');
    }
  };

  if (loading) return <div className="loading">Loading CMS...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">CMS Settings</h1>
        <p className="page-subtitle">Manage app content, legal documents, and promotional banners.</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          {['terms', 'privacy', 'faq', 'banner'].map(tab => (
            <button 
              key={tab}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(tab)}
              style={{ textTransform: 'capitalize' }}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label style={{textTransform: 'capitalize'}}>{activeTab} Content</label>
            <textarea
              className="input"
              rows={activeTab === 'faq' || activeTab === 'banner' ? 15 : 25}
              value={cmsData[activeTab]}
              onChange={(e) => setCmsData({...cmsData, [activeTab]: e.target.value})}
              style={{ fontFamily: activeTab === 'faq' || activeTab === 'banner' ? 'monospace' : 'inherit' }}
            ></textarea>
            {(activeTab === 'faq' || activeTab === 'banner') && (
              <small className="text-muted">Must be valid JSON array.</small>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Content'}
          </button>
        </form>
      </div>
    </div>
  );
}
