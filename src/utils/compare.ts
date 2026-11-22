import type { ComparisonField, ImageExamination } from '../types/examination';
import { displayValue } from './format';

function statusFor(a: string, b: string): ComparisonField['status'] {
  const aMissing = a === 'Not Available';
  const bMissing = b === 'Not Available';
  if (aMissing || bMissing) return 'unavailable';
  return a === b ? 'match' : 'differ';
}

export function buildComparison(
  imageA: ImageExamination,
  imageB: ImageExamination,
): ComparisonField[] {
  const pairs: Array<[string, unknown, unknown]> = [
    ['Filename', imageA.properties.name, imageB.properties.name],
    ['MIME Type', imageA.properties.type, imageB.properties.type],
    ['File Size (bytes)', imageA.properties.size, imageB.properties.size],
    [
      'Display Dimensions',
      imageA.properties.width && imageA.properties.height
        ? `${imageA.properties.width} × ${imageA.properties.height}`
        : null,
      imageB.properties.width && imageB.properties.height
        ? `${imageB.properties.width} × ${imageB.properties.height}`
        : null,
    ],
    ['Camera Model', imageA.metadata?.model, imageB.metadata?.model],
    ['Camera Make', imageA.metadata?.make, imageB.metadata?.make],
    [
      'DateTimeOriginal',
      imageA.metadata?.dateTimeOriginal,
      imageB.metadata?.dateTimeOriginal,
    ],
    [
      'DateTimeDigitized',
      imageA.metadata?.dateTimeDigitized,
      imageB.metadata?.dateTimeDigitized,
    ],
    ['DateTime', imageA.metadata?.dateTime, imageB.metadata?.dateTime],
    ['Software', imageA.metadata?.software, imageB.metadata?.software],
    [
      'Embedded Width',
      imageA.metadata?.imageWidth,
      imageB.metadata?.imageWidth,
    ],
    [
      'Embedded Height',
      imageA.metadata?.imageHeight,
      imageB.metadata?.imageHeight,
    ],
    ['GPS Latitude', imageA.metadata?.gpsLatitude, imageB.metadata?.gpsLatitude],
    [
      'GPS Longitude',
      imageA.metadata?.gpsLongitude,
      imageB.metadata?.gpsLongitude,
    ],
    ['SHA-256', imageA.hash, imageB.hash],
  ];

  return pairs.map(([field, a, b]) => {
    const imageAValue = displayValue(a);
    const imageBValue = displayValue(b);
    return {
      field,
      imageA: imageAValue,
      imageB: imageBValue,
      status: statusFor(imageAValue, imageBValue),
    };
  });
}
