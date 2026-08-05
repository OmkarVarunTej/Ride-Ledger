import type { SupabaseClient } from "@supabase/supabase-js";
import type { IncomeEntryRow } from "../types/domain.js";
import { NotFoundError, AppError } from "../utils/errors.js";
import type { IncomeCategory } from "../constants/categories.js";

export interface IncomeCreateInput {
  monthId: string;
  date: string;
  category: IncomeCategory;
  amount: number;
  description?: string | null;
}

export class IncomeRepository {
  constructor(private readonly db: SupabaseClient, private readonly userId: string) {}

  async listByMonth(monthId: string): Promise<IncomeEntryRow[]> {
    const { data, error } = await this.db
      .from("income_entries")
      .select("*")
      .eq("user_id", this.userId)
      .eq("month_id", monthId)
      .order("date", { ascending: false });
    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  /** Sum of all income for a given month — used by the ledger engine. */
  async sumByMonth(monthId: string): Promise<number> {
    const rows = await this.listByMonth(monthId);
    return rows.reduce((sum, r) => sum + Number(r.amount), 0);
  }

  async getById(id: string): Promise<IncomeEntryRow> {
    const { data, error } = await this.db
      .from("income_entries")
      .select("*")
      .eq("user_id", this.userId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new NotFoundError("Income entry");
    return data;
  }

  async create(input: IncomeCreateInput): Promise<IncomeEntryRow> {
    const { data, error } = await this.db
      .from("income_entries")
      .insert({
        user_id: this.userId,
        month_id: input.monthId,
        date: input.date,
        category: input.category,
        amount: input.amount,
        description: input.description ?? null,
      })
      .select("*")
      .single();
    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async update(id: string, input: Partial<Omit<IncomeCreateInput, "monthId">>): Promise<IncomeEntryRow> {
    await this.getById(id);
    const { data, error } = await this.db
      .from("income_entries")
      .update({
        ...(input.date !== undefined ? { date: input.date } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.amount !== undefined ? { amount: input.amount } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
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
    const { error } = await this.db.from("income_entries").delete().eq("user_id", this.userId).eq("id", id);
    if (error) throw new AppError(error.message, 500);
  }
}
