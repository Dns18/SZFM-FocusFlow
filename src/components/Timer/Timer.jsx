import { useState, useEffect, useRef } from "react";
import "./Timer.css";

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
    const stored = parseInt(localStorage.getItem("shortBreakDuration"));
    return !isNaN(stored) ? stored : DEFAULT_SHORT_BREAK;
  });
  const [longBreakDuration, setLongBreakDuration] = useState(() => {
    const stored = parseInt(localStorage.getItem("longBreakDuration"));
    return !isNaN(stored) ? stored : DEFAULT_LONG_BREAK;
  });

  // segédfüggvény az idő formázására a Ciklushoz
  const formatMinutesSeconds = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const [time, setTime] = useState(focusDuration);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycleCount, setCycleCount] = useState(0); // 0 means before first focus, increments after each focus completes (1..4)

  const [topics, setTopics] = useState(() => loadTopics());
  const [topic, setTopic] = useState(() => {
    const t = loadTopics();
    return t && t.length ? t[0] : "Matematika";
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
    // If we are after finishing a full 4-cycle + long break, user must manually start a new cycle:
    // allow start if not active and (either in progress or at beginning)
    setIsActive(true);
    if (!isBreak && !sessionStartRef.current) sessionStartRef.current = Date.now();
    startInterval();
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
  };

  const endTimer = () => {
    // Save current focus session if ending while in focus
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
  }, [focusDuration]);

  // utolsó 5 mp csipogás
  useEffect(() => {
    if (time > 0 && time <= 5) {
      const freq = isBreak ? 600 : 1000;
      playSound({ freq, duration: 0.12, type: "sine", volume: 0.18 });
    }
  }, [time, isBreak]);

  // váltás logika
  useEffect(() => {
    if (time !== 0) return;

    playSound({ freq: isBreak ? 660 : 880, duration: 0.18, type: "sine", volume: 0.22 });

    clearInterval(intervalRef.current);

    // If finishing a focus period -> increment cycleCount and choose break
    if (!isBreak) {
      // save focus session
      if (sessionStartRef.current) {
        const elapsedSec = Math.round((Date.now() - sessionStartRef.current) / 1000);
        saveSessionToStorage(topic, elapsedSec > 0 ? elapsedSec : focusDuration);
        sessionStartRef.current = null;
      }

      const nextCycle = cycleCount + 1;
      setCycleCount(nextCycle);

      if (nextCycle >= 4) {
        // after the 4th focus, go to LONG_BREAK and then stop after it finishes
        setIsBreak(true);
        setTime(longBreakDuration);
        setIsActive(true);
        startInterval();
        // we intentionally do NOT reset cycleCount here; after long break ends we'll stop
        return;
      } else {
        // go to short break
        setIsBreak(true);
        setTime(shortBreakDuration);
        setIsActive(true);
        startInterval();
        return;
      }
    }

if (isBreak) {
  if (cycleCount >= 4) {
    // hosszú szünet véget ért -> leállunk, kézi indítás kell
    setIsBreak(false);
    setIsActive(false);
    setTime(focusDuration);
    setCycleCount(0);
    return;
  } else {
    // rövid szünet véget ért -> folytatjuk a következő fókuszszakasszal
    setIsBreak(false);
    setTime(focusDuration);
    sessionStartRef.current = Date.now();
    setIsActive(true);
    startInterval();
    return;
  }
}


  }, [time]);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (audioCtxRef.current && typeof audioCtxRef.current.close === "function") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const totalForPercentage = isBreak ? (cycleCount >= 4 && isBreak ? longBreakDuration : shortBreakDuration) : focusDuration;
  const percentage = (time / totalForPercentage) * 100;

  // --- topic kezelő funkciók ---
  const handleAddTopic = () => {
    const trimmed = newTopic.trim();
    if (!trimmed) return;
    if (topics.includes(trimmed)) {
      setNewTopic("");
      setTopic(trimmed);
      return;
    }
    const updated = [...topics, trimmed];
    setTopics(updated);
    saveTopics(updated);
    setTopic(trimmed);
    setNewTopic("");
  };

  const handleRemoveTopic = (t) => {
    const confirmed = window.confirm(`Törlöd a témát: "${t}" ? (a korábbi sessionök megmaradnak)`);
    if (!confirmed) return;
    const updated = topics.filter((x) => x !== t);
    setTopics(updated);
    saveTopics(updated);
    if (topic === t) setTopic(updated[0] || "");
  };

  return (
    <div className="timer-wrapper">
      <h2 className="focus-title">{isBreak ? (cycleCount >= 4 ? "HOSSZÚ SZÜNET" : "SZÜNET") : "FOCUS SESSIONS"}</h2>

      <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ color: "#cbd5e1", fontSize: 14 }}>Mit szeretnél tanulni?</label>

        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "#0b1220", color: "white" }}
        >
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button
          onClick={() => topic && handleRemoveTopic(topic)}
          style={{ padding: "6px 8px", borderRadius: 8, background: "#7f1d1d", color: "white", border: "none" }}
          title="Téma törlése"
        >
          Töröl
        </button>
      </div>

      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <input
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="Új téma hozzáadása"
          style={{ padding: "6px 8px", borderRadius: 8, border: "none", background: "#0b1220", color: "white", flex: 1 }}
        />
        <button
          onClick={handleAddTopic}
          style={{ padding: "6px 10px", borderRadius: 8, background: "#0b7df0", color: "white", border: "none" }}
        >
          Hozzáad
        </button>
      </div>

      {/* időbeállító inputok */}
      <div className="timer-settings">
        <div className="timer-setting">
          <label>Focus (perc):</label>
          <input
            type="number"
            min="1"
            value={focusDuration / 60}
            onChange={(e) => {
              const minutes = parseInt(e.target.value);
              if (!isNaN(minutes) && minutes > 0) {
                setFocusDuration(minutes * 60);
                setTime(minutes * 60);
                localStorage.setItem("focusDuration", minutes * 60);
              }
            }}
          />
        </div>

        <div className="timer-setting">
          <label>Short Break (perc):</label>
          <input
            type="number"
            min="1"
            value={shortBreakDuration / 60}
            // Short Break input
            onChange={(e) => {
              const minutes = parseInt(e.target.value);
              if (!isNaN(minutes) && minutes > 0) {
                setShortBreakDuration(minutes * 60);
                localStorage.setItem("shortBreakDuration", minutes * 60);
                if (isBreak && cycleCount < 4) {
                  setTime(minutes * 60); // az aktuális rövid szünetet frissíti
                }
              }
            }}
          />
        </div>

        <div className="timer-setting">
          <label>Long Break (perc):</label>
          <input
            type="number"
            min="1"
            value={longBreakDuration / 60}
            // Long Break Input
            onChange={(e) => {
              const minutes = parseInt(e.target.value);
              if (!isNaN(minutes) && minutes > 0) {
                setLongBreakDuration(minutes * 60);
                localStorage.setItem("longBreakDuration", minutes * 60);
                if (isBreak && cycleCount >= 4) {
                  setTime(minutes * 60); // az aktuális hosszú szünetet frissíti
                }
              }
            }}
          />
        </div>
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

      <div className="button-group" style={{ marginTop: 16 }}>
        <button className="btn start" onClick={startTimer} disabled={isActive}>
          Start
        </button>
        <button className="btn pause" onClick={pauseTimer} disabled={!isActive}>
          Szünet
        </button>
        <button className="btn end" onClick={endTimer}>
          Vége
        </button>
      </div>

      {/* Következő szünet/ciklus információ */}
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
