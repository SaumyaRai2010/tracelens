import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { FileImage, UploadCloud } from 'lucide-react';
import {
  ACCEPTED_FILE_LABEL,
  FILE_INPUT_ACCEPT,
  MAX_FILE_SIZE_BYTES,
} from '../../types/examination';
import { formatBytes } from '../../utils/format';

interface UploadZoneProps {
  onFileSelected: (file: File) => Promise<void> | void;
  disabled?: boolean;
  label?: string;
  compact?: boolean;
}

export function UploadZone({
  onFileSelected,
  disabled = false,
  label = 'Drop a photograph here',
  compact = false,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setLocalError(null);
      try {
        await onFileSelected(file);
      } catch (error) {
        setLocalError(error instanceof Error ? error.message : 'Upload failed.');
      }
    },
    [onFileSelected],
  );

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    await handleFile(file);
  };

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    await handleFile(file);
    event.target.value = '';
  };

  return (
    <div>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={onDrop}
        className={`relative rounded-xl border-2 border-dashed transition ${
          dragActive
            ? 'border-teal-400 bg-teal-500/10'
            : 'border-navy-500 bg-navy-850/60 hover:border-accent-blue/50'
        } ${disabled ? 'opacity-60' : ''} ${compact ? 'p-6' : 'p-10'}`}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-700 ring-1 ring-navy-500">
            {compact ? (
              <FileImage className="h-6 w-6 text-teal-400" />
            ) : (
              <UploadCloud className="h-6 w-6 text-teal-400" />
            )}
          </div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="mt-1 text-xs text-slate-400">
            {ACCEPTED_FILE_LABEL} · Maximum {formatBytes(MAX_FILE_SIZE_BYTES)} · Processed locally
            in your browser
          </p>
          <button
            type="button"
            className="btn-secondary mt-4"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            Browse Files
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={FILE_INPUT_ACCEPT}
            className="hidden"
            disabled={disabled}
            onChange={onChange}
          />
        </div>
      </div>
      {localError ? (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {localError}
        </p>
      ) : null}
    </div>
  );
}
