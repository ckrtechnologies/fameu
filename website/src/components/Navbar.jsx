import React, { useState } from 'react';
import logoImg from '../assets/logo.jpeg';

export default function Navbar({ currentPage, onNavigate, onOpenModal }) {
  const [menuActive, setMenuActive] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'artists', label: 'For Artists' },
    { id: 'casting', label: 'For Casting' },
    { id: 'auditions', label: 'Browse Auditions' },
    { id: 'safety', label: 'Safety & Trust' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (e, pageId) => {
    e.preventDefault();
    onNavigate(pageId);
    setMenuActive(false);
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        <a href="#/home" className="logo" onClick={(e) => handleNavClick(e, 'home')}>
          <img src={logoImg} alt="Fameuget Logo" className="logo-img" />
        </a>
        
        <nav className={`nav-links ${menuActive ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#/${link.id}`}
              className={`nav-link ${currentPage === link.id ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, link.id)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-cta">
          <button className="btn btn-secondary btn-sm" onClick={() => onOpenModal('Artist')}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenModal('Artist')}>Get App</button>
        </div>

        <div 
          className={`menu-toggle ${menuActive ? 'active' : ''}`} 
          onClick={() => setMenuActive(!menuActive)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
}
