export default function Dashboard() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p>Welcome back, Administrator. Here's what's happening today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {/* Placeholder Stat Cards */}
        <div className="glass-card">
          <p style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Artists</p>
          <h2 style={{ fontSize: '2.5rem', margin: '8px 0', color: 'var(--accent-primary)' }}>1,248</h2>
          <p style={{ color: 'var(--success)', fontSize: '0.875rem' }}>+12% this week</p>
        </div>
        
        <div className="glass-card">
          <p style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Hiring Companies</p>
          <h2 style={{ fontSize: '2.5rem', margin: '8px 0', color: 'var(--accent-secondary)' }}>432</h2>
          <p style={{ color: 'var(--success)', fontSize: '0.875rem' }}>+5% this week</p>
        </div>

        <div className="glass-card">
          <p style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending KYC</p>
          <h2 style={{ fontSize: '2.5rem', margin: '8px 0', color: 'var(--warning)' }}>24</h2>
          <p style={{ fontSize: '0.875rem' }}>Requires your attention</p>
        </div>
      </div>
    </div>
  );
}
