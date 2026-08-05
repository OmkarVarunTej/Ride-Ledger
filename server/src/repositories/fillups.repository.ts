import type { SupabaseClient } from "@supabase/supabase-js";
import type { FuelFillupRow } from "../types/domain.js";
import { NotFoundError, AppError } from "../utils/errors.js";

export interface FillupCreateInput {
  date: string;
  odometer: number;
  amountPaid: number;
  litres: number;
  pricePerLitre: number;
  fuelType?: string;
  station?: string | null;
  notes?: string | null;
}

export class FillupsRepository {
  constructor(private readonly db: SupabaseClient, private readonly userId: string) {}

  /** All fillups ordered by odometer ascending — the ordering the mileage engine depends on. */
  async listAll(): Promise<FuelFillupRow[]> {
    const { data, error } = await this.db
      .from("fuel_fillups")
      .select("*")
      .eq("user_id", this.userId)
      .order("odometer", { ascending: true });
    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  async listBetweenDates(startDate: string, endDate: string): Promise<FuelFillupRow[]> {
    const all = await this.listAll();
    return all.filter((f) => f.date >= startDate && f.date <= endDate);
  }

  async getById(id: string): Promise<FuelFillupRow> {
    const { data, error } = await this.db
      .from("fuel_fillups")
      .select("*")
      .eq("user_id", this.userId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new NotFoundError("Fuel fillup");
    return data;
  }

  async create(input: FillupCreateInput): Promise<FuelFillupRow> {
    const { data, error } = await this.db
      .from("fuel_fillups")
      .insert({
        user_id: this.userId,
        date: input.date,
        odometer: input.odometer,
        amount_paid: input.amountPaid,
        litres: input.litres,
        price_per_litre: input.pricePerLitre,
        fuel_type: input.fuelType ?? "Petrol",
        station: input.station ?? null,
        notes: input.notes ?? null,
      })
      .select("*")
      .single();
    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async update(id: string, input: Partial<FillupCreateInput>): Promise<FuelFillupRow> {
    await this.getById(id);
    const { data, error } = await this.db
      .from("fuel_fillups")
      .update({
        ...(input.date !== undefined ? { date: input.date } : {}),
        ...(input.odometer !== undefined ? { odometer: input.odometer } : {}),
        ...(input.amountPaid !== undefined ? { amount_paid: input.amountPaid } : {}),
        ...(input.litres !== undefined ? { litres: input.litres } : {}),
        ...(input.pricePerLitre !== undefined ? { price_per_litre: input.pricePerLitre } : {}),
        ...(input.fuelType !== undefined ? { fuel_type: input.fuelType } : {}),
        ...(input.station !== undefined ? { station: input.station } : {}),
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
    const { error } = await this.db.from("fuel_fillups").delete().eq("user_id", this.userId).eq("id", id);
    if (error) throw new AppError(error.message, 500);
  }
}
