import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MackerelIndustryDashboard from '@/components/market-understanding/MackerelIndustryDashboard';
import {
  MACKEREL_NARRATIVES,
  MACKEREL_SOURCE_NOTES,
} from '@/lib/mackerel-industry-content';

function narrativeText(): string {
  return MACKEREL_NARRATIVES.flatMap((stage) => [
    stage.lede,
    ...stage.paragraphs,
    ...stage.facts.flatMap((fact) => [
      fact.label,
      fact.value,
      fact.asOf,
      fact.source,
      fact.note ?? '',
    ]),
  ]).join('\n');
}

describe('고등어 최신 주간 수급 신호', () => {
  it('NSC 36주 누계 물량·단가와 전년 대비를 표시한다', () => {
    const text = narrativeText();

    expect(text).toContain('2026년 36주');
    expect(text).toContain('43,195 톤');
    expect(text).toContain('48.32 NOK/kg');
    expect(text).toContain('91,305');
    expect(text).toContain('31.47');
    expect(text).not.toContain('32주 누계');
    expect(text).not.toContain('2026년 34주');
  });

  it('KMI Vol.259 국내 도매·소매 가격과 미형성을 구분한다', () => {
    const text = narrativeText();

    expect(text).toContain('KMI Vol.259');
    expect(text).toContain('냉장 도매 5,579');
    expect(text).toContain('냉동 도매 4,180');
    expect(text).toContain('냉장 소매 12,069');
    expect(text).toContain('11,029');
    expect(text).toContain('미형성');
    expect(text).not.toContain('KMI Vol.257');
    expect(text).not.toContain('냉장 도매 6,172');
  });

  it('상단 스트립과 출처 메타에서도 최신 기준을 노출한다', () => {
    const html = renderToStaticMarkup(
      React.createElement(MackerelIndustryDashboard),
    );
    const notes = MACKEREL_SOURCE_NOTES.join('\n');

    expect(html).toContain('노르웨이 36주 누계');
    expect(html).toContain('43,195톤 · 48.32 NOK/kg');
    expect(html).toContain('NSC 2026-W36');
    expect(html).toContain('KMI Vol.259');
    expect(html).not.toContain('노르웨이 34주 누계');
    expect(html).not.toContain('KMI Vol.257');
    expect(notes).toContain('600g 미만');
    expect(notes).toContain('냉동 소매 미형성');
  });
});

describe('고등어 적대 리뷰 지적 (2026-09-10)', () => {
  it('P0 7.3%는 필렛 53건의 비중이지 대한민국 56건이 아니다', () => {
    const text = narrativeText();
    expect(text).toContain('제조국 대한민국 56건');
    expect(text).toContain('필렛 53건이 전체 725건의 7.3%');
    expect(text).not.toContain('56 건 (7.3%)');
  });

  it('P1 주어·술어와 소비 칸·비축 매체 인용을 걷어냈다', () => {
    const text = narrativeText();
    expect(text).toContain('일방 쿼터 67,548톤을 설정');
    expect(text).not.toContain('67,548톤을 잡았고');
    expect(text).toContain('6월 수출은 14,837톤');
    expect(text).not.toContain('10,584');
    expect(text).not.toContain('추석 비축 방출');
    expect(text).not.toContain('같은 노르웨이 물량을 두고');
    expect(text).toContain('같은 물량 경합으로 읽지 않는다');
  });

  it('P1 KPI·스트립에 2026년 1~7월 금액 라벨이 있다', () => {
    const html = renderToStaticMarkup(
      React.createElement(MackerelIndustryDashboard),
    );
    expect(html).toContain('노르웨이 수입 비중(2026년 1~7월 금액)');
    expect(html).toContain('노르웨이 비중 · 1~7월 누계 금액');
  });

  it('P0 6.4배는 소매 이윤의 배수이지 간접비의 배수가 아니다', () => {
    const text = narrativeText();
    expect(text).toContain('소매 간접비 2,134.8원은 어가수취가격의 44퍼센트');
    expect(text).toContain('이윤 1,781.8원은 산지중도매인 이윤 278.9원의 6.4배');
    expect(text).not.toContain('소매 간접비 2,134.8원과 이윤 1,781.8원은');
  });

  it('P2 원문 단위·세번 바구니·교차 기준·추정을 지킨다', () => {
    const text = narrativeText();
    const notes = MACKEREL_SOURCE_NOTES.join('\n');
    expect(text).toContain('93,444천 달러');
    expect(text).toContain('86,929천 달러');
    expect(text).not.toContain('9,344만');
    expect(text).not.toContain('8,693만');
    expect(text).toContain('5개 세번 바구니');
    expect(text).not.toContain('같은 통관 코드');
    expect(text).toContain('생물학적 허용어획량 30.4만 톤');
    expect(text).toContain('신고 기준 9곳(실제 생산 7곳)');
    expect(text).toContain('추정 - 25,000-9,784');
    expect(text).toContain('추정 - 1,197÷10,181');
    expect(text).toContain('해외 가공사·노르웨이 수출사 법인명은 공표 없음');
    expect(notes).not.toContain('「1~8월」');
    expect(notes).toContain('"1~7월(7개월 누계)"');
    expect(text).not.toContain('에서 봤다');
  });

  it('P1 명부는 lib/data 인테이크를 탄다', async () => {
    const { readFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const source = await readFile(
      join(process.cwd(), 'components/market-understanding/MackerelIndustryDashboard.tsx'),
      'utf8',
    );
    expect(source).toContain("from '@/lib/data/mackerel-roster'");
    expect(source).not.toMatch(/from\s+['"][^'"]+\.json['"]/);
  });
});
