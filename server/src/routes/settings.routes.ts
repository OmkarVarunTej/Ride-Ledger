import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { settingsUpdateSchema } from "../validations/schemas.js";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", getSettings);
router.patch("/", validateBody(settingsUpdateSchema), updateSettings);

export default router;
