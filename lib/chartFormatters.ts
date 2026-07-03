export function toChartNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[,%$£¥€\s]/g, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  if (Array.isArray(value)) {
    return toChartNumber(value[0], fallback);
  }

  return fallback;
}

export function toChartText(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

export function formatChartNumber(value: unknown, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-US', options).format(toChartNumber(value));
}

export function chartPayload(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || !('payload' in value)) return {};
  const payload = (value as { payload?: unknown }).payload;
  return payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
}
