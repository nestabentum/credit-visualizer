import { useState } from 'react';
import { parseGermanNumber } from '../utils/parseNumber';

export interface FormValues {
  creditAmount: string;
  annualRatePercent: string;
  monthlyPayment: string;
  startDate: string;
}

interface Props {
  values: FormValues;
  onChange: (values: FormValues) => void;
  paymentTooLow?: number | null;
}

export default function InputForm({ values, onChange, paymentTooLow }: Props) {
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});

  function handle(field: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setTouched((t) => ({ ...t, [field]: true }));
      onChange({ ...values, [field]: e.target.value });
    };
  }

  const errors: Partial<Record<keyof FormValues, string>> = {};
  if (touched.creditAmount && (isNaN(parseGermanNumber(values.creditAmount)) || parseGermanNumber(values.creditAmount) <= 0))
    errors.creditAmount = 'Please enter a positive amount.';
  if (touched.annualRatePercent && (values.annualRatePercent === '' || isNaN(parseGermanNumber(values.annualRatePercent)) || parseGermanNumber(values.annualRatePercent) < 0))
    errors.annualRatePercent = 'Please enter a rate ≥ 0.';
  if (touched.monthlyPayment && (isNaN(parseGermanNumber(values.monthlyPayment)) || parseGermanNumber(values.monthlyPayment) <= 0))
    errors.monthlyPayment = 'Please enter a positive payment.';
  if (paymentTooLow != null && touched.monthlyPayment)
    errors.monthlyPayment = `Payment must exceed the first month's interest (${fmt(paymentTooLow)}).`;
  if (touched.startDate && !values.startDate)
    errors.startDate = 'Please select a start date.';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Field
        label="Credit Amount (€)"
        id="creditAmount"
        type="text"
        placeholder="z.B. 20.000"
        value={values.creditAmount}
        onChange={handle('creditAmount')}
        error={errors.creditAmount}
        inputMode="decimal"
      />
      <Field
        label="Interest Rate (% p.a.)"
        id="annualRatePercent"
        type="text"
        placeholder="z.B. 3,5"
        value={values.annualRatePercent}
        onChange={handle('annualRatePercent')}
        error={errors.annualRatePercent}
        inputMode="decimal"
      />
      <Field
        label="Monthly Payment (€)"
        id="monthlyPayment"
        type="text"
        placeholder="z.B. 350"
        value={values.monthlyPayment}
        onChange={handle('monthlyPayment')}
        error={errors.monthlyPayment}
        inputMode="decimal"
      />
      <Field
        label="First Payment Date"
        id="startDate"
        type="date"
        placeholder=""
        value={values.startDate}
        onChange={handle('startDate')}
        error={errors.startDate}
      />
    </div>
  );
}

interface FieldProps {
  label: string;
  id: string;
  type: string;
  min?: string;
  step?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

function Field({ label, id, type, min, step, placeholder, value, onChange, error, inputMode }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <input
        id={id}
        type={type}
        min={min}
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        inputMode={inputMode}
        className={`rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 ${
          error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600'
        }`}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
}
