export const INCOME_CATEGORIES = [
  "Monthly Allowance",
  "Freelancing",
  "Salary",
  "Bonus",
  "Cash",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Mobile Recharge",
  "Bike Wash",
  "Parking",
  "Food",
  "Accessories",
  "Insurance",
  "Service",
  "Shopping",
  "Chain Cleaner",
  "Chain Lube",
  "Engine Oil",
  "Custom",
] as const;

export const MAINTENANCE_CATEGORIES = [
  "Bike Wash",
  "Chain Cleaning",
  "Chain Lubing",
  "Engine Oil",
  "Oil Filter",
  "Air Filter",
  "Brake Pads",
  "Coolant",
  "Tyres",
  "Battery",
  "Insurance",
  "Pollution Certificate",
  "General Service",
  "Accessories",
  "Custom",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type MaintenanceCategory = (typeof MAINTENANCE_CATEGORIES)[number];
