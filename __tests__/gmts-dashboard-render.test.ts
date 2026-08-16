import { readFileSync } from 'node:fs';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GmtsDashboard, {
  CanneryUtilizationChart,
  MonthlyVolumeChart,
  PortFlowChart,
  PriceTrendChart,
  type ChartSizeProps,
  type GmtsTabKey,
} from '../components/gmts/GmtsDashboard';

type DashboardProps = NonNullable<Parameters<typeof GmtsDashboard>[0]>;
const DashboardComponent = GmtsDashboard as ComponentType<DashboardProps>;

function renderDashboard(initialTab?: GmtsTabKey): string {
  return renderToStaticMarkup(createElement(DashboardComponent, { initialTab }));
}

describe('GMTS dashboard decision surface', () => {
  it.each([
    ['항만 선박 흐름', PortFlowChart],
    ['공장 이용률', CanneryUtilizationChart],
    ['가격 추세', PriceTrendChart],
    ['월별 반입량', MonthlyVolumeChart],
  ] as const)('%s 차트가 측정된 카드 크기를 Recharts에 전달한다', (_label, Chart) => {
    const html = renderToStaticMarkup(
      createElement(Chart as ComponentType<ChartSizeProps>, { width: 457, height: 330 }),
    );

    expect(html).toContain('class="recharts-wrapper"');
    expect(html).toContain('width="457"');
    expect(html).toContain('height="330"');
    expect(html).toContain('width:457px;height:330px');
  });

  it('renders the real parent summary with source uncertainty and current derived figures', () => {
    const html = renderDashboard();

    expect(html).toContain('GMTS');
    expect(html).toContain('제너럴산토스 주간보고');
    expect(html).toContain('data-now="true"');
    expect(html).toContain('운영 기준일 미기재');
    expect(html).toContain('자료 미확정');
    expect(html).toContain('정적');
    expect(html).toContain('운영 요약');
    expect(html).toContain('항만·선박');
    expect(html).toContain('공장·재고');
    expect(html).toContain('가격·반입');
    expect(html).toContain('데이터 품질');
    expect(html).toContain('2026년 1~7월');
    expect(html).toContain('63,736');
    expect(html).toContain('$1,900');
    expect(html).toContain('$2,025');
    expect(html).toContain('원문 분모 미기재');
    expect(html).toContain('원문 단위 미기재');
    expect(html).not.toContain('$/MT');
    expect(html).not.toContain('Other');
  });

  it.each<{
    tab: GmtsTabKey;
    cards: Array<[title: string, description: string]>;
  }>([
    {
      tab: 'port',
      cards: [
        ['주간 선박 흐름', '원문 선언 건수 추세와 관찰 선박 행 수를 분리 비교'],
        ['최신 선박 파이프라인', '선박별 화물·제너럴산토스 명시 배정·정규화 일자'],
      ],
    },
    {
      tab: 'cannery',
      cards: [
        ['생산·창고 이용률', '생산 가동률과 냉동창고 이용률 주간 비교'],
        ['공장별 원어 압력', '7개 공장 생산·재고·처리일수 원문 대조'],
      ],
    },
    {
      tab: 'price-volume',
      cards: [
        ['GSP·Non-GSP 가격 추세', '특혜·비특혜 가격과 원문 가격 한정어 추세'],
        ['Gensan 월별 반입량', '현재·직전 연도 월별 반입량과 원문 수정 이력 비교'],
      ],
    },
  ])('$tab parent render mounts exactly its two bound WidgetCard surfaces', ({ tab, cards }) => {
    const html = renderDashboard(tab);

    for (const [title, description] of cards) {
      expect(html).toContain(title);
      expect(html).toContain(description);
    }
    expect(html.match(/data-widget-id=/g)).toHaveLength(2);
    expect(html).not.toContain('$/MT');
    expect(html).not.toContain('Other');
    if (tab === 'cannery') {
      expect(html.match(/data-gmts-kpi="true"/g)).toHaveLength(2);
      expect(html).toContain('data-gmts-kpi-label="true"');
      expect(html).toContain('data-gmts-kpi-value="true"');
    }
  });

  it('keeps raw English price qualifiers out of the price tab and shows Korean qualifiers', () => {
    const html = renderDashboard('price-volume');
    const source = readFileSync(
      new URL('../components/gmts/GmtsDashboard.tsx', import.meta.url),
      'utf8',
    );

    for (const rawQualifier of [
      'No price',
      'No offer',
      'Around',
      'Level',
      'under',
      'old contract',
    ]) {
      expect(html).not.toContain(rawQualifier);
    }
    for (const koreanQualifier of ['가격 없음', '제안 없음', '약', '수준', '미만', '기존 계약']) {
      expect(html).toContain(koreanQualifier);
    }
    expect(
      source.match(
        /<small>원문: \{row\.(?:nonGspRawText|gspRawText)\}<\/small>/g,
      ) ?? [],
    ).toHaveLength(0);
    expect(source).toContain('{row.nonGspQualifierLabel}');
    expect(source).toContain('{row.gspQualifierLabel}');
  });

  it('binds all declared-vessel summary states without hard-coded warning text or units', () => {
    const source = readFileSync(
      new URL('../components/gmts/GmtsDashboard.tsx', import.meta.url),
      'utf8',
    );

    expect(source).toContain('value={GMTS_VIEW.hero.activeVessels.value}');
    expect(source).toContain('value={GMTS_VIEW.hero.completedVessels.value}');
    expect(source).toContain('value={GMTS_VIEW.hero.incomingVessels.value}');
    expect(source).toContain("warning={GMTS_VIEW.hero.activeVessels.tone === 'warning'}");
    expect(source).toContain("warning={GMTS_VIEW.hero.completedVessels.tone === 'warning'}");
    expect(source).toContain("warning={GMTS_VIEW.hero.incomingVessels.tone === 'warning'}");
    expect(source).not.toContain('value={`자료 ${GMTS_VIEW.hero.activeVessels.value}`}');
    expect(source).not.toContain('value={`${GMTS_VIEW.hero.completedVessels.value}${GMTS_VIEW.hero.completedVessels.unit}`}');
    expect(source).not.toContain('value={`${GMTS_VIEW.hero.incomingVessels.value}${GMTS_VIEW.hero.incomingVessels.unit}`}');
  });

  it('keeps the locked hero teaser free of every detailed surface', () => {
    const html = renderToStaticMarkup(createElement(DashboardComponent, { heroOnly: true }));

    expect(html).toContain('GMTS');
    expect(html).toContain('제너럴산토스 주간보고');
    expect(html).toContain('data-now="true"');
    expect(html).toContain('자료 미확정');
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain('role="img"');
    expect(html).not.toContain('<table');
    expect(html).not.toContain('data-widget-id=');
    expect(html).not.toContain('2026년 1~7월');
    expect(html).not.toContain('보고서 원문 아카이브');
  });

  it('renders all 30 source reports and the revision and capacity warnings', () => {
    const html = renderDashboard('quality');

    expect(html.match(/data-source-report=/g)).toHaveLength(30);
    expect(html).toContain('30건');
    expect(html).toContain('38쪽');
    expect(html).toContain('원문에서 확인되지 않은 값은 화면에서도 확정하지 않음');
    expect(html).toContain('6,220');
    expect(html).toContain('11,968');
    expect(html).toContain('Celebes');
    expect(html).toContain('122%');
    expect(html).toContain('원문 확인 필요');
  });

  it('does not bypass the typed intake with fetch or a direct JSON import', () => {
    const source = readFileSync(
      new URL('../components/gmts/GmtsDashboard.tsx', import.meta.url),
      'utf8',
    );

    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/(?:from\s+|import\s*\()['"][^'"]+\.json['"]/);
    expect(source).toContain("from '@/lib/data/gmts'");
    expect(source).toContain("from '@/lib/gmts-presentation'");
  });
});
