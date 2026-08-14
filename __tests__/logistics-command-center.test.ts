import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const dashboardSource = readFileSync(join(root, 'components/LogisticsDashboard.tsx'), 'utf8');
const operationsSource = readFileSync(join(root, 'components/LogisticsOperationsPanel.tsx'), 'utf8');
const pillTabsSource = readFileSync(join(root, 'components/v2/PillTabs.tsx'), 'utf8');

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

  it('puts exception-led decisions on the default operations tab', () => {
    expect(dashboardSource).toContain("useState<LogisticsTab>('operations')");
    expect(operationsSource).toContain('운영 예외 관제판');
    expect(operationsSource).toContain('THAI UNION 창고 포화');
    expect(operationsSource).toContain('TRI MARINE 누계 상충');
    expect(operationsSource).toContain('송클라 저가동');
    expect(operationsSource).toContain('입항 상태 재확인');
    expect(operationsSource).toContain('즉시 확인');
    expect(operationsSource).toContain('금주 확인');
  });

  it('keeps static vessel report details collapsed by default', () => {
    expect(dashboardSource).toContain('<details');
    expect(dashboardSource).toContain('보고 시점 자료 — 현재 운항 상태가 아닙니다');
    expect(dashboardSource).toContain('냉동 운반선 보고자료 펼치기');
  });

  it('keeps the reported raw-material price visible on the receipts tab', () => {
    expect(dashboardSource).toContain('원어 협의 시장가');
    expect(dashboardSource).toContain('rawMaterialPriceUsdPerMt');
    expect(dashboardSource).toContain('트레이더-통조림 공장 협의 가격');
  });
});
