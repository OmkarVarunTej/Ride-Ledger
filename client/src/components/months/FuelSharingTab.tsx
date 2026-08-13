import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Trash2, CheckSquare, Square } from "lucide-react";
import { api } from "@/lib/api";
import type { FuelSharingEntry } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, Input, Skeleton } from "@/components/ui/primitives";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

export function FuelSharingTab({ monthId }: { monthId: string }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [vehicleDays, setVehicleDays] = useState("");
  const [person1Days, setPerson1Days] = useState("");
  const [person2Days, setPerson2Days] = useState("");
  const [avgKmPerDay, setAvgKmPerDay] = useState("");
  const [fuelCostPerKm, setFuelCostPerKm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["fuel-sharing", monthId],
    queryFn: () => api.get<{ data: FuelSharingEntry[] }>(`/months/${monthId}/fuel-sharing`).then((r) => r.data),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["fuel-sharing", monthId] });
    queryClient.invalidateQueries({ queryKey: ["months"] });
    queryClient.invalidateQueries({ queryKey: ["month", monthId] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  };

  const create = useMutation({
    mutationFn: () =>
      api.post(`/months/${monthId}/fuel-sharing`, {
        vehicleDays: Number(vehicleDays),
        person1Days: Number(person1Days),
        person2Days: Number(person2Days),
        avgKmPerDay: Number(avgKmPerDay),
        fuelCostPerKm: Number(fuelCostPerKm),
      }),
    onSuccess: () => {
      toast.success("Fuel sharing entry added");
      invalidate();
      setShowForm(false);
      setVehicleDays(""); setPerson1Days(""); setPerson2Days(""); setAvgKmPerDay(""); setFuelCostPerKm("");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add entry"),
  });

  const toggleReceived = useMutation({
    mutationFn: ({ id, isReceived }: { id: string; isReceived: boolean }) =>
      api.patch(`/months/${monthId}/fuel-sharing/${id}`, { isReceived }),
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not update status"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/months/${monthId}/fuel-sharing/${id}`),
    onSuccess: () => {
      toast.success("Entry removed");
      invalidate();
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  const totalReimbursement = (data ?? []).reduce((s, r) => s + r.person2Fuel, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          Person2 reimbursement this month: <span className="text-ledger font-medium tabular">{formatCurrency(totalReimbursement)}</span>
        </p>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}><Plus className="h-3.5 w-3.5" /> Add sharing entry</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-5 gap-3 items-end">
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Vehicle days</label>
                <Input type="number" step="0.5" min={0} required value={vehicleDays} onChange={(e) => setVehicleDays(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Person1 days</label>
                <Input type="number" step="0.5" min={0} required value={person1Days} onChange={(e) => setPerson1Days(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Person2 days</label>
                <Input type="number" step="0.5" min={0} required value={person2Days} onChange={(e) => setPerson2Days(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Avg km/day</label>
                <Input type="number" step="0.1" min={0} required value={avgKmPerDay} onChange={(e) => setAvgKmPerDay(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Fuel cost/km</label>
                <Input type="number" step="0.01" min={0} required value={fuelCostPerKm} onChange={(e) => setFuelCostPerKm(e.target.value)} />
              </div>
              <div className="sm:col-span-5 flex gap-2">
                <Button type="submit" size="sm" loading={create.isPending}>Save</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : (data?.length ?? 0) === 0 ? (
        <p className="text-sm text-ink-faint py-8 text-center">No fuel sharing entries for this month yet</p>
      ) : (
        <div className="space-y-3">
          {data?.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-ink-muted">
                    {formatNumber(entry.vehicle_days)} vehicle days · {formatNumber(entry.avg_km_per_day)} km/day · {formatCurrency(entry.fuel_cost_per_km)}/km
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleReceived.mutate({ id: entry.id, isReceived: !entry.is_received })}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer",
                        entry.is_received
                          ? "bg-ledger/15 border-ledger/40 text-ledger hover:bg-ledger/25"
                          : "bg-white/[0.04] border-base-border text-ink-muted hover:border-fuel/40 hover:text-ink"
                      )}
                    >
                      {entry.is_received ? <CheckSquare className="h-3.5 w-3.5 text-ledger" /> : <Square className="h-3.5 w-3.5 text-ink-faint" />}
                      Received
                    </button>
                    <button onClick={() => remove.mutate(entry.id)} className="text-ink-faint hover:text-danger transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-ink-faint text-xs mb-0.5">Total fuel cost</p>
                    <p className="tabular font-medium">{formatCurrency(entry.fuelCost)}</p>
                  </div>
                  <div>
                    <p className="text-ink-faint text-xs mb-0.5">Person1 share</p>
                    <p className="tabular font-medium">{formatCurrency(entry.person1Fuel)}</p>
                  </div>
                  <div>
                    <p className="text-ink-faint text-xs mb-0.5">Person2 reimbursement</p>
                    <p className={cn("tabular font-medium", entry.is_received ? "text-ledger" : "text-ink-muted")}>
                      {formatCurrency(entry.person2Fuel)} {entry.is_received ? "(Received)" : "(Pending)"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
