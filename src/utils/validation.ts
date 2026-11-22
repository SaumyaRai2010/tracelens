import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_FILE_LABEL,
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '../types/examination';
import { formatBytes } from './format';

function getExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.');
  if (parts.length < 2) return '';
  return `.${parts.pop()}`;
}

export function validateImageFile(file: File): string | null {
  const extension = getExtension(file.name);
  const mime = (file.type || '').toLowerCase();
  const extensionOk = ACCEPTED_EXTENSIONS.includes(
    extension as (typeof ACCEPTED_EXTENSIONS)[number],
  );
  const mimeOk = ACCEPTED_MIME_TYPES.includes(
    mime as (typeof ACCEPTED_MIME_TYPES)[number],
  );

  // iPhones sometimes omit MIME or use a generic type; trust known extensions.
  if (!extensionOk && !mimeOk) {
    return `Unsupported file type. Please upload a ${ACCEPTED_FILE_LABEL} image.`;
  }

  if (!extensionOk && mimeOk) {
    // Rare: correct MIME, odd/missing extension — allow.
  } else if (extensionOk && mime && !mimeOk && !mime.startsWith('image/') && mime !== 'application/octet-stream') {
    return `Unsupported MIME type (${file.type}). Accepted: ${ACCEPTED_FILE_LABEL}.`;
  } else if (!extensionOk) {
    return `Unsupported file extension. Please upload a ${ACCEPTED_FILE_LABEL} file.`;
  }

  if (file.size <= 0) {
    return 'The selected file appears to be empty.';
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File exceeds the maximum size of ${formatBytes(MAX_FILE_SIZE_BYTES)}.`;
  }

  return null;
}

export function readImageDimensions(
  source: Blob,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const image = new Image();
    image.onload = () => {
      const result = { width: image.naturalWidth, height: image.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(result);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          'Unable to read image dimensions. The file may be corrupted or unsupported in this browser.',
        ),
      );
    };
    image.src = url;
  });
}
