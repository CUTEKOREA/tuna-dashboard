import type { FleetInsights } from '../data/unloading-fleet-insights';

export type GroundCell = FleetInsights['grounds'][number]['cells'][number];

export const GROUND_RAMP = ['#bae6fd', '#38bdf8', '#0284c7', '#f59e0b', '#dc2626'] as const;

/** Quantile breaks (50/75/90/97th percentile of catch per cell) so a few hot cells don't wash out the rest. */
export function catchBreaks(cells: GroundCell[]): number[] {
  const sorted = cells.map((c) => c[3]).sort((a, b) => a - b);
  return [0.5, 0.75, 0.9, 0.97].map((q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]);
}

export function rampColor(value: number, breaks: number[]): string {
  const idx = breaks.findIndex((b) => value <= b);
  return GROUND_RAMP[idx === -1 ? GROUND_RAMP.length - 1 : idx];
}

export function formatPosition(lat: number, lon: number): string {
  const ew = lon > 180 ? `${(360 - lon).toFixed(1)}°W` : `${lon.toFixed(1)}°E`;
  return `${Math.abs(lat).toFixed(1)}°${lat < 0 ? 'S' : 'N'} · ${ew}`;
}
