import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { WHELK_CHART_SLOTS } from '@/components/market-understanding/WhelkIndustryDashboard';
import {
  WHELK_BRIEFING_POINTS,
  WHELK_NARRATIVES,
  WHELK_SOURCE_NOTES,
} from '@/lib/whelk-industry-content';
import {
  SERIES_KR_PREP_TONNES,
  seriesMeta,
  seriesRoles,
  seriesUnits,
  seriesWindows,
} from '@/lib/data/whelk-country-series';

const STAGE = WHELK_NARRATIVES.find((n) => n.key === 's05');
const ROOT = join(__dirname, '..');

describe('골뱅이 05단계 - 수입 창구', () => {
  it('탭 이름은 04 교역과 겹치지 않게 수입 창구다', () => {
    expect(STAGE?.title.split(' - ')[0]).toBe('수입 창구');
    expect(WHELK_NARRATIVES.find((n) => n.key === 's04')?.title.split(' - ')[0]).not.toBe(
      '수입 창구',
    );
  });

  it('단계가 교역과 이름 문제 사이에 놓인다', () => {
    expect(WHELK_NARRATIVES.map((n) => n.key)).toEqual([
      's01',
      's02',
      's03',
      's04',
      's05',
      'x01',
    ]);
  });

  it('브리핑에 이 단계 항목이 있다', () => {
    expect(WHELK_BRIEFING_POINTS.some((b) => b.stage === 's05')).toBe(true);
  });

  it('측정 경계를 본문 첫 문단과 출처 각주 양쪽에서 밝힌다', () => {
    expect(STAGE?.paragraphs[0]).toMatch(/더할 수 없다/);
    expect(STAGE?.paragraphs[0]).toMatch(/연환산하지 않는다|연간으로 읽지 않는다/);
    expect(WHELK_SOURCE_NOTES.some((n) => n.includes('05단계'))).toBe(true);
    expect(seriesMeta.measurementBoundary).toMatch(/더하거나 연환산하지 않는다/);
  });

  it('FAO 활어와 관세청 제품중량을 빼서 잔여를 만들지 말라고 한다', () => {
    expect(STAGE?.paragraphs.join(' ')).toMatch(/빼서/);
  });

  it('참골뱅이와 피뿔고둥을 섞지 말라고 한다', () => {
    const body = STAGE?.paragraphs.join(' ') ?? '';
    expect(body).toMatch(/Buccinum undatum/);
    expect(body).toMatch(/Rapana venosa/);
  });

  it('프랑스 창구 0을 단가 0으로 만들지 않는다', () => {
    expect(seriesWindows.find((r) => r.국가 === '프랑스')?.물량).toBe(0);
    expect(seriesUnits.some((r) => r.국가 === '프랑스')).toBe(false);
    expect(STAGE?.paragraphs.join(' ')).toMatch(/단가를 0으로 만들지 않는다/);
  });

  it('인테이크 숫자가 JSON 위젯과 같다', () => {
    const v1 = JSON.parse(
      readFileSync(join(ROOT, 'public/data/whelk_country_series_v1.json'), 'utf8'),
    ) as {
      widgets: Array<{
        id: string;
        customBody?: Array<{ name: string }>;
        data?: Array<{ 국가: string; 물량?: number; 단가?: number }>;
      }>;
    };
    const roles = v1.widgets.find((w) => w.id === 'w_series_country_roles');
    const windows = v1.widgets.find((w) => w.id === 'w_series_kr_windows');
    const unit = v1.widgets.find((w) => w.id === 'w_series_kr_unit');
    expect(roles?.customBody?.map((r) => r.name)).toEqual(seriesRoles.map((r) => r.name));
    expect(windows?.data?.map((r) => [r.국가, r.물량])).toEqual(
      seriesWindows.map((r) => [r.국가, r.물량]),
    );
    expect(unit?.data?.map((r) => [r.국가, r.단가])).toEqual(
      seriesUnits.map((r) => [r.국가, r.단가]),
    );
    expect(seriesRoles.map((r) => r.name)).toEqual([
      '영국',
      '아일랜드',
      '프랑스',
      '캐나다',
      '중국',
      '한국',
    ]);
  });

  it('본문 수치가 인테이크와 맞는다', () => {
    const text = [STAGE?.lede, ...(STAGE?.paragraphs ?? [])].join('\n');
    const uk = seriesWindows.find((r) => r.국가 === '영국');
    const cn = seriesWindows.find((r) => r.국가 === '중국');
    const ca = seriesUnits.find((r) => r.국가 === '캐나다');
    expect(uk).toBeDefined();
    expect(cn).toBeDefined();
    expect(ca).toBeDefined();
    expect(text).toContain(uk!.물량.toLocaleString('en-US'));
    expect(text).toContain(cn!.물량.toLocaleString('en-US'));
    expect(text).toContain(ca!.단가.toLocaleString('en-US'));
    expect(text).toContain(SERIES_KR_PREP_TONNES.toLocaleString('en-US'));
  });

  it('s05 슬롯이 사람이 읽을 수치를 실제로 그려낸다', () => {
    const slots = WHELK_CHART_SLOTS.s05;
    expect(slots).toBeTruthy();
    expect(slots.length).toBe(3);

    const html = slots
      .map((s) => renderToStaticMarkup(React.createElement(React.Fragment, null, s.render())))
      .join('');

    for (const probe of [
      '영국',
      '프랑스',
      '참골뱅이 어획 1위',
      '이 세번에 창구 없음',
      'Rapana venosa',
      'Buccinum undatum',
      '680.3',
    ]) {
      expect(html, `마크업에 없음: ${probe}`).toContain(probe);
    }
  });

  it('슬롯 캡션이 제품중량·세번 경계를 밝힌다', () => {
    const caps = WHELK_CHART_SLOTS.s05.map((s) => s.caption).join(' ');
    expect(caps).toMatch(/제품중량|세번/);
    expect(caps).toMatch(/더할 수 없다|만들지 않는다/);
  });
});
