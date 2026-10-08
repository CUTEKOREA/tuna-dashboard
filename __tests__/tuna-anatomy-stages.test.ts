import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { TUNA_ANATOMY_CHART_SLOTS } from '@/components/market-understanding/TunaAnatomyDashboard';
import { getTunaAnatomyData } from '@/lib/data/commodity-industry';
import {
  TUNA_ANATOMY_BRIEFING_POINTS,
  TUNA_ANATOMY_NARRATIVES,
  TUNA_ANATOMY_SOURCE_NOTES,
} from '@/lib/tuna-anatomy-content';

const TEXT = TUNA_ANATOMY_NARRATIVES.flatMap((s) => [
  s.lede,
  ...s.paragraphs,
  ...s.facts.map((f) => `${f.label} ${f.value} ${f.note ?? ''}`),
]).join('\n');

const BRIEF = TUNA_ANATOMY_BRIEFING_POINTS.map((b) => `${b.headline ?? ''} ${b.text}`).join('\n');
const NOTES = TUNA_ANATOMY_SOURCE_NOTES.join('\n');

describe('참치 해부 페이지 - 보고서 전수 대조 보강', () => {
  it('단계 15개이고 키가 s01~s15다', () => {
    expect(TUNA_ANATOMY_NARRATIVES).toHaveLength(15);
    expect(TUNA_ANATOMY_NARRATIVES.map((n) => n.key)).toEqual(
      Array.from({ length: 15 }, (_, i) => `s${String(i + 1).padStart(2, '0')}`),
    );
  });

  it('팩·수집분의 핵심 수치가 본문·사실표에 있다', () => {
    for (const probe of [
      '2,100',
      '118,014',
      '97,487',
      '62,984',
      '628,606',
      '9,056',
      '0.51',
      '98.83',
      '43,734,528',
      '2,962,652',
      '11,195,039',
      '314,692,949',
      'KIRIKORE',
      'Galapesca',
      '토키오인터네셔널',
      '삼진물산',
      '코스트코코리아',
    ]) {
      expect(TEXT, `없음: ${probe}`).toContain(probe);
    }
  });

  it('옛 방콕 미공시 문구와 일본 HS1604 전년비를 들이지 않는다', () => {
    expect(TEXT).not.toContain('2025년 12월 이후 월별 단일값은 공시되지 않는다');
    expect(TEXT).not.toMatch(/HS1604[^\n]{0,40}전년\s*(비|동기 대비)/);
    expect(NOTES).toContain('전년 동기 원문이 없어 전년비는 없다');
    expect(NOTES).toContain('에콰도르 만타이지 마닐라가 아니다');
  });

  it('주어·단위 오류 잔존을 들이지 않는다', () => {
    expect(TEXT).not.toContain('34,834,425 kg(11.83');
    expect(TEXT).toContain('금액 점유율 11.83%');
    expect(TEXT).toContain('ISSF 참여기업 준수율');
    expect(TEXT).toContain('ISSF PVR 선박 준수 현황');
    expect(TEXT).toContain('75.58');
    expect(TEXT).toContain('캔·조제품 5,962');
    expect(TEXT).toContain('캔·조제품 2,465');
    expect(TEXT).toContain('캔·조제품 수출 444,580');
    expect(TEXT).toContain('그 밖은 1,517');
    expect(TEXT).toContain('2026년 추정 한도 9,056');
    expect(TEXT).toContain('2025년 어획이 해당 연도 한도를');
    expect(TEXT).not.toContain('나눠 실었다');
    expect(NOTES).not.toContain('만들지 않았다');
    expect(TEXT).not.toContain('개별 기업 해부와 칸을 나눈다');
    const sashimi = TUNA_ANATOMY_CHART_SLOTS.s09?.find((s) =>
      s.title.includes('국내 횟감 공장 명부'),
    );
    expect(sashimi?.telemetry.syncDate).toBe('2024년분');
  });

  it('인사이트 2건이 브리핑에 출처·등급과 함께 있다', () => {
    expect(BRIEF).toContain('2,100');
    expect(BRIEF).toContain('등급 A');
    expect(BRIEF).toContain('등급 C');
    expect(BRIEF).toContain('0.51');
    expect(BRIEF).toContain('21.4');
    expect(TUNA_ANATOMY_BRIEFING_POINTS.some((b) => b.stage === 's13')).toBe(true);
    expect(TUNA_ANATOMY_BRIEFING_POINTS.some((b) => b.stage === 's05')).toBe(true);
  });

  it('명부 표 슬롯이 법인명을 그린다', () => {
    const html = ['s04', 's08', 's09', 's10']
      .flatMap((k) => TUNA_ANATOMY_CHART_SLOTS[k] ?? [])
      .map((s) => renderToStaticMarkup(React.createElement(React.Fragment, null, s.render())))
      .join('');
    for (const probe of [
      '대해수산',
      '오뚜기에스에프',
      '토키오인터네셔널',
      'COSMO SEAFOODS',
      '비지에프푸드',
      '커클랜드',
      '그 밖',
      '국가별 캔·조제품 평균 수입단가',
    ]) {
      expect(html, `마크업에 없음: ${probe}`).toContain(probe);
    }
    expect(html).not.toMatch(/대표이사|사장\s/);
    expect(html).not.toContain('개별 기업 해부와 칸을 나눈다');
    expect(html).not.toContain('수입 캔 베트남 4.13');
  });

  it('방콕 시계열 마지막 점이 2026-08 2100이다', () => {
    const bkk = getTunaAnatomyData().가격.방콕;
    const last = bkk[bkk.length - 1];
    expect(last.월).toBe('2026-08');
    expect(last.방콕).toBe(2100);
    expect(
      TUNA_ANATOMY_CHART_SLOTS.s13?.some((s) => s.title.includes('2024~2026')),
    ).toBe(true);
  });
});
