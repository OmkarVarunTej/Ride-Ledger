import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { fillupCreateSchema, fillupUpdateSchema } from "../validations/schemas.js";
import {
  createFillup,
  deleteFillup,
  listFillups,
  monthlyFuelSummary,
  updateFillup,
  yearlyFuelSummary,
} from "../controllers/fillups.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", listFillups);
router.post("/", validateBody(fillupCreateSchema), createFillup);
router.patch("/:id", validateBody(fillupUpdateSchema), updateFillup);
router.delete("/:id", deleteFillup);
router.get("/summary/monthly/:year/:month", monthlyFuelSummary);
router.get("/summary/yearly/:year", yearlyFuelSummary);

export default router;
