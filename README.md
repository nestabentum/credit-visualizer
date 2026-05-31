# Credit Visualizer

A single-page web app for visualising loan payoff schedules and running what-if simulations.

## Features

- **Payoff schedule** — enter a credit amount, annual interest rate, monthly payment, and start date to generate a full amortisation table
- **Balance chart** — line chart showing remaining balance over time
- **Extra payment simulation** — simulate a one-time lump-sum payment applied directly to the principal; see how many months and how much interest you save
- **Alternative monthly payment simulation** — compare a different fixed monthly payment against your base plan; works for both higher *and* lower payments (shows months/interest added when the alternative is worse)
- **Dark mode** — follows your OS preference by default; toggle persists across sessions

All amounts are in **Euro (€)**, payments are on the **1st of each month**.

## Tech Stack

| Layer | Library |
|---|---|
| Framework | [React 18](https://react.dev) |
| Build tool | [Vite 5](https://vitejs.dev) |
| Language | TypeScript (strict) |
| Styling | [Tailwind CSS v3](https://tailwindcss.com) |
| Charts | [Recharts v3](https://recharts.org) |

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev

# Type-check + production build → dist/
npm run build

# Preview the production build locally
npm run preview
```

## Project Structure

```
src/
├── utils/
│   └── calculatePayoff.ts   # Pure calculation logic (no React)
├── components/
│   ├── InputForm.tsx         # Loan parameter inputs
│   ├── PayoffChart.tsx       # Recharts balance-over-time chart
│   ├── PayoffTable.tsx       # Amortisation schedule table
│   ├── SimulationForm.tsx    # Extra one-time payment inputs
│   ├── AltPaymentForm.tsx    # Alternative monthly payment input
│   └── SavingsCard.tsx       # Savings / cost summary card
└── App.tsx                   # Single stateful owner; all useMemo calcs
```

## Calculation Model

- **Annuity** — fixed monthly payment throughout the loan term
- Monthly interest = `balance × (annualRate / 100 / 12)`
- Monthly principal = `payment − interest`
- Last payment is auto-adjusted to the exact remaining balance
- Extra payment is applied to the principal **before** that month's interest is calculated
- Safety cap: 1 200 months (100 years) to guard against near-zero payments
# credit-visualizer
