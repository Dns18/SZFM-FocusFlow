import React, { useState } from "react";
// Navbar komponens, fő navigáció
import "./Navbar.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function Navbar({ route, setRoute }) {
  const links = [
  // Navigációs gombok adatai
    { id: "homepage", label: "Kezdőlap" },
    { id: "dashboard", label: "Statisztikák" },
    { id: "courses", label: "Tanfolyamok" },
    { id: "profile", label: "Profil" },
  ];
    const [menuOpen, setMenuOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Betöltéskor animáció indítása
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
  // Mobil menü nyitva/zárva állapot

  // Bezárja a mobil menüt, ha az ablakméret nagyobb lesz
  React.useEffect(() => {
  // Bezárja a mobil menüt, ha nagyobb lesz az ablak
    const handleResize = () => {
      if (window.innerWidth > 800 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  return (
  <header className={`navbar${loaded ? " loaded" : ""}`}> {/* Fő navigációs sáv */}
      <div className="logo">FocusFlow</div>
  {/* Logó szöveg */}
      <nav className="nav-links">
  {/* Navigációs gombok desktopon */}
        {links.map((l) => (
          <button
            key={l.id}
            className={`nav-item ${route === l.id ? "active" : ""}`}
            onClick={() => setRoute(l.id)}
          >
            {l.label}
          </button>
        ))}
      </nav>
      <button className="hamburger-btn" onClick={() => setMenuOpen(true)}>
  {/* Hamburger ikon mobilon */}
        <FontAwesomeIcon icon={faBars} size="lg" />
      </button>
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
  {/* Jobbról előjövő mobil menü */}
        <button className="close-btn" onClick={() => setMenuOpen(false)}>
  {/* Bezáró X gomb mobil menüben */}
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
        <nav className="mobile-nav-links">
  {/* Mobil menü gombjainak konténere */}
          {links.map((l) => (
            <button
              key={l.id}
              className={`nav-item ${route === l.id ? "active" : ""}`}
              onClick={() => { setRoute(l.id); setMenuOpen(false); }}
            >
              {l.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
