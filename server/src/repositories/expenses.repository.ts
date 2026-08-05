import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExpenseEntryRow } from "../types/domain.js";
import { NotFoundError, AppError } from "../utils/errors.js";
import type { ExpenseCategory } from "../constants/categories.js";

export interface ExpenseCreateInput {
  monthId: string;
  date: string;
  category: ExpenseCategory;
  customCategoryLabel?: string | null;
  amount: number;
  description?: string | null;
}

export class ExpensesRepository {
  constructor(private readonly db: SupabaseClient, private readonly userId: string) {}

  async listByMonth(monthId: string): Promise<ExpenseEntryRow[]> {
    const { data, error } = await this.db
      .from("other_expenses")
      .select("*")
      .eq("user_id", this.userId)
      .eq("month_id", monthId)
      .order("date", { ascending: false });
    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  async sumByMonth(monthId: string): Promise<number> {
    const rows = await this.listByMonth(monthId);
    return rows.reduce((sum, r) => sum + Number(r.amount), 0);
  }

  async categoryTotals(monthId: string): Promise<Record<string, number>> {
    const rows = await this.listByMonth(monthId);
    const totals: Record<string, number> = {};
    for (const row of rows) {
      const key = row.category === "Custom" && row.custom_category_label ? row.custom_category_label : row.category;
      totals[key] = (totals[key] ?? 0) + Number(row.amount);
    }
    return totals;
  }

  async getById(id: string): Promise<ExpenseEntryRow> {
    const { data, error } = await this.db
      .from("other_expenses")
      .select("*")
      .eq("user_id", this.userId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new NotFoundError("Expense entry");
    return data;
  }

  async create(input: ExpenseCreateInput): Promise<ExpenseEntryRow> {
    const { data, error } = await this.db
      .from("other_expenses")
      .insert({
        user_id: this.userId,
        month_id: input.monthId,
        date: input.date,
        category: input.category,
        custom_category_label: input.customCategoryLabel ?? null,
        amount: input.amount,
        description: input.description ?? null,
      })
      .select("*")
      .single();
    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async update(id: string, input: Partial<Omit<ExpenseCreateInput, "monthId">>): Promise<ExpenseEntryRow> {
    await this.getById(id);
    const { data, error } = await this.db
      .from("other_expenses")
      .update({
        ...(input.date !== undefined ? { date: input.date } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.customCategoryLabel !== undefined ? { custom_category_label: input.customCategoryLabel } : {}),
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
    const { error } = await this.db.from("other_expenses").delete().eq("user_id", this.userId).eq("id", id);
    if (error) throw new AppError(error.message, 500);
  }
}
