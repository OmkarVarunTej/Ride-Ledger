import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { MAINTENANCE_CATEGORIES, type MaintenanceEntry } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, Input, Select, Skeleton } from "@/components/ui/primitives";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ChainServiceWidget } from "@/components/dashboard/ChainServiceWidget";

export function MaintenancePage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    odometer: "",
    category: MAINTENANCE_CATEGORIES[0] as (typeof MAINTENANCE_CATEGORIES)[number],
    customCategoryLabel: "",
    cost: "",
    notes: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: () => api.get<{ data: MaintenanceEntry[] }>("/maintenance").then((r) => r.data),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["maintenance"] });
    queryClient.invalidateQueries({ queryKey: ["chain-tracker"] });
  };

  const create = useMutation({
    mutationFn: () =>
      api.post("/maintenance", {
        date: form.date,
        odometer: Number(form.odometer),
        category: form.category,
        customCategoryLabel: form.category === "Custom" ? form.customCategoryLabel : null,
        cost: Number(form.cost),
        notes: form.notes || null,
      }),
    onSuccess: () => {
      toast.success("Maintenance entry added");
      invalidate();
      setShowForm(false);
      setForm((f) => ({ ...f, odometer: "", cost: "", notes: "", customCategoryLabel: "" }));
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add entry"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/maintenance/${id}`),
    onSuccess: () => {
      toast.success("Entry removed");
      invalidate();
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Maintenance</h1>
          <p className="text-sm text-ink-muted mt-1">Service history and the chain-service checkpoint tracker</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}><Plus className="h-4 w-4" /> Log service</Button>
      </div>

      <ChainServiceWidget />

      {showForm && (
        <Card>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Date</label>
                <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Odometer (km)</label>
                <Input type="number" min={0} step="0.1" required value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Category</label>
                <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })}>
                  {MAINTENANCE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              {form.category === "Custom" && (
                <div>
                  <label className="text-xs font-medium text-ink-muted mb-1.5 block">Custom label</label>
                  <Input required value={form.customCategoryLabel} onChange={(e) => setForm({ ...form, customCategoryLabel: e.target.value })} />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Cost</label>
                <Input type="number" min={0} step="0.01" required value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
              </div>
              <div className="sm:col-span-3">
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Notes</label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="sm:col-span-4 flex gap-2">
                <Button type="submit" size="sm" loading={create.isPending}>Save</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : (data?.length ?? 0) === 0 ? (
        <Card><CardContent className="py-12 text-center"><p className="text-sm text-ink-muted">No maintenance logged yet</p></CardContent></Card>
      ) : (
        <div className="rounded-xl border border-base-border divide-y divide-base-border overflow-hidden">
          {data?.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-4 py-3 bg-base-panel/40">
              <div>
                <p className="text-sm font-medium">{entry.category === "Custom" ? entry.custom_category_label : entry.category}</p>
                <p className="text-xs text-ink-faint">{entry.date} · {formatNumber(entry.odometer, 0)} km{entry.notes ? ` · ${entry.notes}` : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="tabular text-sm font-medium">{formatCurrency(entry.cost)}</p>
                <button onClick={() => remove.mutate(entry.id)} className="text-ink-faint hover:text-danger transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
