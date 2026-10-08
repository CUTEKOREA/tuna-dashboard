import { describe, expect, it } from 'vitest';

import * as loadSignals from '@/lib/fleet-map-load-signal';

const { getFleetLoadSignalStyle, resolveFleetLoadSignal } = loadSignals;
const resolveFleetHoldUtilization = (
  loadSignals as typeof loadSignals & {
    resolveFleetHoldUtilization?: (
      loadedMt: number | null,
      capacity: { value: number; unit: 'MT' | '㎥' } | null | undefined,
    ) => { ratioPct: number; barPct: number; level: string } | null;
  }
).resolveFleetHoldUtilization;

describe('fleet map load signals', () => {
  it('fails closed when capacity is missing or invalid', () => {
    expect(resolveFleetLoadSignal(900, null)).toBeNull();
    expect(resolveFleetLoadSignal(900, 0)).toBeNull();
    expect(resolveFleetLoadSignal(null, 1_000)).toBeNull();
    expect(resolveFleetLoadSignal(-1, 1_000)).toBeNull();
  });

  it('does not label a vessel below the 75 percent threshold', () => {
    expect(resolveFleetLoadSignal(749.9, 1_000)).toBeNull();
  });

  it('labels 75 to under 90 percent as high load', () => {
    expect(resolveFleetLoadSignal(750, 1_000)).toEqual({
      level: 'high',
      label: '고적재',
      ratioPct: 75,
    });
    expect(resolveFleetLoadSignal(899, 1_000)).toEqual({
      level: 'high',
      label: '고적재',
      ratioPct: 89.9,
    });
  });

  it('does not round a high-load display value across the 90 percent boundary', () => {
    expect(resolveFleetLoadSignal(899.5, 1_000)).toEqual({
      level: 'high',
      label: '고적재',
      ratioPct: 89.9,
    });
    expect(resolveFleetLoadSignal(899.99, 1_000)).toEqual({
      level: 'high',
      label: '고적재',
      ratioPct: 89.9,
    });
  });

  it('labels 90 percent and above as near capacity without hiding over-capacity reports', () => {
    expect(resolveFleetLoadSignal(900, 1_000)).toEqual({
      level: 'nearCapacity',
      label: '만재 임박',
      ratioPct: 90,
    });
    expect(resolveFleetLoadSignal(1_050, 1_000)).toEqual({
      level: 'nearCapacity',
      label: '만재 임박',
      ratioPct: 105,
    });
  });

  it('uses distinct radius and dash patterns so the map does not rely on color alone', () => {
    expect(getFleetLoadSignalStyle('high')).toEqual({
      color: '#f59e0b',
      dashArray: '5 4',
      fillOpacity: 0.12,
      radius: 22,
      weight: 2,
    });
    expect(getFleetLoadSignalStyle('nearCapacity')).toEqual({
      color: '#ef4444',
      dashArray: '2 3',
      fillOpacity: 0.16,
      radius: 28,
      weight: 3,
    });
  });
});

describe('fleet hold utilization', () => {
  it('calculates the MT percentage as a measured (non-estimated) ratio', () => {
    expect(resolveFleetHoldUtilization?.(10, { value: 1_300, unit: 'MT' })).toEqual({
      ratioPct: 0.8,
      barPct: expect.closeTo(10 / 13, 5),
      level: 'normal',
      estimated: false,
      capacityMtEquivalent: 1_300,
    });
    expect(resolveFleetHoldUtilization?.(766, { value: 1_200, unit: 'MT' })).toEqual({
      ratioPct: 63.8,
      barPct: expect.closeTo(63.833333, 5),
      level: 'normal',
      estimated: false,
      capacityMtEquivalent: 1_200,
    });
  });

  it('converts cubic-metre capacity with the owner-approved 0.7 MT per cubic metre factor', () => {
    // 2026-08-28 소유자 확정: ㎥ x 0.7 = MT 환산 추정 (estimated 표기)
    const result = resolveFleetHoldUtilization?.(900, { value: 3_114.85, unit: '㎥' });
    expect(result).toMatchObject({ estimated: true, capacityMtEquivalent: 2_180.4 });
    expect(result?.ratioPct).toBeCloseTo(41.3, 1); // 900 / (3,114.85 x 0.7)
    expect(resolveFleetHoldUtilization?.(900, null)).toBeNull();
  });

  it('keeps the reported over-capacity percentage while clamping only the visual bar', () => {
    expect(resolveFleetHoldUtilization?.(1_050, { value: 1_000, unit: 'MT' })).toEqual({
      ratioPct: 105,
      barPct: 100,
      level: 'nearCapacity',
      estimated: false,
      capacityMtEquivalent: 1_000,
    });
  });

  it('keeps 75 and 90 percent boundaries semantically distinct', () => {
    expect(resolveFleetHoldUtilization?.(750, { value: 1_000, unit: 'MT' })?.level).toBe('high');
    expect(resolveFleetHoldUtilization?.(899.5, { value: 1_000, unit: 'MT' })).toMatchObject({
      ratioPct: 89.9,
      level: 'high',
    });
    expect(resolveFleetHoldUtilization?.(900, { value: 1_000, unit: 'MT' })?.level).toBe('nearCapacity');
  });
});
