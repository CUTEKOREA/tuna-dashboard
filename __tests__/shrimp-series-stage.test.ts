import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SHRIMP_CHART_SLOTS } from '@/components/market-understanding/ShrimpIndustryDashboard';
import {
  SHRIMP_BRIEFING_POINTS,
  SHRIMP_NARRATIVES,
  SHRIMP_SOURCE_NOTES,
} from '@/lib/shrimp-industry-content';
import {
  SERIES_KR_PREP_TONNES,
  SERIES_KR_RAW_TONNES,
  seriesMeta,
  seriesRoles,
  seriesUnits,
  seriesWindows,
} from '@/lib/data/shrimp-country-series';

const STAGE = SHRIMP_NARRATIVES.find((n) => n.key === 's06');
const ROOT = join(__dirname, '..');

describe('새우 06단계 - 수입 창구', () => {
  it('탭 이름은 04 한국과 겹치지 않게 수입 창구다', () => {
    expect(STAGE?.title.split(' - ')[0]).toBe('수입 창구');
  });

  it('단계가 05와 바스켓 사이에 놓인다', () => {
    expect(SHRIMP_NARRATIVES.map((n) => n.key)).toEqual([
      's01',
      's02',
      's03',
      's04',
      's05',
      's06',
      'x01',
    ]);
  });

  it('브리핑에 이 단계 항목이 있다', () => {
    expect(SHRIMP_BRIEFING_POINTS.some((b) => b.stage === 's06')).toBe(true);
  });

  it('측정 경계를 본문 첫 문단과 출처 각주 양쪽에서 밝힌다', () => {
    expect(STAGE?.paragraphs[0]).toMatch(/더할 수 없다/);
    expect(STAGE?.paragraphs[0]).toMatch(/연환산하지 않는다|연간으로 읽지 않는다/);
    expect(SHRIMP_SOURCE_NOTES.some((n) => n.includes('06단계'))).toBe(true);
    expect(seriesMeta.measurementBoundary).toMatch(/더하거나 연환산하지 않는다/);
  });

  it('FAO 활어와 관세청 제품중량을 빼서 잔여를 만들지 말라고 한다', () => {
    expect(STAGE?.paragraphs.join(' ')).toMatch(/빼서/);
  });

  it('SECA 를 확인 전 특혜로 쓰지 말라고 한다', () => {
    const body = `${STAGE?.paragraphs.join(' ') ?? ''} ${STAGE?.facts.map((f) => f.note).join(' ')}`;
    expect(body).toMatch(/SECA/);
    expect(body).toMatch(/미확인|확인하기 전/);
    expect(SHRIMP_SOURCE_NOTES.some((n) => n.includes('SECA'))).toBe(true);
  });

  it('학명 잠금을 본문에 남긴다', () => {
    const body = STAGE?.paragraphs.join(' ') ?? '';
    expect(body).toMatch(/Penaeus monodon/);
    expect(body).toMatch(/Penaeus chinensis/);
  });

  it('인테이크 숫자가 v4 위젯과 같다', () => {
    const v4 = JSON.parse(
      readFileSync(join(ROOT, 'public/data/shrimp_real_data_v4.json'), 'utf8'),
    ) as {
      widgets: Array<{
        id: string;
        sit?: string;
        customBody?: Array<{ name: string }>;
        data?: Array<{ 국가: string; 원물?: number; 조제품?: number; 단가?: number }>;
      }>;
    };
    const roles = v4.widgets.find((w) => w.id === 'w_series_country_roles');
    const windows = v4.widgets.find((w) => w.id === 'w_series_kr_windows');
    const unit = v4.widgets.find((w) => w.id === 'w_series_kr_unit');
    expect(roles?.customBody?.map((r) => r.name)).toEqual(seriesRoles.map((r) => r.name));
    expect(windows?.data?.map((r) => [r.국가, r.원물, r.조제품])).toEqual(
      seriesWindows.map((r) => [r.국가, r.원물, r.조제품]),
    );
    expect(unit?.data?.map((r) => [r.국가, r.단가])).toEqual(
      seriesUnits.map((r) => [r.국가, r.단가]),
    );
    const koreaScope = seriesRoles.find((r) => r.name === '한국')?.scope ?? '';
    expect(koreaScope).toContain(SERIES_KR_RAW_TONNES.toLocaleString('en-US'));
    expect(koreaScope).toContain(SERIES_KR_PREP_TONNES.toLocaleString('en-US'));
    expect(roles?.customBody?.find((r) => r.name === '한국')).toBeTruthy();
  });

  it('본문 수치가 인테이크와 맞는다', () => {
    const text = [STAGE?.lede, ...(STAGE?.paragraphs ?? [])].join('\n');
    const cn = seriesWindows.find((r) => r.국가 === '중국');
    const vn = seriesWindows.find((r) => r.국가 === '베트남');
    const ec = seriesUnits.find((r) => r.국가 === '에콰도르');
    expect(cn).toBeDefined();
    expect(vn).toBeDefined();
    expect(ec).toBeDefined();
    expect(text).toContain(cn!.원물.toLocaleString('en-US'));
    expect(text).toContain(vn!.조제품.toLocaleString('en-US'));
    expect(text).toContain(String(ec!.단가));
    expect(text).toContain(SERIES_KR_RAW_TONNES.toLocaleString('en-US'));
  });

  it('s06 슬롯이 사람이 읽을 수치를 실제로 그려낸다', () => {
    const slots = SHRIMP_CHART_SLOTS.s06;
    expect(slots).toBeTruthy();
    expect(slots.length).toBe(3);

    const html = slots
      .map((s) => renderToStaticMarkup(React.createElement(React.Fragment, null, s.render())))
      .join('');

    for (const probe of [
      '에콰도르',
      '베트남',
      '수출 표준 생산국',
      '0.26%',
      'Penaeus monodon',
      'Penaeus chinensis',
      'SECA',
    ]) {
      expect(html, `마크업에 없음: ${probe}`).toContain(probe);
    }
  });

  it('슬롯 캡션이 제품중량·세번 경계를 밝힌다', () => {
    const caps = SHRIMP_CHART_SLOTS.s06.map((s) => s.caption).join(' ');
    expect(caps).toMatch(/제품중량|세번/);
    expect(caps).toMatch(/더할 수 없다|섞지 않는다/);
  });
});
