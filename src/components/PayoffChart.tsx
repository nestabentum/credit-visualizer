import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import type { PayoffRow } from '../utils/calculatePayoff';

interface Props {
  rows: PayoffRow[];
  simRows?: PayoffRow[];
  altRows?: PayoffRow[];
}

const EUR = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const monthLabel = new Intl.DateTimeFormat('de-DE', { month: 'short', year: 'numeric' });

interface ChartPoint {
  rawDate: number;
  base: number;
  sim?: number;
  altPayment?: number;
}

export default function PayoffChart({ rows, simRows, altRows }: Props) {
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const handler = () => setIsNarrow(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (rows.length === 0) return null;

  const initialBalance = rows[0].remainingBalance + rows[0].principal;
  const initialDate = rows[0].date.getTime() - 1;

  // Build date-keyed maps for sim and alt data
  const simByDate = new Map<number, number>();
  if (simRows && simRows.length > 0) {
    simByDate.set(initialDate, initialBalance);
    for (const r of simRows) {
      simByDate.set(r.date.getTime(), r.remainingBalance);
    }
  }

  const altByDate = new Map<number, number>();
  if (altRows && altRows.length > 0) {
    altByDate.set(initialDate, initialBalance);
    for (const r of altRows) {
      altByDate.set(r.date.getTime(), r.remainingBalance);
    }
  }

  const data: ChartPoint[] = [
    {
      rawDate: initialDate,
      base: initialBalance,
      sim: simRows ? initialBalance : undefined,
      altPayment: altRows ? initialBalance : undefined,
    },
    ...rows.map((r) => ({
      rawDate: r.date.getTime(),
      base: r.remainingBalance,
      sim: simRows ? (simByDate.get(r.date.getTime()) ?? 0) : undefined,
      altPayment: altRows ? (altByDate.get(r.date.getTime()) ?? 0) : undefined,
    })),
  ];

  // Extend data for alt rows that run beyond the base loan end
  if (altRows && altRows.length > 0) {
    const lastBaseDate = rows[rows.length - 1].date.getTime();
    for (const r of altRows) {
      const t = r.date.getTime();
      if (t > lastBaseDate) {
        data.push({ rawDate: t, base: 0, sim: 0, altPayment: r.remainingBalance });
      }
    }
  }

  // Show at most ~12 tick labels on desktop, ~5 on mobile to avoid crowding
  const tickInterval = Math.max(1, Math.floor(data.length / (isNarrow ? 5 : 12)));
  const ticks = data
    .filter((_, i) => i === 0 || i === data.length - 1 || i % tickInterval === 0)
    .map((d) => d.rawDate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">Remaining Balance Over Time</h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="rawDate"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            ticks={ticks}
            tickFormatter={(v) => monthLabel.format(new Date(v))}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(v) => EUR.format(v)}
            tick={{ fontSize: 11 }}
            width={isNarrow ? 68 : 90}
          />
          <Tooltip
            formatter={(value, name) => {
              const label =
                name === 'sim' ? 'With extra payment' :
                name === 'altPayment' ? 'Alt. monthly payment' :
                'Base';
              return [EUR.format(Number(value)), label];
            }}
            labelFormatter={(label) => monthLabel.format(new Date(label as number))}
            contentStyle={{ fontSize: 12 }}
          />
          {(simRows || altRows) && (
            <Legend
              formatter={(v) =>
                v === 'sim' ? 'With extra payment' :
                v === 'altPayment' ? 'Alt. monthly payment' :
                'Base'
              }
            />
          )}
          <ReferenceLine y={0} stroke="#9ca3af" />
          <Line
            type="monotone"
            dataKey="base"
            name="base"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
          {simRows && (
            <Line
              type="monotone"
              dataKey="sim"
              name="sim"
              stroke="#16a34a"
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 5 }}
            />
          )}
          {altRows && (
            <Line
              type="monotone"
              dataKey="altPayment"
              name="altPayment"
              stroke="#ea580c"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 5 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
