import { useMemo, useState } from 'react';
import { AlertTriangle, GitCompare, Loader2 } from 'lucide-react';
import { UploadZone } from '../components/examine/UploadZone';
import { CompareBadge } from '../components/ui/StatusBadge';
import { useExamination } from '../context/ExaminationContext';
import { buildComparison } from '../utils/compare';
import { formatBytes } from '../utils/format';

export function Comparison() {
  const {
    comparisonA,
    comparisonB,
    isBusy,
    loadComparisonFile,
    analyzeComparison,
    clearComparison,
  } = useExamination();
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (
      comparisonA?.status === 'ready' &&
      comparisonB?.status === 'ready' &&
      comparisonA.metadata &&
      comparisonB.metadata &&
      comparisonA.hash &&
      comparisonB.hash
    ) {
      return buildComparison(comparisonA, comparisonB);
    }
    return [];
  }, [comparisonA, comparisonB]);

  const handleCompare = async () => {
    setError(null);
    try {
      await analyzeComparison();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="panel p-5">
        <h2 className="section-title">Compare Two Photographs</h2>
        <p className="muted mt-1">
          Upload two JPG/HEIC images. TraceLens extracts metadata and SHA-256 hashes independently,
          then highlights matching, differing and unavailable values.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {(['A', 'B'] as const).map((slot) => {
          const exam = slot === 'A' ? comparisonA : comparisonB;
          return (
            <div key={slot} className="panel p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Image {slot}</h3>
                {exam ? (
                  <span className="text-xs text-slate-400">{exam.status}</span>
                ) : null}
              </div>
              {exam ? (
                <div className="space-y-3">
                  <div className="flex min-h-[180px] items-center justify-center rounded-lg bg-navy-950/50 p-3">
                    <img
                      src={exam.previewUrl}
                      alt={`Comparison image ${slot}`}
                      className="max-h-48 max-w-full object-contain"
                    />
                  </div>
                  <p className="break-all font-mono text-xs text-slate-300">{exam.properties.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatBytes(exam.properties.size)}
                    {exam.properties.width && exam.properties.height
                      ? ` · ${exam.properties.width}×${exam.properties.height}`
                      : ''}
                  </p>
                </div>
              ) : (
                <UploadZone
                  compact
                  disabled={isBusy}
                  label={`Drop Image ${slot} here`}
                  onFileSelected={async (file) => {
                    setError(null);
                    await loadComparisonFile(slot, file);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary"
          disabled={!comparisonA || !comparisonB || isBusy}
          onClick={handleCompare}
        >
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Comparing…
            </>
          ) : (
            <>
              <GitCompare className="h-4 w-4" />
              Compare Images
            </>
          )}
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={isBusy || (!comparisonA && !comparisonB)}
          onClick={() => {
            clearComparison();
            setError(null);
          }}
        >
          Clear Comparison
        </button>
      </div>

      {rows.length > 0 ? (
        <div className="panel overflow-x-auto">
          <div className="border-b border-navy-500 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Comparison Table</h3>
          </div>
          <table className="data-table min-w-[720px] border-0">
            <thead>
              <tr>
                <th>Field</th>
                <th>Image A</th>
                <th>Image B</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.field}>
                  <td className="font-medium text-slate-300">{row.field}</td>
                  <td className="max-w-xs break-all font-mono text-xs">{row.imageA}</td>
                  <td className="max-w-xs break-all font-mono text-xs">{row.imageB}</td>
                  <td>
                    <CompareBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
