import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log("╔════════════════════════════════════════╗");
  console.log(`║  Nova AI Backend running on port ${env.port}  ║`);
  console.log("╚════════════════════════════════════════╝");
  console.log(`✅ Health check: http://localhost:${env.port}/`);
  console.log(`🤖 Chat endpoint: POST http://localhost:${env.port}/api/chat`);
  console.log(
    `🔑 Gemini API Key: ${env.geminiApiKey ? "✅ Configured" : "❌ NOT SET!"}`
  );
});
