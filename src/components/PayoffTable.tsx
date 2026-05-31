import type { PayoffRow } from '../utils/calculatePayoff';

interface Props {
  rows: PayoffRow[];
}

const EUR = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const DATE_FMT = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function PayoffTable({ rows }: Props) {
  if (rows.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Payoff Schedule
        <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">({rows.length} payments)</span>
      </h2>
      <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-700">
        <table className="min-w-full text-sm text-right">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2">Payment</th>
              <th className="px-4 py-2">Interest</th>
              <th className="px-4 py-2">Principal</th>
              <th className="px-4 py-2">Remaining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {rows.map((row) => (
              <tr key={row.month} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 py-2 text-left text-gray-400 dark:text-gray-500">{row.month}</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-300 tabular-nums">
                  {DATE_FMT.format(row.date)}
                </td>
                <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100 tabular-nums">
                  {EUR.format(row.payment)}
                </td>
                <td className="px-4 py-2 text-red-500 dark:text-red-400 tabular-nums">{EUR.format(row.interest)}</td>
                <td className="px-4 py-2 text-green-600 dark:text-green-400 tabular-nums">{EUR.format(row.principal)}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-200 tabular-nums font-medium">
                  {EUR.format(row.remainingBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
