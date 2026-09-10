import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { POLLOCK_CHART_SLOTS } from '@/components/market-understanding/PollockIndustryDashboard';
import {
  POLLOCK_BRIEFING_POINTS,
  POLLOCK_NARRATIVES,
  POLLOCK_SOURCE_NOTES,
} from '@/lib/pollock-industry-content';

const TEXT = POLLOCK_NARRATIVES.flatMap((s) => [
  s.lede,
  ...s.paragraphs,
  ...s.facts.map((f) => `${f.label} ${f.value} ${f.note ?? ''}`),
]).join('\n');

describe('명태 산업 페이지 - 보고서 2판 이식', () => {
  it('단계 키가 9개이고 명의·명부·재무가 붙어 있다', () => {
    expect(POLLOCK_NARRATIVES.map((n) => n.key)).toEqual([
      's01',
      's02',
      's03',
      's06',
      's04',
      's07',
      's08',
      's05',
      'x01',
    ]);
    expect(POLLOCK_NARRATIVES.find((n) => n.key === 's06')?.title.split(' - ')[0]).toBe('명의');
    expect(POLLOCK_NARRATIVES.find((n) => n.key === 's07')?.title.split(' - ')[0]).toBe('명부');
    expect(POLLOCK_NARRATIVES.find((n) => n.key === 's08')?.title.split(' - ')[0]).toBe('재무');
    for (const key of ['s01', 's02', 's03', 's06', 's04', 's07', 's08', 's05', 'x01']) {
      expect(POLLOCK_BRIEFING_POINTS.some((b) => b.stage === key)).toBe(true);
    }
    expect(POLLOCK_CHART_SLOTS.s06?.length).toBeGreaterThan(0);
    expect(POLLOCK_CHART_SLOTS.s07?.length).toBeGreaterThan(0);
    expect(POLLOCK_CHART_SLOTS.s08?.length).toBeGreaterThan(0);
  });

  it('팩 A 핵심 수치가 본문·사실표에 있다', () => {
    for (const probe of [
      '3,573,446',
      '28,999',
      '93.8',
      '426.9',
      '195,963',
      '79.8',
      '26,200',
      '6,346',
      '30,879',
      '1,740',
      '158,087',
      '313',
      '3,679',
      '42',
      '1,512',
      '3,879',
      '66.3',
      '46,393',
      '699.2',
      '696.1',
      '95,836.7',
      '1만5700',
      '103,655',
      '249.7',
      '608,283',
      '1,394,250',
      '1,886,000',
      '537',
    ]) {
      expect(TEXT, `없음: ${probe}`).toContain(probe);
    }
  });

  it('옛 값과 합산 금지를 화면에 들이지 않는다', () => {
    const notes = POLLOCK_SOURCE_NOTES.join('\n');
    expect(TEXT).not.toContain('3,884,500.606');
    expect(notes).not.toContain('3,884,500.606');
    expect(notes).toContain('ALK+POL+POK 혼합 옛 요약치');
    expect(TEXT).not.toMatch(/전용 세번은 여덟/);
    expect(TEXT).not.toContain('51,993');
    expect(notes).toContain('2026-06까지');
  });

  it('법인명만 쓰고 개인 이름은 없다', () => {
    expect(TEXT).toContain('에이에스엘교역');
    expect(TEXT).toContain('해성식품');
    expect(TEXT).toContain('조은수산');
    expect(TEXT).toContain('한성기업');
    expect(TEXT).toContain('사조오양');
    expect(TEXT).toContain('American Seafoods');
    expect(TEXT).not.toMatch(/대표이사|사장\s/);
  });

  it('s06·s07·s08 표가 법인명을 그린다', () => {
    const html = [...(POLLOCK_CHART_SLOTS.s06 ?? []), ...(POLLOCK_CHART_SLOTS.s07 ?? []), ...(POLLOCK_CHART_SLOTS.s08 ?? [])]
      .map((s) => renderToStaticMarkup(React.createElement(React.Fragment, null, s.render())))
      .join('');
    for (const probe of ['에이에스엘교역', '조은수산', '해성식품', '경대물산', '한성기업', '동원산업', '한성기업 김해공장', '7위']) {
      expect(html, `마크업에 없음: ${probe}`).toContain(probe);
    }
  });

  it('인사이트 방향이 브리핑에 있다', () => {
    const brief = POLLOCK_BRIEFING_POINTS.map((b) => b.text).join('\n');
    expect(brief).toContain('26,200');
    expect(brief).toContain('103,655');
    expect(brief).toContain('537');
    expect(brief).toContain('1만5700');
    expect(brief).toContain('4,146');
    expect(POLLOCK_SOURCE_NOTES.some((n) => n.includes('전국과 극동'))).toBe(true);
  });

  it('주어·기간·단위가 틀린 옛 표기를 들이지 않는다', () => {
    expect(TEXT).not.toContain('BSAI B시즌 진도');
    expect(TEXT).toContain('BSAI 명태 전체 누계');
    expect(TEXT).toContain('어묵 제외 명태 가공 전체');
    expect(TEXT).toContain('전체 82건 중 연육 81건');
    expect(TEXT).toContain('2023년 매출·영업이익 279.0·2.1억원, 2025년 생산 461톤');
    expect(TEXT).toContain('1~7월(7개월 누계) 1.21');
    expect(TEXT).toContain('8월 22일까지 누계');
    expect(TEXT).not.toContain('원화 환산은 원문에 없다');
    expect(TEXT).not.toContain('화면의 회사명');
    const brief = POLLOCK_BRIEFING_POINTS.map((b) => b.text).join('\n');
    expect(brief).toContain('전체 240건 중 연육 238건');
    expect(brief).not.toContain('연육만');
    expect(brief).toContain('황태 생산 신고 업체 685곳');
    expect(brief).not.toContain('덕장 685');
    expect(TEXT).not.toContain('중국 재수출 약 200,000');
    expect(TEXT).toContain('중국의 명태 수출 200,000톤');
    expect(TEXT).toContain('7위 한성기업 김해공장 82건');
    expect(TEXT).toContain('연육 신고 명의(A-1)');
    expect(TEXT).not.toContain('연육 수입상 명의는 동원에프앤비');
    expect(TEXT).toContain('API 증분은 2026-07부터');
    expect(TEXT).not.toContain('극동 어획 2024 1,998,300');
    expect(TEXT).toContain('러시아 어획 2024 1,998,300톤, 2025 2,150,000톤(극동 분지 기준');
    expect(TEXT).toContain('청아굿푸드 2024 오기 의심 8,869톤 포함');
    expect(brief).toContain('오기 의심 8,869톤 포함');
    expect(TEXT).toContain('연육 2024 2.37');
    expect(TEXT).toContain('2026 1~7월(7개월 누계) 2.81');
  });

  it('공급·가공·브랜드 표가 해당 단계에 연결된다', () => {
    expect(POLLOCK_CHART_SLOTS.s02?.some((s) => s.title === '공급 기업 - 누가 잡고 누가 파는가')).toBe(true);
    expect(POLLOCK_CHART_SLOTS.s04?.some((s) => s.title === '국가별 가공 거점과 기업')).toBe(true);
    expect(POLLOCK_CHART_SLOTS.s08?.some((s) => s.title === '브랜드와 점유율 (성격 구분)')).toBe(true);
    const html = [
      ...(POLLOCK_CHART_SLOTS.s02 ?? []),
      ...(POLLOCK_CHART_SLOTS.s04 ?? []),
      ...(POLLOCK_CHART_SLOTS.s08 ?? []),
    ]
      .map((s) => renderToStaticMarkup(React.createElement(React.Fragment, null, s.render())))
      .join('');
    expect(html).toContain('에이에스엘교역');
    expect(html).toContain('전체 82건 중 연육 81건');
    expect(html).toContain('황태 생산 신고 업체 685곳');
    expect(html).toContain('등급');
  });
});
