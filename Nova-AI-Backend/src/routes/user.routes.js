import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  checkUsername,
  getMe,
  updateMe,
  getUserByUsername,
} from "../controllers/user.controller.js";

const router = Router();

/**
 * GET /api/users/check-username?username=xyz
 * Public — checks if a username is valid & available.
 */
router.get("/check-username", checkUsername);

/**
 * GET /api/users/me
 * Protected — returns the authenticated user's profile.
 */
router.get("/me", requireAuth, getMe);

/**
 * PATCH /api/users/me
 * Protected — updates the authenticated user's profile (username).
 */
router.patch("/me", requireAuth, updateMe);

/**
 * GET /api/users/:username
 * Public — returns a user's public profile by username.
 */
router.get("/:username", getUserByUsername);

export default router;
