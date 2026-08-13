import type { SupabaseClient } from "@supabase/supabase-js";
import type { MoneyToReceiveRow } from "../types/domain.js";
import { AppError, NotFoundError } from "../utils/errors.js";

export interface MoneyToReceiveCreateInput {
  monthId: string;
  person: string;
  amount: number;
  description?: string | null;
  date: string;
  isReceived?: boolean;
}

export class MoneyToReceiveRepository {
  constructor(private readonly db: SupabaseClient, private readonly userId: string) {}

  async listByMonth(monthId: string): Promise<MoneyToReceiveRow[]> {
    const { data, error } = await this.db
      .from("money_to_receive")
      .select("*")
      .eq("user_id", this.userId)
      .eq("month_id", monthId)
      .order("created_at", { ascending: true });
    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  async sumReceivedByMonth(monthId: string): Promise<number> {
    const { data, error } = await this.db
      .from("money_to_receive")
      .select("amount")
      .eq("user_id", this.userId)
      .eq("month_id", monthId)
      .eq("is_received", true);
    if (error) throw new AppError(error.message, 500);
    return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  }

  async getById(id: string): Promise<MoneyToReceiveRow> {
    const { data, error } = await this.db
      .from("money_to_receive")
      .select("*")
      .eq("user_id", this.userId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new NotFoundError("Money to receive entry");
    return data;
  }

  async create(input: MoneyToReceiveCreateInput): Promise<MoneyToReceiveRow> {
    const { data, error } = await this.db
      .from("money_to_receive")
      .insert({
        user_id: this.userId,
        month_id: input.monthId,
        person: input.person,
        amount: input.amount,
        description: input.description ?? null,
        date: input.date,
        is_received: input.isReceived ?? false,
      })
      .select("*")
      .single();
    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async update(id: string, input: Partial<Omit<MoneyToReceiveCreateInput, "monthId">>): Promise<MoneyToReceiveRow> {
    await this.getById(id);
    const { data, error } = await this.db
      .from("money_to_receive")
      .update({
        ...(input.person !== undefined ? { person: input.person } : {}),
        ...(input.amount !== undefined ? { amount: input.amount } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.date !== undefined ? { date: input.date } : {}),
        ...(input.isReceived !== undefined ? { is_received: input.isReceived } : {}),
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
    const { error } = await this.db.from("money_to_receive").delete().eq("user_id", this.userId).eq("id", id);
    if (error) throw new AppError(error.message, 500);
  }
}
