import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileCheck, LogOut, Clapperboard, ShieldAlert, Ban, CreditCard, Settings, FileText, Database, Bell, MessageSquare } from 'lucide-react';

import { Briefcase } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const navCategories = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
      ]
    },
    {
      title: 'Users & Identity',
      items: [
        { name: 'Artists', path: '/users/artist', icon: <Users size={20} /> },
        { name: 'Hiring Partners', path: '/users/hiring', icon: <Briefcase size={20} /> },
        { name: 'KYC Verification', path: '/kyc', icon: <FileCheck size={20} /> },
      ]
    },
    {
      title: 'Content & Moderation',
      items: [
        { name: 'Messaging', path: '/messaging', icon: <MessageSquare size={20} /> },
        { name: 'Auditions', path: '/auditions', icon: <Clapperboard size={20} /> },
        { name: 'Applications', path: '/applications', icon: <FileText size={20} /> },
        { name: 'Fraud Reports', path: '/fraud-reports', icon: <ShieldAlert size={20} /> },
        { name: 'Blacklist', path: '/blacklist', icon: <Ban size={20} /> },
      ]
    },
    {
      title: 'Finance & System',
      items: [
        { name: 'Professions', path: '/professions', icon: <Database size={20} /> },
        { name: 'Notifications', path: '/nms', icon: <Bell size={20} /> },
      ]
    }
  ];

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo" style={{ background: 'transparent', padding: 0 }}>
            <img src="/logo.jpeg" alt="Fameu Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Fameu Admin</h2>
        </div>

        <nav className="sidebar-nav">
          {navCategories.map((category) => (
            <div key={category.title} style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '0 12px 8px', letterSpacing: '1px', fontWeight: '600' }}>
                {category.title}
              </div>
              {category.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    isActive ? 'nav-item active' : 'nav-item'
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="icon">
                        {item.icon}
                      </div>
                      {item.name}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-danger-outline" style={{ width: '100%' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="content-wrapper">
        <header className="header">
          <div className="header-title">Overview</div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
