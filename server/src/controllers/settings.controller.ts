import type { AuthedRequest } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { SettingsRepository } from "../repositories/settings.repository.js";

export const getSettings = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new SettingsRepository(req.db, req.userId);
  const data = await repo.get();
  res.json({ data });
});

export const updateSettings = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new SettingsRepository(req.db, req.userId);
  const data = await repo.update(req.body);
  res.json({ data });
});
