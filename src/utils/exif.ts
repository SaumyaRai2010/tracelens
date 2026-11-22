import exifr from 'exifr';
import type { ExtractedMetadata, MetadataValue } from '../types/examination';
import { displayValue, formatGps } from './format';

function toValue(value: unknown): MetadataValue {
  if (value == null || value === '') return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return displayValue(value);
}

function formatExposure(value: unknown): MetadataValue {
  if (value == null || value === '') return null;
  if (typeof value === 'number') {
    if (value > 0 && value < 1) {
      const denom = Math.round(1 / value);
      return `1/${denom} s`;
    }
    return `${value} s`;
  }
  return toValue(value);
}

function formatFocalLength(value: unknown): MetadataValue {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return `${value} mm`;
  return toValue(value);
}

export async function extractMetadata(file: File | Blob | ArrayBuffer): Promise<ExtractedMetadata> {
  let parsed: Record<string, unknown> | null = null;

  try {
    const source =
      file instanceof ArrayBuffer ? file : await file.arrayBuffer();
    parsed = await exifr.parse(source, {
      tiff: true,
      exif: true,
      gps: true,
      icc: false,
      iptc: false,
      xmp: false,
      interop: false,
      translateKeys: true,
      translateValues: true,
      reviveValues: true,
      sanitize: true,
      mergeOutput: true,
    });
  } catch {
    parsed = null;
  }

  const data = parsed ?? {};
  const keys = Object.keys(data);
  const hasExif = keys.length > 0;

  const latitude =
    data.latitude ?? data.GPSLatitude ?? data.gpsLatitude ?? null;
  const longitude =
    data.longitude ?? data.GPSLongitude ?? data.gpsLongitude ?? null;

  return {
    make: toValue(data.Make ?? data.make),
    model: toValue(data.Model ?? data.model),
    dateTimeOriginal: toValue(data.DateTimeOriginal ?? data.dateTimeOriginal),
    dateTimeDigitized: toValue(
      data.DateTimeDigitized ?? data.CreateDate ?? data.dateTimeDigitized,
    ),
    dateTime: toValue(data.DateTime ?? data.ModifyDate ?? data.dateTime),
    gpsLatitude: latitude == null ? null : formatGps(latitude),
    gpsLongitude: longitude == null ? null : formatGps(longitude),
    imageWidth: toValue(
      data.ExifImageWidth ?? data.ImageWidth ?? data.PixelXDimension,
    ),
    imageHeight: toValue(
      data.ExifImageHeight ?? data.ImageHeight ?? data.PixelYDimension,
    ),
    orientation: toValue(data.Orientation ?? data.orientation),
    exposureTime: formatExposure(data.ExposureTime ?? data.exposureTime),
    iso: toValue(data.ISO ?? data.ISOSpeedRatings ?? data.iso),
    focalLength: formatFocalLength(data.FocalLength ?? data.focalLength),
    software: toValue(data.Software ?? data.software),
    hasExif,
    raw: data,
  };
}

export function metadataFieldGroups(metadata: ExtractedMetadata) {
  return {
    general: [
      { label: 'Image Width', value: metadata.imageWidth },
      { label: 'Image Height', value: metadata.imageHeight },
      { label: 'Orientation', value: metadata.orientation },
      { label: 'EXIF Present', value: metadata.hasExif ? 'Yes' : 'No' },
    ],
    camera: [
      { label: 'Camera Manufacturer', value: metadata.make },
      { label: 'Camera Model', value: metadata.model },
      { label: 'Exposure Time', value: metadata.exposureTime },
      { label: 'ISO', value: metadata.iso },
      { label: 'Focal Length', value: metadata.focalLength },
    ],
    datetime: [
      { label: 'DateTimeOriginal', value: metadata.dateTimeOriginal },
      { label: 'DateTimeDigitized', value: metadata.dateTimeDigitized },
      { label: 'DateTime', value: metadata.dateTime },
    ],
    gps: [
      { label: 'GPS Latitude', value: metadata.gpsLatitude },
      { label: 'GPS Longitude', value: metadata.gpsLongitude },
    ],
    software: [{ label: 'Software', value: metadata.software }],
  };
}
