export function nowIso(): string {
  return new Date().toISOString();
}

export function createId(prefix: string): string {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${suffix}`;
}

export function asJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function asSafeString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  return asJson(value);
}

export function ensureDirPath(...segments: string[]): string {
  return segments.filter(Boolean).join('/');
}
