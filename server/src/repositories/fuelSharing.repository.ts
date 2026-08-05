import type { SupabaseClient } from "@supabase/supabase-js";
import type { FuelSharingRow } from "../types/domain.js";
import { NotFoundError, AppError } from "../utils/errors.js";

export interface FuelSharingCreateInput {
  monthId: string;
  vehicleDays: number;
  person1Days: number;
  person2Days: number;
  avgKmPerDay: number;
  fuelCostPerKm: number;
  notes?: string | null;
}

export class FuelSharingRepository {
  constructor(private readonly db: SupabaseClient, private readonly userId: string) {}

  async listByMonth(monthId: string): Promise<FuelSharingRow[]> {
    const { data, error } = await this.db
      .from("fuel_sharing_entries")
      .select("*")
      .eq("user_id", this.userId)
      .eq("month_id", monthId)
      .order("created_at", { ascending: true });
    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  async getById(id: string): Promise<FuelSharingRow> {
    const { data, error } = await this.db
      .from("fuel_sharing_entries")
      .select("*")
      .eq("user_id", this.userId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new NotFoundError("Fuel sharing entry");
    return data;
  }

  async create(input: FuelSharingCreateInput): Promise<FuelSharingRow> {
    const { data, error } = await this.db
      .from("fuel_sharing_entries")
      .insert({
        user_id: this.userId,
        month_id: input.monthId,
        vehicle_days: input.vehicleDays,
        person1_days: input.person1Days,
        person2_days: input.person2Days,
        avg_km_per_day: input.avgKmPerDay,
        fuel_cost_per_km: input.fuelCostPerKm,
        notes: input.notes ?? null,
      })
      .select("*")
      .single();
    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async update(id: string, input: Partial<Omit<FuelSharingCreateInput, "monthId">>): Promise<FuelSharingRow> {
    await this.getById(id);
    const { data, error } = await this.db
      .from("fuel_sharing_entries")
      .update({
        ...(input.vehicleDays !== undefined ? { vehicle_days: input.vehicleDays } : {}),
        ...(input.person1Days !== undefined ? { person1_days: input.person1Days } : {}),
        ...(input.person2Days !== undefined ? { person2_days: input.person2Days } : {}),
        ...(input.avgKmPerDay !== undefined ? { avg_km_per_day: input.avgKmPerDay } : {}),
        ...(input.fuelCostPerKm !== undefined ? { fuel_cost_per_km: input.fuelCostPerKm } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      })
      .eq("user_id", this.userId)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async remove(id: string): Promise<void> {
    await this.getById(id);
    const { error } = await this.db.from("fuel_sharing_entries").delete().eq("user_id", this.userId).eq("id", id);
    if (error) throw new AppError(error.message, 500);
  }
}
