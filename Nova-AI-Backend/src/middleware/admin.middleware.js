import { requireAuth } from "./auth.middleware.js";
import { supabaseAdmin } from "../services/supabase.service.js";

/**
 * Middleware: Requires valid JWT AND admin role in public.users.
 * Chains requireAuth first, then checks the role column.
 *
 * Usage: router.get("/admin-only", requireAdmin, handler)
 */
export async function requireAdmin(req, res, next) {
  // First run the standard auth check
  requireAuth(req, res, async (authErr) => {
    if (authErr) return; // requireAuth already sent 401

    try {
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", req.user.id)
        .single();

      if (error || !data) {
        return res
          .status(403)
          .json({ error: "Forbidden: User profile not found." });
      }

      if (data.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Forbidden: Admin access required." });
      }

      next();
    } catch (err) {
      console.error("[admin.middleware] Error checking role:", err?.message);
      return res.status(500).json({ error: "Internal server error." });
    }
  });
}
