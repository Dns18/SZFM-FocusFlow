// src/components/Chat/Chat.jsx
import React, { useState, useRef, useEffect } from "react";
import "./Chat.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Szia! Miben segíthetek ma?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("openai"); // default model
  const [topic, setTopic] = useState(() => {
    try {
      const t = localStorage.getItem("selectedTopic");
      return t && t.trim() ? t : "";
    } catch {
      return "";
    }
  });

  const boxRef = useRef(null);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "selectedTopic") {
        setTopic(e.newValue ?? "");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const readCurrentTopic = () => {
    try {
      const t = localStorage.getItem("selectedTopic");
      return t && t.trim() ? t : "";
    } catch {
      return "";
    }
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    const currentTopic = readCurrentTopic();
    setTopic(currentTopic);

    if (!currentTopic) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ A Timer-ben nincs kiválasztott téma. Válassz témát a Timer-ben, majd próbáld újra." },
      ]);
      return;
    }

    const userText = input;
    setInput("");

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const endpoint = model === "openai" ? "api/openai-chat" : "api/groq-chat";

      const systemPrompt = `Beszélj kizárólag erről a témáról: "${currentTopic}". Ha a felhasználó kérdése eltér a témától, kérdezd meg, hogy maradjunk a kiválasztott témánál vagy válaszolj röviden és térj vissza a témához. Ne szólj más témáról.`;

      const res = await fetch(`http://localhost:4000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          topic: currentTopic,
          systemPrompt,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.reply || "Nem érkezett érvényes válasz a szervertől." },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Hiba történt a szerverrel való kommunikáció közben." },
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-wrapper">
      <h3 className="chat-title">AI TUTOR</h3>

      <div className="chat-model-selector">
        <div class="left-side">
          <label htmlFor="model-select">Modell:</label>
          <select id="model-select" value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="openai">OpenAI</option>
            <option value="groq">Groq</option>
          </select>
        </div>
        <div class="right-side">
          <div style={{ marginLeft: 12, color: "#9ca3af", fontSize: 13 }}>
              Aktuális téma: <strong style={{ color: "#fff" }}>
                {topic || "nincs kiválasztva (Timer-ben állítható)"}
            </strong>
          </div>
        </div>
      </div>

      <div className="chat-box" ref={boxRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.sender}`}>
            {m.text}
          </div>
        ))}

        {loading && (
          <div className="chat-message ai">Gondolkodom...</div>
        )}
      </div>

      <div className="chat-input-group">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={topic ? `Kérdezz a(z) ${topic} témában...` : "Előbb válassz témát a Timer-ben..."}
        />
        <button className="send-btn" onClick={handleSend}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
}
