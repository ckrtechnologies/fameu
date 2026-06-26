import React, { useState } from 'react';

const CATEGORY_FORMS = {
  actor: {
    title: 'Actor Profile Requirements',
    desc: 'Create your casting resume and unlock audition requests from premium directors.',
    fields: [
      { id: 'act_height', label: "Height (e.g. 5'9\")", type: 'text', placeholder: "Enter height in feet/inches" },
      { id: 'act_skin', label: 'Skin Tone', type: 'select', options: ['Fair', 'Wheatish', 'Medium', 'Olive', 'Dark'] },
      { id: 'act_eye', label: 'Eye Color', type: 'select', options: ['Black', 'Brown', 'Blue', 'Green', 'Grey'] },
      { id: 'act_hair', label: 'Hair Type', type: 'select', options: ['Straight', 'Wavy', 'Curly', 'Coily', 'Bald'] },
      { id: 'act_lang', label: 'Languages Spoken', type: 'text', placeholder: 'e.g. English, Hindi, Punjabi' },
      { id: 'act_video', label: 'Introduction Video Link', type: 'url', placeholder: 'YouTube/Vimeo introduction monologue' }
    ]
  },
  singer: {
    title: 'Vocalist Profile Requirements',
    desc: 'Upload audio samples and capture playback bookings directly from music directors.',
    fields: [
      { id: 'sing_range', label: 'Vocal Range', type: 'select', options: ['Soprano', 'Alto', 'Tenor', 'Baritone', 'Bass'] },
      { id: 'sing_genre', label: 'Primary Genres', type: 'text', placeholder: 'e.g. Bollywood, Classical, Pop, Rock' },
      { id: 'sing_instrument', label: 'Instruments Played', type: 'text', placeholder: 'e.g. Guitar, Piano, None' },
      { id: 'sing_audio', label: 'Audio Sample Link', type: 'url', placeholder: 'SoundCloud/Drive vocaroo track link' }
    ]
  },
  model: {
    title: 'Model Portfolio Parameters',
    desc: 'Verify your measurements and get matched to brand shoots and runway auditions.',
    fields: [
      { id: 'mod_height', label: "Height (e.g. 5'8\")", type: 'text', placeholder: "Enter height in feet/inches" },
      { id: 'mod_waist', label: 'Waist Size (inches)', type: 'number', placeholder: 'e.g. 30' },
      { id: 'mod_chest', label: 'Chest / Bust (inches)', type: 'number', placeholder: 'e.g. 36' },
      { id: 'mod_shoe', label: 'Shoe Size (UK/US)', type: 'number', placeholder: 'e.g. 8' },
      { id: 'mod_eye', label: 'Eye Color', type: 'select', options: ['Black', 'Brown', 'Blue', 'Green', 'Grey'] },
      { id: 'mod_skin', label: 'Skin Tone', type: 'select', options: ['Fair', 'Wheatish', 'Medium', 'Olive', 'Dark'] },
      { id: 'mod_portfolio', label: 'Portfolio Link', type: 'url', placeholder: 'Instagram/Behance photoshoot link' }
    ]
  },
  dancer: {
    title: 'Dancer Profile Requirements',
    desc: 'Showcase your choreography styles, speed, and video references for music videos.',
    fields: [
      { id: 'dance_style', label: 'Primary Styles', type: 'text', placeholder: 'e.g. Contemporary, Hip-Hop, Salsa, Kathak' },
      { id: 'dance_exp', label: 'Experience Years', type: 'number', placeholder: 'e.g. 3' },
      { id: 'dance_reel', label: 'Dance Reel Link', type: 'url', placeholder: 'YouTube/Instagram performance video' }
    ]
  },
  technician: {
    title: 'Technician & Crew Profile Requirements',
    desc: 'Publish your gear checklists and credits list to secure movie crew contracts.',
    fields: [
      { id: 'tech_role', label: 'Specialization', type: 'select', options: ['Director of Photography', 'Cinematographer', 'Sound Designer', 'Editor', 'Makeup Artist', 'Art Director', 'Grip / Light Crew'] },
      { id: 'tech_software', label: 'Software Proficiencies', type: 'text', placeholder: 'e.g. Premiere Pro, DaVinci Resolve, ProTools' },
      { id: 'tech_gear', label: 'Equipment Owned', type: 'text', placeholder: 'e.g. Sony FX3, DJI Ronin RS3, Lapel Mics' },
      { id: 'tech_link', label: 'IMDb / Showreel Link', type: 'url', placeholder: 'IMDb profile or showreel link' }
    ]
  }
};

export default function Artists({ onOpenModal }) {
  const [activeCategory, setActiveCategory] = useState('actor');
  
  const currentFormData = CATEGORY_FORMS[activeCategory];

  return (
    <>
      {/* BREADCRUMB / HERO BANNER */}
      <section className="section" style={{ paddingTop: '140px', paddingBottom: '4rem', background: 'linear-gradient(180deg, rgba(255, 0, 85, 0.08) 0%, rgba(6, 6, 9, 0) 100%)' }}>
        <div className="container text-center">
          <span className="badge badge-primary">For Actors, Singers, Models, Dancers & Technicians</span>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Build a Profile that <br /><span className="text-gradient">Gets You Hired</span></h1>
          <p className="subtitle" style={{ marginBottom: '0' }}>
            Fameuget replaces chaotic WhatsApp groups and paper resumes with a verified, state-of-the-art digital portfolio.
          </p>
        </div>
      </section>

      {/* DYNAMIC CATEGORY EXPLORER */}
      <section className="section section-alt" style={{ paddingTop: '4rem' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <span className="badge badge-gold">Interactive Preview</span>
            <h2 style={{ fontSize: '2.2rem' }}>Choose Your Talent Category</h2>
            <p className="subtitle">Different talents require different details. Select a category below to see the specific details you can showcase on your Fameuget profile.</p>
          </div>

          {/* Categories Selector Grid */}
          <div className="category-grid" id="categoryGrid">
            {Object.keys(CATEGORY_FORMS).map((catKey) => {
              const icons = { actor: '🎭', singer: '🎤', model: '👠', dancer: '💃', technician: '🎥' };
              const names = { actor: 'Actors', singer: 'Singers', model: 'Models', dancer: 'Dancers', technician: 'Technicians' };
              return (
                <div 
                  key={catKey}
                  className={`category-tab ${activeCategory === catKey ? 'active' : ''}`} 
                  onClick={() => setActiveCategory(catKey)}
                >
                  <div className="category-tab-icon">{icons[catKey]}</div>
                  <div className="category-tab-name">{names[catKey]}</div>
                </div>
              );
            })}
          </div>

          {/* Form Preview Card */}
          <div className="form-preview-box glass-card glow-card-gold">
            <div className="form-preview-header">
              <h3 className="form-preview-title">{currentFormData.title}</h3>
              <p className="form-preview-subtitle">{currentFormData.desc}</p>
            </div>
            
            <div className="fields-grid">
              {currentFormData.fields.map((field) => (
                <div key={field.id} className="form-group">
                  <label htmlFor={field.id}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select id={field.id} className="form-control" disabled>
                      {field.options.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type={field.type} 
                      id={field.id} 
                      className="form-control" 
                      placeholder={field.placeholder} 
                      disabled 
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '2rem' }}>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Ready to upload your real media files, introduction monologues, and details?
              </p>
              <button className="btn btn-gold" onClick={() => onOpenModal('Artist')}>Download App & Sign Up Now</button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">
          <div className="text-center">
            <span className="badge badge-purple">Onboarding Walkthrough</span>
            <h2 style={{ fontSize: '2.5rem' }}>Your Journey to the Big Screen</h2>
            <p className="subtitle">We have simplified artist onboarding. No agency commissions, no listing fees, no middleman.</p>
          </div>

          <div className="grid-3" style={{ marginTop: '2rem' }}>
            <div className="glass-card text-center" style={{ padding: '3rem 2rem' }}>
              <div style={{ width: '50px', height: '50px', background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: '700', margin: '0 auto 1.5rem auto', fontSize: '1.2rem', justifyContent: 'center' }}>1</div>
              <h3 style={{ marginBottom: '0.75rem' }}>Verify via OTP</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Register on the Fameuget app using your email or mobile number. Complete the secure 6-digit OTP verification.
              </p>
            </div>

            <div className="glass-card text-center" style={{ padding: '3rem 2rem' }}>
              <div style={{ width: '50px', height: '50px', background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: '700', margin: '0 auto 1.5rem auto', fontSize: '1.2rem', justifyContent: 'center' }}>2</div>
              <h3 style={{ marginBottom: '0.75rem' }}>Build Portfolio</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Fill in your category-specific parameters. Upload high-res photos, monologue reels, and optional ID documents to obtain a **Verified Artist Badge**.
              </p>
            </div>

            <div className="glass-card text-center" style={{ padding: '3rem 2rem' }}>
              <div style={{ width: '50px', height: '50px', background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: '700', margin: '0 auto 1.5rem auto', fontSize: '1.2rem', justifyContent: 'center' }}>3</div>
              <h3 style={{ marginBottom: '0.75rem' }}>Apply in 1-Click</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Browse trending, walk-in, or nearby auditions. Filter by criteria and click Apply. Track your application status (Shortlisted, Interview, Rejected) dynamically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section section-alt" style={{ background: 'radial-gradient(circle at 10% 20%, rgba(255, 0, 85, 0.03) 0%, rgba(0, 0, 0, 0) 50%)' }}>
        <div className="container">
          <div className="grid-2">
            <div>
              <span className="badge badge-gold">Honest Pricing</span>
              <h2 style={{ fontSize: '2.8rem', marginBottom: '1.5rem' }}>Free Forever <br />For Artists.</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '1.05rem' }}>
                We believe that talent should not have to pay a toll to be discovered. Fameuget keeps the platform entirely free of charge for artists.
              </p>
              <ul style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#4BB543', fontWeight: 'bold' }}>✔</span> Zero Registration Fees
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#4BB543', fontWeight: 'bold' }}>✔</span> Apply to Unlimited Auditions
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#4BB543', fontWeight: 'bold' }}>✔</span> Host Videos & Audio Samples Free
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#4BB543', fontWeight: 'bold' }}>✔</span> Share Your Profile Link Publicly
                </li>
              </ul>
              <button className="btn btn-primary" onClick={() => onOpenModal('Artist')}>Claim Your Free Profile</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="glass-card" style={{ padding: '3rem', borderColor: 'var(--accent-gold)', maxWidth: '400px', textAlign: 'center', background: 'rgba(245, 166, 35, 0.03)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎫</div>
                <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>₹ 0</h3>
                <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--accent-gold)', fontWeight: '700', marginBottom: '1.5rem' }}>No Subscription Required</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Fameuget does not take cuts from your booking salaries or charge monthly recurring portal fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
