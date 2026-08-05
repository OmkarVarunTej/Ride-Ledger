import type { SupabaseClient } from "@supabase/supabase-js";
import type { MaintenanceEntryRow } from "../types/domain.js";
import { NotFoundError, AppError } from "../utils/errors.js";
import type { MaintenanceCategory } from "../constants/categories.js";

export interface MaintenanceCreateInput {
  date: string;
  odometer: number;
  category: MaintenanceCategory;
  customCategoryLabel?: string | null;
  cost: number;
  notes?: string | null;
  invoiceImageUrl?: string | null;
}

export class MaintenanceRepository {
  constructor(private readonly db: SupabaseClient, private readonly userId: string) {}

  async listAll(): Promise<MaintenanceEntryRow[]> {
    const { data, error } = await this.db
      .from("maintenance_entries")
      .select("*")
      .eq("user_id", this.userId)
      .order("date", { ascending: false });
    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  async listByCategory(category: string): Promise<MaintenanceEntryRow[]> {
    const { data, error } = await this.db
      .from("maintenance_entries")
      .select("*")
      .eq("user_id", this.userId)
      .eq("category", category)
      .order("odometer", { ascending: true });
    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  async getById(id: string): Promise<MaintenanceEntryRow> {
    const { data, error } = await this.db
      .from("maintenance_entries")
      .select("*")
      .eq("user_id", this.userId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new NotFoundError("Maintenance entry");
    return data;
  }

  async create(input: MaintenanceCreateInput): Promise<MaintenanceEntryRow> {
    const { data, error } = await this.db
      .from("maintenance_entries")
      .insert({
        user_id: this.userId,
        date: input.date,
        odometer: input.odometer,
        category: input.category,
        custom_category_label: input.customCategoryLabel ?? null,
        cost: input.cost,
        notes: input.notes ?? null,
        invoice_image_url: input.invoiceImageUrl ?? null,
      })
      .select("*")
      .single();
    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async update(id: string, input: Partial<MaintenanceCreateInput>): Promise<MaintenanceEntryRow> {
    await this.getById(id);
    const { data, error } = await this.db
      .from("maintenance_entries")
      .update({
        ...(input.date !== undefined ? { date: input.date } : {}),
        ...(input.odometer !== undefined ? { odometer: input.odometer } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.customCategoryLabel !== undefined ? { custom_category_label: input.customCategoryLabel } : {}),
        ...(input.cost !== undefined ? { cost: input.cost } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.invoiceImageUrl !== undefined ? { invoice_image_url: input.invoiceImageUrl } : {}),
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
    const { error } = await this.db.from("maintenance_entries").delete().eq("user_id", this.userId).eq("id", id);
    if (error) throw new AppError(error.message, 500);
  }
}
