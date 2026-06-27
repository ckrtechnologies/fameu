import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileCheck, LogOut, ShieldAlert } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'KYC Verification', path: '/kyc', icon: <FileCheck size={20} /> },
    { name: 'User Management', path: '/users', icon: <Users size={20} /> },
  ];

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">F</div>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Fameu Admin</h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
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
