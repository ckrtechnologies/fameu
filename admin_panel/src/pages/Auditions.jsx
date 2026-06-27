import { useGetAuditionsQuery, useFlagAuditionMutation, useDeleteAuditionMutation } from '../store/api/adminEndpoints';
import DataTable from '../components/DataTable';

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

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'company', label: 'Company', render: (val, row) => row.hiring_profiles?.company_name || 'N/A' },
    { key: 'category', label: 'Category' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val, row) => (
        <span className={`badge badge-${row.status === 'active' ? 'approved' : row.status === 'cancelled' ? 'rejected' : 'pending'}`} style={{ textTransform: 'capitalize' }}>
          {row.status}
        </span>
      )
    }
  ];

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading auditions...</div>;

  return (
    <DataTable 
      title="Audition Moderation"
      subtitle="Review, flag, or remove auditions posted by casting directors."
      columns={columns}
      data={auditions}
      filterConfig={{ status: ['active', 'cancelled', 'expired'] }}
      onDelete={(row) => handleDelete(row.id)}
      onEdit={(row) => handleFlag(row.id)} 
    />
  );
}
