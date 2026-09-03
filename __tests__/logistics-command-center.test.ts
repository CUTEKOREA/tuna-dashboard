import { readFileSync } from 'node:fs';
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
    expect(markup).toContain('THAI UNION 창고 포화');
    expect(markup).toContain('TRI MARINE 누계 정정 반영');
    expect(markup).toContain('누계 56,463MT · 월별 합계 일치');
    expect(markup).toContain('송클라 저가동');
    expect(markup).toContain('입항 상태 확인 완료');
    expect(markup).toContain('SEIN VENUS 하역완료(8/22) · HENG HONG 9 배분 보고 확인(8/6)');
    expect(markup).toContain('확인 완료');
    expect(markup).not.toContain('TRI MARINE 누계 상충');
    expect(markup).not.toContain('입항 상태 재확인');
    expect(traderSource).toContain('원문 트라이마린 누계도 56,463MT로 정정돼 월별 합산과 일치합니다.');
    expect(traderSource).not.toContain('원문 트라이마린 누계 46,463MT');
  });

  it('renders the reported ETAs with their source-backed follow-up results', () => {
    const heroMarkup = renderToStaticMarkup(React.createElement(LogisticsHero));
    const carrierMarkup = renderToStaticMarkup(React.createElement(CarrierUnloadingStatus));

    expect(heroMarkup).toContain('35주차 운반선 보고 기준');
    expect(heroMarkup).toContain('data-kpi-value="21176.679"');
    expect(heroMarkup).toContain('data-kpi-value="6"');
    expect(heroMarkup).toContain('입항 재확인 2척 후속 확인 완료');
    expect(heroMarkup).not.toContain('입항 상태 재확인');
    expect(carrierMarkup).toContain('입항 예정 후속 확인');
    expect(carrierMarkup).toContain('하역 완료 확인');
    expect(carrierMarkup).toContain('입항·배분 보고 확인');
    expect(carrierMarkup).toContain('하역 원장 2026.08.07~08.22');
    expect(carrierMarkup).toContain('31·32주차 운반선 배분 보고');
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
