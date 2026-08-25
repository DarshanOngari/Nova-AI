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

/** GET /api/admin/stats?days=N */
export function fetchAdminStats(days = 7) {
  return adminFetch(`/api/admin/stats?days=${days}`);
}

/** GET /api/admin/users */
export function fetchAdminUsers() {
  return adminFetch("/api/admin/users");
}

/** PUT /api/admin/users/:id/role */
export function updateUserRole(userId, role) {
  return adminFetch(`/api/admin/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}

/** DELETE /api/admin/users/:id */
export function deleteAdminUser(userId) {
  return adminFetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });
}

/** GET /api/admin/conversations?page=N&limit=N&search=...&userId=... */
export function fetchAdminConversations(page = 1, limit = 20, search = "", userId = "") {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.append("search", search);
  if (userId) params.append("userId", userId);

  return adminFetch(`/api/admin/conversations?${params.toString()}`);
}

/** GET /api/admin/conversations/:id/messages */
export function fetchAdminConversationMessages(id) {
  return adminFetch(`/api/admin/conversations/${id}/messages`);
}

/** DELETE /api/admin/conversations/:id */
export function deleteAdminConversation(id) {
  return adminFetch(`/api/admin/conversations/${id}`, {
    method: "DELETE",
  });
}

/** GET /api/admin/ai-usage?days=N */
export function fetchAdminAIUsage(days = 7) {
  return adminFetch(`/api/admin/ai-usage?days=${days}`);
}
