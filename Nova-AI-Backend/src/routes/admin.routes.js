import { Router } from "express";
import { requireAdmin } from "../middleware/admin.middleware.js";
import {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getConversations,
  getConversationMessages,
  deleteConversation,
  getAIUsage,
} from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Dashboard overview — totals + daily chart data + active users + recent feeds.
 */
router.get("/stats", getStats);

/**
 * GET /api/admin/users
 * All users with conversation & message counts and last active date.
 */
router.get("/users", getUsers);

/**
 * PUT /api/admin/users/:id/role
 * PATCH /api/admin/users/:id/role
 * Update user role ('admin' | 'user').
 */
router.put("/users/:id/role", updateUserRole);
router.patch("/users/:id/role", updateUserRole);

/**
 * DELETE /api/admin/users/:id
 * Delete a user and cascade their data.
 */
router.delete("/users/:id", deleteUser);

/**
 * GET /api/admin/conversations?page=1&limit=20&search=...&userId=...
 * Paginated and searchable conversations list.
 */
router.get("/conversations", getConversations);

/**
 * GET /api/admin/conversations/:id/messages
 * All messages for a specific conversation.
 */
router.get("/conversations/:id/messages", getConversationMessages);

/**
 * DELETE /api/admin/conversations/:id
 * Delete a conversation and its messages.
 */
router.delete("/conversations/:id", deleteConversation);

/**
 * GET /api/admin/ai-usage?days=7|14|30
 * AI usage statistics + daily chart + top users.
 */
router.get("/ai-usage", getAIUsage);

export default router;
