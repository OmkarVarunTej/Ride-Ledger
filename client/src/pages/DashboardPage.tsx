import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
  Wallet, TrendingUp, TrendingDown, Fuel, Gauge, Droplets, Waves, HandCoins, Route,
} from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardSummary } from "@/types/domain";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui/primitives";
import { formatCurrency, formatNumber, MONTH_NAMES } from "@/lib/utils";

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => api.get<{ data: DashboardSummary }>("/dashboard/summary").then((r) => r.data),
  });

  const monthLabel = data?.currentMonth ? `${MONTH_NAMES[data.currentMonth.month - 1]} ${data.currentMonth.year}` : "No months yet";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-ink-muted mt-1">{monthLabel}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Current Balance" value={formatCurrency(data?.currentBalance ?? 0)} icon={<Wallet className="h-4 w-4 text-ledger" />} accent="ledger" />
          <StatCard label="This Month's Income" value={formatCurrency(data?.currentMonthIncome ?? 0)} icon={<TrendingUp className="h-4 w-4 text-ledger" />} />
          <StatCard label="This Month's Expenses" value={formatCurrency(data?.currentMonthExpenses ?? 0)} icon={<TrendingDown className="h-4 w-4 text-danger" />} />
          <StatCard label="This Month's Fuel" value={formatCurrency(data?.currentMonthFuelCost ?? 0)} icon={<Fuel className="h-4 w-4 text-fuel" />} accent="fuel" />
          <StatCard
            label="Fuel Cost / km"
            value={data?.fuelCostPerKm != null ? formatCurrency(data.fuelCostPerKm) : "—"}
            icon={<Gauge className="h-4 w-4 text-fuel" />}
          />
          <StatCard
            label="Average Mileage"
            value={data?.averageMileage != null ? `${formatNumber(data.averageMileage)} km/l` : "—"}
            icon={<Droplets className="h-4 w-4 text-ink-muted" />}
          />
          <StatCard label="Bike Wash Cost" value={formatCurrency(data?.bikeWashCostThisMonth ?? 0)} icon={<Waves className="h-4 w-4 text-ink-muted" />} />
          <StatCard label="Reimbursement Received" value={formatCurrency(data?.fuelReimbursementReceived ?? 0)} icon={<HandCoins className="h-4 w-4 text-ledger" />} accent="ledger" />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Balance Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-2">
          {isLoading ? (
            <Skeleton className="h-full" />
          ) : (data?.balanceTrend.length ?? 0) === 0 ? (
            <EmptyChartState />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.balanceTrend}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34D2C4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#34D2C4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232830" vertical={false} />
                <XAxis dataKey="label" stroke="#5A6270" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5A6270" fontSize={12} tickLine={false} axisLine={false} width={60} />
                <Tooltip
                  contentStyle={{ background: "#111419", border: "1px solid #232830", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="value" stroke="#34D2C4" strokeWidth={2} fill="url(#balanceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Distance Ridden</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3 pt-2">
          <div className="h-10 w-10 rounded-lg bg-fuel/10 flex items-center justify-center">
            <Route className="h-5 w-5 text-fuel" />
          </div>
          <p className="font-display text-2xl font-semibold tabular">
            {formatNumber(data?.totalDistanceAllTime ?? 0, 0)} km
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyChartState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <p className="text-sm text-ink-muted">No months yet</p>
      <p className="text-xs text-ink-faint mt-1">Create a month to start tracking your balance</p>
    </div>
  );
}
