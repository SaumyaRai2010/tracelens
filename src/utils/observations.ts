import type {
  ExtractedMetadata,
  ForensicObservation,
} from '../types/examination';

function normalizeComparable(value: string | number | null): string | null {
  if (value == null || value === '') return null;
  return String(value).trim().toLowerCase();
}

export function generateObservations(
  metadata: ExtractedMetadata,
): ForensicObservation[] {
  const observations: ForensicObservation[] = [];

  if (metadata.hasExif) {
    observations.push({
      id: 'exif-present',
      observation: 'EXIF metadata is present in the examined file.',
      reason: 'One or more EXIF/TIFF fields were successfully parsed from the image.',
      relevance:
        'Presence of EXIF supports technical examination of capture and processing history, but does not by itself establish authenticity.',
      severity: 'info',
    });
  } else {
    observations.push({
      id: 'exif-absent',
      observation: 'No EXIF metadata was detected in the examined file.',
      reason: 'The parser returned no extractable EXIF/TIFF fields from the uploaded image bytes.',
      relevance:
        'Missing EXIF is common after social-media re-encoding, export, or privacy stripping. It requires further examination and is not proof of manipulation.',
      severity: 'attention',
    });
  }

  const hasCamera = Boolean(metadata.make || metadata.model);
  observations.push(
    hasCamera
      ? {
          id: 'camera-present',
          observation: 'Camera manufacturer and/or model information is present.',
          reason: `Make: ${metadata.make ?? 'Not Available'}; Model: ${metadata.model ?? 'Not Available'}.`,
          relevance:
            'Camera fields can help correlate images with a device profile, subject to the possibility of edited or incomplete tags.',
          severity: 'info',
        }
      : {
          id: 'camera-absent',
          observation: 'Camera manufacturer and model information are absent.',
          reason: 'Make and Model fields were not available in the extracted metadata.',
          relevance:
            'Absence of camera tags may indicate stripping, export, or a source that never embedded them. It is incomplete metadata, not conclusive evidence of tampering.',
          severity: 'attention',
        },
  );

  const hasDates = Boolean(
    metadata.dateTimeOriginal || metadata.dateTimeDigitized || metadata.dateTime,
  );
  observations.push(
    hasDates
      ? {
          id: 'datetime-present',
          observation: 'Date and time metadata fields are present.',
          reason:
            'At least one of DateTimeOriginal, DateTimeDigitized, or DateTime was extracted.',
          relevance:
            'Timestamp fields support timeline reconstruction but can be inaccurate, timezone-shifted, or altered.',
          severity: 'info',
        }
      : {
          id: 'datetime-absent',
          observation: 'Date and time metadata fields are absent.',
          reason: 'DateTimeOriginal, DateTimeDigitized, and DateTime were all unavailable.',
          relevance:
            'Missing timestamps limit chronological analysis. This is an incompleteness finding, not a determination of image authenticity.',
          severity: 'attention',
        },
  );

  const hasGps = Boolean(metadata.gpsLatitude && metadata.gpsLongitude);
  observations.push(
    hasGps
      ? {
          id: 'gps-present',
          observation: 'GPS location metadata is present.',
          reason: `Latitude ${metadata.gpsLatitude}, Longitude ${metadata.gpsLongitude}.`,
          relevance:
            'GPS tags may indicate approximate capture location if trustworthy, but coordinates can be missing, imprecise, or modified.',
          severity: 'info',
        }
      : {
          id: 'gps-absent',
          observation: 'GPS location metadata is absent.',
          reason: 'Latitude and/or longitude were not available in the extracted metadata.',
          relevance:
            'Many cameras and sharing pipelines omit GPS for privacy. Absence of GPS does not indicate manipulation.',
          severity: 'neutral',
        },
  );

  observations.push(
    metadata.software
      ? {
          id: 'software-present',
          observation: 'A software field is present in the metadata.',
          reason: `Software tag reports: ${metadata.software}.`,
          relevance:
            'Software tags can indicate capture firmware or later processing applications. Presence of editing software is not proof of content alteration.',
          severity: 'info',
        }
      : {
          id: 'software-absent',
          observation: 'Software field is absent.',
          reason: 'No Software tag was found in the extracted metadata.',
          relevance:
            'Missing software information is frequent and should be treated as incomplete metadata rather than evidence of tampering.',
          severity: 'neutral',
        },
  );

  const dateValues = [
    normalizeComparable(metadata.dateTimeOriginal),
    normalizeComparable(metadata.dateTimeDigitized),
    normalizeComparable(metadata.dateTime),
  ].filter((value): value is string => Boolean(value));

  const uniqueDates = new Set(dateValues);
  if (uniqueDates.size > 1) {
    observations.push({
      id: 'datetime-conflict',
      observation: 'Conflicting date/time metadata fields were detected.',
      reason:
        'DateTimeOriginal, DateTimeDigitized, and/or DateTime contain differing values in this file.',
      relevance:
        'Differing timestamps may reflect capture vs. digitization vs. modification events, timezone differences, or inconsistent tagging. Flag for further examination; do not treat as sole proof of manipulation.',
      severity: 'attention',
    });
  }

  const incomplete =
    !metadata.hasExif ||
    !hasCamera ||
    !hasDates ||
    (!metadata.imageWidth && !metadata.imageHeight);

  if (incomplete) {
    observations.push({
      id: 'incomplete-metadata',
      observation: 'Metadata appears unusual or incomplete for a typical camera original.',
      reason:
        'One or more commonly expected fields (EXIF block, camera identity, timestamps, or embedded dimensions) are missing.',
      relevance:
        'Incomplete metadata warrants cautious interpretation and additional technical checks. TraceLens does not classify images as genuine, fake, manipulated, or tampered based on missing tags alone.',
      severity: 'attention',
    });
  }

  return observations;
}
