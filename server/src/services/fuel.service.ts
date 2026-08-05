import type { SupabaseClient } from "@supabase/supabase-js";
import { FillupsRepository } from "../repositories/fillups.repository.js";
import { MonthsRepository } from "../repositories/months.repository.js";
import type { FuelFillupWithDerived, MonthlyFuelSummary } from "../types/domain.js";

function monthDateRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export class FuelService {
  private readonly fillups: FillupsRepository;
  private readonly months: MonthsRepository;

  constructor(db: SupabaseClient, userId: string) {
    this.fillups = new FillupsRepository(db, userId);
    this.months = new MonthsRepository(db, userId);
  }

  /**
   * Derives distance-since-last, mileage (km/l), and cost/km for every fillup,
   * in odometer order. Because these are computed on read rather than stored,
   * editing an earlier fillup automatically changes every later calculation
   * the next time this is called — there is nothing to "re-save".
   */
  async fillupsWithDerived(): Promise<FuelFillupWithDerived[]> {
    const all = await this.fillups.listAll();
    let previousOdometer: number | null = null;

    return all.map((fillup) => {
      const distanceSinceLast = previousOdometer === null ? null : Number(fillup.odometer) - previousOdometer;
      const mileageKmpl =
        distanceSinceLast !== null && distanceSinceLast > 0 ? distanceSinceLast / Number(fillup.litres) : null;
      const costPerKm =
        distanceSinceLast !== null && distanceSinceLast > 0 ? Number(fillup.amount_paid) / distanceSinceLast : null;

      previousOdometer = Number(fillup.odometer);

      return { ...fillup, distanceSinceLast, mileageKmpl, costPerKm };
    });
  }

  /**
   * Monthly fuel summary built from fillups that fall within the calendar month.
   * Distance for the month is measured from the last fillup at/before the
   * month started to the last fillup within the month, so partial-month
   * refuels are handled correctly. Falls back to the month's manual entry
   * when no fillups exist.
   */
  async monthlySummary(year: number, month: number): Promise<MonthlyFuelSummary> {
    const { start, end } = monthDateRange(year, month);
    const derived = await this.fillupsWithDerived();
    const inMonth = derived.filter((f) => f.date >= start && f.date <= end);

    if (inMonth.length === 0) {
      const months = await this.months.list();
      const monthRow = months.find((m) => m.year === year && m.month === month);
      const manual = monthRow?.manual_fuel_cost ?? null;
      return {
        totalFuelCost: manual ?? 0,
        totalDistance: 0,
        totalLitres: 0,
        averageMileage: null,
        averageFuelCostPerKm: null,
        isManualEntry: manual !== null,
      };
    }

    const totalFuelCost = inMonth.reduce((sum, f) => sum + Number(f.amount_paid), 0);
    const totalLitres = inMonth.reduce((sum, f) => sum + Number(f.litres), 0);
    const totalDistance = inMonth.reduce((sum, f) => sum + (f.distanceSinceLast ?? 0), 0);

    return {
      totalFuelCost,
      totalDistance,
      totalLitres,
      averageMileage: totalLitres > 0 ? totalDistance / totalLitres : null,
      averageFuelCostPerKm: totalDistance > 0 ? totalFuelCost / totalDistance : null,
      isManualEntry: false,
    };
  }

  async yearlySummary(year: number): Promise<MonthlyFuelSummary> {
    const monthly = await Promise.all(
      Array.from({ length: 12 }, (_, i) => i + 1).map((m) => this.monthlySummary(year, m))
    );
    const totalFuelCost = monthly.reduce((s, m) => s + m.totalFuelCost, 0);
    const totalDistance = monthly.reduce((s, m) => s + m.totalDistance, 0);
    const totalLitres = monthly.reduce((s, m) => s + m.totalLitres, 0);
    return {
      totalFuelCost,
      totalDistance,
      totalLitres,
      averageMileage: totalLitres > 0 ? totalDistance / totalLitres : null,
      averageFuelCostPerKm: totalDistance > 0 ? totalFuelCost / totalDistance : null,
      isManualEntry: false,
    };
  }
}
