import { env } from "../config/env.js";

/**
 * POST one chat turn to the convo-admin dashboard.
 * Never throws — logging must not affect /api/chat.
 */
export async function logChatTurn({
  sessionId,
  prompt,
  response,
  userIdentifier,
  metadata,
}) {
  const session_id = typeof sessionId === "string" ? sessionId.trim() : "";
  const promptText = typeof prompt === "string" ? prompt.trim() : "";
  const responseText = typeof response === "string" ? response.trim() : "";

  if (!session_id || !promptText || !responseText) {
    return;
  }

  const url = env.convoAdminUrl;
  if (!url) {
    return;
  }

  const body = {
    session_id,
    prompt: promptText,
    response: responseText,
  };

  if (typeof userIdentifier === "string" && userIdentifier.trim()) {
    body.user_identifier = userIdentifier.trim();
  }

  if (metadata && typeof metadata === "object") {
    body.metadata = metadata;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.warn(
        `[convo-admin] POST failed (${res.status}): ${detail.slice(0, 200)}`
      );
    }
  } catch (error) {
    const cause = error?.cause;
    const detail = [
      error?.message,
      cause?.code,
      cause?.message,
      cause?.hostname || cause?.host,
    ]
      .filter(Boolean)
      .join(" | ");
    console.warn(`[convo-admin] POST failed: ${detail || error}`);
  }
}
