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