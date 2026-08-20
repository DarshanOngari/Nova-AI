import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Nova AI Backend is running 🚀" });
});

export default router;
