import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { api } from "@/lib/api";
import type { ChainServiceTracker } from "@/types/domain";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui/primitives";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ChainServiceWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ["chain-tracker"],
    queryFn: () => api.get<{ data: ChainServiceTracker }>("/maintenance/chain-tracker").then((r) => r.data),
  });

  if (isLoading) return <Skeleton className="h-64" />;
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chain Service Tracker</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 space-y-5">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-ink-muted">Next service in</span>
            <span className="font-medium tabular">{formatNumber(data.nextServiceInKm, 0)} km</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-fuel rounded-full transition-all" style={{ width: `${data.progressPercent}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.checkpoints.map((cp) => (
            <div
              key={cp.index}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                cp.status === "completed" && "bg-ledger/10 border-ledger/30 text-ledger",
                cp.status === "pending" && "bg-fuel/10 border-fuel/30 text-fuel",
                cp.status === "locked" && "bg-white/[0.02] border-base-border text-ink-faint"
              )}
            >
              {cp.status === "completed" && <CheckCircle2 className="h-3.5 w-3.5" />}
              {cp.status === "pending" && <Circle className="h-3.5 w-3.5" />}
              {cp.status === "locked" && <Lock className="h-3.5 w-3.5" />}
              {formatNumber(cp.thresholdKm, 0)} km
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-base-border text-sm">
          <div>
            <p className="text-ink-faint text-xs mb-0.5">Last service</p>
            <p className="font-medium">{data.lastService ? data.lastService.date : "—"}</p>
          </div>
          <div>
            <p className="text-ink-faint text-xs mb-0.5">Last cost</p>
            <p className="tabular font-medium">{data.lastCost != null ? formatCurrency(data.lastCost) : "—"}</p>
          </div>
          <div>
            <p className="text-ink-faint text-xs mb-0.5">Average cost</p>
            <p className="tabular font-medium">{data.averageCost != null ? formatCurrency(data.averageCost) : "—"}</p>
          </div>
          <div>
            <p className="text-ink-faint text-xs mb-0.5">Average interval</p>
            <p className="tabular font-medium">{data.averageIntervalKm != null ? `${formatNumber(data.averageIntervalKm, 0)} km` : "—"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
