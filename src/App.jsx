import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import Content from "./components/Content/Content";
import Timer from "./components/Timer/Timer";
import Chat from "./components/Chat/Chat";
import LoginForm from "./components/Profile/LoginForm";
import RegisterForm from "./components/Profile/RegisterForm";
import Profile from "./components/Profile/Profile";
import "./App.css";

// TÉMA VÁLTÓ LOGIKA
const getInitialTheme = () => {
    // 1. Megnézi a felhasználó utolsó választását
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) return storedTheme;
    
    // 2. Ha nincs választás, megnézi a böngésző beállítását
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark-mode' : 'light-mode';
};

export default function App() {
  const [route, setRoute] = useState("homepage");
  const [user, setUser] = useState(null);
  
  // ÁLLAPOT A TÉMÁHOZ
  const [theme, setTheme] = useState(getInitialTheme);
  
  // OLDAL BETÖLTÉSEKOR BEÁLLÍTJA A body osztályát
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light-mode' ? 'dark-mode' : 'light-mode';
    setTheme(newTheme);
    // Mentés a localStorage-ba, hogy emlékezzen rá
    localStorage.setItem('theme', newTheme);
  };

  const handleLogin = (u) => {
    setUser(u);
    setRoute("profile");
  };

  const handleRegister = (u) => {
    // Regisztráció után automatikusan beléptetjük a felhasználót
    setUser(u);
    setRoute("profile");
  };

  const handleLogout = () => {
    setUser(null);
    setRoute("login");
  };

  return (
    // A theme állapothoz kapcsolódó osztály hozzáadása az .app-hoz
    <div className={`app ${theme}`}>
      {/* ÁTADJUK A TÉMA ÁLLAPOTOT ÉS VÁLTÓT A NAVBAR-NAK */}
      <Navbar 
        route={route === "homepage" ? "homepage" : route} 
        setRoute={setRoute} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      <div className={`main-layout ${route === "homepage" ? "homepage" : ""}`}>
        {route === "homepage" ? (
          <>
            <div className="timer-panel">
              <Timer user={user} />
            </div>
            <div className="chat-panel">
              <Chat />
            </div>
          </>
        ) : route === "login" ? (
          <div className="auth-panel">
            <LoginForm onLogin={handleLogin} />
              <div className="auth-footer">
                <span className="info-text">Nincs még fiókod?</span>
                <button className="register-btn" onClick={() => setRoute("register")}>Regisztráció</button>
              </div>
          </div>
        ) : route === "register" ? (
          <div className="auth-panel">
            <RegisterForm onRegister={handleRegister} />
              <div className="auth-footer">
                <span className="info-text">Van már fiókod?</span>
                <button className="login-btn" onClick={() => setRoute("login")}>Bejelentkezés</button>
              </div>
          </div>
        ) : route === "profile" ? (
          <div className="content-panel">
            <Profile user={user} onLogout={handleLogout} onLogin={handleLogin} setRoute={setRoute} />
          </div>
        ) : (
          <div className="content-panel">
            <Content route={route} user={user} />
          </div>
        )}
      </div>
    </div>
  );
}