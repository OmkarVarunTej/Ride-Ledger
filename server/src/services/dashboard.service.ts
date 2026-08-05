import type { SupabaseClient } from "@supabase/supabase-js";
import { LedgerService } from "./ledger.service.js";
import { FuelService } from "./fuel.service.js";
import { MonthsRepository } from "../repositories/months.repository.js";
import { ExpensesRepository } from "../repositories/expenses.repository.js";
import { FuelSharingService } from "./fuelSharing.service.js";

export interface DashboardSummary {
  currentBalance: number;
  currentMonth: { year: number; month: number } | null;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  currentMonthFuelCost: number;
  fuelCostPerKm: number | null;
  averageMileage: number | null;
  bikeWashCostThisMonth: number;
  fuelReimbursementPending: number;
  fuelReimbursementReceived: number;
  totalDistanceAllTime: number;
  balanceTrend: { label: string; value: number }[];
}

export class DashboardService {
  private readonly db: SupabaseClient;
  private readonly userId: string;

  constructor(db: SupabaseClient, userId: string) {
    this.db = db;
    this.userId = userId;
  }

  async summary(): Promise<DashboardSummary> {
    const months = new MonthsRepository(this.db, this.userId);
    const expenses = new ExpensesRepository(this.db, this.userId);
    const ledger = new LedgerService(this.db, this.userId);
    const fuel = new FuelService(this.db, this.userId);
    const sharing = new FuelSharingService(this.db, this.userId);

    const allMonths = await months.list();
    const latest = allMonths[allMonths.length - 1] ?? null;

    const [allLedgers, allFuelDerived] = await Promise.all([
      ledger.computeAllLedgers(),
      fuel.fillupsWithDerived(),
    ]);

    const currentBalance = allLedgers.length > 0 ? allLedgers[allLedgers.length - 1].closingBalance : 0;
    const latestLedger = allLedgers.find((l) => l.monthId === latest?.id) ?? null;

    let currentMonthFuelCost = 0;
    let fuelCostPerKm: number | null = null;
    let averageMileage: number | null = null;
    let bikeWashCostThisMonth = 0;
    let reimbursementReceived = 0;

    if (latest) {
      const monthlyFuel = await fuel.monthlySummary(latest.year, latest.month);
      currentMonthFuelCost = monthlyFuel.totalFuelCost;
      fuelCostPerKm = monthlyFuel.averageFuelCostPerKm;
      averageMileage = monthlyFuel.averageMileage;

      const categoryTotals = await expenses.categoryTotals(latest.id);
      bikeWashCostThisMonth = categoryTotals["Bike Wash"] ?? 0;

      reimbursementReceived = await sharing.person2ReimbursementForMonth(latest.id);
    }

    const totalDistanceAllTime = allFuelDerived.reduce((sum, f) => sum + (f.distanceSinceLast ?? 0), 0);

    const balanceTrend = allLedgers.slice(-12).map((l) => ({
      label: `${l.month}/${l.year}`,
      value: l.closingBalance,
    }));

    return {
      currentBalance,
      currentMonth: latest ? { year: latest.year, month: latest.month } : null,
      currentMonthIncome: latestLedger?.income ?? 0,
      currentMonthExpenses: latestLedger?.otherExpenses ?? 0,
      currentMonthFuelCost,
      fuelCostPerKm,
      averageMileage,
      bikeWashCostThisMonth,
      fuelReimbursementPending: 0,
      fuelReimbursementReceived: reimbursementReceived,
      totalDistanceAllTime,
      balanceTrend,
    };
  }
}
