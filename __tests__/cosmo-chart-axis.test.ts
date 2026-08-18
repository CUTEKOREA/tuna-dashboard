import { describe, expect, it } from 'vitest';

import { categoryAxisWidth, measureTickPx, yAxisWidthForFmt, type Serie } from '@/components/cosmo/Chart';

const kusd = (v: number) => `${Math.round(v).toLocaleString('en-US')}천불`;
const stacked: Serie[] = [
  { key: '재료비', name: '재료비', color: '#000', type: 'bar', stackId: 'c' },
  { key: '노무비', name: '노무비', color: '#000', type: 'bar', stackId: 'c' },
  { key: '경비', name: '경비', color: '#000', type: 'bar', stackId: 'c' },
];

describe('코스모/파노피 차트 Y축 폭', () => {
  it('20,000천불 틱이 예전 고정폭 58보다 넓다', () => {
    expect(measureTickPx('20,000천불')).toBeGreaterThan(58);
  });

  it('스택 합계로 폭을 재서 잘리지 않게 한다', () => {
    const rows = [{ 재료비: 8000, 노무비: 4000, 경비: 8000 }];
    const width = yAxisWidthForFmt(rows, stacked, kusd);
    expect(width).toBeGreaterThan(58);
    expect(width).toBeGreaterThanOrEqual(measureTickPx('20,000천불'));
    expect(width).toBeLessThanOrEqual(120);
  });

  it('짧은 틱은 좁혀도 최소폭을 지킨다', () => {
    const width = yAxisWidthForFmt([{ 척수: 12 }], [{ key: '척수', name: '척수', color: '#000' }], (v) => `${v}척`);
    expect(width).toBeGreaterThanOrEqual(56);
    expect(width).toBeLessThanOrEqual(72);
  });

  it('음수 천불 틱도 58보다 넓다', () => {
    const width = yAxisWidthForFmt(
      [{ 당년추정: -3200, 전년실적: -1800 }],
      [
        { key: '전년실적', name: '전년', color: '#000', type: 'bar' },
        { key: '당년추정', name: '당년', color: '#000', type: 'bar' },
      ],
      kusd,
    );
    expect(width).toBeGreaterThan(58);
    expect(width).toBeGreaterThanOrEqual(measureTickPx('-3,200천불'));
  });

  it('민감도처럼 긴 가로 라벨은 118보다 넓다', () => {
    const width = categoryAxisWidth([
      '어획 ±2,000톤(±5%)',
      '미수금 대손(아비장+AIRONE)',
    ]);
    expect(width).toBeGreaterThan(118);
    expect(width).toBeLessThanOrEqual(200);
  });
});
