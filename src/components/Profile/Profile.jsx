// src/components/Auth/Profile.jsx
import React, { useEffect, useState } from "react";
import "./login.css";
import LoginForm from "./LoginForm";

const STORAGE_KEY = "focusflow_sessions_v1";
const PROFILE_IMAGE_KEY = "focusflow_profile_image_v1";
const XP_PER_LEVEL = 100; // ennyi XP kell egy szinthez (1 perc = 1 XP)
const DAILY_VISIT_XP = 5; // fix 5 XP motivációs belépésért

// Kitűzők generálása összes / napi tanulási percek alapján
function getBadges(totalMinutesAll, totalMinutesToday) {
  const badges = [];

  // 1) Első tanulás
  if (totalMinutesAll >= 1) {
    badges.push({
      id: "first-steps",
      label: "Első lépések",
      desc: "Elkezdted a tanulást – ez a legfontosabb!",
      icon: "🚀",
    });
  }

  // 2) 25 perc összesen
  if (totalMinutesAll >= 25) {
    badges.push({
      id: "focus-25",
      label: "Fókusz tanuló",
      desc: "Legalább 25 perc fókuszált tanulás összesen.",
      icon: "🎯",
    });
  }

  // 3) 60 perc összesen
  if (totalMinutesAll >= 60) {
    badges.push({
      id: "one-hour",
      label: "1 órás fókusz",
      desc: "Legalább 60 perc fókuszált tanulás összesen.",
      icon: "⏱️",
    });
  }

  // 4) 5 óra összesen
  if (totalMinutesAll >= 300) {
    badges.push({
      id: "marathon",
      label: "Tanulás maraton",
      desc: "Öt óránál is többet tanultál már!",
      icon: "🏃‍♂️",
    });
  }

  // 5) 1000 perc összesen
  if (totalMinutesAll >= 1000) {
    badges.push({
      id: "legend",
      label: "Fókusz legenda",
      desc: "Több mint 1000 perc tanulás – brutál!",
      icon: "👑",
    });
  }

  // 6) Mai napi fókusz hős (25 perc egy nap alatt)
  if (totalMinutesToday >= 25) {
    badges.push({
      id: "today-focus",
      label: "Mai fókusz hős",
      desc: "Ma legalább 25 percig tanultál.",
      icon: "🔥",
    });
  }

  return badges;
}

export default function Profile({ user, onLogout, onLogin, setRoute }) {
  const [profileImage, setProfileImage] = useState(null);
  const [xpData, setXpData] = useState({
    visitXp: DAILY_VISIT_XP,
    studyXpToday: 0,
    totalStudyMinutesToday: 0,
    totalStudyMinutesAllTime: 0,
    lifetimeXp: 0, // Összes XP (tanulás + login)
    level: 1,
    xpIntoLevel: 0,
    xpToNextLevel: XP_PER_LEVEL,
    badges: [],
  });

  // Profilkép betöltése
  useEffect(() => {
    try {
      const storedImg = localStorage.getItem(PROFILE_IMAGE_KEY);
      if (storedImg) setProfileImage(storedImg);
    } catch (e) {
      console.warn("Profile image load failed", e);
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setProfileImage(dataUrl);
      try {
        localStorage.setItem(PROFILE_IMAGE_KEY, dataUrl);
      } catch (err) {
        console.warn("Profile image save failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  // XP újraszámolása
  const recalcXp = () => {
    if (typeof window === "undefined") return;

    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).getTime();

      const raw = localStorage.getItem(STORAGE_KEY);
      let totalSecondsAll = 0;
      let totalSecondsToday = 0;

      if (raw) {
        const sessions = JSON.parse(raw);

        totalSecondsAll = sessions.reduce(
          (sum, s) => sum + (s.duration || 0),
          0
        );

        totalSecondsToday = sessions
          .filter((s) => s.timestamp >= startOfDay)
          .reduce((sum, s) => sum + (s.duration || 0), 0);
      }

      // Lifetime percek (csak tanulás)
      const totalMinutesAllTime =
        totalSecondsAll > 0
          ? Math.max(1, Math.floor(totalSecondsAll / 60))
          : 0;

      // Napi percek
      const totalMinutesToday =
        totalSecondsToday > 0
          ? Math.max(1, Math.floor(totalSecondsToday / 60))
          : 0;

      const studyXpToday = totalMinutesToday; // 1 perc = 1 XP
      const visitXp = DAILY_VISIT_XP;

      // Lifetime XP: tanulás + login XP
      const lifetimeXp = totalMinutesAllTime + visitXp;

      // Szint: lifetime XP alapján
      const level = Math.floor(lifetimeXp / XP_PER_LEVEL) + 1;
      const xpIntoLevel = lifetimeXp % XP_PER_LEVEL;
      const xpToNextLevel = XP_PER_LEVEL - xpIntoLevel;

      const badges = getBadges(totalMinutesAllTime, totalMinutesToday);

      setXpData({
        visitXp,
        studyXpToday,
        totalStudyMinutesToday: totalMinutesToday,
        totalStudyMinutesAllTime: totalMinutesAllTime,
        lifetimeXp,
        level,
        xpIntoLevel,
        xpToNextLevel,
        badges,
      });
    } catch (err) {
      console.warn("XP calculation failed", err);
    }
  };

  // XP-kiszámolás: belépéskor + amikor a Timer jelzi, hogy új session lett mentve
  useEffect(() => {
    if (!user) return;

    recalcXp(); // első betöltés

    const handler = () => {
      recalcXp();
    };

    window.addEventListener("focusSessionSaved", handler);

    return () => {
      window.removeEventListener("focusSessionSaved", handler);
    };
  }, [user]);

  // Avatar keret szín szint alapján
  const avatarFrameClass = (() => {
    const lvl = xpData.level;
    if (lvl >= 20) return "diamond";
    if (lvl >= 10) return "gold";
    if (lvl >= 5) return "silver";
    return "bronze";
  })();

  // Bejelentkezett állapot – profil nézet
  if (user) {
    const totalToday = xpData.visitXp + xpData.studyXpToday;

    return (
      <div className="profile">
        {/* Fejléc + szint pill */}
        <div className="profile-header">
          <span className={`level-pill ${avatarFrameClass}`}>
            Szint {xpData.level}
          </span>
        </div>

        {/* Avatar + profilkép */}
        <div className="profile-avatar">
          <div className={`avatar-frame ${avatarFrameClass}`}>
            <img
              src={profileImage || "/default-avatar.png"}
              alt="Profil"
              className="profile-img"
            />
          </div>
          <label className="upload-btn">
            Profilkép feltöltése
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>

        {/* Alap adatok */}
        <div className="profile-info">
          <p>
            <strong>Azonosító:</strong> {user.id}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Név:</strong> {user.name}
          </p>
        </div>

        {/* Motivációs XP kártya */}
        <div className="xp-card">
          <h4>Mai motiváció ✨</h4>

          <p className="xp-line">
            <span className="xp-value">+{xpData.visitXp} XP</span> amiért ma
            beléptél 🔥
          </p>

          <p className="xp-line">
            <span className="xp-value">+{xpData.studyXpToday} XP</span>
            {xpData.totalStudyMinutesToday > 0 ? (
              <>
                {" "}
                a mai{" "}
                <strong>{xpData.totalStudyMinutesToday} perc</strong> tanulásért
                🎓
              </>
            ) : (
              <> — Indíts egy sessiont a Timerrel!</>
            )}
          </p>

          {/* Napi XP progress bar – cél: 100 XP */}
          <div className="xp-bar">
            <div
              className="xp-bar-fill"
              style={{
                width: `${Math.min((totalToday / 100) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="xp-bar-label">
            Napi cél: <strong>100 XP</strong>
          </p>

          <p className="xp-total">
            Összes mai XP: <strong>{totalToday} XP</strong>
          </p>

          <p className="level-progress-text">
            Szint progress (lifetime):{" "}
            <strong>
              {xpData.xpIntoLevel}/{XP_PER_LEVEL} XP
            </strong>{" "}
            a következő szintig
          </p>
        </div>

        {/* Összesített / lifetime XP kártya */}
        <div className="lifetime-xp-card">
          <h4>Összesített haladás 📚</h4>
          <p className="lifetime-xp">
            Eddig összegyűjtött XP:{" "}
            <strong>{xpData.lifetimeXp} XP</strong>
          </p>
          <p className="lifetime-desc">
            Ennyi perc fókuszált tanulás + napi belépés XP! 🔥
          </p>
        </div>

        {/* Kitűzők */}
        <div className="badges-card">
          <h4>Kitűzők 🏅</h4>
          {xpData.badges.length === 0 ? (
            <p className="no-badges">
              Még nincs kitűződ – kezdj el tanulni, és gyűjtsd be az elsőket!
            </p>
          ) : (
            <div className="badges-list">
              {xpData.badges.map((b) => (
                <div key={b.id} className="badge">
                  <span className="badge-icon">{b.icon}</span>
                  <span className="badge-label">{b.label}</span>
                  <div className="badge-tooltip">{b.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={onLogout} className="logout-btn">
          Kijelentkezés
        </button>
      </div>
    );
  }

  // Login nézet – ehhez nem nyúlunk
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
