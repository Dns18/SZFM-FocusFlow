// src/components/Timer/Timer.jsx
import { useState, useEffect, useRef } from "react";
import "./Timer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faStop } from '@fortawesome/free-solid-svg-icons';

const STORAGE_KEY = "focusflow_sessions_v1";
const TOPICS_KEY = "focusflow_topics_v1";

const DEFAULT_FOCUS = 25 * 60;
const DEFAULT_SHORT_BREAK = 5 * 60;
const DEFAULT_LONG_BREAK = 15 * 60;

function saveSessionToStorage(topic, durationSeconds) {
  if (!topic) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ topic, timestamp: Date.now(), duration: durationSeconds });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.warn("Saving session failed", e);
  }
}

function loadTopics() {
  try {
    const raw = localStorage.getItem(TOPICS_KEY);
    return raw ? JSON.parse(raw) : ["Matematika", "Történelem", "Fizika", "Programozás", "Nyelvtanulás"];
  } catch (e) {
    console.warn("Load topics failed", e);
    return ["Matematika", "Történelem", "Fizika", "Programozás", "Nyelvtanulás"];
  }
}

function saveTopics(topics) {
  try {
    localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
  } catch (e) {
    console.warn("Save topics failed", e);
  }
}

export default function Timer() {
  const [focusDuration, setFocusDuration] = useState(() => {
    const stored = parseInt(localStorage.getItem("focusDuration"));
    return !isNaN(stored) ? stored : DEFAULT_FOCUS;
  });
  const [shortBreakDuration, setShortBreakDuration] = useState(() => {
    const stored = parseInt(localStorage.getItem("shortBreak"));
    return !isNaN(stored) ? stored : DEFAULT_SHORT_BREAK;
  });
  const [longBreakDuration, setLongBreakDuration] = useState(() => {
    const stored = parseInt(localStorage.getItem("longBreak"));
    return !isNaN(stored) ? stored : DEFAULT_LONG_BREAK;
  });

  const formatMinutesSeconds = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const [showTips, setShowTips] = useState(false);
  const [isTipsVisible, setIsTipsVisible] = useState(false);

  useEffect(() => {
    if (showTips) setIsTipsVisible(true);
  }, [showTips]);

  const closeTips = () => {
    setIsTipsVisible(false);
    setTimeout(() => setShowTips(false), 300); // animáció időtartama
  };

  const [time, setTime] = useState(focusDuration);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  const [topics, setTopics] = useState(() => loadTopics());
  const [topic, setTopic] = useState(() => {
    const t = loadTopics();
    const persisted = localStorage.getItem("selectedTopic");
    return (persisted && persisted.trim()) || (t && t.length ? t[0] : "Matematika");
  });
  const [newTopic, setNewTopic] = useState("");

  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sessionStartRef = useRef(null);

  const formatTime = (t) => {
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const playSound = (opts = {}) => {
    try {
      const ctx = audioCtxRef.current ?? new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const duration = opts.duration ?? 0.12;
      const type = opts.type ?? "sine";
      const volume = opts.volume ?? 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(opts.freq ?? 880, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration + 0.02);
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  };

  const startInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  const startTimer = () => {
    setIsActive(true);
    if (!isBreak && !sessionStartRef.current) sessionStartRef.current = Date.now();
    startInterval();
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
  };

  const endTimer = () => {
    if (!isBreak && sessionStartRef.current) {
      const elapsedSec = Math.round((Date.now() - sessionStartRef.current) / 1000);
      saveSessionToStorage(topic, elapsedSec > 0 ? elapsedSec : focusDuration);
      sessionStartRef.current = null;
    }
    clearInterval(intervalRef.current);
    setIsActive(false);
    setIsBreak(false);
    setCycleCount(0);
    setTime(focusDuration);
  };

  useEffect(() => {
    if (!isActive) setTime(focusDuration);
  }, [focusDuration, isActive]);

  useEffect(() => {
    if (time > 0 && time <= 5) {
      const freq = isBreak ? 600 : 1000;
      playSound({ freq, duration: 0.12, type: "sine", volume: 0.18 });
    }
  }, [time, isBreak]);

  useEffect(() => {
    if (time !== 0) return;

    playSound({ freq: isBreak ? 660 : 880, duration: 0.18, type: "sine", volume: 0.22 });

    clearInterval(intervalRef.current);

    if (!isBreak) {
      if (sessionStartRef.current) {
        const elapsedSec = Math.round((Date.now() - sessionStartRef.current) / 1000);
        saveSessionToStorage(topic, elapsedSec > 0 ? elapsedSec : focusDuration);
        sessionStartRef.current = null;
      }

      const nextCycle = cycleCount + 1;
      setCycleCount(nextCycle);

      if (nextCycle >= 4) {
        setIsBreak(true);
        setTime(longBreakDuration);
        setIsActive(true);
        startInterval();
        return;
      } else {
        setIsBreak(true);
        setTime(shortBreakDuration);
        setIsActive(true);
        startInterval();
        return;
      }
    }

    if (isBreak) {
      if (cycleCount >= 4) {
        setIsBreak(false);
        setIsActive(false);
        setTime(focusDuration);
        setCycleCount(0);
        return;
      } else {
        setIsBreak(false);
        setTime(focusDuration);
        sessionStartRef.current = Date.now();
        setIsActive(true);
        startInterval();
        return;
      }
    }
  }, [time, isBreak, cycleCount, focusDuration, longBreakDuration, shortBreakDuration, topic]);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (audioCtxRef.current && typeof audioCtxRef.current.close === "function") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const totalForPercentage = isBreak
    ? (cycleCount >= 4 && isBreak ? longBreakDuration : shortBreakDuration)
    : focusDuration;
  const percentage = (time / totalForPercentage) * 100;

  // --- topic kezelő funkciók ---
  const handleAddTopic = () => {
    if (isActive) return; // blokkoljuk ha fut a timer
    const trimmed = newTopic.trim();
    if (!trimmed) return;

    if (topics.includes(trimmed)) {
      setNewTopic("");
      setTopic(trimmed);
      try { localStorage.setItem("selectedTopic", trimmed); } catch (err) {}
      window.dispatchEvent(new CustomEvent("topicChange", { detail: trimmed }));
      return;
    }

    const updated = [...topics, trimmed];
    setTopics(updated);
    saveTopics(updated);

    setTopic(trimmed);
    try { localStorage.setItem("selectedTopic", trimmed); } catch (err) {}
    window.dispatchEvent(new CustomEvent("topicChange", { detail: trimmed }));

    setNewTopic("");
  };

  const handleRemoveTopic = (t) => {
    if (isActive) return; // blokkoljuk ha fut a timer
    const confirmed = window.confirm(`Törlöd a témát: "${t}" ? (a korábbi sessionök megmaradnak)`);
    if (!confirmed) return;
    const updated = topics.filter((x) => x !== t);
    setTopics(updated);
    saveTopics(updated);
    if (topic === t) {
      const newTopic = updated[0] || "";
      setTopic(newTopic);
      try { localStorage.setItem("selectedTopic", newTopic); } catch (err) {}
      window.dispatchEvent(new CustomEvent("topicChange", { detail: newTopic }));
    }
  };

  // ------ ÚJ: helper függvények a 3 inputhoz (ugyanaz a logika, mint eddig) ------

  const setFocusMinutes = (minutes) => {
    if (!isNaN(minutes) && minutes > 0) {
      setFocusDuration(minutes * 60);
      setTime(minutes * 60);
      localStorage.setItem("focusDuration", minutes * 60);
    }
  };

  const setShortBreakMinutes = (minutes) => {
    if (!isNaN(minutes) && minutes > 0) {
      setShortBreakDuration(minutes * 60);
      localStorage.setItem("shortBreakDuration", minutes * 60);
      if (isBreak && cycleCount < 4) {
        setTime(minutes * 60);
      }
    }
  };

  const setLongBreakMinutes = (minutes) => {
    if (!isNaN(minutes) && minutes > 0) {
      setLongBreakDuration(minutes * 60);
      localStorage.setItem("longBreakDuration", minutes * 60);
      if (isBreak && cycleCount >= 4) {
        setTime(minutes * 60);
      }
    }
  };

  return (
    <div className="timer-wrapper">
      {/* --- Tippek gomb és animált modal --- */}
      <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 1000 }}>
        <button className="btn tippek-btn" onClick={() => setShowTips(true)}>
          Tippek
        </button>
      </div>

      {showTips && (
        <div
          className={`tips-modal-overlay ${isTipsVisible ? "fade-in" : "fade-out"}`}
          onClick={closeTips}
        >
          <div className="tips-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Tanulási Tippek</h3>
            <ul>
              <li>Kapcsold ki a zavaró tényezőket: telefon, chat, értesítések szünetre.</li>
              <li>Ne zavarjon semmi a fókusz idején.</li>
              <li>Írd fel a legfontosabb pontokat minden session végén.</li>
              <li>Rövid, kulcsszavas jegyzetek segítik az emlékezést.</li>
              <li>Maradj hidratált.</li>
              <li>Egy kis gyümölcs vagy snack segíti az agyműködést.</li>
              <li>Mozogj a szünetben: pár perc séta vagy nyújtás felfrissít.</li>
              <li>A nap végén nézd át, mennyit tanultál, és mit kell javítani.</li>
            </ul>
            <button className="close-btn" onClick={closeTips}>×</button>
          </div>
        </div>
      )}

      <h2 className="focus-title">
        {isBreak ? (cycleCount >= 4 ? "HOSSZÚ SZÜNET" : "SZÜNET") : "FOCUS SESSIONS"}
      </h2>

      <div className="timer-topic-select-group">
        <label>Mit szeretnél tanulni?</label>

        <select
          value={topic}
          onChange={(e) => {
            const v = e.target.value;
            setTopic(v);
            try { localStorage.setItem("selectedTopic", v); } catch (err) {}
            window.dispatchEvent(new CustomEvent("topicChange", { detail: v }));
          }}
          disabled={isActive}
        >
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button
          onClick={() => topic && handleRemoveTopic(topic)}
          disabled={isActive}
          className="remove-topic-btn"
          title={isActive ? "A timer fut — előbb állítsd meg a timert" : "Téma törlése"}
        >
          Töröl
        </button>
      </div>

      <div className="timer-topic-add-group">
        <input
          className="new-topic-input"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="Új téma hozzáadása"
          disabled={isActive}
        />
        <button
          onClick={handleAddTopic}
          disabled={isActive}
          className="add-topic-btn"
        >
          Hozzáad
        </button>
      </div>

      <div className="circle-wrapper">
        <svg className="progress-ring" width="260" height="260">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00e0ff" />
              <stop offset="100%" stopColor="#c8f560" />
            </linearGradient>
          </defs>

          <circle className="progress-ring__background" cx="130" cy="130" r="115" />
          <circle
            className="progress-ring__circle"
            cx="130"
            cy="130"
            r="115"
            style={{
              strokeDashoffset: `${(2 * Math.PI * 115 * (100 - percentage)) / 100}`,
            }}
          />
        </svg>
        <div className="time-text">{formatTime(time)}</div>
      </div>

      {/* ----------- ITT VANNAK AZ ÚJ, EGYFORMA DESIGN-Ú INPUTOK ----------- */}
      <div className="timer-settings">
        {/* FOCUS */}
        <div className="timer-setting">
          <label>Focus (perc):</label>
          <div className="number-wrapper">
            <input
              className="focus-input"
              type="number"
              min="1"
              value={focusDuration / 60}
              onChange={(e) => setFocusMinutes(parseInt(e.target.value))}
            />
            <div className="spinner-buttons">
              <button
                className="spin-btn up"
                onClick={() => setFocusMinutes(focusDuration / 60 + 1)}
              >
                ▲
              </button>
              <button
                className="spin-btn down"
                onClick={() => setFocusMinutes(focusDuration / 60 - 1)}
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* SHORT BREAK */}
        <div className="timer-setting">
          <label>Short Break (perc):</label>
          <div className="number-wrapper">
            <input
              className="focus-input"
              type="number"
              min="1"
              value={shortBreakDuration / 60}
              onChange={(e) => setShortBreakMinutes(parseInt(e.target.value))}
            />
            <div className="spinner-buttons">
              <button
                className="spin-btn up"
                onClick={() => setShortBreakMinutes(shortBreakDuration / 60 + 1)}
              >
                ▲
              </button>
              <button
                className="spin-btn down"
                onClick={() => setShortBreakMinutes(shortBreakDuration / 60 - 1)}
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* LONG BREAK */}
        <div className="timer-setting">
          <label>Long Break (perc):</label>
          <div className="number-wrapper">
            <input
              className="focus-input"
              type="number"
              min="1"
              value={longBreakDuration / 60}
              onChange={(e) => setLongBreakMinutes(parseInt(e.target.value))}
            />
            <div className="spinner-buttons">
              <button
                className="spin-btn up"
                onClick={() => setLongBreakMinutes(longBreakDuration / 60 + 1)}
              >
                ▲
              </button>
              <button
                className="spin-btn down"
                onClick={() => setLongBreakMinutes(longBreakDuration / 60 - 1)}
              >
                ▼
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="button-group" style={{ marginTop: 16 }}>
        <button className="btn pause" onClick={pauseTimer} disabled={!isActive}>
          <FontAwesomeIcon icon={faPause} />
        </button>
        <button className="btn start" onClick={startTimer} disabled={isActive}>
          <FontAwesomeIcon icon={faPlay} />
        </button>
        <button className="btn end" onClick={endTimer}>
          <FontAwesomeIcon icon={faStop} />
        </button>
      </div>

      <p className="next-break">
        {isBreak
          ? cycleCount >= 4
            ? `Hosszú szünet: ${formatTime(time)} — a ciklus a végére ért, indítsd újra kézzel.`
            : `A szünetből vissza: ${formatTime(time)}`
          : `Ciklus: ${cycleCount}/4 — Következő szünet: ${formatMinutesSeconds(
              cycleCount + 1 >= 4 ? longBreakDuration : shortBreakDuration
            )}`}
      </p>
    </div>
  );
}