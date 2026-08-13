import type { ExpenseCategory, IncomeCategory, MaintenanceCategory } from "../constants/categories.js";

export interface MonthRow {
  id: string;
  user_id: string;
  year: number;
  month: number;
  notes: string | null;
  manual_fuel_cost: number | null;
  created_at: string;
  updated_at: string;
}

export interface IncomeEntryRow {
  id: string;
  user_id: string;
  month_id: string;
  date: string;
  category: IncomeCategory;
  amount: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseEntryRow {
  id: string;
  user_id: string;
  month_id: string;
  date: string;
  category: ExpenseCategory;
  custom_category_label: string | null;
  amount: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FuelFillupRow {
  id: string;
  user_id: string;
  date: string;
  odometer: number;
  amount_paid: number;
  litres: number;
  price_per_litre: number;
  fuel_type: string;
  station: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FuelSharingRow {
  id: string;
  user_id: string;
  month_id: string;
  vehicle_days: number;
  person1_days: number;
  person2_days: number;
  avg_km_per_day: number;
  fuel_cost_per_km: number;
  notes: string | null;
  is_received: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceEntryRow {
  id: string;
  user_id: string;
  date: string;
  odometer: number;
  category: MaintenanceCategory;
  custom_category_label: string | null;
  cost: number;
  notes: string | null;
  invoice_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsRow {
  user_id: string;
  bike_name: string;
  bike_model: string | null;
  currency: string;
  fuel_price: number | null;
  avg_km_per_day: number | null;
  default_monthly_income: number | null;
  initial_balance: number;
  initial_balance_adjustment: number;
  fuel_sharing_rule: Record<string, unknown>;
  chain_service_interval_km: number;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface MoneyToReceiveRow {
  id: string;
  user_id: string;
  month_id: string;
  person: string;
  amount: number;
  description: string | null;
  date: string;
  is_received: boolean;
  created_at: string;
  updated_at: string;
}

/** A fillup enriched with the distance/mileage/cost derived from the previous fillup. */
export interface FuelFillupWithDerived extends FuelFillupRow {
  distanceSinceLast: number | null;
  mileageKmpl: number | null;
  costPerKm: number | null;
}

export interface FuelSharingResult extends FuelSharingRow {
  totalKm: number;
  fuelCost: number;
  costPerDay: number;
  sharedCost: number;
  remainingDays: number;
  person1Fuel: number;
  person2Fuel: number;
}

export interface MonthlyFuelSummary {
  totalFuelCost: number;
  totalDistance: number;
  totalLitres: number;
  averageMileage: number | null;
  averageFuelCostPerKm: number | null;
  isManualEntry: boolean;
}

export interface MonthlyLedger {
  monthId: string;
  year: number;
  month: number;
  openingBalance: number;
  income: number;
  fuelCost: number;
  person2Reimbursement: number;
  otherExpenses: number;
  closingBalance: number;
}
