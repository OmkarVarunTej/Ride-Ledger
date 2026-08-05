import type { SupabaseClient } from "@supabase/supabase-js";
import { FuelSharingRepository, type FuelSharingCreateInput } from "../repositories/fuelSharing.repository.js";
import type { FuelSharingResult, FuelSharingRow } from "../types/domain.js";

/**
 * Pure calculation, kept separate from persistence so it can be unit-tested
 * and reused (e.g. by the ledger engine) without hitting the database.
 *
 *   totalKm        = vehicleDays * avgKmPerDay
 *   fuelCost        = totalKm * fuelCostPerKm
 *   costPerDay      = fuelCost / vehicleDays
 *   sharedCost       = costPerDay / 2                (cost for a day both used it)
 *   remainingDays   = vehicleDays - person2Days       (days Person1 used it alone)
 *   person1Fuel     = sharedCost * person2Days + costPerDay * remainingDays
 *   person2Fuel     = sharedCost * person2Days        (Person2 owes half of the shared days)
 */
export function computeFuelSharing(row: FuelSharingRow): FuelSharingResult {
  const vehicleDays = Number(row.vehicle_days);
  const person2Days = Number(row.person2_days);
  const avgKmPerDay = Number(row.avg_km_per_day);
  const fuelCostPerKm = Number(row.fuel_cost_per_km);

  const totalKm = vehicleDays * avgKmPerDay;
  const fuelCost = totalKm * fuelCostPerKm;
  const costPerDay = vehicleDays > 0 ? fuelCost / vehicleDays : 0;
  const sharedCost = costPerDay / 2;
  const remainingDays = Math.max(vehicleDays - person2Days, 0);

  const person2Fuel = sharedCost * person2Days;
  const person1Fuel = sharedCost * person2Days + costPerDay * remainingDays;

  return { ...row, totalKm, fuelCost, costPerDay, sharedCost, remainingDays, person1Fuel, person2Fuel };
}

export class FuelSharingService {
  private readonly repo: FuelSharingRepository;

  constructor(db: SupabaseClient, userId: string) {
    this.repo = new FuelSharingRepository(db, userId);
  }

  async listByMonth(monthId: string): Promise<FuelSharingResult[]> {
    const rows = await this.repo.listByMonth(monthId);
    return rows.map(computeFuelSharing);
  }

  /** Total Person2 reimbursement owed for a month — feeds directly into the ledger. */
  async person2ReimbursementForMonth(monthId: string): Promise<number> {
    const results = await this.listByMonth(monthId);
    return results.reduce((sum, r) => sum + r.person2Fuel, 0);
  }

  async create(input: FuelSharingCreateInput): Promise<FuelSharingResult> {
    const row = await this.repo.create(input);
    return computeFuelSharing(row);
  }

  async update(id: string, input: Partial<Omit<FuelSharingCreateInput, "monthId">>): Promise<FuelSharingResult> {
    const row = await this.repo.update(id, input);
    return computeFuelSharing(row);
  }

  async remove(id: string): Promise<void> {
    await this.repo.remove(id);
  }
}
