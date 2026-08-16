import { describe, expect, it } from 'vitest';

import { resolveCarrierReportedLocation } from '@/lib/fleet-daily-presentation';

describe('FleetRosterGrid reported carrier locations', () => {
  it('maps only explicit reported ports and fails closed for unsupported or empty notes', () => {
    expect(resolveCarrierReportedLocation('BKK 시험 위치')).toEqual({ position: 'BKK', location: '방콕' });
    expect(resolveCarrierReportedLocation('GENSAN 시험 위치')).toEqual({ position: 'GENSAN', location: '젠산' });
    expect(resolveCarrierReportedLocation('X-MAS 시험 위치')).toEqual({ position: 'X-MAS', location: '크리스마스섬' });
    expect(resolveCarrierReportedLocation('RABAUL 시험 위치')).toEqual({ position: 'RABAUL', location: '라바울' });
    expect(resolveCarrierReportedLocation('알 수 없는 항만 대기')).toEqual({ position: null, location: null });
    expect(resolveCarrierReportedLocation('')).toEqual({ position: null, location: null });
  });
});
