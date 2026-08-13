import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Trash2, CheckSquare, Square } from "lucide-react";
import { api } from "@/lib/api";
import type { MoneyToReceiveEntry } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, Input, Skeleton } from "@/components/ui/primitives";
import { formatCurrency, cn } from "@/lib/utils";

export function MoneyToReceiveTab({ monthId }: { monthId: string }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isReceived, setIsReceived] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["money-to-receive", monthId],
    queryFn: () => api.get<{ data: MoneyToReceiveEntry[] }>(`/months/${monthId}/money-to-receive`).then((r) => r.data),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["money-to-receive", monthId] });
    queryClient.invalidateQueries({ queryKey: ["months"] });
    queryClient.invalidateQueries({ queryKey: ["month", monthId] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  };

  const create = useMutation({
    mutationFn: () =>
      api.post(`/months/${monthId}/money-to-receive`, {
        date,
        person,
        amount: Number(amount),
        description: description || null,
        isReceived,
      }),
    onSuccess: () => {
      toast.success("Amount logged");
      invalidate();
      setShowForm(false);
      setPerson("");
      setAmount("");
      setDescription("");
      setIsReceived(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add record"),
  });

  const toggleReceived = useMutation({
    mutationFn: ({ id, nextReceived }: { id: string; nextReceived: boolean }) =>
      api.patch(`/months/${monthId}/money-to-receive/${id}`, { isReceived: nextReceived }),
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not update status"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/months/${monthId}/money-to-receive/${id}`),
    onSuccess: () => {
      toast.success("Entry removed");
      invalidate();
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  const pendingTotal = (data ?? []).filter((r) => !r.is_received).reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          Pending receivables this month: <span className="text-ink font-medium tabular">{formatCurrency(pendingTotal)}</span>
        </p>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          <Plus className="h-3.5 w-3.5" /> Add amount
        </Button>
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
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Person / From</label>
                <Input placeholder="e.g. Person 2" required value={person} onChange={(e) => setPerson(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Amount</label>
                <Input type="number" min={0} step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Reason / Description</label>
                <Input placeholder="e.g. Fuel reimbursement" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="sm:col-span-4 flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-ink-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isReceived}
                    onChange={(e) => setIsReceived(e.target.checked)}
                    className="rounded border-base-border bg-base-panel text-fuel focus:ring-0"
                  />
                  Mark as Received immediately
                </label>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={create.isPending}>Save</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : (data?.length ?? 0) === 0 ? (
        <p className="text-sm text-ink-faint py-8 text-center">No money to receive entries for this month yet</p>
      ) : (
        <div className="space-y-3">
          {data?.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="pt-4 pb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{entry.person}</p>
                  <p className="text-xs text-ink-muted">{entry.description || "Money to receive"}</p>
                  <p className="text-xs text-ink-faint mt-1">{entry.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-display text-base font-semibold tabular text-ink">
                    {formatCurrency(Number(entry.amount))}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleReceived.mutate({ id: entry.id, nextReceived: !entry.is_received })}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer",
                      entry.is_received
                        ? "bg-ledger/15 border-ledger/40 text-ledger hover:bg-ledger/25"
                        : "bg-white/[0.04] border-base-border text-ink-muted hover:border-fuel/40 hover:text-ink"
                    )}
                  >
                    {entry.is_received ? (
                      <>
                        <CheckSquare className="h-4 w-4 text-ledger" /> Received
                      </>
                    ) : (
                      <>
                        <Square className="h-4 w-4 text-ink-faint" /> Received
                      </>
                    )}
                  </button>
                  <button onClick={() => remove.mutate(entry.id)} className="text-ink-faint hover:text-danger transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
