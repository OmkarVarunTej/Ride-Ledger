import type { AuthedRequest } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { FuelSharingService } from "../services/fuelSharing.service.js";

export const listFuelSharing = asyncHandler<AuthedRequest>(async (req, res) => {
  const service = new FuelSharingService(req.db, req.userId);
  const data = await service.listByMonth(req.params.monthId);
  res.json({ data });
});

export const createFuelSharing = asyncHandler<AuthedRequest>(async (req, res) => {
  const service = new FuelSharingService(req.db, req.userId);
  const entry = await service.create(req.body);
  res.status(201).json({ data: entry });
});

export const updateFuelSharing = asyncHandler<AuthedRequest>(async (req, res) => {
  const service = new FuelSharingService(req.db, req.userId);
  const entry = await service.update(req.params.id, req.body);
  res.json({ data: entry });
});

export const deleteFuelSharing = asyncHandler<AuthedRequest>(async (req, res) => {
  const service = new FuelSharingService(req.db, req.userId);
  await service.remove(req.params.id);
  res.status(204).send();
});
