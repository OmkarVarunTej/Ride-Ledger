import type { AuthedRequest } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MonthsRepository } from "../repositories/months.repository.js";
import { LedgerService } from "../services/ledger.service.js";

export const listMonths = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new MonthsRepository(req.db, req.userId);
  const ledger = new LedgerService(req.db, req.userId);
  const [months, ledgers] = await Promise.all([repo.list(), ledger.computeAllLedgers()]);
  const merged = months.map((m) => ({ ...m, ledger: ledgers.find((l) => l.monthId === m.id) ?? null }));
  res.json({ data: merged });
});

export const getMonth = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new MonthsRepository(req.db, req.userId);
  const ledger = new LedgerService(req.db, req.userId);
  const [month, monthLedger] = await Promise.all([
    repo.getById(req.params.id),
    ledger.ledgerForMonth(req.params.id),
  ]);
  res.json({ data: { ...month, ledger: monthLedger } });
});

export const createMonth = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new MonthsRepository(req.db, req.userId);
  const month = await repo.create(req.body);
  res.status(201).json({ data: month });
});

export const updateMonth = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new MonthsRepository(req.db, req.userId);
  const month = await repo.update(req.params.id, req.body);
  res.json({ data: month });
});

export const deleteMonth = asyncHandler<AuthedRequest>(async (req, res) => {
  const repo = new MonthsRepository(req.db, req.userId);
  await repo.remove(req.params.id);
  res.status(204).send();
});
