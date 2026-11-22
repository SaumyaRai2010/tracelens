import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ImageExamination } from '../types/examination';
import { extractMetadata } from '../utils/exif';
import { generateExaminationId } from '../utils/format';
import { calculateSha256 } from '../utils/hash';
import { createPreviewObjectUrl, isHeicFile } from '../utils/heic';
import { generateObservations } from '../utils/observations';
import { readImageDimensions, validateImageFile } from '../utils/validation';

interface ExaminationContextValue {
  primary: ImageExamination | null;
  comparisonA: ImageExamination | null;
  comparisonB: ImageExamination | null;
  isBusy: boolean;
  loadPrimaryFile: (file: File) => Promise<void>;
  analyzePrimary: () => Promise<void>;
  clearPrimary: () => void;
  clearExamination: () => void;
  loadComparisonFile: (slot: 'A' | 'B', file: File) => Promise<void>;
  analyzeComparison: () => Promise<void>;
  clearComparison: () => void;
}

const ExaminationContext = createContext<ExaminationContextValue | null>(null);

function revokePreview(examination: ImageExamination | null) {
  if (examination?.previewUrl) {
    URL.revokeObjectURL(examination.previewUrl);
  }
}

async function createExaminationShell(file: File): Promise<ImageExamination> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    // HEIC often cannot be shown natively in Chrome; convert for preview only.
    // EXIF + SHA-256 still use the original uploaded file bytes.
    const { previewUrl, previewBlob } = await createPreviewObjectUrl(file);
    const dimensions = await readImageDimensions(previewBlob);
    const fallbackType = isHeicFile(file) ? 'image/heic' : 'image/jpeg';

    return {
      id: generateExaminationId(),
      file,
      previewUrl,
      properties: {
        name: file.name,
        size: file.size,
        type: file.type || fallbackType,
        width: dimensions.width,
        height: dimensions.height,
        lastModified: file.lastModified,
      },
      metadata: null,
      hash: null,
      observations: [],
      analyzedAt: null,
      status: 'idle',
      error: null,
    };
  } catch (error) {
    if (isHeicFile(file)) {
      throw new Error(
        error instanceof Error
          ? `HEIC conversion failed: ${error.message}`
          : 'HEIC conversion failed in this browser. Try exporting the photo as JPEG.',
      );
    }
    throw error;
  }
}

async function analyzeExamination(
  examination: ImageExamination,
): Promise<ImageExamination> {
  const [metadata, hash] = await Promise.all([
    extractMetadata(examination.file),
    calculateSha256(examination.file),
  ]);

  return {
    ...examination,
    metadata,
    hash,
    observations: generateObservations(metadata),
    analyzedAt: new Date().toISOString(),
    status: 'ready',
    error: null,
  };
}

export function ExaminationProvider({ children }: { children: ReactNode }) {
  const [primary, setPrimary] = useState<ImageExamination | null>(null);
  const [comparisonA, setComparisonA] = useState<ImageExamination | null>(null);
  const [comparisonB, setComparisonB] = useState<ImageExamination | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const loadPrimaryFile = useCallback(async (file: File) => {
    setIsBusy(true);
    try {
      const next = await createExaminationShell(file);
      setPrimary((prev) => {
        revokePreview(prev);
        return next;
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load the selected image.';
      setPrimary((prev) => {
        revokePreview(prev);
        return null;
      });
      throw new Error(message);
    } finally {
      setIsBusy(false);
    }
  }, []);

  const analyzePrimary = useCallback(async () => {
    if (!primary) {
      throw new Error('Upload an image before starting analysis.');
    }

    setIsBusy(true);
    setPrimary((prev) =>
      prev ? { ...prev, status: 'analyzing', error: null } : prev,
    );

    try {
      const analyzed = await analyzeExamination(primary);
      setPrimary(analyzed);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Analysis failed. The file may be unsupported or corrupted.';
      setPrimary((prev) =>
        prev ? { ...prev, status: 'error', error: message } : prev,
      );
      throw new Error(message);
    } finally {
      setIsBusy(false);
    }
  }, [primary]);

  const clearPrimary = useCallback(() => {
    setPrimary((prev) => {
      revokePreview(prev);
      return null;
    });
  }, []);

  const loadComparisonFile = useCallback(async (slot: 'A' | 'B', file: File) => {
    setIsBusy(true);
    try {
      const next = await createExaminationShell(file);
      if (slot === 'A') {
        setComparisonA((prev) => {
          revokePreview(prev);
          return next;
        });
      } else {
        setComparisonB((prev) => {
          revokePreview(prev);
          return next;
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load comparison image.';
      throw new Error(message);
    } finally {
      setIsBusy(false);
    }
  }, []);

  const analyzeComparison = useCallback(async () => {
    if (!comparisonA || !comparisonB) {
      throw new Error('Upload two supported images before comparing.');
    }

    setIsBusy(true);
    setComparisonA((prev) =>
      prev ? { ...prev, status: 'analyzing', error: null } : prev,
    );
    setComparisonB((prev) =>
      prev ? { ...prev, status: 'analyzing', error: null } : prev,
    );

    try {
      const [analyzedA, analyzedB] = await Promise.all([
        analyzeExamination(comparisonA),
        analyzeExamination(comparisonB),
      ]);
      setComparisonA(analyzedA);
      setComparisonB(analyzedB);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Comparison analysis failed for one or both images.';
      setComparisonA((prev) =>
        prev ? { ...prev, status: 'error', error: message } : prev,
      );
      setComparisonB((prev) =>
        prev ? { ...prev, status: 'error', error: message } : prev,
      );
      throw new Error(message);
    } finally {
      setIsBusy(false);
    }
  }, [comparisonA, comparisonB]);

  const clearComparison = useCallback(() => {
    setComparisonA((prev) => {
      revokePreview(prev);
      return null;
    });
    setComparisonB((prev) => {
      revokePreview(prev);
      return null;
    });
  }, []);

  const clearExamination = useCallback(() => {
    clearPrimary();
    clearComparison();
  }, [clearPrimary, clearComparison]);

  const value = useMemo(
    () => ({
      primary,
      comparisonA,
      comparisonB,
      isBusy,
      loadPrimaryFile,
      analyzePrimary,
      clearPrimary,
      clearExamination,
      loadComparisonFile,
      analyzeComparison,
      clearComparison,
    }),
    [
      primary,
      comparisonA,
      comparisonB,
      isBusy,
      loadPrimaryFile,
      analyzePrimary,
      clearPrimary,
      clearExamination,
      loadComparisonFile,
      analyzeComparison,
      clearComparison,
    ],
  );

  return (
    <ExaminationContext.Provider value={value}>{children}</ExaminationContext.Provider>
  );
}

export function useExamination() {
  const context = useContext(ExaminationContext);
  if (!context) {
    throw new Error('useExamination must be used within ExaminationProvider');
  }
  return context;
}
