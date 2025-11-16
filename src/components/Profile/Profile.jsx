import React from "react";
import "./login.css";
import LoginForm from "./LoginForm";

export default function Profile({ user, onLogout, onLogin, setRoute }) {
  // Ha be van jelentkezve a felhasználó, mutatjuk a profil nézetet
  if (user) {
    return (
      <div className="profile">
        <h3>Profil</h3>
        <p><strong>Azonosító:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Név:</strong> {user.name}</p>
        <button onClick={onLogout}>Kijelentkezés</button>
      </div>
    );
  }

  // Alap: belépés nézet (LoginForm komponens)
  return (
    <div className="auth-home">
      <h3>Belépés</h3>
      <LoginForm onLogin={onLogin} />
      <div className="auth-footer">
        <span className="info-text">Még nincs fiókod?</span>
        <button
          className="register-btn"
          onClick={() => setRoute && setRoute("register")}
        >
          Regisztráció
        </button>
      </div>
    </div>
  );
}
