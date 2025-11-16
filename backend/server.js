/* Backend with OpenAI and Groq API integration */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "SET" : "MISSING");

// === OpenAI SDK ===
const OpenAI = require("openai");

// === Groq SDK ===
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());

// -------------------
// OpenAI Client
// -------------------
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Groq Client
const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// -------------------
// Test route
// -------------------
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// -------------------
// Simple off-topic heuristic
// -------------------
const OFF_TOPIC_KEYWORDS = [
  "foci", "labdarúgás", "football", "soccer",
  "zene", "film", "sorozat", "politika"
];

function looksOffTopic(text, topic) {
  if (!text) return true;
  const low = text.toLowerCase();
  // explicit tiltott kulcsszó esetén off-topic
  for (const bad of OFF_TOPIC_KEYWORDS) {
    if (low.includes(bad)) return true;
  }
  // egyszerű relevanciaellenőrzés: ha a topic szó teljesen nincs benne, figyelmeztetünk
  const t = (topic || "").toLowerCase();
  if (!t) return true;
  if (!low.includes(t) && t.split(" ").length === 1) {
    // ha egy szavas a topic és nem szerepel, jelezzük
    return true;
  }
  return false;
}

function makeOnTopicSystemPrompt(topic) {
  return `Te egy barátságos magyar AI tutor vagy, aki kizárólag a következő témáról beszél: "${topic}". Ha a felhasználó kérdése eltér a témától, röviden utasítsd vissza és kérdezd meg, hogy akar-e maradni ennél a témánál. Ne említs vagy ne térj át egyéb témákra. Magyarázz röviden, példákkal és lépésenként, de maradj a témánál.`;
}

// -------------------
// OpenAI chat endpoint
// -------------------
app.post("/api/openai-chat", async (req, res) => {
  const userMessage = req.body?.message || "";
  const topic = (req.body?.topic || "").trim();
  const clientSystemPrompt = req.body?.systemPrompt;

  if (!userMessage) {
    return res.json({ reply: "Nem kaptam üzenetet a kérésben." });
  }
  if (!topic) {
    return res.json({ reply: "Kérlek válassz témát (topic) a pontos válaszért." });
  }

  try {
    const finalSystem = clientSystemPrompt || makeOnTopicSystemPrompt(topic);

    const openaiResponse = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: finalSystem,
        },
        {
          role: "user",
          content: `Téma: ${topic}\nKérdés: ${userMessage}`,
        },
      ],
    });

    const reply =
      openaiResponse.choices?.[0]?.message?.content?.trim() ||
      "Üres válasz érkezett a modeltől.";

    if (looksOffTopic(reply, topic)) {
      console.warn("OpenAI reply flagged as off-topic. Topic:", topic, "Reply:", reply);
      return res.json({
        reply: `A modell válasza valószínűleg eltér a kiválasztott témától. Kérlek pontosítsd a kérdésedet a(z) "${topic}" témában.`,
        meta: { flagged: true },
      });
    }

    console.log("OpenAI reply:", reply);
    return res.json({ reply, meta: { flagged: false } });
  } catch (err) {
    console.error("OpenAI full error:", err);
    return res.json({
      reply:
        "⚠️ Hiba történt az OpenAI hívás közben. (Részletek a szerver logban.)",
    });
  }
});

// -------------------
// Groq chat endpoint
// -------------------
app.post("/api/groq-chat", async (req, res) => {
  const userMessage = req.body?.message || "";
  const topic = (req.body?.topic || "").trim();
  const clientSystemPrompt = req.body?.systemPrompt;

  if (!userMessage) {
    return res.json({ reply: "Nem kaptam üzenetet a kérésben." });
  }
  if (!topic) {
    return res.json({ reply: "Kérlek válassz témát (topic) a pontos válaszért." });
  }

  try {
    const finalSystem = clientSystemPrompt || makeOnTopicSystemPrompt(topic);

    const groqResponse = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: finalSystem,
        },
        {
          role: "user",
          content: `Téma: ${topic}\nKérdés: ${userMessage}`,
        },
      ],
      temperature: 0.3,
    });

    const reply =
      (groqResponse.choices?.[0]?.message?.content ||
        groqResponse.output ||
        groqResponse.reply ||
        ""
      ).toString().trim() || "Üres válasz érkezett a Groq modelltől.";

    if (looksOffTopic(reply, topic)) {
      console.warn("Groq reply flagged as off-topic. Topic:", topic, "Reply:", reply);
      return res.json({
        reply: `A modell válasza valószínűleg eltér a kiválasztott témától. Kérlek tartsd a kérdést a(z) "${topic}" témán belül.`,
        meta: { flagged: true },
      });
    }

    console.log("Groq reply:", reply);
    return res.json({ reply, meta: { flagged: false } });
  } catch (err) {
    console.error("Groq API error:", err && err.message ? err.message : err);
    return res.json({
      reply:
        "⚠️ Hiba történt a Groq AI hívás közben. (Részletek a szerver konzolon.)",
    });
  }
});

// -------------------
// Start server
// -------------------
const SERVER_PORT = process.env.PORT || 4000;
app.listen(SERVER_PORT, () => {
  console.log(`Backend running on http://localhost:${SERVER_PORT}`);
});