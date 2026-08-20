import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // fallback allow for dev environment
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

// ─── Gemini Setup ──────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const SYSTEM_PROMPT =
  "You are Nova, a helpful, friendly, and intelligent AI assistant. Answer clearly and concisely, using markdown when it improves readability.";

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Nova AI Backend is running 🚀" });
});

// POST /api/chat — Main AI chat endpoint (streaming)
// Body: { messages: Array<{ role: "user" | "assistant", content: string }> }
app.post("/api/chat", async (req, res) => {
  try {
    // ── Validate API key ────────────────────────────────────────────────────
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is not configured. Set GEMINI_API_KEY in .env",
      });
    }

    // ── Validate request body ───────────────────────────────────────────────
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: "messages array is required and cannot be empty." });
    }

    // ── Build Gemini history ────────────────────────────────────────────────
    // Gemini uses "user" and "model" roles (not "assistant")
    const history = messages
      .filter((m) => typeof m.content === "string" && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // The last message must be from the user; separate it as the new prompt
    const lastMessage = history.pop();
    if (!lastMessage || lastMessage.role !== "user") {
      return res
        .status(400)
        .json({ error: "The last message must be from the user." });
    }

    // ── Initialize Gemini client ────────────────────────────────────────────
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_PROMPT,
    });

    // ── Start chat and stream response ──────────────────────────────────────
    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage.parts[0].text);

    // Set streaming headers
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");

    // Stream each chunk to the client as plain text
    let fullResponse = "";
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        fullResponse += text;
        res.write(text);
      }
    }

    // End the stream
    res.end();

    // ── Log the conversation (user request + AI response) ───────────────────
    console.log("─".repeat(60));
    console.log(`[${new Date().toISOString()}] New message`);
    console.log(`USER: ${lastMessage.parts[0].text}`);
    console.log(`NOVA: ${fullResponse.slice(0, 200)}${fullResponse.length > 200 ? "..." : ""}`);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Something went wrong while generating a response.",
        detail: error?.message || "Unknown error",
      });
    }
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("╔════════════════════════════════════════╗");
  console.log(`║  Nova AI Backend running on port ${PORT}  ║`);
  console.log("╚════════════════════════════════════════╝");
  console.log(`✅ Health check: http://localhost:${PORT}/`);
  console.log(`🤖 Chat endpoint: POST http://localhost:${PORT}/api/chat`);
  console.log(`🔑 Gemini API Key: ${GEMINI_API_KEY ? "✅ Configured" : "❌ NOT SET!"}`);
});
