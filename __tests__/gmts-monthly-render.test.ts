import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GmtsDashboard, { type GmtsTabKey } from '../components/gmts/GmtsDashboard';
import {
  GensanMonthlyPriceChart,
  MonthlyCatchChart,
} from '../components/gmts/GmtsMonthlyReport';

type DashboardProps = NonNullable<Parameters<typeof GmtsDashboard>[0]>;
const DashboardComponent = GmtsDashboard as ComponentType<DashboardProps>;

function renderDashboard(initialTab?: GmtsTabKey): string {
  return renderToStaticMarkup(createElement(DashboardComponent, { initialTab }));
}

describe('GMTS monthly report tab', () => {
  it.each([
    ['어획량', MonthlyCatchChart],
    ['어가', GensanMonthlyPriceChart],
  ] as const)('%s 차트가 측정된 카드 크기를 Recharts에 전달한다', (_label, Chart) => {
    const html = renderToStaticMarkup(
      createElement(Chart as ComponentType<{ width?: number; height?: number }>, { width: 457, height: 330 }),
    );

    expect(html).toContain('class="recharts-wrapper"');
    expect(html).toContain('width="457"');
    expect(html).toContain('height="330"');
  });

  it('월간보고 탭을 노출하고 최신 보고의 손익·자금·업무 동향을 고정한다', () => {
    const html = renderDashboard('monthly');

    expect(html).toContain('월간보고');
    expect(html).toContain('합작선 월별 어획량');
    expect(html).toContain('GENSAN 어가 동향');
    expect(html).toContain('2026년 1~7월 손익');
    expect(html).toContain('2026년 7월말 채권/채무 내역');
    expect(html).toContain('4,969,573');
    expect(html).toContain('(5,582,202)');
    expect(html).toContain('(41,002,295)');
    expect(html).toContain('정부기여금 $3,116,666 미지급 배당금 $449,683');
    expect(html).toContain('3개사 7월 결산');
    expect(html).toContain('GMTS 월간보고 (8월).pptx');
    expect(html).toContain('2026.08.25');
    // 5월 NFDC 손익 표기-합산 불일치는 원문 유지 + 플래그 노출
    expect(html).toContain('원문 확인 필요');
    // 병합 셀 잔존값은 어디에도 노출하지 않는다
    expect(html).not.toContain('122,052');
    expect(html).not.toContain('26,529,930');
  });

  it('기존 주간 탭 화면을 유지한다', () => {
    const html = renderDashboard();

    expect(html).toContain('운영 요약');
    expect(html).toContain('데이터 품질');
    expect(html).toContain('월간보고');
  });
});
