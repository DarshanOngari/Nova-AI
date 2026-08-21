import { supabaseAdmin } from "../services/supabase.service.js";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const USERNAME_MIN = 3;
const USERNAME_MAX = 20;

/**
 * GET /api/users/check-username?username=xyz
 * Public — no auth required.
 * Returns { available: bool, message: string }
 */
export async function checkUsername(req, res) {
  const { username } = req.query;

  if (!username || typeof username !== "string") {
    return res.status(400).json({
      available: false,
      message: "Username query parameter is required.",
    });
  }

  const trimmed = username.trim();

  // Format validation
  if (trimmed.length < USERNAME_MIN) {
    return res.json({
      available: false,
      message: `Username must be at least ${USERNAME_MIN} characters.`,
    });
  }
  if (trimmed.length > USERNAME_MAX) {
    return res.json({
      available: false,
      message: `Username must be at most ${USERNAME_MAX} characters.`,
    });
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return res.json({
      available: false,
      message: "Username can only contain letters, numbers, and underscores.",
    });
  }

  try {
    // Case-insensitive availability check using the unique lower() index
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id")
      .ilike("username", trimmed)
      .maybeSingle();

    if (error) {
      console.error("[checkUsername] Supabase error:", error.message);
      return res.status(500).json({ available: false, message: "Server error. Please try again." });
    }

    if (data) {
      return res.json({ available: false, message: "Username is already taken." });
    }

    return res.json({ available: true, message: "Username is available!" });
  } catch (err) {
    console.error("[checkUsername] Unexpected error:", err?.message);
    return res.status(500).json({ available: false, message: "Server error. Please try again." });
  }
}

/**
 * GET /api/users/me
 * Protected — requires valid JWT Bearer token.
 * Returns the authenticated user's profile from public.users.
 */
export async function getMe(req, res) {
  const userId = req.user?.id;

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, username, email, role, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "User profile not found." });
  }

  return res.json({ user: data });
}

/**
 * PATCH /api/users/me
 * Protected — requires valid JWT Bearer token.
 * Body: { username?: string }
 * Allows updating username only.
 */
export async function updateMe(req, res) {
  const userId = req.user?.id;
  const { username } = req.body;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Username is required." });
  }

  const trimmed = username.trim();

  if (trimmed.length < USERNAME_MIN || trimmed.length > USERNAME_MAX || !USERNAME_REGEX.test(trimmed)) {
    return res.status(400).json({
      error: `Username must be ${USERNAME_MIN}-${USERNAME_MAX} characters, letters, numbers, and underscores only.`,
    });
  }

  // Check availability (exclude own)
  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .ilike("username", trimmed)
    .neq("id", userId)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({ error: "Username is already taken." });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ username: trimmed, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select("id, username, email, role, updated_at")
    .single();

  if (error) {
    console.error("[updateMe] Supabase error:", error.message);
    return res.status(500).json({ error: "Failed to update profile." });
  }

  return res.json({ user: data });
}

/**
 * GET /api/users/:username
 * Public — returns a user's public profile by username.
 */
export async function getUserByUsername(req, res) {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: "Username parameter is required." });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, username, role, created_at")
    .ilike("username", username.trim())
    .maybeSingle();

  if (error) {
    console.error("[getUserByUsername] Supabase error:", error.message);
    return res.status(500).json({ error: "Server error." });
  }

  if (!data) {
    return res.status(404).json({ error: "User not found." });
  }

  return res.json({ user: data });
}
