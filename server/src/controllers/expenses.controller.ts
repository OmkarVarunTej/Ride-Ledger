import type { AuthedRequest } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ExpensesRepository } from "../repositories/expenses.repository.js";

export const listExpenses = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new ExpensesRepository(req.db, req.userId);
  const [data, categoryTotals] = await Promise.all([
    repo.listByMonth(req.params.monthId),
    repo.categoryTotals(req.params.monthId),
  ]);
  res.json({ data, total: data.reduce((s, r) => s + Number(r.amount), 0), categoryTotals });
});

export const createExpense = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new ExpensesRepository(req.db, req.userId);
  const entry = await repo.create(req.body);
  res.status(201).json({ data: entry });
});

export const updateExpense = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new ExpensesRepository(req.db, req.userId);
  const entry = await repo.update(req.params.id, req.body);
  res.json({ data: entry });
});

export const deleteExpense = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new ExpensesRepository(req.db, req.userId);
  await repo.remove(req.params.id);
  res.status(204).send();
});
