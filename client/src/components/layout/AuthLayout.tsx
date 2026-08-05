import type { ReactNode } from "react";
import { Bike } from "lucide-react";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grid-fade px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-fuel/15 border border-fuel/30 flex items-center justify-center mb-4">
            <Bike className="h-6 w-6 text-fuel" />
          </div>
          <h1 className="font-display text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-ink-muted mt-1 text-center">{subtitle}</p>
        </div>
        <div className="glass-panel rounded-2xl p-6">{children}</div>
      </div>
    </div>
  );
}
