import { Router } from "express";
import healthRoutes from "./health.routes.js";
import chatRoutes from "./chat.routes.js";
import userRoutes from "./user.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

router.use("/", healthRoutes);
router.use("/api/chat", chatRoutes);
router.use("/api/users", userRoutes);
router.use("/api/admin", adminRoutes);

export default router;
