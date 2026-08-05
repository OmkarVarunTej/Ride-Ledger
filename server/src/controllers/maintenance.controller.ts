import type { AuthedRequest } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MaintenanceRepository } from "../repositories/maintenance.repository.js";

export const listMaintenance = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new MaintenanceRepository(req.db, req.userId);
  const data = await repo.listAll();
  res.json({ data });
});

export const createMaintenance = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new MaintenanceRepository(req.db, req.userId);
  const entry = await repo.create(req.body);
  res.status(201).json({ data: entry });
});

export const updateMaintenance = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new MaintenanceRepository(req.db, req.userId);
  const entry = await repo.update(req.params.id, req.body);
  res.json({ data: entry });
});

export const deleteMaintenance = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new MaintenanceRepository(req.db, req.userId);
  await repo.remove(req.params.id);
  res.status(204).send();
});
