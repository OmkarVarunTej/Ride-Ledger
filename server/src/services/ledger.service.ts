import type { SupabaseClient } from "@supabase/supabase-js";
import { MonthsRepository } from "../repositories/months.repository.js";
import { IncomeRepository } from "../repositories/income.repository.js";
import { ExpensesRepository } from "../repositories/expenses.repository.js";
import { SettingsRepository } from "../repositories/settings.repository.js";
import { MoneyToReceiveRepository } from "../repositories/moneyToReceive.repository.js";
import { FuelService } from "./fuel.service.js";
import { FuelSharingService } from "./fuelSharing.service.js";
import type { MonthlyLedger } from "../types/domain.js";
import { NotFoundError } from "../utils/errors.js";

/**
 * The ledger is never persisted. Opening balance, closing balance, and every
 * total are recomputed from raw rows (income, expenses, fillups, sharing
 * entries, received receivables) every time this service runs.
 *
 * Closing = Opening + Income - FuelCost + Person2Reimbursement + ReceivedReceivables - OtherExpenses
 * Opening(month N) = Closing(month N-1), Opening(first month) = initial_balance (from user_settings)
 */
export class LedgerService {
  private readonly months: MonthsRepository;
  private readonly income: IncomeRepository;
  private readonly expenses: ExpensesRepository;
  private readonly fuel: FuelService;
  private readonly sharing: FuelSharingService;
  private readonly moneyToReceive: MoneyToReceiveRepository;
  private readonly settings: SettingsRepository;

  constructor(db: SupabaseClient, userId: string) {
    this.months = new MonthsRepository(db, userId);
    this.income = new IncomeRepository(db, userId);
    this.expenses = new ExpensesRepository(db, userId);
    this.fuel = new FuelService(db, userId);
    this.sharing = new FuelSharingService(db, userId);
    this.moneyToReceive = new MoneyToReceiveRepository(db, userId);
    this.settings = new SettingsRepository(db, userId);
  }

  /** Computes the ledger for every month the user has created, in chronological order. */
  async computeAllLedgers(): Promise<MonthlyLedger[]> {
    const [months, settingsRow] = await Promise.all([
      this.months.list(), // already sorted year, month ascending
      this.settings.get().catch(() => null),
    ]);
    const ledgers: MonthlyLedger[] = [];
    let runningOpeningBalance = settingsRow?.initial_balance ? Number(settingsRow.initial_balance) : 0;

    for (const monthRow of months) {
      const [incomeTotal, fuelSummary, person2SharingReimbursement, moneyToReceiveReimbursement, expenseTotal] =
        await Promise.all([
          this.income.sumByMonth(monthRow.id),
          this.fuel.monthlySummary(monthRow.year, monthRow.month),
          this.sharing.person2ReimbursementForMonth(monthRow.id),
          this.moneyToReceive.sumReceivedByMonth(monthRow.id),
          this.expenses.sumByMonth(monthRow.id),
        ]);

      const reimbursement = person2SharingReimbursement + moneyToReceiveReimbursement;

      const openingBalance = runningOpeningBalance;
      const closingBalance =
        openingBalance + incomeTotal - fuelSummary.totalFuelCost + reimbursement - expenseTotal;

      ledgers.push({
        monthId: monthRow.id,
        year: monthRow.year,
        month: monthRow.month,
        openingBalance,
        income: incomeTotal,
        fuelCost: fuelSummary.totalFuelCost,
        person2Reimbursement: reimbursement,
        otherExpenses: expenseTotal,
        closingBalance,
      });

      runningOpeningBalance = closingBalance;
    }

    return ledgers;
  }

  async ledgerForMonth(monthId: string): Promise<MonthlyLedger> {
    const all = await this.computeAllLedgers();
    const found = all.find((l) => l.monthId === monthId);
    if (!found) throw new NotFoundError("Month ledger");
    return found;
  }

  /** The most recent month's closing balance — the headline "Current Balance" dashboard figure. */
  async currentBalance(): Promise<number> {
    const all = await this.computeAllLedgers();
    if (all.length === 0) return 0;
    return all[all.length - 1].closingBalance;
  }
}
