// src/components/Navbar/Navbar.jsx
import React, { useState } from "react";
import "./Navbar.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

// Kiterjesztve a props-ot: theme és toggleTheme hozzáadva
export default function Navbar({ route, setRoute, theme, toggleTheme }) {
  const links = [
    { id: "homepage", label: "Kezdőlap" },
    { id: "dashboard", label: "Statisztikák" },
    { id: "courses", label: "Tanfolyamok" },
    { id: "profile", label: "Profil" },
  ];
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showManual, setShowManual] = useState(false);

  React.useEffect(() => {
    // Animáció csak akkor, amikor a hamburger ikon eltűnik (desktop nézet)
    const handleResize = () => {
      if (window.innerWidth > 800) {
        setLoaded(true);
      } else {
        setLoaded(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Bezárja a mobil menüt, ha nagyobb lesz az ablak
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 800 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  // Az új téma gomb komponens
  const ThemeToggleButton = ({ isMobile = false }) => (
    <button 
      className={`nav-item theme-toggle-btn ${isMobile ? 'mobile' : ''}`}
      onClick={toggleTheme}
    >
      <FontAwesomeIcon icon={theme === 'dark-mode' ? faSun : faMoon} />
      <span className="button-text">
        {isMobile ? (theme === 'dark-mode' ? 'Világos Mód' : 'Sötét Mód') : ''}
      </span>
    </button>
  );

  return (
    <>
      <header className={`navbar${loaded ? " loaded" : ""}`}>
        <div className="logo">FocusFlow</div>
        
        <nav className="nav-links">
          {/* Működési leírás gomb - a kezdőlap elé */}
          <button className="manual-btn" onClick={() => setShowManual(true)}>?</button>

          {links.map((l) => (
            <button
              key={l.id}
              className={`nav-item ${route === l.id ? "active" : ""}`}
              onClick={() => setRoute(l.id)}
            >
              {l.label}
            </button>
          ))}

          {/* TÉMA VÁLTÓ GOMB DESKTOPON */}
          <ThemeToggleButton /> 
        </nav>
        
        <button className="hamburger-btn" onClick={() => setMenuOpen(true)}>
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
        
        <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
          <button className="close-btn" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
          
          {/* TÉMA VÁLTÓ GOMB MOBILON (a mobil menüben) */}
          <nav className="mobile-nav-links">
            <ThemeToggleButton isMobile={true} />
            {links.map((l) => (
              <button
                key={l.id}
                className={`nav-item ${route === l.id ? "active" : ""}`}
                onClick={() => { setRoute(l.id); setMenuOpen(false); }}
              >
                {l.label}
              </button>
            ))}

            {/* Működési leírás gomb mobilon */}
            <button 
              className="manual-btn" 
              onClick={() => { setShowManual(true); setMenuOpen(false); }}
            >
              ❔
            </button>
          </nav>
        </div>
      </header>
      
      {/* Működési leírás pop-up */}
      {showManual && (
        <div 
          className="manual-modal-overlay fade-in" 
          onClick={() => setShowManual(false)}
        >
          <div 
            className="manual-modal" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="close-btn" 
              onClick={() => setShowManual(false)}
            >
              ×
            </button>
            <h3>Működési leírás</h3>
            <ul>
              <li>Válassz témát a Timer-ben</li>
              <li>Kattints a Start gombra a Pomodoro indításához</li>
              <li>A Tippek gombra kattintva extra tanulási tippeket láthatsz</li>
              <li>Session-ök automatikusan mentődnek, ha be vagy jelentkezve</li>
              <li>Analytics alatt megtekintheted a heti statisztikákat</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}