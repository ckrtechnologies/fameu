import React, { useState } from 'react';

const AUDITIONS_DATABASE = [
  {
    id: 1,
    title: "Lead Female Actor (Romantic Drama)",
    company: "Yash Raj Films",
    category: "actor",
    city: "mumbai",
    type: "scheduled",
    budget: "₹15,000 - ₹20,000 / Day",
    date: "July 5, 2026",
    tags: ["Female", "Age: 20-25", "Vibrant"],
    description: "Looking for a fresh face to play the female lead in an upcoming romantic theatrical release. Must speak fluent Hindi."
  },
  {
    id: 2,
    title: "Playback Male Singer (Romantic Track)",
    company: "T-Series Music",
    category: "singer",
    city: "delhi",
    type: "scheduled",
    budget: "₹50,000 Flat",
    date: "July 12, 2026",
    tags: ["Male", "Tenor", "Classical Touch"],
    description: "Urgent recording for a mainstream Hindi movie song. Requires high voice control and expression. Classical training is preferred."
  },
  {
    id: 3,
    title: "Commercial Model (Winter Campaign)",
    company: "Zara India",
    category: "model",
    city: "bangalore",
    type: "walk-in",
    budget: "₹8,000 / Day",
    date: "June 29, 2026",
    tags: ["Height: 5'8\"+", "Waist: 28-30"],
    description: "Walk-in catalog model audition for winter apparel catalog. Bring physical composite card and heels."
  },
  {
    id: 4,
    title: "Contemporary Background Dancers",
    company: "Dharma Productions",
    category: "dancer",
    city: "mumbai",
    type: "walk-in",
    budget: "₹5,000 / Day",
    date: "July 1, 2026",
    tags: ["Contemporary", "Acrobatics a plus"],
    description: "Open casting call for male and female contemporary ensemble dancers for an upcoming film shoot in Mumbai."
  },
  {
    id: 5,
    title: "Director of Photography (Indie Feature)",
    company: "Phantom Films Group",
    category: "technician",
    city: "mumbai",
    type: "scheduled",
    budget: "₹1,20,000 Total",
    date: "July 20, 2026",
    tags: ["Sony FX9 / RED", "Indie Film"],
    description: "Looking for an experienced DP to shoot a gritty indie drama in Mumbai. Must have portfolio links and own gear preferred."
  },
  {
    id: 6,
    title: "Senior Fashion Models (Runway Show)",
    company: "Lakme Fashion Week",
    category: "model",
    city: "mumbai",
    type: "scheduled",
    budget: "₹25,000 / Show",
    date: "August 15, 2026",
    tags: ["Height: 5'9\"+", "Runway Experience"],
    description: "Runway casting for the upcoming winter festive season designer collection showcase. Strict height audits apply."
  }
];

export default function Auditions({ onOpenModal }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');

  // Filter Logic
  const filteredAuditions = AUDITIONS_DATABASE.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCity = city === '' || item.city === city;
    const matchesCategory = category === '' || item.category === category;
    const matchesType = type === '' || item.type === type;

    return matchesSearch && matchesCity && matchesCategory && matchesType;
  });

  return (
    <>
      {/* PAGE HEADER */}
      <section className="section" style={{ paddingTop: '140px', paddingBottom: '3rem', background: 'linear-gradient(180deg, rgba(123, 44, 191, 0.08) 0%, rgba(6, 6, 9, 0) 100%)' }}>
        <div className="container text-center">
          <span className="badge badge-purple">Live Audition Directory</span>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Explore Active Casting Calls</h1>
          <p className="subtitle" style={{ marginBottom: '0' }}>
            Direct applications. Verified companies. See details, check compensation structures, and apply.
          </p>
        </div>
      </section>

      {/* FILTER & GRID */}
      <section className="section" style={{ paddingTop: '1rem', paddingBottom: '6rem' }}>
        <div className="container">
          
          {/* Filter Controls */}
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search keywords (e.g. Lead, Singer, YRF)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
            </div>

            <select 
              className="filter-select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">All Cities</option>
              <option value="mumbai">Mumbai</option>
              <option value="delhi">Delhi</option>
              <option value="bangalore">Bangalore</option>
            </select>

            <select 
              className="filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="actor">Actors</option>
              <option value="singer">Singers</option>
              <option value="model">Models</option>
              <option value="dancer">Dancers</option>
              <option value="technician">Technicians</option>
            </select>

            <select 
              className="filter-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Audition Types</option>
              <option value="walk-in">Walk-In</option>
              <option value="scheduled">Scheduled Slot</option>
            </select>
          </div>

          {/* Results Count Banner */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Showing <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>{filteredAuditions.length}</span> active auditions matching your criteria.
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Updated 5 minutes ago</span>
          </div>

          {/* Auditions Cards Grid */}
          <div className="auditions-grid">
            {filteredAuditions.length > 0 ? (
              filteredAuditions.map((item) => (
                <div key={item.id} className="audition-card glass-card">
                  <div className="audition-card-header">
                    <span className={`badge ${item.type === 'walk-in' ? 'badge-gold' : 'badge-primary'}`}>
                      {item.type === 'walk-in' ? 'Walk-in Call' : 'Scheduled Slots'}
                    </span>
                    <span className="audition-date" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.date}</span>
                  </div>

                  <h3 className="audition-title">{item.title}</h3>
                  <div className="audition-company">
                    🏢 {item.company}
                  </div>
                  
                  <div className="audition-meta">
                    <div className="meta-row">
                      <span>📍 {item.city.charAt(0).toUpperCase() + item.city.slice(1)}</span>
                    </div>
                  </div>

                  <p className="audition-card-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                    {item.description}
                  </p>

                  <div className="audition-tags">
                    {item.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>

                  <div className="audition-footer">
                    <div className="audition-salary">
                      {item.budget}
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => onOpenModal('Artist')}>Apply Now</button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }} className="glass-card">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <h3>No Auditions Found</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Try clearing your search query or setting the drop-down filters back to "All".</p>
              </div>
            )}
          </div>

        </div>
      </section>
    </>
  );
}
