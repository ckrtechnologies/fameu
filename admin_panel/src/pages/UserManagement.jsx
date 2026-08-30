import React, { useState, useMemo } from 'react';
import { 
  useGetUsersQuery, 
  useDeleteUserMutation, 
  useBlacklistUserMutation,
  useRemoveBlacklistMutation
} from '../store/api/adminEndpoints';
import UserDetailsModal from '../components/UserDetailsModal';
import EditUserModal from '../components/EditUserModal';
import { getImageUrl } from '../lib/api';
import { 
  Users, 
  Briefcase, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  X, 
  RefreshCw, 
  ShieldCheck, 
  LayoutGrid, 
  List,
  Sparkles,
  MessageCircle
} from 'lucide-react';

export default function UserManagement({ role = 'artist' }) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editUserId, setEditUserId] = useState(null);

  const { data: response, isLoading: loading, isFetching, refetch } = useGetUsersQuery(role);
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [blacklistUser] = useBlacklistUserMutation();
  const [removeBlacklist] = useRemoveBlacklistMutation();

  const users = useMemo(() => response?.data || [], [response]);

  const isArtist = role === 'artist';
  const pageTitle = isArtist ? 'Artist Directory & Management' : 'Hiring Partner Management';
  const pageSubtitle = isArtist 
    ? 'Manage actor, model, dancer, and talent profiles across the FameU network.'
    : 'Manage casting directors, production houses, and agency accounts.';

  // Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const verified = users.filter(u => u.is_verified || u.hiring_profiles?.is_verified || u.artist_profiles?.is_verified).length;
    const blacklisted = users.filter(u => u.is_blacklisted).length;
    const incomplete = users.filter(u => !u.email || (!u.display_name && !u.username)).length;
    return { total, verified, blacklisted, incomplete };
  }, [users]);

  // Filtered List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Filter tab
      if (selectedFilter === 'verified') {
        const isVer = u.is_verified || u.hiring_profiles?.is_verified || u.artist_profiles?.is_verified;
        if (!isVer) return false;
      } else if (selectedFilter === 'blacklisted') {
        if (!u.is_blacklisted) return false;
      } else if (selectedFilter === 'active') {
        if (u.is_blacklisted) return false;
      }

      // Search query
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      const name = (u.display_name || u.artist_profiles?.full_name || u.hiring_profiles?.company_name || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.mobile || u.phone || u.hiring_profiles?.phone || '').toLowerCase();

      return name.includes(query) || username.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [users, selectedFilter, searchQuery]);

  const handleDelete = async (user) => {
    const name = user.display_name || user.username || 'this user';
    if (window.confirm(`Are you sure you want to permanently delete ${name}? This action cannot be undone.`)) {
      try {
        await deleteUser(user.id).unwrap();
        alert('User deleted successfully.');
      } catch (err) {
        alert(err?.data?.error || 'Failed to delete user');
      }
    }
  };

  const handleToggleBlacklist = async (user) => {
    try {
      if (user.is_blacklisted) {
        await removeBlacklist(user.id).unwrap();
        alert('User unbanned successfully.');
      } else {
        const reason = window.prompt(`Reason for banning ${user.display_name || 'this user'}:`, 'Violation of platform terms');
        if (reason) {
          await blacklistUser({ user_id: user.id, reason }).unwrap();
          alert('User blacklisted.');
        }
      }
    } catch (err) {
      alert(err?.data?.error || 'Action failed');
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isArtist ? <Users size={26} color="var(--primary)" /> : <Briefcase size={26} color="#7C3AED" />}
            {pageTitle}
          </h1>
          <p className="page-subtitle">{pageSubtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => refetch()} 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            disabled={isFetching}
          >
            <RefreshCw size={15} className={isFetching ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Top 4 KPI Deck */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Total Users */}
        <div 
          onClick={() => setSelectedFilter('all')}
          className="card"
          style={{ 
            cursor: 'pointer', 
            padding: '18px 20px', 
            borderRadius: '12px',
            border: selectedFilter === 'all' ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: selectedFilter === 'all' ? 'var(--primary-light)' : 'var(--bg-card)',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              TOTAL {isArtist ? 'ARTISTS' : 'PARTNERS'}
            </span>
            {isArtist ? <Users size={18} color="var(--primary)" /> : <Briefcase size={18} color="#7C3AED" />}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)' }}>{metrics.total}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>All registered accounts</div>
        </div>

        {/* Active Accounts */}
        <div 
          onClick={() => setSelectedFilter('active')}
          className="card"
          style={{ 
            cursor: 'pointer', 
            padding: '18px 20px', 
            borderRadius: '12px',
            border: selectedFilter === 'active' ? '2px solid var(--success)' : '1px solid var(--border)',
            background: selectedFilter === 'active' ? '#ECFDF5' : 'var(--bg-card)',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--success)', textTransform: 'uppercase' }}>
              ACTIVE & HEALTHY
            </span>
            <CheckCircle2 size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--success)' }}>
            {metrics.total - metrics.blacklisted}
          </div>
          <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>Good standing accounts</div>
        </div>

        {/* Verified Accounts */}
        <div 
          onClick={() => setSelectedFilter('verified')}
          className="card"
          style={{ 
            cursor: 'pointer', 
            padding: '18px 20px', 
            borderRadius: '12px',
            border: selectedFilter === 'verified' ? '2px solid #3B82F6' : '1px solid var(--border)',
            background: selectedFilter === 'verified' ? '#EFF6FF' : 'var(--bg-card)',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase' }}>
              VERIFIED BADGE
            </span>
            <ShieldCheck size={18} color="#2563EB" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#2563EB' }}>{metrics.verified}</div>
          <div style={{ fontSize: '12px', color: '#1D4ED8', marginTop: '4px' }}>KYC / Identity verified</div>
        </div>

        {/* Blacklisted / Suspended */}
        <div 
          onClick={() => setSelectedFilter('blacklisted')}
          className="card"
          style={{ 
            cursor: 'pointer', 
            padding: '18px 20px', 
            borderRadius: '12px',
            border: selectedFilter === 'blacklisted' ? '2px solid var(--danger)' : '1px solid var(--border)',
            background: selectedFilter === 'blacklisted' ? '#FEE2E2' : 'var(--bg-card)',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--danger)', textTransform: 'uppercase' }}>
              BLACKLISTED
            </span>
            <Ban size={18} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--danger)' }}>{metrics.blacklisted}</div>
          <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '4px' }}>Suspended from platform</div>
        </div>

      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card" style={{ padding: '16px 20px', borderRadius: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Users', count: metrics.total },
              { id: 'active', label: 'Active', count: metrics.total - metrics.blacklisted, color: 'var(--success)' },
              { id: 'verified', label: 'Verified Only', count: metrics.verified, color: '#2563EB' },
              { id: 'blacklisted', label: 'Blacklisted', count: metrics.blacklisted, color: '#DC2626' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`btn ${selectedFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: selectedFilter === tab.id ? '600' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{tab.label}</span>
                <span 
                  style={{
                    backgroundColor: selectedFilter === tab.id ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                    color: selectedFilter === tab.id ? '#fff' : (tab.color || 'var(--text-main)'),
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & View Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px', maxWidth: '480px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder={`Search by name, @username, email, phone...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '36px', height: '40px', borderRadius: '20px' }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={14} color="var(--text-muted)" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', backgroundColor: '#F1F5F9', borderRadius: '8px', padding: '2px' }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
                title="Card Grid View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <RefreshCw size={32} className="spin" color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h3>Loading {isArtist ? 'Artists' : 'Hiring Partners'}...</h3>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '16px' }}>
          <Users size={54} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No users found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
            {searchQuery 
              ? `No records matching "${searchQuery}".`
              : `There are currently no accounts in this list.`}
          </p>
          {selectedFilter !== 'all' && (
            <button onClick={() => setSelectedFilter('all')} className="btn btn-secondary" style={{ marginTop: '16px' }}>
              View All Users
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Card Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredUsers.map((user) => {
            const avatarUrl = getImageUrl(user.avatar_url) || `https://ui-avatars.com/api/?name=${user.display_name || 'User'}&background=random`;
            const name = user.display_name || user.artist_profiles?.full_name || user.hiring_profiles?.company_name || 'Unnamed User';
            const phone = user.mobile || user.phone || user.hiring_profiles?.phone;
            const isVerified = user.is_verified || user.hiring_profiles?.is_verified;

            return (
              <div 
                key={user.id}
                className="card"
                style={{
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: user.is_blacklisted ? '1.5px solid #FCA5A5' : '1px solid var(--border)',
                  backgroundColor: user.is_blacklisted ? '#FEF2F2' : '#FFFFFF'
                }}
              >
                <div>
                  {/* Top Avatar & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        style={{ width: '54px', height: '54px', borderRadius: '14px', objectFit: 'cover', border: '1px solid var(--border)' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${name}&background=random`;
                        }}
                      />
                      {isVerified && (
                        <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', backgroundColor: '#2563EB', color: '#fff', borderRadius: '50%', padding: '2px' }}>
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                    </div>

                    <span 
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: user.is_blacklisted ? '#FEE2E2' : '#ECFDF5',
                        color: user.is_blacklisted ? '#DC2626' : '#16A34A',
                        textTransform: 'uppercase'
                      }}
                    >
                      {user.is_blacklisted ? 'Blacklisted' : 'Active'}
                    </span>
                  </div>

                  {/* Name & Identifier */}
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 2px', color: 'var(--text-main)' }}>
                    {name}
                  </h3>
                  {user.username && (
                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
                      @{user.username}
                    </span>
                  )}

                  {/* Contact Info */}
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {user.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
                      </div>
                    )}
                    {phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} /> <span>{phone}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} /> <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '18px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <button
                    onClick={() => setSelectedUserId(user.id)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '7px', fontSize: '12px', justifyContent: 'center' }}
                  >
                    <Eye size={14} /> Profile
                  </button>
                  <button
                    onClick={() => setEditUserId(user.id)}
                    className="btn btn-secondary"
                    style={{ padding: '7px 10px', fontSize: '12px' }}
                    title="Edit User"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleToggleBlacklist(user)}
                    className="btn btn-secondary"
                    style={{ padding: '7px 10px', fontSize: '12px', color: user.is_blacklisted ? 'var(--success)' : 'var(--danger)' }}
                    title={user.is_blacklisted ? 'Unban User' : 'Ban User'}
                  >
                    <Ban size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="btn btn-secondary"
                    style={{ padding: '7px 10px', fontSize: '12px', color: 'var(--danger)' }}
                    title="Delete User"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Modern Data Table View */
        <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border)', color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 20px', fontWeight: '700' }}>User Profile</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700' }}>Role / Type</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700' }}>Contact Info</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700' }}>Joined</th>
                  <th style={{ padding: '14px 20px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const avatarUrl = getImageUrl(user.avatar_url) || `https://ui-avatars.com/api/?name=${user.display_name || 'User'}&background=random`;
                  const name = user.display_name || user.artist_profiles?.full_name || user.hiring_profiles?.company_name || 'Unnamed User';
                  const phone = user.mobile || user.phone || user.hiring_profiles?.phone;
                  const isVerified = user.is_verified || user.hiring_profiles?.is_verified;

                  return (
                    <tr 
                      key={user.id}
                      style={{ 
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: user.is_blacklisted ? '#FEF2F2' : '#FFFFFF',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => { if (!user.is_blacklisted) e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                      onMouseLeave={e => { if (!user.is_blacklisted) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                    >
                      {/* Profile Column */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={avatarUrl} 
                            alt="Avatar" 
                            style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border)' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${name}&background=random`;
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{name}</span>
                              {isVerified && <CheckCircle2 size={13} color="#2563EB" />}
                            </div>
                            {user.username && (
                              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>@{user.username}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role / Type */}
                      <td style={{ padding: '14px 16px' }}>
                        <span 
                          style={{ 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            padding: '3px 8px', 
                            borderRadius: '6px',
                            backgroundColor: user.role === 'artist' ? '#EFF6FF' : '#F5F3FF',
                            color: user.role === 'artist' ? 'var(--primary)' : '#7C3AED',
                            textTransform: 'capitalize'
                          }}
                        >
                          {user.role || role}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12.5px' }}>
                          {user.email && <span style={{ color: 'var(--text-main)' }}>{user.email}</span>}
                          {phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                              <span>{phone}</span>
                              <a 
                                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ color: '#16A34A', display: 'flex' }}
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle size={13} />
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span 
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: user.is_blacklisted ? '#FEE2E2' : '#DCFCE7',
                            color: user.is_blacklisted ? '#DC2626' : '#16A34A',
                            textTransform: 'uppercase'
                          }}
                        >
                          {user.is_blacklisted ? 'Banned' : 'Active'}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            onClick={() => setSelectedUserId(user.id)}
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                            title="Inspect User Details"
                          >
                            <Eye size={13} /> View
                          </button>
                          <button 
                            onClick={() => setEditUserId(user.id)}
                            className="btn btn-secondary" 
                            style={{ padding: '6px 8px', fontSize: '12px' }}
                            title="Edit User"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button 
                            onClick={() => handleToggleBlacklist(user)}
                            className="btn btn-secondary" 
                            style={{ padding: '6px 8px', fontSize: '12px', color: user.is_blacklisted ? 'var(--success)' : 'var(--danger)' }}
                            title={user.is_blacklisted ? 'Unban User' : 'Ban User'}
                          >
                            <Ban size={13} />
                          </button>
                          <button 
                            onClick={() => handleDelete(user)}
                            className="btn btn-secondary" 
                            style={{ padding: '6px 8px', fontSize: '12px', color: 'var(--danger)' }}
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserId && (
        <UserDetailsModal 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      )}

      {/* Edit User Modal */}
      {editUserId && (
        <EditUserModal 
          userId={editUserId} 
          onClose={() => setEditUserId(null)} 
        />
      )}

    </div>
  );
}
