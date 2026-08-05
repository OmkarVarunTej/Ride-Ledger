import { Router } from "express";
import { validateBody } from "../middlewares/validate.js";
import { expenseCreateSchema, expenseUpdateSchema } from "../validations/schemas.js";
import { createExpense, deleteExpense, listExpenses, updateExpense } from "../controllers/expenses.controller.js";

const router = Router({ mergeParams: true });

router.get("/", listExpenses);
router.post("/", (req, _res, next) => {
  req.body.monthId = req.params.monthId;
  next();
}, validateBody(expenseCreateSchema), createExpense);
router.patch("/:id", validateBody(expenseUpdateSchema), updateExpense);
router.delete("/:id", deleteExpense);

export default router;
