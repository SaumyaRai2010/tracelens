import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Loader2, ScanSearch } from 'lucide-react';
import { UploadZone } from '../components/examine/UploadZone';
import { useExamination } from '../context/ExaminationContext';
import { formatBytes, formatDateTime } from '../utils/format';

export function Examine() {
  const { primary, isBusy, loadPrimaryFile, analyzePrimary, clearPrimary } =
    useExamination();
  const [error, setError] = useState<string | null>(null);

  const handleAnalyse = async () => {
    setError(null);
    try {
      await analyzePrimary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="panel p-5">
        <h2 className="section-title">Upload Specimen</h2>
        <p className="muted mt-1">
          Drag and drop a JPG, JPEG, HEIC or HEIF photograph or browse locally. Files are validated
          for type and size (max 10 MB) and processed entirely in your browser. HEIC previews are
          converted locally; EXIF and SHA-256 still use the original file bytes.
        </p>
        <div className="mt-5">
          <UploadZone
            disabled={isBusy}
            onFileSelected={async (file) => {
              setError(null);
              await loadPrimaryFile(file);
            }}
          />
        </div>
      </div>

      {error || primary?.error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error || primary?.error}</p>
        </div>
      ) : null}

      {primary ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel overflow-hidden">
            <div className="border-b border-navy-500 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">Image Preview</h3>
            </div>
            <div className="flex min-h-[280px] items-center justify-center bg-navy-950/50 p-4">
              <img
                src={primary.previewUrl}
                alt={`Preview of ${primary.properties.name}`}
                className="max-h-[420px] max-w-full rounded-lg object-contain shadow-panel"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="panel overflow-hidden">
              <div className="border-b border-navy-500 px-4 py-3">
                <h3 className="text-sm font-semibold text-white">File Properties</h3>
              </div>
              <table className="data-table border-0">
                <tbody>
                  <tr>
                    <td className="w-2/5 text-slate-400">Filename</td>
                    <td className="break-all font-mono">{primary.properties.name}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-400">File Size</td>
                    <td className="font-mono">
                      {formatBytes(primary.properties.size)} ({primary.properties.size} bytes)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-slate-400">MIME Type</td>
                    <td className="font-mono">{primary.properties.type || 'Not Available'}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-400">Dimensions</td>
                    <td className="font-mono">
                      {primary.properties.width && primary.properties.height
                        ? `${primary.properties.width} × ${primary.properties.height} px`
                        : 'Not Available'}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-slate-400">Examination ID</td>
                    <td className="font-mono text-teal-300">{primary.id}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-400">Analysis Status</td>
                    <td className="capitalize">{primary.status}</td>
                  </tr>
                  {primary.analyzedAt ? (
                    <tr>
                      <td className="text-slate-400">Analysed At</td>
                      <td>{formatDateTime(primary.analyzedAt)}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary min-w-[180px]"
                disabled={isBusy || primary.status === 'analyzing'}
                onClick={handleAnalyse}
              >
                {primary.status === 'analyzing' || isBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analysing…
                  </>
                ) : (
                  <>
                    <ScanSearch className="h-4 w-4" />
                    Analyse Image
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={isBusy}
                onClick={() => {
                  clearPrimary();
                  setError(null);
                }}
              >
                Remove Image
              </button>
              {primary.status === 'ready' ? (
                <Link to="/metadata" className="btn-secondary">
                  View Metadata
                </Link>
              ) : null}
            </div>

            {primary.status === 'ready' ? (
              <p className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-sm text-teal-200">
                Analysis complete. Continue to Metadata, Integrity, Observations or Report.
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Analysis extracts EXIF with exifr, computes SHA-256 with Web Crypto, and generates
                rule-based observations from the actual file data.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
