import { Router } from "express";
import { validateBody } from "../middlewares/validate.js";
import { fuelSharingCreateSchema, fuelSharingUpdateSchema } from "../validations/schemas.js";
import {
  createFuelSharing,
  deleteFuelSharing,
  listFuelSharing,
  updateFuelSharing,
} from "../controllers/fuelSharing.controller.js";

const router = Router({ mergeParams: true });

router.get("/", listFuelSharing);
router.post("/", (req, _res, next) => {
  req.body.monthId = req.params.monthId;
  next();
}, validateBody(fuelSharingCreateSchema), createFuelSharing);
router.patch("/:id", validateBody(fuelSharingUpdateSchema), updateFuelSharing);
router.delete("/:id", deleteFuelSharing);

export default router;
