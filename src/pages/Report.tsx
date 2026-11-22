import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { useExamination } from '../context/ExaminationContext';
import { formatBytes, formatDateTime } from '../utils/format';
import { generateForensicReport } from '../utils/pdf';

export function Report() {
  const { primary } = useExamination();
  const [examinerName, setExaminerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  if (!primary || primary.status !== 'ready' || !primary.metadata || !primary.hash) {
    return (
      <EmptyState
        icon={FileText}
        title="No examination ready for reporting"
        description="Complete an image analysis first. The PDF includes examination ID, file properties, metadata, SHA-256, observations and examiner attestation space."
        actionLabel="Go to Image Examination"
        actionTo="/examine"
      />
    );
  }

  const handleDownload = async () => {
    setError(null);
    setGenerating(true);
    try {
      generateForensicReport(primary, examinerName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF report.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="panel p-5">
        <h2 className="section-title">Forensic Examination Report</h2>
        <p className="muted mt-1">
          Generate a client-side PDF summarising the current examination. Reports are created
          locally with jsPDF — no server upload.
        </p>
      </div>

      <div className="panel space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="label">Examination ID</p>
            <p className="mt-1 font-mono text-sm text-teal-300">{primary.id}</p>
          </div>
          <div>
            <p className="label">Examination Date/Time</p>
            <p className="mt-1 text-sm text-slate-200">
              {formatDateTime(primary.analyzedAt)}
            </p>
          </div>
          <div>
            <p className="label">Filename</p>
            <p className="mt-1 break-all text-sm text-slate-200">{primary.properties.name}</p>
          </div>
          <div>
            <p className="label">File Size</p>
            <p className="mt-1 text-sm text-slate-200">
              {formatBytes(primary.properties.size)}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="examiner" className="label">
            Examiner Name (optional)
          </label>
          <input
            id="examiner"
            type="text"
            value={examinerName}
            onChange={(e) => setExaminerName(e.target.value)}
            placeholder="Enter examiner name for the attestation block"
            className="mt-2 w-full rounded-lg border border-navy-500 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none ring-accent-blue/40 placeholder:text-slate-500 focus:ring-2"
          />
        </div>

        <div className="rounded-lg border border-navy-500 bg-navy-850/80 p-4 text-sm text-slate-300">
          <p className="font-medium text-white">Report contents</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>TraceLens heading and examination identifiers</li>
            <li>Uploaded filename and file properties</li>
            <li>Extracted metadata groups</li>
            <li>SHA-256 hash and integrity guidance</li>
            <li>Forensic observations with reasons</li>
            <li>Limitations, disclaimer, examiner name and signature space</li>
          </ul>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          className="btn-primary"
          disabled={generating}
          onClick={handleDownload}
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}
