import { describe, expect, it } from 'vitest';

import {
  getVdsBurnCell,
  getVdsBurnYears,
  getVdsCompanyBurn,
} from '@/lib/data/vds-company-burn';

const data = getVdsCompanyBurn();
const ZONES = ['PNG', 'Solomon', 'Kiribati', 'Tuvalu', 'Nauru', 'FSM'];

describe('VDS 회사별 소진현황 계약 (260828 대장)', () => {
  it('출처 메타가 8/28 대장을 가리킨다', () => {
    expect(data.asOf).toBe('2026-08-28');
    expect(data.source.file).toBe('260828_수역별 회사별 조업일수 소진현황.xlsx');
    expect(data.source.sha256).toBe(
      '9cb4d48d70b72e634db68f276a3d2cc632830055a5734ec7e2b1652ebf922b40',
    );
  });

  it('2023~2026 4개년 x 6수역이 전부 있다', () => {
    expect(getVdsBurnYears()).toEqual(['2023', '2024', '2025', '2026']);
    for (const year of getVdsBurnYears()) {
      expect(Object.keys(data.years[year].zones).sort()).toEqual([...ZONES].sort());
    }
  });

  it('2026 원자료 앵커와 일치한다 (8/28 시트 실측)', () => {
    // PNG 동원산업: 총가용 402, 소진 93.0, 잔여 309.0
    expect(getVdsBurnCell('2026', '동원산업', 'PNG')).toMatchObject({
      available: 402, ratePct: 23,
    });
    // Kiribati 집계 블록 합계: 가용 2,290 / 소진 2,227.7 / 잔여 62.3
    expect(data.years['2026'].zones['Kiribati'].total.available).toBe(2290);
    expect(data.years['2026'].zones['Kiribati'].total.consumed).toBeCloseTo(2227.7, 0);
    // 신라교역 Tuvalu: 가용 102, 소진 100.2 (98%)
    expect(getVdsBurnCell('2026', '신라교역', 'Tuvalu')).toMatchObject({
      available: 102, ratePct: 98,
    });
    // 신라교역 FSM: 가용 49, 소진 14.8 (30%)
    expect(getVdsBurnCell('2026', '신라교역', 'FSM')?.ratePct).toBe(30);
  });

  it('완결 연도는 기존 화면 하드코딩과 이어진다 (회귀 앵커)', () => {
    // 2023 동원산업 PNG - 구 heatmapData 값 remaining 7.79 / rate 99 재현
    expect(getVdsBurnCell('2023', '동원산업', 'PNG')).toMatchObject({
      remaining: 7.79, ratePct: 99,
    });
  });

  it('소진+잔여=가용 관계가 성립한다 (원문 반올림 1일 이내)', () => {
    for (const year of getVdsBurnYears()) {
      for (const zone of ZONES) {
        const { companies } = data.years[year].zones[zone];
        for (const cell of Object.values(companies)) {
          if (cell.available != null && cell.consumed != null && cell.remaining != null) {
            expect(Math.abs(cell.available - cell.consumed - cell.remaining)).toBeLessThanOrEqual(1);
          }
        }
      }
    }
  });
});
