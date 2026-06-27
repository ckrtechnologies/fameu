import React from 'react';

export default function Casting({ onOpenModal }) {
  return (
    <>
      {/* BREADCRUMB / HERO BANNER */}
      <section className="section" style={{ paddingTop: '140px', paddingBottom: '4rem', background: 'linear-gradient(180deg, rgba(245, 166, 35, 0.08) 0%, rgba(6, 6, 9, 0) 100%)' }}>
        <div className="container text-center">
          <span className="badge badge-gold">For Producers, Directors & Talent Managers</span>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Accelerate Your <br /><span className="text-gradient-gold">Casting Workflow</span></h1>
          <p className="subtitle" style={{ marginBottom: '0' }}>
            Vetted portfolios, search filters for physical and artistic criteria, and automated schedule queues in one platform.
          </p>
        </div>
      </section>

      {/* TALENT SEARCH SIMULATION */}
      <section className="section section-alt" style={{ paddingTop: '4rem' }}>
        <div className="container">
          <div className="grid-2">
            <div>
              <span className="badge badge-primary">Smart Search Simulation</span>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Filter by Exact Physical & Creative Parameters</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Stop scrolling through endless unorganized files or email attachments. Fameuget lets casting directors execute advanced database lookups in seconds.
              </p>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', fontStyle: 'italic' }}>
                  "Need a female actor aged 20-25, height 5'7\"+, fluent in English and Tamil, who has uploaded a monologue video? Simply set the parameters and get instantly matched profiles."
                </p>
              </div>

              <button className="btn btn-gold" onClick={() => onOpenModal('Hiring')}>Try Casting Dashboard</button>
            </div>

            <div>
              {/* Simulated Search UI Container */}
              <div className="glass-card glow-card-gold" style={{ padding: '2.5rem', background: '#0c0c12' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>Talent Finder Simulator</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Category</label>
                      <select className="form-control" style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem', background: '#191922' }} disabled>
                        <option>Actor (Female)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Location</label>
                      <select className="form-control" style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem', background: '#191922' }} disabled>
                        <option>Mumbai</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Age Range</label>
                      <select className="form-control" style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem', background: '#191922' }} disabled>
                        <option>20 - 25 Years</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Minimum Height</label>
                      <select className="form-control" style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem', background: '#191922' }} disabled>
                        <option>5'7" (170cm)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Languages Spoken</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      <span style={{ background: 'var(--accent-purple)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>English</span>
                      <span style={{ background: 'var(--accent-purple)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>Tamil</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>14 Matching Profiles</span>
                    <span style={{ color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => onOpenModal('Hiring')}>Show Results</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVENUE & PRICING */}
      <section className="section">
        <div className="container">
          <div className="text-center">
            <span className="badge badge-gold">Affordable Listings</span>
            <h2 style={{ fontSize: '2.5rem' }}>₹ 10 Per Audition Post. Period.</h2>
            <p className="subtitle">Forget expensive enterprise subscriptions. Fameuget operates on a pay-as-you-go credit system. Keep your overheads low.</p>
          </div>

          <div className="grid-3" style={{ marginTop: '2rem' }}>
            <div className="glass-card text-center">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Pay Per Post</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No monthly contracts. Recharge your casting credit wallet. Every live audition or casting listing costs exactly ₹10.
              </p>
            </div>

            <div className="glass-card text-center">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Free Communication</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Once candidates apply or you request their contact, messaging and audition slot allocation are entirely free.
              </p>
            </div>

            <div className="glass-card text-center">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Instant Notifications</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Automated email and push notifications alert artists about scheduled slots, reducing venue wait queues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MANDATORY VERIFICATION */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid-2">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '380px', borderColor: 'var(--accent-crimson)', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-crimson)' }}>No Audit, No Post</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Production teams cannot publish public auditions or view talent details until their company is fully approved.
                </p>
              </div>
            </div>

            <div>
              <span className="badge badge-primary">Verification Checklist</span>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '1.5rem' }}>To Post Auditions, You Will Need:</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                As part of our commitment to artist safety and anti-scam regulations, casting agencies are required to submit the following documents during onboarding:
              </p>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', fontWeight: 'bold' }}>01</div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.1rem' }}>Government ID Verification</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Submit PAN Card and Aadhaar details of the primary account holder.</p>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', fontWeight: 'bold' }}>02</div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.1rem' }}>Company Registration Document</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Upload Incorporate Certificate, GST validation, or registered leasing contracts.</p>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', fontWeight: 'bold' }}>03</div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.1rem' }}>Selfie / Face Match Check</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Complete a brief visual scan using our secure biometric API.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
