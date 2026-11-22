import { ShieldAlert } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { SeverityBadge } from '../components/ui/StatusBadge';
import { useExamination } from '../context/ExaminationContext';

export function Observations() {
  const { primary } = useExamination();

  if (!primary || primary.status !== 'ready' || primary.observations.length === 0) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="No forensic observations yet"
        description="Run image analysis to generate rule-based observations from the actual extracted metadata."
        actionLabel="Go to Image Examination"
        actionTo="/examine"
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="panel p-5">
        <h2 className="section-title">Rule-Based Forensic Observations</h2>
        <p className="muted mt-1">
          Observations are derived only from data extracted from{' '}
          <span className="text-slate-200">{primary.properties.name}</span>. TraceLens never labels an
          image genuine, fake, manipulated or tampered solely from missing metadata.
        </p>
      </div>

      <div className="space-y-4">
        {primary.observations.map((obs) => (
          <article key={obs.id} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-white">{obs.observation}</h3>
              <SeverityBadge severity={obs.severity} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="label">Reason</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">{obs.reason}</p>
              </div>
              <div>
                <p className="label">Forensic Relevance</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">{obs.relevance}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
