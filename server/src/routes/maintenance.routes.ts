import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { maintenanceCreateSchema, maintenanceUpdateSchema } from "../validations/schemas.js";
import {
  createMaintenance,
  deleteMaintenance,
  listMaintenance,
  updateMaintenance,
} from "../controllers/maintenance.controller.js";
import { getChainServiceTracker } from "../controllers/chainService.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", listMaintenance);
router.post("/", validateBody(maintenanceCreateSchema), createMaintenance);
router.patch("/:id", validateBody(maintenanceUpdateSchema), updateMaintenance);
router.delete("/:id", deleteMaintenance);
router.get("/chain-tracker", getChainServiceTracker);

export default router;
