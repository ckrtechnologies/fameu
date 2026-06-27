import React from 'react';

export default function Home({ onNavigate, onOpenModal }) {
  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-glow"></div>
        <div className="container hero-container">
          <div className="hero-content">
            <span className="badge badge-primary">Now Live in Chandigarh & Mumbai</span>
            <h1 className="hero-title">
              Where Talent Meets the <br />
              <span className="text-gradient">Spotlight</span>
            </h1>
            <p className="hero-subtitle">
              Fameuget is India's premium tech-enabled hiring network for actors, singers, models, and production crew. Built with mandatory verification to keep casting scam-free.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => onOpenModal('Artist')}>Create Your Portfolio</button>
              <button className="btn btn-secondary" onClick={() => onNavigate('auditions')}>Browse Auditions</button>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <h3>10k+</h3>
                <p>Vetted Artists</p>
              </div>
              <div className="stat-item">
                <h3>500+</h3>
                <p>Auditions Filled</p>
              </div>
              <div className="stat-item">
                <h3>₹10</h3>
                <p>Audition Post Fee</p>
              </div>
            </div>
          </div>

          <div className="hero-graphics">
            <div className="mockup-container">
              <div className="mockup-notch"></div>
              <div className="mockup-screen">
                <div className="mockup-header" style={{ marginTop: '0.5rem' }}>
                  <div className="mockup-status">Fameuget</div>
                  <div className="mockup-signal">5G 🔋</div>
                </div>
                <div className="mockup-body">
                  <div className="mockup-title">Trending Auditions</div>
                  <div className="mockup-card">
                    <span className="mockup-tag font-bold">ACTOR</span>
                    <h4 style={{ color: 'white', marginTop: '0.25rem', fontSize: '0.9rem' }}>Romantic Lead Female</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>YRF Studios • Mumbai</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>₹15k - 20k/Day</span>
                      <span className="badge-sm badge-success">Apply</span>
                    </div>
                  </div>
                  <div className="mockup-card">
                    <span className="mockup-tag" style={{ background: '#7B2CBF' }}>SINGER</span>
                    <h4 style={{ color: 'white', marginTop: '0.25rem', fontSize: '0.9rem' }}>Playback Vocals (Male)</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>T-Series • Delhi</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>₹50k Flat</span>
                      <span className="badge-sm badge-success">Apply</span>
                    </div>
                  </div>
                  <div className="mockup-card">
                    <span className="mockup-tag" style={{ background: '#F5A623' }}>MODEL</span>
                    <h4 style={{ color: 'white', marginTop: '0.25rem', fontSize: '0.9rem' }}>Winter Apparel Shoot</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Zara India • Bangalore</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>₹8k/Day</span>
                      <span className="badge-sm badge-success">Apply</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DUAL PATHWAY SELECTOR */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <span className="badge badge-gold">Select Your Path</span>
            <h2 style={{ fontSize: '2.5rem' }}>Welcome to Fameuget</h2>
            <p className="subtitle">Choose your user profile pathway below to get tailored onboarding guides and registration info.</p>
          </div>

          <div className="grid-2">
            <div className="glass-card role-card" onClick={() => onNavigate('artists')}>
              <div className="role-icon">🎭</div>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>I am an Artist</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Create a professional digital portfolio, add details (acting parameters, vocals, crew skillsets), upload monologues, and apply to auditions for free.
              </p>
              <span className="btn btn-secondary btn-sm">Explore Artist Features</span>
            </div>

            <div className="glass-card role-card" onClick={() => onNavigate('casting')}>
              <div className="role-icon">🎥</div>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>I am Hiring / Casting</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Submit PAN/GST documents for company approval, lookup talent using strict physical parameters, post verified auditions for ₹10, and schedule digital slots.
              </p>
              <span className="btn btn-secondary btn-sm">Explore Casting Features</span>
            </div>
          </div>
        </div>
      </section>

      {/* VERIFICATION AND TRUST SEGMENT */}
      <section className="section">
        <div className="container">
          <div className="grid-2">
            <div>
              <span className="badge badge-primary">Security Shield</span>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Eradicating Audition Fraud</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '1.05rem' }}>
                We believe that the film industry should be safe. Fameuget enforces mandatory identity auditing for all recruiting companies before their profile goes live.
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                This structure prevents fake casting coordinators and unauthorized talent managers from requesting upfront fees or private personal contact details.
              </p>
              <button className="btn btn-gold" onClick={() => onNavigate('safety')}>Read Anti-Scam Rules</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
              <div className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem' }}>🆔</div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Aadhaar & PAN Audit</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Every casting coordinator must complete a KYC process.</p>
                </div>
              </div>
              
              <div className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem' }}>🏢</div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem' }}>GST & Lease Verification</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Verifies the legitimacy of corporate production spaces.</p>
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem' }}>🤳</div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Face Match check</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ensures the account creator corresponds to the ID provided.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD Call to Action */}
      <section className="section section-alt" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 85, 0.05) 0%, rgba(0, 0, 0, 0) 70%)' }}>
        <div className="container text-center">
          <span className="badge badge-purple">Available Now</span>
          <h2 style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>Download the Fameuget App</h2>
          <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
            Claim your free digital portfolio, verify your artist details, and start applying to verified casting directors instantly.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => onOpenModal('Artist')}>Google Play Store</button>
            <button className="btn btn-secondary" onClick={() => onOpenModal('Artist')}>Apple App Store</button>
          </div>
        </div>
      </section>
    </>
  );
}
