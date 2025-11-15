/* Backend with OpenAI and Groq API integration */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// === OpenAI SDK ===
const OpenAI = require("openai");

// === Groq SDK ===
const Groq = require("groq-sdk");