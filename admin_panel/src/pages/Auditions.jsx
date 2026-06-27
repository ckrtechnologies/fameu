import { useGetAuditionsQuery, useFlagAuditionMutation, useDeleteAuditionMutation } from '../store/api/adminEndpoints';

export default function Auditions() {
  const { data: response, isLoading: loading } = useGetAuditionsQuery();
  const [flagAudition] = useFlagAuditionMutation();
  const [deleteAudition] = useDeleteAuditionMutation();
  
  const auditions = response?.data || [];

  const handleFlag = async (id) => {
    if (!window.confirm('Are you sure you want to flag and cancel this audition?')) return;
    try {
      await flagAudition(id).unwrap();
    } catch (error) {
      console.error('Failed to flag audition:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this audition?')) return;
    try {
      await deleteAudition(id).unwrap();
    } catch (error) {
      console.error('Failed to delete audition:', error);
    }
  };

  if (loading) return <div className="loading">Loading auditions...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Audition Moderation</h1>
        <p className="page-subtitle">Review, flag, or remove auditions posted by casting directors.</p>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {auditions.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign: 'center'}}>No auditions found.</td></tr>
              ) : (
                auditions.map((aud) => (
                  <tr key={aud.id}>
                    <td>{aud.title}</td>
                    <td>{aud.hiring_profiles?.company_name || 'N/A'}</td>
                    <td>{aud.category}</td>
                    <td>
                      <span className={`status-badge status-${aud.status.toLowerCase()}`}>
                        {aud.status}
                      </span>
                    </td>
                    <td>
                      {aud.status !== 'cancelled' && (
                        <button className="btn btn-warning" onClick={() => handleFlag(aud.id)} style={{marginRight: '8px'}}>Flag</button>
                      )}
                      <button className="btn btn-danger" onClick={() => handleDelete(aud.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
