import type { ComparisonField, ObservationSeverity } from '../../types/examination';

const severityStyles: Record<ObservationSeverity, string> = {
  info: 'bg-accent-blue/15 text-accent-blue ring-accent-blue/30',
  attention: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  neutral: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
};

const compareStyles: Record<ComparisonField['status'], string> = {
  match: 'bg-teal-500/15 text-teal-300 ring-teal-500/30',
  differ: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  unavailable: 'bg-slate-500/15 text-slate-400 ring-slate-500/30',
};

export function SeverityBadge({ severity }: { severity: ObservationSeverity }) {
  const label =
    severity === 'info' ? 'Informational' : severity === 'attention' ? 'Further Review' : 'Neutral';
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${severityStyles[severity]}`}
    >
      {label}
    </span>
  );
}

export function CompareBadge({ status }: { status: ComparisonField['status'] }) {
  const label =
    status === 'match' ? 'Match' : status === 'differ' ? 'Differ' : 'Unavailable';
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${compareStyles[status]}`}
    >
      {label}
    </span>
  );
}
