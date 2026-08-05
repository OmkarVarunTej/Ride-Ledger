import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, CalendarRange, Fuel, Wrench, Settings as SettingsIcon, LogOut, Bike,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/months", label: "Months", icon: CalendarRange },
  { to: "/fuel", label: "Fuel Fillups", icon: Fuel },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell() {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-grid-fade">
      <div className="flex">
        <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-base-border bg-base-panel/60 backdrop-blur-xl">
          <div className="flex items-center gap-2 px-5 h-16 border-b border-base-border">
            <div className="h-8 w-8 rounded-lg bg-fuel/15 border border-fuel/30 flex items-center justify-center">
              <Bike className="h-4 w-4 text-fuel" />
            </div>
            <span className="font-display font-semibold tracking-tight">RideLedger</span>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-fuel/10 text-fuel" : "text-ink-muted hover:text-ink hover:bg-white/5"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-3 border-t border-base-border">
            <div className="px-3 py-2 text-xs text-ink-faint truncate">{user?.email}</div>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted hover:text-danger hover:bg-danger/5 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </aside>

        <main className="flex-1 md:ml-60 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-base-panel/95 backdrop-blur-xl border-t border-base-border flex justify-around py-2 z-20">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn("flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]", isActive ? "text-fuel" : "text-ink-faint")
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
