import {
  buildGeminiHistory,
  streamChatReply,
} from "../services/gemini.service.js";
import { logChatTurn } from "../services/convo-admin.service.js";
import { env } from "../config/env.js";

/**
 * POST /api/chat
 * Body: {
 *   messages: Array<{ role: "user" | "assistant", content: string }>,
 *   session_id?: string,
 *   user_identifier?: string
 * }
 * Streams plain-text AI response.
 */
export async function chat(req, res) {
  try {
    if (!env.geminiApiKey) {
      return res.status(500).json({
        error: "Gemini API key is not configured. Set GEMINI_API_KEY in .env",
      });
    }

    const { messages, session_id, user_identifier } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: "messages array is required and cannot be empty." });
    }

    const { history, lastMessage } = buildGeminiHistory(messages);

    if (!lastMessage || lastMessage.role !== "user") {
      return res
        .status(400)
        .json({ error: "The last message must be from the user." });
    }

    const userPrompt = lastMessage.parts[0].text;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");

    const startedAt = Date.now();
    let fullResponse = "";
    for await (const text of streamChatReply(history, userPrompt)) {
      fullResponse += text;
      res.write(text);
    }

    res.end();

    const latencyMs = Date.now() - startedAt;

    console.log("─".repeat(60));
    console.log(`[${new Date().toISOString()}] New message`);
    console.log(`USER: ${userPrompt}`);
    console.log(
      `NOVA: ${fullResponse.slice(0, 200)}${fullResponse.length > 200 ? "..." : ""}`
    );

    logChatTurn({
      sessionId: session_id,
      prompt: userPrompt,
      response: fullResponse,
      userIdentifier: user_identifier,
      metadata: {
        model: env.geminiModel,
        latency_ms: latencyMs,
      },
    }).catch((error) => {
      console.warn("[convo-admin] unexpected error:", error?.message || error);
    });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Something went wrong while generating a response.",
        detail: error?.message || "Unknown error",
      });
    }
  }
}
