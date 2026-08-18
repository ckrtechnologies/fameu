import React from 'react';

export default function Safety({ onNavigate }) {
  return (
    <>
      {/* BREADCRUMB / HERO BANNER */}
      <section className="section" style={{ paddingTop: '140px', paddingBottom: '4rem', background: 'linear-gradient(180deg, rgba(255, 0, 85, 0.05) 0%, rgba(6, 6, 9, 0) 100%)' }}>
        <div className="container text-center">
          <span className="badge badge-primary">Fameuget Safety Shield</span>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Building a Vetted <br /><span className="text-gradient">Scam-Free Ecosystem</span></h1>
          <p className="subtitle" style={{ marginBottom: '0' }}>
            We enforce rigorous verification parameters for casting teams to protect our talent database from fraudulent agents.
          </p>
        </div>
      </section>

      {/* CHILD SAFETY & PROTECTION STANDARDS CALLOUT */}
      <section className="section" style={{ paddingTop: '0', paddingBottom: '3rem' }}>
        <div className="container">
          <div 
            className="glass-card" 
            style={{ 
              padding: '2.5rem', 
              background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%)',
              border: '1px solid rgba(225, 29, 72, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Google Play & Legal Compliance</span>
                <h3 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', margin: 0 }}>Fameu Child Safety Standards (Zero Tolerance)</h3>
              </div>
              <a 
                href="#/child-safety" 
                className="btn btn-primary" 
                onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('child-safety'); else window.location.hash = '#/child-safety'; }}
              >
                View Child Safety Policy &rarr;
              </a>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
              Fameu, operated by ArgosMob Tech & AI, maintains zero tolerance for Child Sexual Abuse and Exploitation (CSAE) and Child Sexual Abuse Material (CSAM). We enforce strict guardian oversight for minor performers and report violations to legal authorities.
            </p>
          </div>
        </div>
      </section>

      {/* CORE SAFETY INITIATIVE */}
      <section className="section section-alt" style={{ paddingTop: '4rem' }}>
        <div className="container">
          <div className="grid-2">
            <div className="safety-shield">
              <div className="shield-glow"></div>
              <div className="shield-icon">🛡️</div>
            </div>

            <div>
              <span className="badge badge-gold">Anti-Scam Architecture</span>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Why Fameuget is Safe</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Traditional platforms let anyone publish casting calls. Scammers use this loophole to charge actors "registration fees" or steal personal contact details.
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                At Fameuget, we have integrated a multi-layered verification framework. No recruiter can contact artists or post roles until they pass our manual screening queues.
              </p>
              
              <div className="safety-checkmarks">
                <div className="checkmark-item">
                  <div className="checkmark-icon">✓</div>
                  <div className="checkmark-text">
                    <h4>Mandatory Recruiter Audits</h4>
                    <p>Recruiters must upload Aadhaar, PAN, and corporate incorporation documents.</p>
                  </div>
                </div>
                <div className="checkmark-item">
                  <div className="checkmark-icon">✓</div>
                  <div className="checkmark-text">
                    <h4>Biometric Selfie Matching</h4>
                    <p>Facial scans ensure the profile creator corresponds to the submitted identity documentation.</p>
                  </div>
                </div>
                <div className="checkmark-item">
                  <div className="checkmark-icon">✓</div>
                  <div className="checkmark-text">
                    <h4>Secure Contact Channels</h4>
                    <p>Communication occurs inside the app. Recruiters do not see your phone number until you accept their request.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GUIDELINES FOR ARTISTS */}
      <section className="section">
        <div className="container">
          <div className="text-center">
            <span className="badge badge-purple">Community Policies</span>
            <h2 style={{ fontSize: '2.5rem' }}>The Golden Rules of Auditions</h2>
            <p className="subtitle">Keep these key principles in mind to navigate your professional career safely.</p>
          </div>

          <div className="grid-3" style={{ marginTop: '2rem' }}>
            <div className="glass-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>❌</div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Never Pay Upfront</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No verified production house will ever ask for card processing fees, agency deposits, or portfolio charges. Reject such requests immediately.
              </p>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚩</div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Report Suspicious Posts</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                If an audition venue feels unsafe, or if a recruiter displays suspicious behavior, click the flag icon to report them to our moderation team.
              </p>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🆔</div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Look for Blue Badges</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Prioritize applying to recruiters displaying the verified icon badge. It signifies our staff has successfully verified their corporate status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MODERATION & BLACKLIST CONTROL */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid-2">
            <div>
              <span className="badge badge-primary">Admin System</span>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Behind the Scenes: Admin Moderation</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Our backend admin panel runs active monitoring scripts to capture spam and blacklist offenders.
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                - **Fraud Review Queues**: Whenever a profile is flagged by three unique artists, it is auto-paused and routed to our manual intervention queue.
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                - **Blacklist Enforcement**: Suspended users have their Aadhaar hashes, PAN records, and device IDs blacklisted, preventing them from re-registering.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '400px', background: 'rgba(123, 44, 191, 0.03)', borderColor: 'var(--accent-purple)' }}>
                <h4 style={{ color: 'var(--accent-violet)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>Verification Stats</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Avg Vetting Time:</span>
                    <span style={{ fontWeight: 700 }}>&lt; 12 Hours</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Suspicious Accounts Blocked:</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-crimson)' }}>120+</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Verification Success Rate:</span>
                    <span style={{ fontWeight: 700, color: '#4BB543' }}>98.4%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
