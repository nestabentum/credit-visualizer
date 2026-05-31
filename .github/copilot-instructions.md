# Copilot Instructions — Credit Visualizer

## Commands

```bash
npm run dev        # start dev server at http://localhost:5173
npm run build      # tsc type-check + vite production build (dist/)
npm run preview    # serve the production build locally
```

There is no test runner configured. Type-check alone: `npx tsc --noEmit`.

## Architecture

This is a **pure client-side SPA** — no backend, no API calls, no routing. All state lives in `App.tsx`.

Data flows in one direction:

```
FormValues (strings) → App.tsx useMemo → calculatePayoff() → PayoffRow[] → chart + table
```

**Key separation:**
- `src/utils/calculatePayoff.ts` — pure calculation logic with no React dependency. All financial math lives here and nowhere else.
- `src/components/` — presentational components that receive data as props and own no calculation logic.
- `App.tsx` — the single stateful owner: holds `FormValues`, runs the calculation via `useMemo`, and distributes results to child components.

## Key Conventions

### Form state is always strings
`FormValues` (defined in `InputForm.tsx`) stores all numeric inputs as `string`. Conversion to `number` happens only in `App.tsx` inside `useMemo`, not in the components. This avoids controlled-input issues with numeric fields.

### Validation is split across two layers
- **UI validation** (touched-state errors): handled entirely inside `InputForm.tsx` using local `touched` state. Only fires after a field has been interacted with.
- **Domain validation** (`payment_too_low`): returned by `calculatePayoff()` as a `ValidationError` discriminated union, then passed back into `InputForm` via the `paymentTooLow` prop from `App.tsx`.

### `calculatePayoff` returns a union, not throws
```ts
calculatePayoff(input): PayoffResult | ValidationError
```
Always check with `isValidationError()` before using the result. Never assume it returned a `PayoffResult`.

### Currency formatting
All EUR formatting uses `Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })`. Locale is `de-DE` throughout — do not switch to `en-US` or generic formats.

### Chart data shape
`PayoffChart` uses Unix timestamps (`rawDate: number`) as the Recharts X-axis `dataKey` with `type="number" scale="time"`. The first data point is a synthetic "Start" entry reconstructed from `rows[0]` (before the first payment). Do not change the X-axis approach without accounting for this.

### Recharts version
Uses **Recharts v3** (not v2). The `Tooltip` formatter type changed in v3 — `value` is `ValueType | undefined`, so always cast: `EUR.format(Number(value))`.
