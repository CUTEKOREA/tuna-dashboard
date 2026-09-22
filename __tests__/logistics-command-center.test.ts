import { readFileSync } from 'node:fs';
import { reeferWeeklyReport } from '@/lib/data/reefer-weekly';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CarrierUnloadingStatus from '@/components/CarrierUnloadingStatus';
import { LogisticsHero } from '@/components/LogisticsDashboard';
import LogisticsOperationsPanel from '@/components/LogisticsOperationsPanel';

const root = process.cwd();
const dashboardSource = readFileSync(join(root, 'components/LogisticsDashboard.tsx'), 'utf8');
const pillTabsSource = readFileSync(join(root, 'components/v2/PillTabs.tsx'), 'utf8');
const traderSource = readFileSync(join(root, 'components/TraderStatus.tsx'), 'utf8');

describe('logistics decision workspace', () => {
  it('provides four keyboard-accessible work tabs through the shared pill shell', () => {
    for (const label of ['오늘의 운영', '반입·가격', '공장 운영', '선박·보고자료']) {
      expect(dashboardSource).toContain(label);
    }

    expect(dashboardSource).toContain('<PillTabs');
    expect(dashboardSource).toContain('role="tabpanel"');
    expect(dashboardSource).toContain('tabIdPrefix="logistics-tab"');
    expect(dashboardSource).toContain('panelIdPrefix="logistics-panel"');
    expect(pillTabsSource).toContain('role="tablist"');
    expect(pillTabsSource).toContain('role="tab"');
    expect(pillTabsSource).toContain("event.key === 'ArrowRight'");
    expect(pillTabsSource).toContain("event.key === 'Home'");
  });

  it('puts open exceptions and completed corrections on the default operations tab', () => {
    const markup = renderToStaticMarkup(React.createElement(LogisticsOperationsPanel));

    expect(dashboardSource).toContain("useState<LogisticsTab>('operations')");
    expect(markup).toContain('운영 확인 관제판');
    expect(markup).toContain('SPA 창고 포화');
    expect(markup).toContain('9월 반입 누계 정정 반영');
    expect(markup).toContain('9월 누계 7척 · 26,486MT · 월별 합계 일치');
    expect(markup).toContain('송클라 저가동');
    // 원문 잔량 불일치는 덮지 않고 관제판에 남긴다
    expect(markup).toContain('고반려 잔량 불일치');
    expect(markup).toContain('BAO LUCKY·SHIN FUJI·HIKARI 1');
    expect(markup).toContain('확인 완료');
    expect(markup).not.toContain('TRI MARINE 누계 상충');
    // 화면 문장에 손으로 적은 보고일이 남으면 다음 주에 그대로 남는다
    expect(traderSource).not.toContain('2026-08-05');
    expect(traderSource).toContain('logisticsWeeklyReport.traderReceipts.reconciliationNote');
  });

  it('renders the reported ETAs with their source-backed follow-up results', () => {
    const heroMarkup = renderToStaticMarkup(React.createElement(LogisticsHero));
    const carrierMarkup = renderToStaticMarkup(React.createElement(CarrierUnloadingStatus));

    // 주차·총량·척수는 매주 바뀐다 - 계약에서 파생시킨다
    const { source: reeferSource, rows: reeferRows } = reeferWeeklyReport;
    const reeferTotal = reeferRows.reduce((sum, row) => sum + Object.entries(row.deliveries)
      .reduce((inner, [key, value]) => (key === 'OTHER' || key === 'SHIP' || value === ''
        ? inner : inner + Number.parseFloat(value.replaceAll(',', ''))), 0), 0);
    expect(heroMarkup).toContain(`${reeferSource.week}주차 운반선 보고 기준`);
    expect(heroMarkup).toContain(`data-kpi-value="${reeferTotal}"`);
    expect(heroMarkup).toContain(`data-kpi-value="${reeferRows.length}"`);
    expect(heroMarkup).toContain('9월 방콕 반입 7척');
    expect(heroMarkup).not.toContain('입항 상태 재확인');
    // 운반선 표는 트레이더 단위 - 원문 입항표와 같은 모양이어야 척수 칸이 뜻을 갖는다
    expect(carrierMarkup).toContain('SEIN QUEEN (2,902 MT)');
    expect(carrierMarkup).toContain('ZHONG YU MARINE (5,025 MT)');
    expect(carrierMarkup).toContain('26,486 MT');
    expect(carrierMarkup).toContain('하역 중인 배는 5척');
    expect(carrierMarkup).not.toContain('2026-08-05');
  });

  it('keeps static vessel report details collapsed by default', () => {
    expect(dashboardSource).toContain('<details');
    expect(dashboardSource).toContain('보고 시점 자료 - 현재 운항 상태가 아닙니다');
    expect(dashboardSource).toContain('냉동 운반선 보고자료 펼치기');
  });

  it('keeps the reported raw-material price visible on the receipts tab', () => {
    expect(dashboardSource).toContain('원어 협의 시장가');
    expect(dashboardSource).toContain('rawMaterialPriceUsdPerMt');
    expect(dashboardSource).toContain('트레이더-통조림 공장 협의 가격');
  });
});
