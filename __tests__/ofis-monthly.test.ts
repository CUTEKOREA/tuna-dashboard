import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import OfisMonthlyPanel from '@/components/OfisMonthlyPanel';
import PurseSeinerDashboard from '@/components/PurseSeinerDashboard';
import {
  OFIS_BET_KRW,
  OFIS_LL_MONTH_T,
  OFIS_MONTH_TOTAL_T,
  OFIS_PRIOR_YTD_T,
  OFIS_PS_MONTH_T,
  OFIS_YTD_TOTAL_T,
  ofisHeadline,
  ofisMeta,
  ofisOceans,
  ofisPrices,
  ofisSpecies,
  ofisYtdYoyPct,
} from '@/lib/data/ofis-monthly';

const ROOT = join(__dirname, '..');

describe('OFIS 2026.6 인테이크', () => {
  it('최신호 합계·선망·눈다랑어를 원문 그대로 둔다', () => {
    expect(ofisMeta.period).toBe('2026-06');
    expect(ofisMeta.published).toBe('2026-08-07');
    expect(ofisMeta.status).toBe('STATIC');
    expect(ofisMeta.provisional).toBe(true);
    expect(OFIS_MONTH_TOTAL_T).toBe(33_045);
    expect(OFIS_YTD_TOTAL_T).toBe(191_540);
    expect(OFIS_PRIOR_YTD_T).toBe(214_623);
    expect(OFIS_PS_MONTH_T).toBe(13_176);
    expect(OFIS_LL_MONTH_T).toBe(3_760);
    expect(OFIS_BET_KRW).toBe(7_068.6);
    expect(ofisHeadline.monthYoyPct).toBe(-21.2);
  });

  it('상반기 증감은 누계 대비이지 연환산이 아니다', () => {
    expect(ofisYtdYoyPct).toBe(-10.8);
    expect(ofisMeta.measurementBoundary).toMatch(/연환산하지 않는다/);
    expect(ofisMeta.ytdLabel).toBe('2026년 1~6월');
  });

  it('꽁치 단가 행이 없고 당월 실적은 없다', () => {
    expect(ofisPrices.some((row) => row.label === '꽁치')).toBe(false);
    expect(ofisSpecies.find((row) => row.id === 'saury')).toMatchObject({ month: 0, ytd: 0 });
  });

  it('해역 당월 합은 원문대로 합계와 1톤 차이가 난다', () => {
    const oceanMonth = ofisOceans.reduce((sum, row) => sum + row.month, 0);
    expect(oceanMonth).toBe(33_046);
    expect(OFIS_MONTH_TOTAL_T).toBe(33_045);
  });

  it('JSON 위젯과 인테이크가 같다', () => {
    const v1 = JSON.parse(
      readFileSync(join(ROOT, 'public/data/ofis_monthly_v1.json'), 'utf8'),
    ) as { headline: { month: number; ytd: number }; tuna: { purseSeine: { month: number } } };
    expect(v1.headline.month).toBe(OFIS_MONTH_TOTAL_T);
    expect(v1.headline.ytd).toBe(OFIS_YTD_TOTAL_T);
    expect(v1.tuna.purseSeine.month).toBe(OFIS_PS_MONTH_T);
  });
});

describe('OFIS 선대 패널', () => {
  it('세 위젯과 측정 경계를 렌더한다', () => {
    const html = renderToStaticMarkup(createElement(OfisMonthlyPanel));
    expect(html).toContain('W-OFIS01');
    expect(html).toContain('W-OFIS02');
    expect(html).toContain('W-OFIS03');
    expect(html).toContain('33,045');
    expect(html).toContain('191,540');
    expect(html).toContain('13,176');
    expect(html).toContain('7,068.6');
    expect(html).toContain('연환산하지 않음');
    expect(html).toContain('단가 0 행을 만들지 않음');
    expect(html).not.toMatch(/LIVE/);
  });

  it('라이브 선단 DB에 붙고 퇴역한 fleet-strategy에는 없다', () => {
    const live = renderToStaticMarkup(createElement(PurseSeinerDashboard));
    const teaser = renderToStaticMarkup(createElement(PurseSeinerDashboard, { heroOnly: true }));
    const dead = readFileSync(join(ROOT, 'components/FleetStrategyMatrix.tsx'), 'utf8');
    const page = readFileSync(join(ROOT, 'app/page.tsx'), 'utf8');
    expect(live).toContain('W-OFIS01');
    expect(teaser).not.toContain('W-OFIS01');
    expect(dead).not.toContain('OfisMonthlyPanel');
    expect(page).toContain("'purse-seiner-db': <PurseSeinerDashboard />");
    expect(page).not.toContain('FleetStrategyMatrix');
  });
});

describe('2024 빈티지 라벨', () => {
  it('288,742와 479,000 옆에 2024가 있다', () => {
    const fleet = readFileSync(join(ROOT, 'components/FleetStrategyMatrix.tsx'), 'utf8');
    const sashimi = readFileSync(
      join(ROOT, 'components/sashimi-strategy/SasKoreaProductionStructure.tsx'),
      'utf8',
    );
    const tuna = readFileSync(join(ROOT, 'lib/tuna-industry-content.ts'), 'utf8');

    const assertVintage = (source: string, needle: string) => {
      let from = 0;
      let hits = 0;
      while (from < source.length) {
        const at = source.indexOf(needle, from);
        if (at < 0) break;
        hits += 1;
        const window = source.slice(Math.max(0, at - 80), at + needle.length + 80);
        expect(window, `${needle} at ${at}`).toMatch(/2024/);
        from = at + needle.length;
      }
      expect(hits).toBeGreaterThan(0);
    };

    assertVintage(fleet, '288,742');
    assertVintage(sashimi, '288,742');
    assertVintage(sashimi, '479,000');
    assertVintage(tuna, '288,742');
    assertVintage(tuna, '479,000');
  });
});
