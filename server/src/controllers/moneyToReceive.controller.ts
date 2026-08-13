import type { AuthedRequest } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MoneyToReceiveRepository } from "../repositories/moneyToReceive.repository.js";

export const listMoneyToReceive = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new MoneyToReceiveRepository(req.db, req.userId);
  const data = await repo.listByMonth(req.params.monthId);
  res.json({ data });
});

export const createMoneyToReceive = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new MoneyToReceiveRepository(req.db, req.userId);
  const entry = await repo.create({ ...req.body, monthId: req.params.monthId });
  res.status(201).json({ data: entry });
});

export const updateMoneyToReceive = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new MoneyToReceiveRepository(req.db, req.userId);
  const entry = await repo.update(req.params.id, req.body);
  res.json({ data: entry });
});

export const deleteMoneyToReceive = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new MoneyToReceiveRepository(req.db, req.userId);
  await repo.remove(req.params.id);
  res.status(204).send();
});
