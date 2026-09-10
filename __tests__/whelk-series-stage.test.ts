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
      's06',
      's07',
      's08',
      'x01',
      'x02',
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
    expect(slots.length).toBeGreaterThanOrEqual(3);

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

describe('골뱅이 06·07단계 - 명의·위판 (보고서 제3판)', () => {
  it('명의·위판 단계와 브리핑이 있다', () => {
    expect(WHELK_NARRATIVES.find((n) => n.key === 's06')?.title.split(' - ')[0]).toBe('명의');
    expect(WHELK_NARRATIVES.find((n) => n.key === 's07')?.title.split(' - ')[0]).toBe('위판');
    expect(WHELK_NARRATIVES.find((n) => n.key === 's08')?.title.split(' - ')[0]).toBe('명부');
    expect(WHELK_BRIEFING_POINTS.some((b) => b.stage === 's06')).toBe(true);
    expect(WHELK_BRIEFING_POINTS.some((b) => b.stage === 's07')).toBe(true);
    expect(WHELK_BRIEFING_POINTS.some((b) => b.stage === 's08')).toBe(true);
    expect(WHELK_SOURCE_NOTES.some((n) => n.includes('제3판'))).toBe(true);
  });

  it('생산·위판 정본 수치가 본문에 있다', () => {
    const s06 = WHELK_NARRATIVES.find((n) => n.key === 's06');
    const s07 = WHELK_NARRATIVES.find((n) => n.key === 's07');
    const t6 = [s06?.lede, ...(s06?.paragraphs ?? [])].join('\n');
    const t7 = [s07?.lede, ...(s07?.paragraphs ?? [])].join('\n');
    expect(t6).toContain('6,203,407');
    expect(t6).toContain('2,464,820');
    expect(t6).toContain('59.5%');
    expect(t6).toContain('705건');
    expect(t7).toContain('8,228,645');
    expect(t7).toContain('7,925,747');
    expect(t7).toContain('16-81');
  });

  it('매체 670 t과 세계 골뱅이 생산량 라벨을 쓰지 않는다', () => {
    const text = WHELK_NARRATIVES.flatMap((s) => [s.lede, ...s.paragraphs]).join('\n');
    expect(text).not.toContain('670 tons');
    expect(text).not.toContain('1,591');
    expect(text).not.toMatch(/(?<![0-9,])670 t\b/);
  });

  it('3차 지적: 기간·단위·표 불일치·전체화를 되돌리지 않는다', () => {
    const s01 = WHELK_NARRATIVES.find((n) => n.key === 's01');
    const s07 = WHELK_NARRATIVES.find((n) => n.key === 's07');
    const s08 = WHELK_NARRATIVES.find((n) => n.key === 's08');
    const x02 = WHELK_NARRATIVES.find((n) => n.key === 'x02');
    const t7 = [s07?.lede, ...(s07?.paragraphs ?? [])].join('\n');
    const t8 = [s08?.lede, ...(s08?.paragraphs ?? [])].join('\n');
    const tX = [x02?.lede, ...(x02?.paragraphs ?? [])].join('\n');
    const f01 = (s01?.facts ?? []).map((f) => `${f.label}|${f.value}|${f.asOf}|${f.note}`).join('\n');
    const f07 = (s07?.facts ?? []).map((f) => `${f.label}|${f.value}|${f.note}`).join('\n');
    const f08 = (s08?.facts ?? []).map((f) => `${f.label}|${f.value}|${f.asOf}|${f.note}`).join('\n');
    expect(f01).toContain('6,443원/kg');
    expect(f01).toContain('2020→2025년');
    expect(f01).not.toMatch(/6,443원(?!\/kg)/);
    expect(t7).toContain('잠수기 업종조합 2곳 위판');
    expect(f07).toContain('잠수기 업종조합 2곳 위판');
    expect(t8).toContain('2025년 생산 상위 20개 업체의 생산량과 점유율이다');
    expect(t8).toContain('2024 생산량(kg)');
    expect(t8).toContain('전년비(%)');
    expect(t8).toContain('2025 점유율(%)');
    expect(t8).not.toContain('원문 그대로 둔다');
    expect(t8).toContain('표 11 기준 112건(영국 85');
    expect(t8).toContain('원문 표 간 불일치');
    expect(t8).toContain('미주통상 2022년 결산');
    expect(f08).toContain('미주통상 2022년 결산');
    expect(f08).toContain('2022년');
    expect(tX).toContain('보고서가 집계한 7건의 사유는 카드뮴·납이다');
    expect(tX).not.toContain('유럽연합 통보는 모두 카드뮴과 납');
    const s08Html = (WHELK_CHART_SLOTS.s08 ?? [])
      .map((s) => `${s.caption}\n${renderToStaticMarkup(React.createElement(React.Fragment, null, s.render()))}`)
      .join('\n');
    expect(s08Html).toContain('2024·2025 생산량(kg)');
    expect(s08Html).not.toContain('전년비는 보고서 원문');
  });

  it('s06·s07 표가 법인명을 그린다', () => {
    const html = [...(WHELK_CHART_SLOTS.s06 ?? []), ...(WHELK_CHART_SLOTS.s07 ?? [])]
      .map((s) => renderToStaticMarkup(React.createElement(React.Fragment, null, s.render())))
      .join('');
    for (const probe of [
      '유성물산교역',
      '동원F&amp;B',
      '유동골뱅이',
      '구룡포',
      '에스티엑스에프앤씨',
      '한마루식품',
      '은하수산',
      '대천서부',
    ]) {
      expect(html, `마크업에 없음: ${probe}`).toContain(probe);
    }
  });
});
