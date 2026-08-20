import { Router } from "express";
import healthRoutes from "./health.routes.js";
import chatRoutes from "./chat.routes.js";

const router = Router();

router.use("/", healthRoutes);
router.use("/api/chat", chatRoutes);

export default router;
