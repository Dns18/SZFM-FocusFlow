// RegisterForm.jsx
import React, { useState } from "react";
import "./Login.css";

export default function RegisterForm({ onRegister }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.error || "Hiba a regisztrációnál");
      onRegister && onRegister(data.user);
    } catch (err) {
      setLoading(false);
      setError("Hálózati hiba");
    }
  };

  return (
    <form onSubmit={submit} className="auth-form">
      <h3>Regisztráció</h3>
      {error && <div className="error">{error}</div>}
      <label>Email</label>
      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
      <label>Név</label>
      <input type="text" value={name} onChange={e => setName(e.target.value)} />
      <label>Jelszó</label>
      <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit" disabled={loading}>{loading ? "Feldolgozás..." : "Regisztrálás"}</button>
    </form>
  );
}
