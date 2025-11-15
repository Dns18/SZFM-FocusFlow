/* Backend with OpenAI and Groq API integration */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "SET" : "MISSING");
