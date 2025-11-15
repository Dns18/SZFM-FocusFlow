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
  const boxRef = useRef(null);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userText = input;
    setInput("");

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      // dynamically choose endpoint based on selected model
      const endpoint = model === "openai" ? "api/openai-chat" : "api/groq-chat";

      const res = await fetch(`http://localhost:4000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
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

      {/* --- Model Selector --- */}
      <div className="chat-model-selector">
        <label htmlFor="model-select">Válassz modellt:</label>
        <select
          id="model-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="openai">OpenAI</option>
          <option value="groq">Groq</option>
        </select>
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
          placeholder="Kérdezz bármit..."
        />
        <button className="send-btn" onClick={handleSend}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
}