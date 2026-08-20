import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

/**
 * Convert client messages into Gemini chat history + the latest user prompt.
 * Gemini uses "user" / "model" roles (not "assistant").
 */
export function buildGeminiHistory(messages) {
  const history = messages
    .filter((m) => typeof m.content === "string" && m.content.trim().length > 0)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const lastMessage = history.pop();
  return { history, lastMessage };
}

/**
 * Stream a Gemini reply for the given history + latest user prompt.
 * Yields text chunks as they arrive.
 */
export async function* streamChatReply(history, userPrompt) {
  if (!env.geminiApiKey) {
    throw new Error("Gemini API key is not configured. Set GEMINI_API_KEY in .env");
  }

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: env.geminiModel,
    systemInstruction: env.systemPrompt,
  });

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(userPrompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}
