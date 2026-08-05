# RideLedger

Personal bike finance, fuel, reimbursement, maintenance and expense tracker.

Live Supabase project: `rideledger` (ref `ttxjmxeydoehkltfisia`, region `ap-south-1`).
The schema is already applied — you only need to plug in keys and run both apps.

## Architecture

```
client/   React 19 + TypeScript + Vite + Tailwind + TanStack Query/Table + Recharts
server/   Node + Express + TypeScript, talking to Supabase (Postgres + Auth)
```

**Nothing derived is stored.** Opening/closing balance, mileage, cost/km, and monthly
fuel summaries are all computed on every request from raw rows (income, expenses,
fillups, fuel-sharing entries). Edit an old month and everything after it updates
automatically the next time it's read — there's no cache to invalidate because
nothing was ever cached.

## 1. Get your Supabase service role key

The project is already live. Go to the Supabase Dashboard → your `rideledger`
project → **Project Settings → API**, and copy the **service_role** secret key
(not the anon/publishable one — that one's already filled in for you).

## 2. Server setup

```bash
cd server
cp .env.example .env
# paste your service role key into SUPABASE_SERVICE_ROLE_KEY in .env
npm install
npm run dev        # http://localhost:4000
```

## 3. Client setup

```bash
cd client
cp .env.example .env   # already points at the live Supabase project + localhost:4000
npm install
npm run dev             # http://localhost:5173
```

## 4. Try it

1. Open the client, register an account (Supabase Auth sends a confirmation email —
   check the Supabase dashboard's Auth logs if you don't have email sending configured
   for the project yet).
2. Sign in, create your first month, log a fuel fillup or two, add some income/expenses.
3. Watch the dashboard and ledger update — everything is computed live.

## What's included

- Full auth flow: register, login, forgot/reset password, logout (Supabase Auth)
- Months, Income, Other Expenses — full CRUD, categorized, totals
- Fuel Fillups — mileage & cost/km derived from consecutive odometer readings;
  edit an early fillup and every later calculation updates automatically
- Fuel Sharing calculator → Person2 reimbursement, feeding straight into the ledger
- The ledger engine — cascading opening/closing balance across every month
- Maintenance log + Chain Service Tracker (500km checkpoint ladder: completed /
  pending / locked, progress bar, history stats)
- Dashboard with live cards + balance trend chart
- Settings (bike info, defaults, chain-service interval)
- Dark, glassmorphic UI with the requested stack (React Hook Form/Zod wiring is in
  the server-side validation layer and ready to mirror client-side; toast notifications,
  loading skeletons, and optimistic-feeling mutations via TanStack Query throughout)

## Not yet built (next phase)

- Reports: PDF / CSV / Excel export, yearly report view
- Global search across months/expenses/fuel/maintenance
- Full statistics page (best/worst mileage, yearly rollups) — the ledger/fuel
  services already expose everything needed, this is a UI pass
- Keyboard shortcuts, "Recalculate Historical Data" settings action, invoice image
  upload UI (the `invoice_image_url` column and API field exist; wire up Supabase
  Storage when you're ready)

These are straightforward additions on top of the services already built — say the
word and I'll keep going.
