import type { PayoffResult } from '../utils/calculatePayoff';

type AccentColor = 'green' | 'orange';

interface Props {
  base: PayoffResult;
  sim: PayoffResult;
  title?: string;
  accentColor?: AccentColor;
}

const EUR = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

const ACCENT: Record<AccentColor, { card: string; label: string; value: string }> = {
  green: {
    card: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    label: 'text-green-700 dark:text-green-400',
    value: 'text-green-700 dark:text-green-400',
  },
  orange: {
    card: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    label: 'text-orange-700 dark:text-orange-400',
    value: 'text-orange-700 dark:text-orange-400',
  },
};

export default function SavingsCard({ base, sim, title, accentColor = 'green' }: Props) {
  const monthsDelta = base.rows.length - sim.rows.length; // positive = saved, negative = added
  const interestDelta = base.totalInterest - sim.totalInterest; // positive = saved, negative = extra cost
  const accent = ACCENT[accentColor];

  if (monthsDelta === 0 && interestDelta === 0) return null;

  const monthsLabel = monthsDelta >= 0 ? 'Months saved' : 'Months added';
  const monthsValue = monthsDelta !== 0 ? `${Math.abs(monthsDelta)} months` : '—';
  const monthsBad = monthsDelta < 0;

  const interestLabel = interestDelta >= 0 ? 'Interest saved' : 'Extra interest';
  const interestValue = EUR.format(Math.abs(interestDelta));
  const interestBad = interestDelta < 0;

  return (
    <div className={`${accent.card} border rounded-2xl p-5 flex flex-col gap-3`}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{monthsDelta >= 0 && interestDelta >= 0 ? '💡' : '⚠️'}</span>
        {title && <span className={`text-sm font-semibold ${accent.label}`}>{title}</span>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Stat label={monthsLabel} value={monthsValue} accent={accent} bad={monthsBad} />
        <Stat label={interestLabel} value={interestValue} accent={accent} highlight bad={interestBad} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  highlight,
  bad,
}: {
  label: string;
  value: string;
  accent: (typeof ACCENT)[AccentColor];
  highlight?: boolean;
  bad?: boolean;
}) {
  const valueColor = bad
    ? 'text-red-500 dark:text-red-400'
    : highlight
    ? accent.value
    : 'text-gray-800 dark:text-gray-100';
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`text-xs uppercase tracking-wide font-medium ${bad ? 'text-red-500 dark:text-red-400' : accent.label}`}>{label}</span>
      <span className={`text-lg font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}
