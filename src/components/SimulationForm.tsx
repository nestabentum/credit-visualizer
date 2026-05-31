import { useState } from 'react';

export interface SimFormValues {
  extraAmount: string;
  atMonth: string;
}

interface Props {
  values: SimFormValues;
  onChange: (values: SimFormValues) => void;
  maxMonth: number;
}

export default function SimulationForm({ values, onChange, maxMonth }: Props) {
  const [touched, setTouched] = useState<Partial<Record<keyof SimFormValues, boolean>>>({});

  function handle(field: keyof SimFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setTouched((t) => ({ ...t, [field]: true }));
      onChange({ ...values, [field]: e.target.value });
    };
  }

  const errors: Partial<Record<keyof SimFormValues, string>> = {};
  if (touched.extraAmount && (isNaN(Number(values.extraAmount)) || Number(values.extraAmount) <= 0))
    errors.extraAmount = 'Please enter a positive amount.';

  const monthNum = Number(values.atMonth);
  if (touched.atMonth && (isNaN(monthNum) || !Number.isInteger(monthNum) || monthNum < 1 || monthNum > maxMonth))
    errors.atMonth = `Please enter a month between 1 and ${maxMonth}.`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-1">Extra Payment Simulation</h2>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        Simulate a one-time lump sum paid directly into the principal.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Extra Amount */}
        <div className="flex flex-col gap-1">
          <label htmlFor="extraAmount" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Extra Payment (€)
          </label>
          <input
            id="extraAmount"
            type="number"
            inputMode="decimal"
            min="1"
            step="500"
            placeholder="e.g. 5000"
            value={values.extraAmount}
            onChange={handle('extraAmount')}
            className={`rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 ${
              errors.extraAmount ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.extraAmount && <p className="text-xs text-red-400">{errors.extraAmount}</p>}
        </div>

        {/* At Month */}
        <div className="flex flex-col gap-1">
          <label htmlFor="atMonth" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            In Month #
          </label>
          <input
            id="atMonth"
            type="number"
            inputMode="numeric"
            min="1"
            max={maxMonth}
            step="1"
            placeholder={`1–${maxMonth}`}
            value={values.atMonth}
            onChange={handle('atMonth')}
            className={`rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 ${
              errors.atMonth ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.atMonth && <p className="text-xs text-red-400">{errors.atMonth}</p>}
        </div>
      </div>
    </div>
  );
}
