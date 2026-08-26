import { describe, expect, it } from 'vitest';
import { pctChange, progressPct } from '../lib/metrics';

/* 지표 SSOT 자기 검증 — 정책(0분모=null·기본 무클램프)이 조용히 바뀌면 여기서 깨진다 */
describe('lib/metrics (지표 계산 SSOT)', () => {
  it('pctChange - 기본 산식과 부호', () => {
    expect(pctChange(110, 100)).toBeCloseTo(10);
    expect(pctChange(90, 100)).toBeCloseTo(-10);
    expect(pctChange(100, 100)).toBe(0);
  });

  it('pctChange - 0분모·비유한값은 null (0%로 뭉개지 않는다)', () => {
    expect(pctChange(5, 0)).toBeNull();
    expect(pctChange(Number.NaN, 100)).toBeNull();
    expect(pctChange(100, Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('progressPct - 기본은 무클램프 (하역 초과는 사실대로, 2026-08-17 소유자 확정)', () => {
    expect(progressPct(2013.1, 3275)).toBeCloseTo(61.468, 2);
    expect(progressPct(106, 100)).toBeCloseTo(106);
  });

  it('progressPct - clampMax는 명시했을 때만, 0분모는 null', () => {
    expect(progressPct(106, 100, { clampMax: 100 })).toBe(100);
    expect(progressPct(50, 0)).toBeNull();
  });
});
