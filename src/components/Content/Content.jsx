import React, { useMemo, useState, useEffect } from "react";
import Courses from "../Courses/Courses";
import Statistics from "../Content/Statistics";

const STORAGE_KEY = "focusflow_sessions_v1";
const DEFAULT_SESSION_DURATION = 25 * 60; // másodpercben (ha nincs duration a mentésben)

function loadSessions(user) {
  // 🔧 ugyanaz a logika, mint máshol: user → saját kulcs, különben guest
  const key =
    user && user.id
      ? `focusflow_sessions_v1_${user.id}`
      : "focusflow_sessions_v1_guest";

  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Failed to load sessions", e);
    return [];
  }
}

export default function Content({ route, user }) {
  // 🔧 induláskor is a megfelelő kulcsról olvasunk
  const [sessions, setSessions] = useState(() => loadSessions(user));

  // 🔧 ha a user változik (login/logout), töltsük újra a sessionöket
  useEffect(() => {
    setSessions(loadSessions(user));
  }, [user]);

  useEffect(() => {
    const onStorage = (e) => {
      // más tabról jövő módosítás esetén is frissítsünk
      if (!e.key) return;
      if (e.key.startsWith(STORAGE_KEY)) {
        setSessions(loadSessions(user));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [user]);

  // darabszám és összes másodperc tantárgyanként
  const stats = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      const topic = s.topic || "Unknown";
      const duration =
        typeof s.duration === "number" && s.duration > 0
          ? s.duration
          : DEFAULT_SESSION_DURATION;
      if (!map[topic]) map[topic] = { count: 0, seconds: 0 };
      map[topic].count += 1;
      map[topic].seconds += duration;
    });
    return Object.entries(map).map(([topic, { count, seconds }]) => ({
      topic,
      count,
      minutes: Math.round(seconds / 60),
    }));
  }, [sessions]);

  if (route === "dashboard") {
    return (
      <section style={{ padding: 24 }}>
        <h1>Statisztikák</h1>

        {sessions.length === 0 ? (
          <p>Nincs még mentett session.</p>
        ) : (
          <>
            <div style={{ margin: "12px 0" }}>
              <strong>Összes session:</strong> {sessions.length}
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 12,
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <th style={{ padding: "8px 6px" }}>Tantárgy</th>
                  <th style={{ padding: "8px 6px" }}>Alkalom</th>
                  <th style={{ padding: "8px 6px" }}>Összes tanult perc</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((r) => (
                  <tr
                    key={r.topic}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                    }}
                  >
                    <td style={{ padding: "10px 6px" }}>{r.topic}</td>
                    <td style={{ padding: "10px 6px" }}>{r.count}</td>
                    <td style={{ padding: "10px 6px" }}>{r.minutes} perc</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ marginTop: 20 }}>Részletes lista</h3>
            <div
              className="tablazat"
              style={{
                maxHeight: 240,
                overflow: "auto",
                marginTop: 8,
                borderRadius: 8,
                padding: 8,
              }}
            >
              <table
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <th style={{ padding: "6px" }}>Dátum</th>
                    <th style={{ padding: "6px" }}>Tantárgy</th>
                    <th style={{ padding: "6px" }}>Időtartam</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions
                    .slice(-50)
                    .reverse()
                    .map((s, i) => {
                      const duration =
                        typeof s.duration === "number" && s.duration > 0
                          ? s.duration
                          : DEFAULT_SESSION_DURATION;
                      return (
                        <tr
                          key={i}
                          style={{
                            borderBottom:
                              "1px solid rgba(255,255,255,0.03)",
                          }}
                        >
                          <td
                            style={{
                              padding: "8px 6px",
                              color: "#cbd5e1",
                            }}
                          >
                            {new Date(s.timestamp).toLocaleString()}
                          </td>
                          <td style={{ padding: "8px 6px" }}>{s.topic}</td>
                          <td style={{ padding: "8px 6px" }}>
                            {Math.round(duration / 60)} perc
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <Statistics sessions={sessions} />
          </>
        )}

        <div
          style={{ marginTop: 18, display: "flex", gap: 8 }}
        >
          <button
            onClick={() => {
              if (
                !confirm(
                  "Biztosan törlöd az összes mentett sessiont?"
                )
              )
                return;

              // 🔧 a megfelelő kulcs törlése (user / guest)
              const keyToDelete =
                user && user.id
                  ? `${STORAGE_KEY}_${user.id}`
                  : "focusflow_sessions_v1_guest";

              localStorage.removeItem(keyToDelete);
              setSessions([]);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "#7f1d1d",
              color: "white",
              border: "none",
            }}
          >
            Összes törlése
          </button>
        </div>
      </section>
    );
  }

  switch (route) {
    case "homepage":
      return (
        <section>
          <h1>Home Page</h1>
          <p>Home Page</p>
        </section>
      );
    case "courses":
      return <Courses />;
    case "analytics":
      return (
        <section>
          <h1>Analytics</h1>
          <p>Analytics</p>
        </section>
      );
    default:
      return (
        <section>
          <h1>Ismeretlen</h1>
        </section>
      );
  }
}
