import { useGetPaymentsQuery } from '../store/api/adminEndpoints';
import DataTable from '../components/DataTable';

export default function Payments() {
  const { data: response, isLoading: loading } = useGetPaymentsQuery();
  const payments = response?.data || [];

  const columns = [
    { key: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'order_id', label: 'Order ID', render: (val) => <small>{val}</small> },
    { key: 'company_name', label: 'Company', render: (val, row) => row.hiring_profiles?.company_name || 'N/A' },
    { key: 'type', label: 'Type', render: (val) => val || 'Standard' },
    { key: 'amount', label: 'Amount', render: (val, row) => <strong>{row.currency} {val}</strong> },
    { 
      key: 'status', 
      label: 'Status',
      render: (val, row) => (
        <span className={`badge badge-${row.status === 'success' ? 'approved' : row.status === 'failed' ? 'rejected' : 'pending'}`} style={{ textTransform: 'capitalize' }}>
          {row.status}
        </span>
      )
    },
    { key: 'gateway_ref', label: 'Gateway Ref', render: (val) => <small style={{ color: 'var(--text-muted)' }}>{val || '-'}</small> }
  ];

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading payments...</div>;

  return (
    <DataTable 
      title="Payments Ledger"
      subtitle="Track all transactions, audition boosts, and platform revenue."
      columns={columns}
      data={payments}
      filterConfig={{ status: ['success', 'pending', 'failed'] }}
    />
  );
}
