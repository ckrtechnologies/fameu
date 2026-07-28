import { useState } from 'react';
import { useGetSupportTicketsQuery, useUpdateSupportTicketStatusMutation } from '../store/api/adminEndpoints';
import DataTable from '../components/DataTable';
import { Mail, CheckCircle, Clock } from 'lucide-react';

export default function SupportTickets() {
  const { data: tickets = [], isLoading } = useGetSupportTicketsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateSupportTicketStatusMutation();

  const handleResolve = async (id) => {
    try {
      await updateStatus({ id, status: 'resolved' }).unwrap();
      alert('Ticket marked as resolved');
    } catch (error) {
      alert('Failed to resolve ticket');
    }
  };

  const columns = [
    {
      key: 'user',
      label: 'User Details',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: '600' }}>{row.users?.display_name || 'Unknown'}</div>
          <div style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
            {row.users?.email || row.users?.mobile || 'No contact'}
          </div>
          <span className={`badge ${row.user_type === 'artist' ? 'badge-approved' : 'badge-pending'}`} style={{ marginTop: '4px', display: 'inline-block' }}>
            {row.user_type}
          </span>
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (val) => <span style={{ fontWeight: '500' }}>{val}</span>
    },
    {
      key: 'message',
      label: 'Message',
      render: (val) => (
        <div style={{ maxWidth: '300px', whiteSpace: 'pre-wrap', fontSize: '0.9em' }}>
          {val}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          color: val === 'resolved' ? 'var(--success)' : 'var(--warning)',
          fontWeight: '500'
        }}>
          {val === 'resolved' ? <CheckCircle size={16} /> : <Clock size={16} />}
          {val.charAt(0).toUpperCase() + val.slice(1)}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (val) => new Date(val).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (val, row) => row.status !== 'resolved' && (
        <button 
          className="btn-primary" 
          onClick={() => handleResolve(row.id)}
          disabled={isUpdating}
          style={{ padding: '6px 12px', fontSize: '0.9em' }}
        >
          Resolve
        </button>
      )
    }
  ];

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">View and manage messages from the Contact Us form.</p>
        </div>
      </div>
      
      <div className="card">
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Mail size={48} color="var(--border-color)" style={{ marginBottom: '16px' }} />
            <h3>No Support Tickets</h3>
            <p>There are no messages from users at the moment.</p>
          </div>
        ) : (
          <DataTable 
            data={tickets}
            columns={columns}
            searchKey="subject"
          />
        )}
      </div>
    </div>
  );
}
