import { Router } from "express";
import { validateBody } from "../middlewares/validate.js";
import { moneyToReceiveCreateSchema, moneyToReceiveUpdateSchema } from "../validations/schemas.js";
import {
  createMoneyToReceive,
  deleteMoneyToReceive,
  listMoneyToReceive,
  updateMoneyToReceive,
} from "../controllers/moneyToReceive.controller.js";

const router = Router({ mergeParams: true });

router.get("/", listMoneyToReceive);
router.post(
  "/",
  (req, _res, next) => {
    req.body.monthId = req.params.monthId;
    next();
  },
  validateBody(moneyToReceiveCreateSchema),
  createMoneyToReceive
);
router.patch("/:id", validateBody(moneyToReceiveUpdateSchema), updateMoneyToReceive);
router.delete("/:id", deleteMoneyToReceive);

export default router;
