import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { api } from "@/lib/api";
import type { MonthRow } from "@/types/domain";
import { Card, CardContent, Skeleton } from "@/components/ui/primitives";
import { formatCurrency, MONTH_NAMES, cn } from "@/lib/utils";
import { IncomeTab } from "@/components/months/IncomeTab";
import { ExpensesTab } from "@/components/months/ExpensesTab";
import { FuelSharingTab } from "@/components/months/FuelSharingTab";
import { MoneyToReceiveTab } from "@/components/months/MoneyToReceiveTab";

const TABS = ["Income", "Expenses", "Fuel Sharing", "Money to Receive"] as const;

export function MonthDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Income");

  const { data: month, isLoading } = useQuery({
    queryKey: ["month", id],
    queryFn: () => api.get<{ data: MonthRow }>(`/months/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading || !month) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const ledger = month.ledger;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/months" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-3">
          <ChevronLeft className="h-4 w-4" /> Months
        </Link>
        <h1 className="font-display text-2xl font-semibold">{MONTH_NAMES[month.month - 1]} {month.year}</h1>
      </div>

      <Card>
        <CardContent className="pt-5 grid grid-cols-2 md:grid-cols-5 gap-4">
          <LedgerFigure label="Opening" value={ledger?.openingBalance ?? 0} />
          <LedgerFigure label="+ Income" value={ledger?.income ?? 0} tone="positive" />
          <LedgerFigure label="− Fuel" value={ledger?.fuelCost ?? 0} tone="negative" />
          <LedgerFigure label="+ Reimbursement" value={ledger?.person2Reimbursement ?? 0} tone="positive" />
          <LedgerFigure label="− Expenses" value={ledger?.otherExpenses ?? 0} tone="negative" />
        </CardContent>
        <div className="border-t border-base-border px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-ink-muted">Closing balance</p>
          <p className="font-display text-xl font-semibold text-ledger tabular">{formatCurrency(ledger?.closingBalance ?? 0)}</p>
        </div>
      </Card>

      <div className="flex gap-1 border-b border-base-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t ? "border-fuel text-fuel" : "border-transparent text-ink-muted hover:text-ink"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {id && (
        <>
          {tab === "Income" && <IncomeTab monthId={id} />}
          {tab === "Expenses" && <ExpensesTab monthId={id} />}
          {tab === "Fuel Sharing" && <FuelSharingTab monthId={id} />}
          {tab === "Money to Receive" && <MoneyToReceiveTab monthId={id} />}
        </>
      )}
    </div>
  );
}

function LedgerFigure({ label, value, tone }: { label: string; value: number; tone?: "positive" | "negative" }) {
  const color = tone === "positive" ? "text-ledger" : tone === "negative" ? "text-danger" : "text-ink";
  return (
    <div>
      <p className="text-xs text-ink-faint mb-1">{label}</p>
      <p className={cn("tabular font-medium", color)}>{formatCurrency(value)}</p>
    </div>
  );
}
