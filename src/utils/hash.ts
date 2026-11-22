export async function calculateSha256(file: File | Blob | ArrayBuffer): Promise<string> {
  const buffer =
    file instanceof ArrayBuffer
      ? file
      : await (file instanceof Blob ? file.arrayBuffer() : Promise.reject(new Error('Invalid input')));

  if (!crypto?.subtle) {
    throw new Error('Web Crypto API is unavailable in this browser context.');
  }

  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}
