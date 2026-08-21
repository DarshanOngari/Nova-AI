import { supabase } from "./supabase";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

/**
 * Helper to make authenticated requests to admin API endpoints.
 * Automatically attaches the user's JWT token.
 */
async function adminFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

/** GET /api/admin/stats */
export function fetchAdminStats() {
  return adminFetch("/api/admin/stats");
}

/** GET /api/admin/users */
export function fetchAdminUsers() {
  return adminFetch("/api/admin/users");
}

/** GET /api/admin/conversations?page=N&limit=N */
export function fetchAdminConversations(page = 1, limit = 20) {
  return adminFetch(`/api/admin/conversations?page=${page}&limit=${limit}`);
}

/** GET /api/admin/conversations/:id/messages */
export function fetchAdminConversationMessages(id) {
  return adminFetch(`/api/admin/conversations/${id}/messages`);
}

/** GET /api/admin/ai-usage */
export function fetchAdminAIUsage() {
  return adminFetch("/api/admin/ai-usage");
}
