import React from 'react';
import logoImg from '../assets/logo.jpeg';

export default function Footer({ onNavigate }) {
  const handleLinkClick = (e, pageId) => {
    e.preventDefault();
    onNavigate(pageId);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#/home" className="logo" onClick={(e) => handleLinkClick(e, 'home')}>
              <img src={logoImg} alt="Fameuget Logo" className="logo-img" />
            </a>
            <p className="footer-desc">
              Fameuget is India's premium tech-enabled talent hiring and live audition platform. Protecting artists from scams, and making talent onboarding simple.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon">F</a>
              <a href="#" class="social-icon">T</a>
              <a href="#" class="social-icon">I</a>
              <a href="#" class="social-icon">Y</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>For Artists</h4>
            <div className="footer-links">
              <a href="#/artists" onClick={(e) => handleLinkClick(e, 'artists')}>Join as Actor</a>
              <a href="#/artists" onClick={(e) => handleLinkClick(e, 'artists')}>Join as Singer</a>
              <a href="#/artists" onClick={(e) => handleLinkClick(e, 'artists')}>Join as Model</a>
              <a href="#/artists" onClick={(e) => handleLinkClick(e, 'artists')}>Join as Dancer</a>
              <a href="#/artists" onClick={(e) => handleLinkClick(e, 'artists')}>Crew & Technicians</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>For Casting</h4>
            <div className="footer-links">
              <a href="#/casting" onClick={(e) => handleLinkClick(e, 'casting')}>Register Agency</a>
              <a href="#/casting" onClick={(e) => handleLinkClick(e, 'casting')}>Casting Dashboard</a>
              <a href="#/casting" onClick={(e) => handleLinkClick(e, 'casting')}>Smart Talent Search</a>
              <a href="#/casting" onClick={(e) => handleLinkClick(e, 'casting')}>Affordable Pricing</a>
              <a href="#/contact" onClick={(e) => handleLinkClick(e, 'contact')}>Request Onboarding</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Subscribe</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Get early audition listings directly in your inbox.</p>
            <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); e.target.reset(); }}>
              <input type="email" placeholder="Your Email" className="newsletter-input" required />
              <button type="submit" className="newsletter-btn">Go</button>
            </form>
          </div>
        </div>
        <div className="footer-col" style={{ gridColumn: '1 / -1', marginTop: '2rem', borderTop: '1px solid var(--border-glass)', paddingTop: '2rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Project Information</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            This React website represents the digital landing hub for <strong>Fameuget</strong>, developed under project scope parameters defined by <strong>ArgosMob Tech & AI Pvt Ltd</strong>. All references to features, application modules, pricing schemes (e.g. ₹10 audition posting fee), and security verification mechanisms (Aadhaar, PAN, GST) correspond to the specifications outlined in client BRD document <em>HarrshPandey_FilmAuditionApp_BRD.pdf</em>.
          </p>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Fameuget (ArgosMob Tech & AI Pvt Ltd). All rights reserved.</p>
          <div className="footer-legal">
            <a href="#/safety" onClick={(e) => handleLinkClick(e, 'safety')}>Terms & Conditions</a>
            <a href="#/privacy" onClick={(e) => handleLinkClick(e, 'privacy')}>Privacy Policy</a>
            <a href="#/child-safety" onClick={(e) => handleLinkClick(e, 'child-safety')}>Child Safety Standards</a>
            <a href="#/safety" onClick={(e) => handleLinkClick(e, 'safety')}>Anti-Scam Guidelines</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
