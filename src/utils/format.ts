export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** i;
  return `${value.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

export function formatDateTime(value: string | number | Date | null | undefined): string {
  if (value == null || value === '') return 'Not Available';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function displayValue(value: unknown): string {
  if (value == null || value === '') return 'Not Available';
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return 'Not Available';
    return String(value);
  }
  if (value instanceof Date) return formatDateTime(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return 'Not Available';
    }
  }
  return String(value);
}

export function generateExaminationId(): string {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TL-${stamp}-${random}`;
}

export function formatGps(value: unknown): string {
  if (value == null || value === '') return 'Not Available';
  if (typeof value === 'number') return value.toFixed(6);
  return String(value);
}
