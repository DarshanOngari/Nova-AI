import { supabaseAnon } from "../services/supabase.service.js";

/**
 * Middleware: Validates Supabase JWT from Authorization header.
 * Attaches `req.user` if the token is valid, else returns 401.
 *
 * Usage: router.get("/protected", requireAuth, handler)
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Missing or invalid Authorization header." });
  }

  const token = authHeader.slice(7); // Strip "Bearer "

  try {
    const {
      data: { user },
      error,
    } = await supabaseAnon.auth.getUser(token);

    if (error || !user) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid or expired token." });
    }

    req.user = user; // Attach Supabase user to request
    next();
  } catch (err) {
    console.error("[auth.middleware] Error verifying token:", err?.message);
    return res.status(500).json({ error: "Internal server error during authentication." });
  }
}
