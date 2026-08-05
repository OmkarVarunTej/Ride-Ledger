import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { api } from "@/lib/api";
import type { MonthRow } from "@/types/domain";
import { Card, CardContent, Input, Select, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { formatCurrency, MONTH_NAMES } from "@/lib/utils";

export function MonthsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: months, isLoading } = useQuery({
    queryKey: ["months"],
    queryFn: () => api.get<{ data: MonthRow[] }>("/months").then((r) => r.data),
  });

  const createMonth = useMutation({
    mutationFn: () => api.post("/months", { year, month }),
    onSuccess: () => {
      toast.success("Month created");
      queryClient.invalidateQueries({ queryKey: ["months"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setShowForm(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not create month"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createMonth.mutate();
  }

  const sorted = [...(months ?? [])].sort((a, b) => (a.year === b.year ? b.month - a.month : b.year - a.year));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Months</h1>
          <p className="text-sm text-ink-muted mt-1">Every month you've tracked, with its running ledger</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus className="h-4 w-4" /> New month
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
              <div className="w-40">
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Month</label>
                <Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  {MONTH_NAMES.map((name, i) => (
                    <option key={name} value={i + 1}>{name}</option>
                  ))}
                </Select>
              </div>
              <div className="w-32">
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Year</label>
                <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
              </div>
              <Button type="submit" loading={createMonth.isPending}>Create</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-ink-muted">No months yet</p>
            <p className="text-xs text-ink-faint mt-1">Create your first month to start the ledger</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {sorted.map((m) => (
            <Link key={m.id} to={`/months/${m.id}`}>
              <Card className="hover:border-fuel/40 transition-colors h-full">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-medium">{MONTH_NAMES[m.month - 1]} {m.year}</h3>
                    <ArrowRight className="h-4 w-4 text-ink-faint" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-ink-faint text-xs mb-0.5">Opening</p>
                      <p className="tabular font-medium">{formatCurrency(m.ledger?.openingBalance ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-ink-faint text-xs mb-0.5">Closing</p>
                      <p className="tabular font-medium text-ledger">{formatCurrency(m.ledger?.closingBalance ?? 0)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-ledger" />
                      <p className="tabular text-ink-muted">{formatCurrency(m.ledger?.income ?? 0)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="h-3.5 w-3.5 text-danger" />
                      <p className="tabular text-ink-muted">{formatCurrency((m.ledger?.otherExpenses ?? 0) + (m.ledger?.fuelCost ?? 0))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
