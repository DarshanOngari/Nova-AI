import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

const MIME_EXTENSION_MAP = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  pdf: "application/pdf",
  txt: "text/plain",
  md: "text/markdown",
  markdown: "text/markdown",
  csv: "text/csv",
  json: "application/json",
  js: "text/javascript",
  jsx: "text/javascript",
  ts: "text/plain",
  tsx: "text/plain",
  py: "text/plain",
  html: "text/html",
  htm: "text/html",
  css: "text/css",
  xml: "text/xml",
};

/**
 * Infer MIME type from filename extension if mediaType is missing or generic.
 */
function resolveMimeType(mediaType, filename = "") {
  if (mediaType && mediaType !== "application/octet-stream") {
    return mediaType;
  }
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return MIME_EXTENSION_MAP[ext] || mediaType || "application/octet-stream";
}

/**
 * Convert a client attachment object to a Gemini part.
 * Supports:
 * - Images (image/*): inlineData
 * - PDF documents (application/pdf): inlineData
 * - Text / code / CSV / JSON documents: decoded formatted text part
 * - Other binary formats: inlineData
 */
function convertAttachmentToPart(attachment) {
  if (!attachment) return null;

  let mimeType = resolveMimeType(attachment.mediaType, attachment.filename);
  let base64Data = attachment.data || "";

  if (typeof attachment.url === "string" && attachment.url.startsWith("data:")) {
    const match = attachment.url.match(/^data:([^;]+);base64,(.+)$/s);
    if (match) {
      mimeType = resolveMimeType(match[1].trim(), attachment.filename);
      base64Data = match[2].trim();
    }
  }

  if (!base64Data) {
    return null;
  }

  const isTextDocument =
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/javascript" ||
    mimeType === "text/csv";

  if (isTextDocument) {
    try {
      const decodedText = Buffer.from(base64Data, "base64").toString("utf-8");
      const label = attachment.filename ? `[Document: ${attachment.filename}]` : "[Document]";
      return {
        text: `${label}\n\`\`\`\n${decodedText}\n\`\`\``,
      };
    } catch {
      // Fall through to inlineData if decode fails
    }
  }

  return {
    inlineData: {
      mimeType,
      data: base64Data,
    },
  };
}

/**
 * Convert client messages into Gemini chat history + the latest user prompt parts.
 * Gemini uses "user" / "model" roles (not "assistant").
 */
export function buildGeminiHistory(messages) {
  const history = [];

  for (const m of messages) {
    const parts = [];

    // Add attachments if present
    if (Array.isArray(m.attachments)) {
      for (const att of m.attachments) {
        const part = convertAttachmentToPart(att);
        if (part) {
          parts.push(part);
        }
      }
    }

    // Add text content if present
    if (typeof m.content === "string" && m.content.trim().length > 0) {
      parts.push({ text: m.content.trim() });
    }

    // If only attachments were provided by user without text, supply default instruction
    if (parts.length > 0 && !parts.some((p) => p.text) && m.role !== "assistant") {
      parts.push({
        text: "Please analyze and explain the attached image(s) or document(s).",
      });
    }

    if (parts.length > 0) {
      history.push({
        role: m.role === "assistant" ? "model" : "user",
        parts,
      });
    }
  }

  const lastMessage = history.pop();
  return { history, lastMessage };
}

/**
 * Stream a Gemini reply for the given history + latest user prompt or parts.
 * Yields text chunks as they arrive.
 */
export async function* streamChatReply(history, userPromptOrParts) {
  if (!env.geminiApiKey) {
    throw new Error("Gemini API key is not configured. Set GEMINI_API_KEY in .env");
  }

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: env.geminiModel,
    systemInstruction: env.systemPrompt,
  });

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(userPromptOrParts);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

