import { displayValue } from '../../utils/format';
import type { MetadataValue } from '../../types/examination';

interface MetadataTableProps {
  title: string;
  rows: Array<{ label: string; value: MetadataValue }>;
}

export function MetadataTable({ title, rows }: MetadataTableProps) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-navy-500 bg-navy-700/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <table className="data-table border-0">
        <tbody>
          {rows.map((row) => {
            const value = displayValue(row.value);
            const unavailable = value === 'Not Available';
            return (
              <tr key={row.label}>
                <td className="w-1/3 font-medium text-slate-400">{row.label}</td>
                <td className={unavailable ? 'font-mono text-slate-500' : 'font-mono text-slate-100'}>
                  {value}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
