import type { AuthedRequest } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { FillupsRepository } from "../repositories/fillups.repository.js";
import { FuelService } from "../services/fuel.service.js";

export const listFillups = asyncHandler<AuthedRequest>(async (req, res) => {
  const fuel = new FuelService(req.db, req.userId);
  const data = await fuel.fillupsWithDerived();
  // most recent first for the UI, while the service computed them in odometer order
  res.json({ data: [...data].reverse() });
});

export const monthlyFuelSummary = asyncHandler<AuthedRequest>(async (req, res) => {
  const fuel = new FuelService(req.db, req.userId);
  const { year, month } = req.params;
  const summary = await fuel.monthlySummary(Number(year), Number(month));
  res.json({ data: summary });
});

export const yearlyFuelSummary = asyncHandler<AuthedRequest>(async (req, res) => {
  const fuel = new FuelService(req.db, req.userId);
  const summary = await fuel.yearlySummary(Number(req.params.year));
  res.json({ data: summary });
});

export const createFillup = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new FillupsRepository(req.db, req.userId);
  const entry = await repo.create(req.body);
  res.status(201).json({ data: entry });
});

export const updateFillup = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new FillupsRepository(req.db, req.userId);
  const entry = await repo.update(req.params.id, req.body);
  res.json({ data: entry });
});

export const deleteFillup = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new FillupsRepository(req.db, req.userId);
  await repo.remove(req.params.id);
  res.status(204).send();
});
