import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import type { UserSettings } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Skeleton } from "@/components/ui/primitives";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<{ data: UserSettings }>("/settings").then((r) => r.data),
  });

  const [form, setForm] = useState({
    bikeName: "",
    bikeModel: "",
    currency: "INR",
    fuelPrice: "",
    avgKmPerDay: "",
    defaultMonthlyIncome: "",
    chainServiceIntervalKm: "500",
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      bikeName: data.bike_name ?? "",
      bikeModel: data.bike_model ?? "",
      currency: data.currency ?? "INR",
      fuelPrice: data.fuel_price != null ? String(data.fuel_price) : "",
      avgKmPerDay: data.avg_km_per_day != null ? String(data.avg_km_per_day) : "",
      defaultMonthlyIncome: data.default_monthly_income != null ? String(data.default_monthly_income) : "",
      chainServiceIntervalKm: String(data.chain_service_interval_km ?? 500),
    });
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      api.patch("/settings", {
        bikeName: form.bikeName,
        bikeModel: form.bikeModel || null,
        currency: form.currency,
        fuelPrice: form.fuelPrice ? Number(form.fuelPrice) : null,
        avgKmPerDay: form.avgKmPerDay ? Number(form.avgKmPerDay) : null,
        defaultMonthlyIncome: form.defaultMonthlyIncome ? Number(form.defaultMonthlyIncome) : null,
        chainServiceIntervalKm: Number(form.chainServiceIntervalKm),
      }),
    onSuccess: () => {
      toast.success("Settings saved — this only affects future calculations");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["chain-tracker"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save settings"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate();
  }

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-ink-muted mt-1">Changes here only affect future calculations — past months stay as they were</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Bike & Defaults</CardTitle></CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Bike name</Label>
              <Input value={form.bikeName} onChange={(e) => setForm({ ...form, bikeName: e.target.value })} />
            </div>
            <div>
              <Label>Bike model</Label>
              <Input placeholder="e.g. Triumph Speed 400" value={form.bikeModel} onChange={(e) => setForm({ ...form, bikeModel: e.target.value })} />
            </div>
            <div>
              <Label>Currency</Label>
              <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </div>
            <div>
              <Label>Default fuel price</Label>
              <Input type="number" step="0.01" value={form.fuelPrice} onChange={(e) => setForm({ ...form, fuelPrice: e.target.value })} />
            </div>
            <div>
              <Label>Default avg km/day</Label>
              <Input type="number" step="0.1" value={form.avgKmPerDay} onChange={(e) => setForm({ ...form, avgKmPerDay: e.target.value })} />
            </div>
            <div>
              <Label>Default monthly income</Label>
              <Input type="number" step="0.01" value={form.defaultMonthlyIncome} onChange={(e) => setForm({ ...form, defaultMonthlyIncome: e.target.value })} />
            </div>
            <div>
              <Label>Chain service interval (km)</Label>
              <Input type="number" step="10" value={form.chainServiceIntervalKm} onChange={(e) => setForm({ ...form, chainServiceIntervalKm: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" loading={save.isPending}>Save settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
