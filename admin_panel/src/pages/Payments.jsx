import { useGetPaymentsQuery } from '../store/api/adminEndpoints';

export default function Payments() {
  const { data: response, isLoading: loading } = useGetPaymentsQuery();
  const payments = response?.data || [];

  if (loading) return <div className="loading">Loading payments...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Payments Ledger</h1>
        <p className="page-subtitle">Track all transactions, audition boosts, and platform revenue.</p>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Company</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Gateway Ref</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign: 'center'}}>No transactions found.</td></tr>
              ) : (
                payments.map((pay) => (
                  <tr key={pay.id}>
                    <td>{new Date(pay.created_at).toLocaleDateString()}</td>
                    <td><small>{pay.order_id}</small></td>
                    <td>{pay.hiring_profiles?.company_name || 'N/A'}</td>
                    <td>{pay.type || 'Standard'}</td>
                    <td><strong>{pay.currency} {pay.amount}</strong></td>
                    <td>
                      <span className={`status-badge status-${pay.status.toLowerCase()}`}>
                        {pay.status}
                      </span>
                    </td>
                    <td><small className="text-muted">{pay.gateway_ref || '-'}</small></td>
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
