const HEIC_EXTENSIONS = new Set(['.heic', '.heif']);
const HEIC_MIME_TYPES = new Set([
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
]);

export function isHeicFile(file: File): boolean {
  const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  if (HEIC_EXTENSIONS.has(extension)) return true;
  if (file.type && HEIC_MIME_TYPES.has(file.type.toLowerCase())) return true;
  return false;
}

/**
 * Convert HEIC/HEIF to a JPEG blob for browser preview/dimensions.
 * Metadata and SHA-256 continue to use the original uploaded bytes.
 */
export async function convertHeicToJpegBlob(file: File): Promise<Blob> {
  const heic2any = (await import('heic2any')).default;
  const result = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.92,
  });

  const blob = Array.isArray(result) ? result[0] : result;
  if (!(blob instanceof Blob)) {
    throw new Error('Unable to convert HEIC image for preview in this browser.');
  }
  return blob;
}

export async function createPreviewObjectUrl(file: File): Promise<{
  previewUrl: string;
  previewBlob: Blob;
}> {
  if (isHeicFile(file)) {
    const previewBlob = await convertHeicToJpegBlob(file);
    return {
      previewBlob,
      previewUrl: URL.createObjectURL(previewBlob),
    };
  }

  return {
    previewBlob: file,
    previewUrl: URL.createObjectURL(file),
  };
}
