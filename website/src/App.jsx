import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppModal from './components/AppModal';

// Pages
import Home from './pages/Home';
import Artists from './pages/Artists';
import Casting from './pages/Casting';
import Auditions from './pages/Auditions';
import Safety from './pages/Safety';
import Contact from './pages/Contact';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState('Artist');

  // Sync hash routing on reload/changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '') || 'home';
      const validPages = ['home', 'artists', 'casting', 'auditions', 'safety', 'contact'];
      if (validPages.includes(hash)) {
        setCurrentPage(hash);
      } else {
        setCurrentPage('home');
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHash);
    handleHash(); // run initial check

    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (pageId) => {
    window.location.hash = `#/${pageId}`;
  };

  const openModal = (roleType) => {
    setModalRole(roleType || 'Artist');
    setModalOpen(true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigateTo} onOpenModal={openModal} />;
      case 'artists':
        return <Artists onOpenModal={openModal} />;
      case 'casting':
        return <Casting onOpenModal={openModal} />;
      case 'auditions':
        return <Auditions onOpenModal={openModal} />;
      case 'safety':
        return <Safety />;
      case 'contact':
        return <Contact />;
      default:
        return <Home onNavigate={navigateTo} onOpenModal={openModal} />;
    }
  };

  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentPage={currentPage} onNavigate={navigateTo} onOpenModal={openModal} />
      
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>

      <Footer onNavigate={navigateTo} />
      
      <AppModal 
        isOpen={modalOpen} 
        initialRole={modalRole} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  );
}
