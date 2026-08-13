import { z } from "zod";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, MAINTENANCE_CATEGORIES } from "../constants/categories.js";

export const monthCreateSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  notes: z.string().max(2000).optional().nullable(),
});

export const monthUpdateSchema = z.object({
  notes: z.string().max(2000).optional().nullable(),
  manualFuelCost: z.number().min(0).optional().nullable(),
});

export const incomeCreateSchema = z.object({
  monthId: z.string().uuid(),
  date: z.string().date(),
  category: z.enum(INCOME_CATEGORIES),
  amount: z.number().min(0),
  description: z.string().max(2000).optional().nullable(),
});

export const incomeUpdateSchema = incomeCreateSchema.partial().omit({ monthId: true });

export const expenseCreateSchema = z.object({
  monthId: z.string().uuid(),
  date: z.string().date(),
  category: z.enum(EXPENSE_CATEGORIES),
  customCategoryLabel: z.string().max(120).optional().nullable(),
  amount: z.number().min(0),
  description: z.string().max(2000).optional().nullable(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial().omit({ monthId: true });

export const fillupCreateSchema = z.object({
  date: z.string().date(),
  odometer: z.number().min(0),
  amountPaid: z.number().min(0),
  litres: z.number().gt(0),
  pricePerLitre: z.number().min(0),
  fuelType: z.string().max(60).default("Petrol"),
  station: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const fillupUpdateSchema = fillupCreateSchema.partial();

export const fuelSharingCreateSchema = z.object({
  monthId: z.string().uuid(),
  vehicleDays: z.number().min(0),
  person1Days: z.number().min(0),
  person2Days: z.number().min(0),
  avgKmPerDay: z.number().min(0),
  fuelCostPerKm: z.number().min(0),
  notes: z.string().max(2000).optional().nullable(),
  isReceived: z.boolean().optional(),
});

export const fuelSharingUpdateSchema = fuelSharingCreateSchema.partial().omit({ monthId: true });

export const maintenanceCreateSchema = z.object({
  date: z.string().date(),
  odometer: z.number().min(0),
  category: z.enum(MAINTENANCE_CATEGORIES),
  customCategoryLabel: z.string().max(120).optional().nullable(),
  cost: z.number().min(0),
  notes: z.string().max(2000).optional().nullable(),
  invoiceImageUrl: z.string().url().optional().nullable(),
});

export const maintenanceUpdateSchema = maintenanceCreateSchema.partial();

export const settingsUpdateSchema = z.object({
  bikeName: z.string().min(1).max(120).optional(),
  bikeModel: z.string().max(120).optional().nullable(),
  currency: z.string().min(1).max(10).optional(),
  fuelPrice: z.number().min(0).optional().nullable(),
  avgKmPerDay: z.number().min(0).optional().nullable(),
  defaultMonthlyIncome: z.number().min(0).optional().nullable(),
  initialBalance: z.number().optional().nullable(),
  initialBalanceAdjustment: z.number().optional().nullable(),
  fuelSharingRule: z.record(z.unknown()).optional(),
  chainServiceIntervalKm: z.number().gt(0).optional(),
  theme: z.enum(["dark", "light"]).optional(),
});

export const moneyToReceiveCreateSchema = z.object({
  monthId: z.string().uuid(),
  person: z.string().min(1).max(120),
  amount: z.number().min(0),
  description: z.string().max(2000).optional().nullable(),
  date: z.string().date(),
  isReceived: z.boolean().optional(),
});

export const moneyToReceiveUpdateSchema = moneyToReceiveCreateSchema.partial().omit({ monthId: true });
