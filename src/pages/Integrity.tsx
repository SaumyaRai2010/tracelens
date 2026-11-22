import { useState } from 'react';
import { Check, Copy, Fingerprint } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { useExamination } from '../context/ExaminationContext';
import { copyToClipboard } from '../utils/hash';

export function Integrity() {
  const { primary } = useExamination();
  const [copied, setCopied] = useState(false);

  if (!primary || primary.status !== 'ready' || !primary.hash) {
    return (
      <EmptyState
        icon={Fingerprint}
        title="No integrity hash yet"
        description="Analyse an uploaded JPG or HEIC to calculate its SHA-256 digest from the original file bytes using the Web Crypto API."
        actionLabel="Go to Image Examination"
        actionTo="/examine"
      />
    );
  }

  const handleCopy = async () => {
    await copyToClipboard(primary.hash!);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="panel p-5">
        <h2 className="section-title">SHA-256 File Integrity</h2>
        <p className="muted mt-1">
          Digest calculated from the original uploaded bytes of{' '}
          <span className="text-slate-200">{primary.properties.name}</span>. Recalculate against a
          reference copy to check whether the file bytes have changed.
        </p>
      </div>

      <div className="panel p-5">
        <p className="label">Full SHA-256 Hash</p>
        <p className="mt-3 break-all font-mono text-sm leading-relaxed text-teal-300 sm:text-base">
          {primary.hash}
        </p>
        <button type="button" className="btn-secondary mt-4" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4 text-teal-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Hash
            </>
          )}
        </button>
      </div>

      <div className="panel space-y-3 p-5 text-sm leading-relaxed text-slate-300">
        <h3 className="text-sm font-semibold text-white">How to interpret this hash</h3>
        <p>
          SHA-256 produces a fixed-length fingerprint of the exact byte sequence. If even a single
          byte changes, the resulting hash will differ. Matching hashes indicate that two files are
          byte-identical.
        </p>
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-100">
          A hash alone never proves photographic authenticity, capture provenance, or that visual
          content was not previously edited and re-exported. Use it for integrity verification
          against a known reference, not as a standalone authenticity verdict.
        </p>
      </div>
    </div>
  );
}
