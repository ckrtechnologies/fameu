import { useGetAnalyticsQuery } from '../store/api/adminEndpoints';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: response, isLoading: loading, error } = useGetAnalyticsQuery();
  
  const stats = response?.data || {
    totalUsers: 0,
    activeAuditions: 0,
    totalApplications: 0
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p>Welcome back, Administrator. Here's what's happening today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <Link to="/users" className="glass-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          <p style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Users</p>
          <h2 style={{ fontSize: '2.5rem', margin: '8px 0', color: 'var(--accent-primary)' }}>
            {loading ? '...' : stats.totalUsers}
          </h2>
          <p style={{ color: 'var(--success)', fontSize: '0.875rem' }}>All registered accounts</p>
        </Link>
        
        <Link to="/auditions" className="glass-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          <p style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Auditions</p>
          <h2 style={{ fontSize: '2.5rem', margin: '8px 0', color: 'var(--accent-secondary)' }}>
            {loading ? '...' : stats.activeAuditions}
          </h2>
          <p style={{ color: 'var(--success)', fontSize: '0.875rem' }}>Currently open</p>
        </Link>

        <div className="glass-card">
          <p style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Applications</p>
          <h2 style={{ fontSize: '2.5rem', margin: '8px 0', color: 'var(--warning)' }}>
            {loading ? '...' : stats.totalApplications}
          </h2>
          <p style={{ fontSize: '0.875rem' }}>Submitted by artists</p>
        </div>

      </div>
    </div>
  );
}
