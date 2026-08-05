export const INCOME_CATEGORIES = ["Monthly Allowance", "Freelancing", "Salary", "Bonus", "Cash", "Other"] as const;
export const EXPENSE_CATEGORIES = [
  "Mobile Recharge", "Bike Wash", "Parking", "Food", "Accessories", "Insurance",
  "Service", "Shopping", "Chain Cleaner", "Chain Lube", "Engine Oil", "Custom",
] as const;
export const MAINTENANCE_CATEGORIES = [
  "Bike Wash", "Chain Cleaning", "Chain Lubing", "Engine Oil", "Oil Filter", "Air Filter",
  "Brake Pads", "Coolant", "Tyres", "Battery", "Insurance", "Pollution Certificate",
  "General Service", "Accessories", "Custom",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type MaintenanceCategory = (typeof MAINTENANCE_CATEGORIES)[number];

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

export interface MonthRow {
  id: string;
  year: number;
  month: number;
  notes: string | null;
  manual_fuel_cost: number | null;
  ledger: MonthlyLedger | null;
}

export interface IncomeEntry {
  id: string;
  month_id: string;
  date: string;
  category: IncomeCategory;
  amount: number;
  description: string | null;
}

export interface ExpenseEntry {
  id: string;
  month_id: string;
  date: string;
  category: ExpenseCategory;
  custom_category_label: string | null;
  amount: number;
  description: string | null;
}

export interface FuelFillup {
  id: string;
  date: string;
  odometer: number;
  amount_paid: number;
  litres: number;
  price_per_litre: number;
  fuel_type: string;
  station: string | null;
  notes: string | null;
  distanceSinceLast: number | null;
  mileageKmpl: number | null;
  costPerKm: number | null;
}

export interface FuelSharingEntry {
  id: string;
  month_id: string;
  vehicle_days: number;
  person1_days: number;
  person2_days: number;
  avg_km_per_day: number;
  fuel_cost_per_km: number;
  notes: string | null;
  totalKm: number;
  fuelCost: number;
  costPerDay: number;
  sharedCost: number;
  remainingDays: number;
  person1Fuel: number;
  person2Fuel: number;
}

export interface MaintenanceEntry {
  id: string;
  date: string;
  odometer: number;
  category: MaintenanceCategory;
  custom_category_label: string | null;
  cost: number;
  notes: string | null;
  invoice_image_url: string | null;
}

export interface ChainCheckpoint {
  index: number;
  thresholdKm: number;
  status: "completed" | "pending" | "locked";
  completedEntry: MaintenanceEntry | null;
}

export interface ChainServiceTracker {
  intervalKm: number;
  currentOdometer: number;
  checkpoints: ChainCheckpoint[];
  nextServiceInKm: number;
  progressPercent: number;
  lastService: MaintenanceEntry | null;
  lastCost: number | null;
  averageCost: number | null;
  averageIntervalKm: number | null;
}

export interface UserSettings {
  user_id: string;
  bike_name: string;
  bike_model: string | null;
  currency: string;
  fuel_price: number | null;
  avg_km_per_day: number | null;
  default_monthly_income: number | null;
  fuel_sharing_rule: Record<string, unknown>;
  chain_service_interval_km: number;
  theme: string;
}

export interface DashboardSummary {
  currentBalance: number;
  currentMonth: { year: number; month: number } | null;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  currentMonthFuelCost: number;
  fuelCostPerKm: number | null;
  averageMileage: number | null;
  bikeWashCostThisMonth: number;
  fuelReimbursementPending: number;
  fuelReimbursementReceived: number;
  totalDistanceAllTime: number;
  balanceTrend: { label: string; value: number }[];
}
