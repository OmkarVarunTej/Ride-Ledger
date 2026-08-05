import { Router } from "express";
import { validateBody } from "../middlewares/validate.js";
import { incomeCreateSchema, incomeUpdateSchema } from "../validations/schemas.js";
import { createIncome, deleteIncome, listIncome, updateIncome } from "../controllers/income.controller.js";

const router = Router({ mergeParams: true });

router.get("/", listIncome);
router.post("/", (req, _res, next) => {
  req.body.monthId = req.params.monthId;
  next();
}, validateBody(incomeCreateSchema), createIncome);
router.patch("/:id", validateBody(incomeUpdateSchema), updateIncome);
router.delete("/:id", deleteIncome);

export default router;
