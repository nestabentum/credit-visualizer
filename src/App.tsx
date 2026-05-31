import { useEffect, useMemo, useState } from 'react';
import InputForm, { type FormValues } from './components/InputForm';
import PayoffChart from './components/PayoffChart';
import PayoffTable from './components/PayoffTable';
import SimulationForm, { type SimFormValues } from './components/SimulationForm';
import AltPaymentForm, { type AltPayFormValues } from './components/AltPaymentForm';
import SavingsCard from './components/SavingsCard';
import {
  calculatePayoff,
  isValidationError,
  minMonthlyPayment,
  type PayoffResult,
} from './utils/calculatePayoff';

const EUR = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

/** Parses a YYYY-MM-DD string as local midnight, avoiding the UTC-offset date-shift bug. */
function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function todayFirstOfMonth(): string {
  const d = new Date();
  // Jump to next 1st if we're not already on it
  if (d.getDate() > 1) d.setMonth(d.getMonth() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

export default function App() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('darkMode', String(dark));
  }, [dark]);

  const [form, setForm] = useState<FormValues>({
    creditAmount: '',
    annualRatePercent: '',
    monthlyPayment: '',
    startDate: todayFirstOfMonth(),
  });

  const [simForm, setSimForm] = useState<SimFormValues>({
    extraAmount: '',
    atMonth: '',
  });

  const [altPayForm, setAltPayForm] = useState<AltPayFormValues>({
    altMonthlyPayment: '',
  });

  const result = useMemo<{ data: PayoffResult; paymentTooLow?: number } | null>(() => {
    const amount = Number(form.creditAmount);
    const rate = Number(form.annualRatePercent);
    const payment = Number(form.monthlyPayment);

    if (!amount || form.annualRatePercent === '' || isNaN(rate) || !payment || !form.startDate) return null;
    if (amount <= 0 || rate < 0 || payment <= 0) return null;

    const startDate = parseLocalDate(form.startDate);
    if (isNaN(startDate.getTime())) return null;

    const calc = calculatePayoff({ creditAmount: amount, annualRatePercent: rate, monthlyPayment: payment, startDate });

    if (isValidationError(calc)) {
      if (calc.type === 'payment_too_low') {
        return { data: { rows: [], totalInterest: 0, totalPaid: 0 }, paymentTooLow: calc.minPayment };
      }
      return null;
    }

    return { data: calc };
  }, [form]);

  // Simulation calculation — only runs when base is valid and sim inputs are filled
  const simResult = useMemo<PayoffResult | null>(() => {
    if (!result?.data || result.data.rows.length === 0) return null;

    const extraAmount = Number(simForm.extraAmount);
    const atMonth = Number(simForm.atMonth);

    if (!extraAmount || extraAmount <= 0 || !atMonth || !Number.isInteger(atMonth)) return null;
    if (atMonth < 1 || atMonth > result.data.rows.length) return null;

    const amount = Number(form.creditAmount);
    const rate = Number(form.annualRatePercent);
    const payment = Number(form.monthlyPayment);
    const startDate = parseLocalDate(form.startDate);

    const calc = calculatePayoff({
      creditAmount: amount,
      annualRatePercent: rate,
      monthlyPayment: payment,
      startDate,
      extraPayment: { amount: extraAmount, atMonth },
    });

    return isValidationError(calc) ? null : calc;
  }, [simForm, result, form]);

  // Alt monthly payment simulation
  const altPayResult = useMemo<PayoffResult | null>(() => {
    if (!result?.data || result.data.rows.length === 0) return null;

    const altPayment = Number(altPayForm.altMonthlyPayment);
    const amount = Number(form.creditAmount);
    const rate = Number(form.annualRatePercent);
    const minPay = minMonthlyPayment(amount, rate);

    if (!altPayment || altPayment <= minPay) return null;

    const startDate = parseLocalDate(form.startDate);

    const calc = calculatePayoff({
      creditAmount: amount,
      annualRatePercent: rate,
      monthlyPayment: altPayment,
      startDate,
    });

    return isValidationError(calc) ? null : calc;
  }, [altPayForm, result, form]);

  const paymentTooLow = result?.paymentTooLow ?? null;
  const rows = result?.data.rows ?? [];
  const totalInterest = result?.data.totalInterest ?? 0;
  const totalPaid = result?.data.totalPaid ?? 0;

  const minPaymentHint = useMemo(() => {
    const amount = Number(form.creditAmount);
    const rate = Number(form.annualRatePercent);
    if (amount > 0 && rate >= 0 && !isNaN(rate)) {
      return minMonthlyPayment(amount, rate);
    }
    return null;
  }, [form.creditAmount, form.annualRatePercent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
              💳 Credit Visualizer
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter your loan details to see your payoff schedule and balance curve.
            </p>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="mt-1 flex-shrink-0 rounded-full p-2 text-xl bg-white dark:bg-gray-700 shadow hover:shadow-md transition-shadow"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </header>

        {/* Input form */}
        <InputForm values={form} onChange={setForm} paymentTooLow={paymentTooLow} />

        {/* Minimum payment hint */}
        {minPaymentHint !== null && minPaymentHint > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 -mt-3 pl-1">
            Minimum payment to reduce principal at this rate: <strong>{EUR.format(minPaymentHint)}</strong> / month
          </p>
        )}

        {/* Summary strip */}
        {rows.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard label="Loan Amount" value={EUR.format(Number(form.creditAmount))} />
            <SummaryCard label="Total Payments" value={rows.length.toString()} suffix="months" />
            <SummaryCard label="Total Interest" value={EUR.format(totalInterest)} highlight="red" />
            <SummaryCard label="Total Paid" value={EUR.format(totalPaid)} highlight="blue" />
          </div>
        )}

        {/* Empty state */}
        {rows.length === 0 && !paymentTooLow && (
          <div className="text-center text-gray-400 dark:text-gray-500 py-16 text-sm">
            Fill in the fields above to generate your payoff plan.
          </div>
        )}

        {/* Simulation panels — shown only when base schedule is ready */}
        {rows.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SimulationForm values={simForm} onChange={setSimForm} maxMonth={rows.length} />
            <AltPaymentForm
              values={altPayForm}
              onChange={setAltPayForm}
              minPayment={minMonthlyPayment(Number(form.creditAmount), Number(form.annualRatePercent))}
            />
          </div>
        )}

        {/* Savings summaries */}
        {(simResult || altPayResult) && result?.data && rows.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {simResult && (
              <SavingsCard
                base={result.data}
                sim={simResult}
                title="Extra Payment"
                accentColor="green"
              />
            )}
            {altPayResult && (
              <SavingsCard
                base={result.data}
                sim={altPayResult}
                title="Alt. Monthly Payment"
                accentColor="orange"
              />
            )}
          </div>
        )}

        {/* Chart */}
        <PayoffChart rows={rows} simRows={simResult?.rows} altRows={altPayResult?.rows} />

        {/* Table */}
        <PayoffTable rows={rows} />
      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  suffix?: string;
  highlight?: 'red' | 'blue';
}

function SummaryCard({ label, value, suffix, highlight }: SummaryCardProps) {
  const valueColor =
    highlight === 'red'
      ? 'text-red-500'
      : highlight === 'blue'
      ? 'text-blue-600 dark:text-blue-400'
      : 'text-gray-800 dark:text-gray-100';
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow px-4 py-3 flex flex-col gap-1">
      <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</span>
      <span className={`text-lg font-bold ${valueColor}`}>
        {value}
        {suffix && <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">{suffix}</span>}
      </span>
    </div>
  );
}
