import type { SupabaseClient } from "@supabase/supabase-js";
import type { MonthRow } from "../types/domain.js";
import { NotFoundError, AppError } from "../utils/errors.js";

export class MonthsRepository {
  constructor(private readonly db: SupabaseClient, private readonly userId: string) {}

  async list(): Promise<MonthRow[]> {
    const { data, error } = await this.db
      .from("months")
      .select("*")
      .eq("user_id", this.userId)
      .order("year", { ascending: true })
      .order("month", { ascending: true });
    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  async getById(id: string): Promise<MonthRow> {
    const { data, error } = await this.db
      .from("months")
      .select("*")
      .eq("user_id", this.userId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new NotFoundError("Month");
    return data;
  }

  /** All months strictly before the given (year, month), ascending — used for ledger cascade. */
  async listBefore(year: number, month: number): Promise<MonthRow[]> {
    const all = await this.list();
    return all.filter((m) => m.year < year || (m.year === year && m.month < month));
  }

  async create(input: { year: number; month: number; notes?: string | null }): Promise<MonthRow> {
    const { data, error } = await this.db
      .from("months")
      .insert({ user_id: this.userId, year: input.year, month: input.month, notes: input.notes ?? null })
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") throw new AppError("That month already exists", 409);
      throw new AppError(error.message, 500);
    }
    return data;
  }

  async update(id: string, input: { notes?: string | null; manualFuelCost?: number | null }): Promise<MonthRow> {
    await this.getById(id);
    const { data, error } = await this.db
      .from("months")
      .update({
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.manualFuelCost !== undefined ? { manual_fuel_cost: input.manualFuelCost } : {}),
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
    const { error } = await this.db.from("months").delete().eq("user_id", this.userId).eq("id", id);
    if (error) throw new AppError(error.message, 500);
  }
}
