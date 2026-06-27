import { useGetApplicationsQuery } from '../store/api/adminEndpoints';
import DataTable from '../components/DataTable';

export default function Applications() {
  const { data: response, isLoading: loading } = useGetApplicationsQuery();
  const applications = response?.data || [];

  const columns = [
    { key: 'created_at', label: 'Applied On', render: (val) => new Date(val).toLocaleDateString() },
    { 
      key: 'artist', 
      label: 'Artist', 
      render: (val, row) => (
        <div>
          <div>{row.artist?.display_name || 'N/A'}</div>
          <small style={{ color: 'var(--text-muted)' }}>{row.artist?.email}</small>
        </div>
      )
    },
    { key: 'audition', label: 'Audition', render: (val, row) => row.audition?.title || 'N/A' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val, row) => (
        <span className={`badge badge-${row.status === 'accepted' ? 'approved' : row.status === 'rejected' ? 'rejected' : 'pending'}`} style={{ textTransform: 'capitalize' }}>
          {row.status || 'pending'}
        </span>
      )
    }
  ];

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading applications...</div>;

  return (
    <DataTable 
      title="Applications"
      subtitle="View all job applications submitted by artists."
      columns={columns}
      data={applications}
      filterConfig={{ status: ['pending', 'accepted', 'rejected'] }}
    />
  );
}
