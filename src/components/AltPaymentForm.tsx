import { useState } from 'react';

export interface AltPayFormValues {
  altMonthlyPayment: string;
}

interface Props {
  values: AltPayFormValues;
  onChange: (values: AltPayFormValues) => void;
  minPayment: number;
}

export default function AltPaymentForm({ values, onChange, minPayment }: Props) {
  const [touched, setTouched] = useState(false);

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    setTouched(true);
    onChange({ altMonthlyPayment: e.target.value });
  }

  const num = Number(values.altMonthlyPayment);
  let error: string | null = null;
  if (touched && values.altMonthlyPayment !== '') {
    if (isNaN(num) || num <= 0) {
      error = 'Please enter a positive amount.';
    } else if (num <= minPayment) {
      error = `Must be greater than ${new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
      }).format(minPayment)} (minimum to reduce the principal).`;
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-1">
        Alt. Monthly Payment Simulation
      </h2>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        See how a different fixed monthly payment changes your loan duration.
      </p>
      <div className="flex flex-col gap-1">
        <label htmlFor="altMonthlyPayment" className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Alternative Monthly Payment (€)
        </label>
        <input
          id="altMonthlyPayment"
          type="number"
          min={Math.ceil(minPayment) + 1}
          step="50"
          placeholder={`> ${Math.ceil(minPayment)}`}
          value={values.altMonthlyPayment}
          onChange={handle}
          className={`rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
