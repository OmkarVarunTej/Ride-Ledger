import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserSettingsRow } from "../types/domain.js";
import { AppError, NotFoundError } from "../utils/errors.js";

export interface SettingsUpdateInput {
  bikeName?: string;
  bikeModel?: string | null;
  currency?: string;
  fuelPrice?: number | null;
  avgKmPerDay?: number | null;
  defaultMonthlyIncome?: number | null;
  initialBalance?: number | null;
  initialBalanceAdjustment?: number | null;
  fuelSharingRule?: Record<string, unknown>;
  chainServiceIntervalKm?: number;
  theme?: "dark" | "light";
}

export class SettingsRepository {
  constructor(private readonly db: SupabaseClient, private readonly userId: string) {}

  async get(): Promise<UserSettingsRow> {
    const { data, error } = await this.db
      .from("user_settings")
      .select("*")
      .eq("user_id", this.userId)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new NotFoundError("Settings");
    return data;
  }

  async update(input: SettingsUpdateInput): Promise<UserSettingsRow> {
    const { data, error } = await this.db
      .from("user_settings")
      .update({
        ...(input.bikeName !== undefined ? { bike_name: input.bikeName } : {}),
        ...(input.bikeModel !== undefined ? { bike_model: input.bikeModel } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.fuelPrice !== undefined ? { fuel_price: input.fuelPrice } : {}),
        ...(input.avgKmPerDay !== undefined ? { avg_km_per_day: input.avgKmPerDay } : {}),
        ...(input.defaultMonthlyIncome !== undefined ? { default_monthly_income: input.defaultMonthlyIncome } : {}),
        ...(input.initialBalance !== undefined ? { initial_balance: input.initialBalance } : {}),
        ...(input.initialBalanceAdjustment !== undefined ? { initial_balance_adjustment: input.initialBalanceAdjustment } : {}),
        ...(input.fuelSharingRule !== undefined ? { fuel_sharing_rule: input.fuelSharingRule } : {}),
        ...(input.chainServiceIntervalKm !== undefined ? { chain_service_interval_km: input.chainServiceIntervalKm } : {}),
        ...(input.theme !== undefined ? { theme: input.theme } : {}),
      })
      .eq("user_id", this.userId)
      .select("*")
      .single();
    if (error) throw new AppError(error.message, 500);
    return data;
  }
}
