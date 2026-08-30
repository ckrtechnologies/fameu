import React from 'react';
import { 
  useGetAnalyticsQuery, 
  useGetPendingKYCQuery, 
  useGetAuditionsQuery, 
  useGetFraudReportsQuery 
} from '../store/api/adminEndpoints';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  FileCheck2, 
  Clapperboard, 
  FileText, 
  ShieldAlert, 
  ArrowUpRight, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Bell, 
  Image as ImageIcon, 
  LifeBuoy, 
  Database,
  Building2,
  Calendar,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: analyticsRes, isLoading: loadingAnalytics, refetch: refetchAnalytics } = useGetAnalyticsQuery();
  const { data: pendingKycRes, isLoading: loadingKYC } = useGetPendingKYCQuery();
  const { data: auditionsRes, isLoading: loadingAuditions } = useGetAuditionsQuery();
  const { data: fraudRes } = useGetFraudReportsQuery();

  const stats = analyticsRes?.data || {
    totalUsers: 0,
    totalArtists: 0,
    totalHiring: 0,
    activeAuditions: 0,
    totalApplications: 0,
    pendingKYC: 0,
    pendingFraud: 0
  };

  const pendingKYCList = pendingKycRes?.data || [];
  const recentAuditions = (auditionsRes?.data || []).slice(0, 5);
  const recentFraud = (fraudRes?.data || []).filter(f => f.status === 'pending').slice(0, 4);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* 6 Top KPI Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        
        {/* Total Artists */}
        <Link 
          to="/users/artist" 
          style={{ textDecoration: 'none' }}
          className="card"
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              REGISTERED ARTISTS
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)' }}>
            {loadingAnalytics ? '...' : stats.totalArtists || stats.totalUsers}
          </div>
          <div style={{ fontSize: '12px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontWeight: '600' }}>
            <TrendingUp size={13} /> Active Talent Directory
          </div>
        </Link>

        {/* Hiring Partners */}
        <Link 
          to="/users/hiring" 
          style={{ textDecoration: 'none' }}
          className="card"
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              HIRING PARTNERS
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={18} color="#7C3AED" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#7C3AED' }}>
            {loadingAnalytics ? '...' : stats.totalHiring}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Production Houses & Casting
          </div>
        </Link>

        {/* Pending KYC Reviews */}
        <Link 
          to="/kyc" 
          style={{ textDecoration: 'none' }}
          className="card"
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              PENDING KYC
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCheck2 size={18} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#D97706' }}>
            {loadingAnalytics ? '...' : stats.pendingKYC || pendingKYCList.length}
          </div>
          <div style={{ fontSize: '12px', color: '#B45309', marginTop: '4px', fontWeight: '600' }}>
            Requires Admin Action →
          </div>
        </Link>

        {/* Active Auditions */}
        <Link 
          to="/auditions" 
          style={{ textDecoration: 'none' }}
          className="card"
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ACTIVE AUDITIONS
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ECFEFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clapperboard size={18} color="#0891B2" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0891B2' }}>
            {loadingAnalytics ? '...' : stats.activeAuditions}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Currently Live for Submissions
          </div>
        </Link>

        {/* Total Applications */}
        <Link 
          to="/applications" 
          style={{ textDecoration: 'none' }}
          className="card"
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              APPLICATIONS
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="var(--success)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--success)' }}>
            {loadingAnalytics ? '...' : stats.totalApplications}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Audition reels submitted
          </div>
        </Link>

        {/* Fraud / Safety Alerts */}
        <Link 
          to="/fraud-reports" 
          style={{ textDecoration: 'none' }}
          className="card"
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              SAFETY ALERTS
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={18} color="var(--danger)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--danger)' }}>
            {loadingAnalytics ? '...' : stats.pendingFraud || recentFraud.length}
          </div>
          <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px', fontWeight: '600' }}>
            Unresolved User Reports →
          </div>
        </Link>

      </div>

      {/* Main Content 2-Column Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        
        {/* Pending KYC Action Card */}
        <div className="card" style={{ borderRadius: '16px', padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck2 size={20} color="#D97706" />
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Pending KYC Approvals</h3>
            </div>
            <Link to="/kyc" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All ({pendingKYCList.length}) <ArrowUpRight size={14} />
            </Link>
          </div>

          {loadingKYC ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading KYC records...</p>
          ) : pendingKYCList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 12px', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
              <CheckCircle2 size={36} color="var(--success)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: '600' }}>All Caught Up!</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>No agencies currently waiting for KYC approval.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingKYCList.slice(0, 4).map((doc) => {
                const profile = doc.hiring_profiles || {};
                return (
                  <div 
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
                        {(profile.company_name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                          {profile.company_name || 'Hiring Agency'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#B45309' }}>
                          {profile.company_type || 'Casting House'} • Submitted {new Date(doc.updated_at || doc.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate('/kyc')}
                      className="btn" 
                      style={{ backgroundColor: '#D97706', color: '#FFFFFF', padding: '6px 12px', fontSize: '12px', borderRadius: '6px', fontWeight: '600' }}
                    >
                      Review
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Casting Calls / Auditions Feed */}
        <div className="card" style={{ borderRadius: '16px', padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clapperboard size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Recent Auditions Posted</h3>
            </div>
            <Link to="/auditions" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All ({stats.activeAuditions}) <ArrowUpRight size={14} />
            </Link>
          </div>

          {loadingAuditions ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading auditions...</p>
          ) : recentAuditions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 12px', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No active auditions found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentAuditions.map((audition) => (
                <div 
                  key={audition.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid var(--border)',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clapperboard size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-main)' }}>
                        {audition.title || 'Untitled Audition'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {audition.hiring_profiles?.company_name || 'Production'} • {audition.category || 'Lead Role'}
                      </div>
                    </div>
                  </div>

                  <span 
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: audition.status === 'active' ? '#DCFCE7' : '#F1F5F9',
                      color: audition.status === 'active' ? '#16A34A' : '#64748B',
                      textTransform: 'capitalize'
                    }}
                  >
                    {audition.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Quick Launchpad Actions */}
      <div className="card" style={{ borderRadius: '16px', padding: '22px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)' }}>
          Quick Management Launchpad
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Broadcast Push (NMS)', path: '/nms', icon: <Bell size={18} color="#0033FF" />, bg: '#EFF6FF' },
            { label: 'Promotional Banners', path: '/banners', icon: <ImageIcon size={18} color="#7C3AED" />, bg: '#F5F3FF' },
            { label: 'Professions Taxonomy', path: '/professions', icon: <Database size={18} color="#0891B2" />, bg: '#ECFEFF' },
            { label: 'User Fraud Reports', path: '/fraud-reports', icon: <ShieldAlert size={18} color="#EF4444" />, bg: '#FEE2E2' },
            { label: 'Support Tickets', path: '/support', icon: <LifeBuoy size={18} color="#10B981" />, bg: '#ECFDF5' },
          ].map((action, i) => (
            <Link 
              key={i}
              to={action.path}
              className="btn btn-secondary"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '12px 14px', 
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {action.icon}
              </div>
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
