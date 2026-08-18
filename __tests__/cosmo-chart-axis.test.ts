import { describe, expect, it } from 'vitest';

import { measureTickPx, yAxisWidthForFmt, type Serie } from '@/components/cosmo/Chart';

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
    expect(width).toBeLessThanOrEqual(96);
  });

  it('짧은 틱은 좁혀도 최소폭을 지킨다', () => {
    const width = yAxisWidthForFmt([{ 척수: 12 }], [{ key: '척수', name: '척수', color: '#000' }], (v) => `${v}척`);
    expect(width).toBeGreaterThanOrEqual(56);
    expect(width).toBeLessThanOrEqual(72);
  });
});
