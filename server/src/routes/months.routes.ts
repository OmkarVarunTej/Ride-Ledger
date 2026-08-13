import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { monthCreateSchema, monthUpdateSchema } from "../validations/schemas.js";
import { createMonth, deleteMonth, getMonth, listMonths, updateMonth } from "../controllers/months.controller.js";
import incomeRoutes from "./income.routes.js";
import expensesRoutes from "./expenses.routes.js";
import fuelSharingRoutes from "./fuelSharing.routes.js";
import moneyToReceiveRouter from "./moneyToReceive.router.js";

const router = Router();
router.use(requireAuth);

router.get("/", listMonths);
router.post("/", validateBody(monthCreateSchema), createMonth);
router.get("/:id", getMonth);
router.patch("/:id", validateBody(monthUpdateSchema), updateMonth);
router.delete("/:id", deleteMonth);

router.use("/:monthId/income", incomeRoutes);
router.use("/:monthId/expenses", expensesRoutes);
router.use("/:monthId/fuel-sharing", fuelSharingRoutes);
router.use("/:monthId/money-to-receive", moneyToReceiveRouter);

export default router;
