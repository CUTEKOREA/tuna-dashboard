import { describe, expect, it } from 'vitest';

import { getFleetLoadSignalStyle, resolveFleetLoadSignal } from '@/lib/fleet-map-load-signal';

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
