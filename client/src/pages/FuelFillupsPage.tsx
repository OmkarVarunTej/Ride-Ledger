import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flexRender, getCoreRowModel, useReactTable, createColumnHelper } from "@tanstack/react-table";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { FuelFillup } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, Input, Skeleton } from "@/components/ui/primitives";
import { formatCurrency, formatNumber } from "@/lib/utils";

const columnHelper = createColumnHelper<FuelFillup>();

export function FuelFillupsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    odometer: "",
    amountPaid: "",
    litres: "",
    pricePerLitre: "",
    fuelType: "Petrol",
    station: "",
    notes: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["fillups"],
    queryFn: () => api.get<{ data: FuelFillup[] }>("/fuel-fillups").then((r) => r.data),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["fillups"] });
    queryClient.invalidateQueries({ queryKey: ["months"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  };

  const create = useMutation({
    mutationFn: () =>
      api.post("/fuel-fillups", {
        date: form.date,
        odometer: Number(form.odometer),
        amountPaid: Number(form.amountPaid),
        litres: Number(form.litres),
        pricePerLitre: Number(form.pricePerLitre),
        fuelType: form.fuelType,
        station: form.station || null,
        notes: form.notes || null,
      }),
    onSuccess: () => {
      toast.success("Fillup logged");
      invalidate();
      setShowForm(false);
      setForm((f) => ({ ...f, odometer: "", amountPaid: "", litres: "", pricePerLitre: "", station: "", notes: "" }));
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add fillup"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/fuel-fillups/${id}`),
    onSuccess: () => {
      toast.success("Fillup removed");
      invalidate();
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor("date", { header: "Date" }),
      columnHelper.accessor("odometer", { header: "Odometer", cell: (c) => `${formatNumber(c.getValue(), 0)} km` }),
      columnHelper.accessor("litres", { header: "Litres", cell: (c) => formatNumber(c.getValue(), 2) }),
      columnHelper.accessor("price_per_litre", { header: "₹/L", cell: (c) => formatCurrency(c.getValue()) }),
      columnHelper.accessor("amount_paid", { header: "Amount", cell: (c) => formatCurrency(c.getValue()) }),
      columnHelper.accessor("distanceSinceLast", { header: "Distance", cell: (c) => (c.getValue() != null ? `${formatNumber(c.getValue()!, 0)} km` : "—") }),
      columnHelper.accessor("mileageKmpl", { header: "Mileage", cell: (c) => (c.getValue() != null ? `${formatNumber(c.getValue()!)} km/l` : "—") }),
      columnHelper.accessor("costPerKm", { header: "Cost/km", cell: (c) => (c.getValue() != null ? formatCurrency(c.getValue()!) : "—") }),
      columnHelper.accessor("station", { header: "Station", cell: (c) => c.getValue() ?? "—" }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (c) => (
          <button onClick={() => remove.mutate(c.row.original.id)} className="text-ink-faint hover:text-danger transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        ),
      }),
    ],
    [remove]
  );

  const table = useReactTable({ data: data ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Fuel Fillups</h1>
          <p className="text-sm text-ink-muted mt-1">Mileage and cost/km are derived automatically from consecutive odometer readings</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}><Plus className="h-4 w-4" /> Log fillup</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-4 gap-3 items-end">
              <Field label="Date"><Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Odometer (km)"><Input type="number" min={0} step="0.1" required value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} /></Field>
              <Field label="Litres"><Input type="number" min={0.01} step="0.01" required value={form.litres} onChange={(e) => setForm({ ...form, litres: e.target.value })} /></Field>
              <Field label="Price / litre"><Input type="number" min={0} step="0.01" required value={form.pricePerLitre} onChange={(e) => setForm({ ...form, pricePerLitre: e.target.value })} /></Field>
              <Field label="Amount paid"><Input type="number" min={0} step="0.01" required value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} /></Field>
              <Field label="Fuel type"><Input value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} /></Field>
              <Field label="Station"><Input value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} /></Field>
              <Field label="Notes"><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
              <div className="sm:col-span-4 flex gap-2">
                <Button type="submit" size="sm" loading={create.isPending}>Save</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (data?.length ?? 0) === 0 ? (
        <Card><CardContent className="py-12 text-center"><p className="text-sm text-ink-muted">No fillups logged yet</p></CardContent></Card>
      ) : (
        <div className="rounded-xl border border-base-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-base-border bg-base-panel/60">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="text-left px-4 py-3 text-xs font-medium text-ink-muted whitespace-nowrap">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-base-border last:border-0 hover:bg-white/[0.02]">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 tabular whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-muted mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
