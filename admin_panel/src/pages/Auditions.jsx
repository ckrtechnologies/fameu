import { useState, useMemo } from 'react';
import { useGetAuditionsQuery, useFlagAuditionMutation, useSuspendAuditionMutation, useReactivateAuditionMutation, useDeleteAuditionMutation } from '../store/api/adminEndpoints';
import DataTable from '../components/DataTable';
import AuditionDetailsModal from '../components/AuditionDetailsModal';
import { Eye, Flag, Ban, Trash2, CheckCircle } from 'lucide-react';

export default function Auditions() {
  const { data: response, isLoading: loading } = useGetAuditionsQuery();
  const [flagAudition] = useFlagAuditionMutation();
  const [suspendAudition] = useSuspendAuditionMutation();
  const [reactivateAudition] = useReactivateAuditionMutation();
  const [deleteAudition] = useDeleteAuditionMutation();
  
  const [selectedAudition, setSelectedAudition] = useState(null);

  const rawAuditions = response?.data || [];

  const handleFlag = async (row) => {
    if (!window.confirm('Are you sure you want to flag and cancel this audition?')) return;
    try {
      await flagAudition(row.id).unwrap();
    } catch (error) {
      console.error('Failed to flag audition:', error);
    }
  };

  const handleSuspend = async (row) => {
    if (!window.confirm('Are you sure you want to suspend this audition?')) return;
    try {
      await suspendAudition(row.id).unwrap();
    } catch (error) {
      console.error('Failed to suspend audition:', error);
    }
  };

  const handleReactivate = async (row) => {
    if (!window.confirm('Are you sure you want to reactivate this audition?')) return;
    try {
      await reactivateAudition(row.id).unwrap();
    } catch (error) {
      console.error('Failed to reactivate audition:', error);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Are you sure you want to permanently delete this audition?')) return;
    try {
      await deleteAudition(row.id).unwrap();
    } catch (error) {
      console.error('Failed to delete audition:', error);
    }
  };

  const actions = (row) => [
    { label: 'View', icon: Eye, variant: 'secondary', onClick: (r) => setSelectedAudition(r) },
    { label: 'Flag', icon: Flag, variant: 'warning', onClick: handleFlag },
    ...(row.status === 'suspended' || row.status === 'cancelled'
      ? [{ label: 'Reactivate', icon: CheckCircle, variant: 'success', onClick: handleReactivate }]
      : [{ label: 'Suspend', icon: Ban, variant: 'warning', onClick: handleSuspend }]),
    { label: 'Delete', icon: Trash2, variant: 'danger', onClick: handleDelete },
  ];

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'company_name', label: 'Company' },
    { key: 'category', label: 'Category' },
    { key: 'audition_type', label: 'Type' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val, row) => (
        <span className={`badge badge-${row.status === 'active' ? 'approved' : row.status === 'cancelled' ? 'rejected' : row.status === 'suspended' ? 'pending' : 'pending'}`} style={{ textTransform: 'capitalize' }}>
          {row.status}
        </span>
      )
    }
  ];

  const { mappedAuditions, filterConfig } = useMemo(() => {
    const uniqueCategories = new Set();
    const uniqueCompanies = new Set();
    const uniqueTypes = new Set();

    const mapped = rawAuditions.map(a => {
      const company_name = a.hiring_profiles?.company_name || 'N/A';
      const category = a.category || 'N/A';
      const audition_type = a.audition_type || 'N/A';

      if (category !== 'N/A') uniqueCategories.add(category);
      if (company_name !== 'N/A') uniqueCompanies.add(company_name);
      if (audition_type !== 'N/A') uniqueTypes.add(audition_type);

      let displayStatus = a.status;
      // Derive 'suspended' status if backend used our fallback
      if (a.status === 'cancelled' && a.is_live === false) {
        displayStatus = 'suspended';
      }

      return {
        ...a,
        company_name,
        category,
        audition_type,
        status: displayStatus
      };
    });

    return {
      mappedAuditions: mapped,
      filterConfig: {
        status: ['active', 'cancelled', 'expired', 'suspended'],
        category: Array.from(uniqueCategories),
        company_name: Array.from(uniqueCompanies),
        audition_type: Array.from(uniqueTypes),
      }
    };
  }, [rawAuditions]);

  const dateFilterFields = [
    { key: 'audition_date', label: 'Audition Date' },
    { key: 'created_at', label: 'Posted Date' }
  ];

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading auditions...</div>;

  return (
    <>
      <DataTable 
        title="Audition Moderation"
        subtitle="Review, flag, or remove auditions posted by casting directors."
        columns={columns}
        data={mappedAuditions}
        filterConfig={filterConfig}
        dateFilterFields={dateFilterFields}
        actions={actions}
      />
      {selectedAudition && (
        <AuditionDetailsModal 
          audition={selectedAudition} 
          onClose={() => setSelectedAudition(null)} 
        />
      )}
    </>
  );
}
