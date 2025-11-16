import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Content from "./components/Content/Content";
import Timer from "./components/Timer/Timer";
import Chat from "./components/Chat/Chat";
import LoginForm from "./components/Profile/LoginForm";
import RegisterForm from "./components/Profile/RegisterForm";
import Profile from "./components/Profile/Profile";
import "./App.css";

export default function App() {
  const [route, setRoute] = useState("homepage");
  const [user, setUser] = useState(null);

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
    <div className="app">
      <Navbar route={route === "homepage" ? "homepage" : route} setRoute={setRoute} />

      <div className={`main-layout ${route === "homepage" ? "homepage" : ""}`}>
        {route === "homepage" ? (
          <>
            <div className="timer-panel">
              <Timer />
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
            <Content route={route} />
          </div>
        )}
      </div>
    </div>
  );
}