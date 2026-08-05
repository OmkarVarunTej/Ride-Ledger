import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  accent = "ink",
  hint,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: "ink" | "fuel" | "ledger" | "danger";
  hint?: string;
}) {
  const accentClass = {
    ink: "text-ink",
    fuel: "text-fuel",
    ledger: "text-ledger",
    danger: "text-danger",
  }[accent];

  return (
    <Card>
      <CardContent className="pt-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-muted mb-1.5">{label}</p>
          <p className={cn("font-display text-2xl font-semibold tabular", accentClass)}>{value}</p>
          {hint && <p className="text-xs text-ink-faint mt-1">{hint}</p>}
        </div>
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", "bg-white/5")}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
