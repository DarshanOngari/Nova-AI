import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 5000,
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash",
  frontendUrl: process.env.FRONTEND_URL || "",
  convoAdminUrl:
    process.env.CONVO_ADMIN_URL ||
    "https://convo-api.parkarlabs.in/api/chat-logs",
  systemPrompt:
    process.env.SYSTEM_PROMPT ||
    "You are Nova, a helpful, friendly, and intelligent AI assistant. Answer clearly and concisely, using markdown when it improves readability.",
};
