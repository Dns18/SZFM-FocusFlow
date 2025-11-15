// server.js
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// GROQ kliens
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Teszt route
app.get("/", (req, res) => {
  res.send("Groq backend fut a 4000-es porton ✅");
});

// Chat endpoint (AI válasz)
app.post("/api/chat", async (req, res) => {
  console.log("KAPTAM A FRONTENDTŐL:", req.body);

  const userMessage = (req.body?.message || "").trim();
  const topic = (req.body?.topic || "").trim();

  if (!userMessage) {
    return res.json({ reply: "Nem kaptam üzenetet a kérésben." });
  }
  if (!topic) {
    return res.json({ reply: "Nincs kiválasztott tantárgy. Válaszd ki a 'Mit szeretnél tanulni?' mezőben." });
  }

  // Rendszer prompt: kötelezően a kiválasztott témára korlátoz
  const systemPrompt = `
Te egy magyar nyelvű AI tanulási tutor vagy.
A felhasználó jelenleg a következő tantárgyat tanulja: "${topic}".
MINDEN válaszodat kizárólag erre a tantárgyra korlátozd.
Ha a felhasználó más témáról kérdez, röviden (egy-két mondatban) tereld vissza a beszélgetést a "${topic}" témára és ajánlj egy egyszerű gyakorlati feladatot.
Válaszolj magyarul, tömören és gyakorlatorientáltan.
  `.trim();

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content || "Üres válasz érkezett a Groq modelltől.";
    console.log("GROQ VÁLASZ:", reply);
    return res.json({ reply });
  } catch (err) {
    console.error("GROQ API HIBA:", err);
    return res.json({ reply: "⚠️ Hiba történt a Groq AI hívás közben. (Részletek a szerver konzolon.)" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend fut: http://localhost:${PORT}`);
});
