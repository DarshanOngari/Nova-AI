import { Router } from "express";
import { requireAdmin } from "../middleware/admin.middleware.js";
import {
  getStats,
  getUsers,
  getConversations,
  getConversationMessages,
  getAIUsage,
} from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Dashboard overview — totals + daily chart data.
 */
router.get("/stats", getStats);

/**
 * GET /api/admin/users
 * All users with conversation & message counts.
 */
router.get("/users", getUsers);

/**
 * GET /api/admin/conversations?page=1&limit=20
 * Paginated conversations list.
 */
router.get("/conversations", getConversations);

/**
 * GET /api/admin/conversations/:id/messages
 * All messages for a specific conversation.
 */
router.get("/conversations/:id/messages", getConversationMessages);

/**
 * GET /api/admin/ai-usage
 * AI usage statistics + daily chart.
 */
router.get("/ai-usage", getAIUsage);

export default router;
