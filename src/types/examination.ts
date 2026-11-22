export type MetadataValue = string | number | null;

export interface ExtractedMetadata {
  make: MetadataValue;
  model: MetadataValue;
  dateTimeOriginal: MetadataValue;
  dateTimeDigitized: MetadataValue;
  dateTime: MetadataValue;
  gpsLatitude: MetadataValue;
  gpsLongitude: MetadataValue;
  imageWidth: MetadataValue;
  imageHeight: MetadataValue;
  orientation: MetadataValue;
  exposureTime: MetadataValue;
  iso: MetadataValue;
  focalLength: MetadataValue;
  software: MetadataValue;
  hasExif: boolean;
  raw: Record<string, unknown>;
}

export interface FileProperties {
  name: string;
  size: number;
  type: string;
  width: number | null;
  height: number | null;
  lastModified: number;
}

export type ObservationSeverity = 'info' | 'attention' | 'neutral';

export interface ForensicObservation {
  id: string;
  observation: string;
  reason: string;
  relevance: string;
  severity: ObservationSeverity;
}

export interface ImageExamination {
  id: string;
  file: File;
  previewUrl: string;
  properties: FileProperties;
  metadata: ExtractedMetadata | null;
  hash: string | null;
  observations: ForensicObservation[];
  analyzedAt: string | null;
  status: 'idle' | 'analyzing' | 'ready' | 'error';
  error: string | null;
}

export interface ComparisonField {
  field: string;
  imageA: string;
  imageB: string;
  status: 'match' | 'differ' | 'unavailable';
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
] as const;

export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.heic', '.heif'] as const;

export const ACCEPTED_FILE_LABEL = 'JPG, JPEG, HEIC or HEIF';
export const FILE_INPUT_ACCEPT =
  '.jpg,.jpeg,.heic,.heif,image/jpeg,image/heic,image/heif';
