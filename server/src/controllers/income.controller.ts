import type { AuthedRequest } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { IncomeRepository } from "../repositories/income.repository.js";

export const listIncome = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new IncomeRepository(req.db, req.userId);
  const data = await repo.listByMonth(req.params.monthId);
  res.json({ data, total: data.reduce((s, r) => s + Number(r.amount), 0) });
});

export const createIncome = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new IncomeRepository(req.db, req.userId);
  const entry = await repo.create(req.body);
  res.status(201).json({ data: entry });
});

export const updateIncome = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new IncomeRepository(req.db, req.userId);
  const entry = await repo.update(req.params.id, req.body);
  res.json({ data: entry });
});

export const deleteIncome = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new IncomeRepository(req.db, req.userId);
  await repo.remove(req.params.id);
  res.status(204).send();
});
