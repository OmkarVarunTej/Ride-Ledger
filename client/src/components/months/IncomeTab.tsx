import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { INCOME_CATEGORIES, type IncomeEntry } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, Input, Select, Skeleton } from "@/components/ui/primitives";
import { formatCurrency } from "@/lib/utils";

export function IncomeTab({ monthId }: { monthId: string }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<(typeof INCOME_CATEGORIES)[number]>("Monthly Allowance");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["income", monthId],
    queryFn: () => api.get<{ data: IncomeEntry[]; total: number }>(`/months/${monthId}/income`),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["income", monthId] });
    queryClient.invalidateQueries({ queryKey: ["months"] });
    queryClient.invalidateQueries({ queryKey: ["month", monthId] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  };

  const create = useMutation({
    mutationFn: () => api.post(`/months/${monthId}/income`, { date, category, amount: Number(amount), description: description || null }),
    onSuccess: () => {
      toast.success("Income added");
      invalidate();
      setShowForm(false);
      setAmount("");
      setDescription("");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add income"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/months/${monthId}/income/${id}`),
    onSuccess: () => {
      toast.success("Income removed");
      invalidate();
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">Total: <span className="text-ink font-medium tabular">{formatCurrency(data?.total ?? 0)}</span></p>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}><Plus className="h-3.5 w-3.5" /> Add income</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Date</label>
                <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Category</label>
                <Select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
                  {INCOME_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Amount</label>
                <Input type="number" min={0} step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="sm:col-span-1 flex gap-2">
                <Input placeholder="Note (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
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
        <Skeleton className="h-40" />
      ) : (data?.data.length ?? 0) === 0 ? (
        <p className="text-sm text-ink-faint py-8 text-center">No income entries for this month yet</p>
      ) : (
        <div className="rounded-xl border border-base-border divide-y divide-base-border overflow-hidden">
          {data?.data.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-4 py-3 bg-base-panel/40">
              <div>
                <p className="text-sm font-medium">{entry.category}</p>
                <p className="text-xs text-ink-faint">{entry.date}{entry.description ? ` · ${entry.description}` : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="tabular text-sm font-medium text-ledger">{formatCurrency(entry.amount)}</p>
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
