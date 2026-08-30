import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  LogOut, 
  Clapperboard, 
  ShieldAlert, 
  Ban, 
  FileText, 
  Database, 
  Bell, 
  MessageSquare, 
  LifeBuoy, 
  Image as ImageIcon,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles
} from 'lucide-react';
import { useGetAnalyticsQuery } from '../store/api/adminEndpoints';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: analyticsRes } = useGetAnalyticsQuery(undefined, { pollingInterval: 30000 });
  const stats = analyticsRes?.data || {};

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const navCategories = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={19} /> },
      ]
    },
    {
      title: 'Users & Identity',
      items: [
        { name: 'Artists', path: '/users/artist', icon: <Users size={19} />, count: stats.totalArtists },
        { name: 'Hiring Partners', path: '/users/hiring', icon: <Briefcase size={19} />, count: stats.totalHiring },
        { 
          name: 'KYC Verification', 
          path: '/kyc', 
          icon: <FileCheck size={19} />, 
          badge: stats.pendingKYC > 0 ? stats.pendingKYC : null,
          badgeColor: '#D97706',
          badgeBg: '#FEF3C7'
        },
      ]
    },
    {
      title: 'Content & Moderation',
      items: [
        { name: 'Messaging', path: '/messaging', icon: <MessageSquare size={19} /> },
        { name: 'Auditions', path: '/auditions', icon: <Clapperboard size={19} />, count: stats.activeAuditions },
        { name: 'Applications', path: '/applications', icon: <FileText size={19} /> },
        { 
          name: 'Fraud Reports', 
          path: '/fraud-reports', 
          icon: <ShieldAlert size={19} />,
          badge: stats.pendingFraud > 0 ? stats.pendingFraud : null,
          badgeColor: '#DC2626',
          badgeBg: '#FEE2E2'
        },
        { name: 'Blacklist', path: '/blacklist', icon: <Ban size={19} /> },
        { name: 'Support', path: '/support', icon: <LifeBuoy size={19} /> },
        { name: 'Banners', path: '/banners', icon: <ImageIcon size={19} /> }
      ]
    },
    {
      title: 'Finance & System',
      items: [
        { name: 'Professions', path: '/professions', icon: <Database size={19} /> },
        { name: 'Notifications', path: '/nms', icon: <Bell size={19} /> },
      ]
    }
  ];

  // Helper to get active page name for header
  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/') return 'Dashboard Overview';
    if (p === '/kyc') return 'KYC Verification Hub';
    if (p === '/users/artist') return 'Artist Management';
    if (p === '/users/hiring') return 'Hiring Partner Management';
    if (p === '/auditions') return 'Auditions & Casting Calls';
    if (p === '/applications') return 'Audition Applications';
    if (p === '/fraud-reports') return 'Fraud & Safety Reports';
    if (p === '/blacklist') return 'Blacklist & Suspensions';
    if (p === '/messaging') return 'Live Messaging Audit';
    if (p === '/support') return 'Support Tickets';
    if (p === '/banners') return 'Banners & Promotions';
    if (p === '/professions') return 'Professions Taxonomy';
    if (p === '/nms') return 'Push Notifications (NMS)';
    return 'Admin Panel';
  };

  useEffect(() => {
    const pageTitle = getPageTitle();
    document.title = `${pageTitle} | FameU Admin`;
  }, [location.pathname]);

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <aside className="sidebar" style={{ boxShadow: '2px 0 10px rgba(0,0,0,0.02)' }}>
        {/* Brand Header */}
        <div className="sidebar-header" style={{ padding: '16px 20px', gap: '12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0033FF 0%, #3B82F6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '18px', boxShadow: '0 4px 10px rgba(0, 51, 255, 0.25)' }}>
            F
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.3px', margin: 0 }}>FameU Admin</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>Master Control Suite</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" style={{ padding: '16px 12px', overflowY: 'auto' }}>
          {navCategories.map((category) => (
            <div key={category.title} style={{ marginBottom: '1.4rem' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', margin: '0 10px 8px', letterSpacing: '0.8px', fontWeight: '700' }}>
                {category.title}
              </div>
              {category.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => 
                    isActive ? 'nav-item active' : 'nav-item'
                  }
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    marginBottom: '3px',
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '13.5px',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: isActive ? 'var(--primary)' : '#64748B', display: 'flex' }}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>

                      {/* Badge / Count Pill */}
                      {item.badge ? (
                        <span 
                          style={{
                            backgroundColor: item.badgeBg || '#FEE2E2',
                            color: item.badgeColor || '#DC2626',
                            padding: '2px 7px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            animation: 'pulse 2s infinite'
                          }}
                        >
                          {item.badge}
                        </span>
                      ) : item.count !== undefined && item.count > 0 ? (
                        <span 
                          style={{
                            backgroundColor: isActive ? 'rgba(0,51,255,0.1)' : '#F1F5F9',
                            color: isActive ? 'var(--primary)' : '#64748B',
                            padding: '1px 6px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer with Logout */}
        <div className="sidebar-footer" style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary" 
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              color: 'var(--danger)', 
              borderColor: '#FEE2E2', 
              backgroundColor: '#FEF2F2',
              fontWeight: '600',
              fontSize: '13px',
              padding: '9px 12px',
              borderRadius: '8px'
            }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="content-wrapper">
        <header 
          className="header" 
          style={{ 
            height: '64px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '0 28px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--border)'
          }}
        >
          {/* Breadcrumb & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Admin</span>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <h1 style={{ fontSize: '15.5px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
              {getPageTitle()}
            </h1>
          </div>

          {/* Right Status & Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', color: '#059669', fontWeight: '600' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              Live Server
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '14px', borderLeft: '1px solid var(--border)' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>
                AD
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>Administrator</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="main-content" style={{ padding: '28px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
