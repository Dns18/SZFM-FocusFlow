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
// OpenAI chat endpoint
// -------------------
app.post("/api/openai-chat", async (req, res) => {
  const userMessage = req.body?.message || "";

  if (!userMessage) {
    return res.json({ reply: "Nem kaptam üzenetet a kérésben." });
  }

  try {
    const openaiResponse = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Te egy barátságos magyar AI tutor vagy, aki röviden, érthetően magyaráz.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const reply =
      openaiResponse.choices?.[0]?.message?.content?.trim() ||
      "Üres válasz érkezett a modeltől. 😅";

    console.log("OpenAI reply:", reply);
    return res.json({ reply });
  } catch (err) {
    console.error("OpenAI full error:", err);
    return res.json({
      reply:
        "⚠️ Hiba történt az OpenAI hívás közben. (Részletek a szerver logban.)",
    });
  }
});