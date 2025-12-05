import React, { useState } from "react";
import "./LoginForm.css";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.error || "Hiba a bejelentkezéskor");
      onLogin && onLogin(data.user);
    } catch (err) {
      setLoading(false);
      setError("Hálózati hiba");
    }
  };

  return (
    <form onSubmit={submit} className="auth-form">
      <h3>Bejelentkezés</h3>
      {error && <div className="error">{error}</div>}
      <label>Email</label>
      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
      <label>Jelszó</label>
      <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit" disabled={loading}>{loading ? "Feldolgozás..." : "Bejelentkezés"}</button>
    </form>
  );
}