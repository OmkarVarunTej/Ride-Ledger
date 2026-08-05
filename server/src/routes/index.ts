import { Router } from "express";
import monthsRoutes from "./months.routes.js";
import fillupsRoutes from "./fillups.routes.js";
import maintenanceRoutes from "./maintenance.routes.js";
import settingsRoutes from "./settings.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = Router();

router.use("/months", monthsRoutes);
router.use("/fuel-fillups", fillupsRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/settings", settingsRoutes);
router.use("/dashboard", dashboardRoutes);

router.get("/health", (_req, res) => res.json({ status: "ok" }));

export default router;
