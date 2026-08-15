'use client';

import React, { useState } from 'react';
import {
  Anchor,
  BadgeDollarSign,
  Globe2,
  LayoutDashboard,
  Route,
  ShieldCheck,
  Ship,
  Tag,
  WalletCards,
} from 'lucide-react';

import { headline, h1, company } from '@/lib/data/panofi';
import HeroZone, { type HeroKpi } from '../v2/HeroZone';
import PillTabs, { type PillTab } from '../v2/PillTabs';
import '../cosmo/cosmo.css';
import {
  CashTab,
  FleetTab,
  HomeTab,
  IndustryTab,
  PriceTab,
  ProfitTab,
  QualityTab,
  StrategyTab,
  TradeTab,
} from './PanofiTabs';

export type PanofiTabKey =
  | 'home'
  | 'fleet'
  | 'price'
  | 'profit'
  | 'cash'
  | 'strategy'
  | 'industry'
  | 'trade'
  | 'quality';

export const PANOFI_TABS: PillTab[] = [
  { key: 'home', label: '개관', icon: <LayoutDashboard size={15} /> },
  { key: 'fleet', label: '선단·조업', icon: <Anchor size={15} /> },
  { key: 'price', label: '어가·채널', icon: <Tag size={15} /> },
  { key: 'profit', label: '손익·원가', icon: <BadgeDollarSign size={15} /> },
  { key: 'cash', label: '자금·미수금', icon: <WalletCards size={15} /> },
  { key: 'strategy', label: '하반기 전략', icon: <Route size={15} /> },
  { key: 'industry', label: '가나 산업', icon: <Globe2 size={15} /> },
  { key: 'trade', label: '수출입', icon: <Ship size={15} /> },
  { key: 'quality', label: '데이터 품질', icon: <ShieldCheck size={15} /> },
];

const PANELS: Record<PanofiTabKey, React.ComponentType> = {
  home: HomeTab,
  fleet: FleetTab,
  price: PriceTab,
  profit: ProfitTab,
  cash: CashTab,
  strategy: StrategyTab,
  industry: IndustryTab,
  trade: TradeTab,
  quality: QualityTab,
};

/**
 * 헤드라인 KPI. 파노피는 «물량이 곧 손익»인 구조라 선단·물량을 앞에 세우고,
 * 손익분기 어가와의 격차를 바로 옆에 붙여 물량 목표의 근거를 보이게 한다.
 */
const heroKpis: { primary: HeroKpi; secondary: HeroKpi[] } = {
  primary: {
    label: '상반기 생산',
    value: h1.productionT,
    unit: '(톤)',
    decimals: 0,
  },
  secondary: [
    { label: '가동 선망선', value: headline.activeVessels, unit: '(척)', decimals: 0 },
    { label: '상반기 순손익', value: h1.netKusd / 1000, unit: '(백만 달러)', decimals: 2 },
    { label: '손익분기 어가', value: headline.bepPriceUsdPerT, unit: '(달러/톤)', decimals: 0 },
  ],
};

export default function PanofiDashboard({ heroOnly = false }: { heroOnly?: boolean } = {}) {
  const [activeTab, setActiveTab] = useState<PanofiTabKey>('home');
  const ActivePanel = PANELS[activeTab];

  return (
    <div className="cosmo-root" data-panofi-dashboard>
      <HeroZone
        variant="kpi"
        title="파노피 조업 대시보드"
        subtitle={`${company.base} · 선망 ${headline.activeVessels}척 · 주간동향 ${headline.weekCount}주 (${headline.rangeStart} ~ ${headline.rangeEnd})`}
        primaryKpi={heroKpis.primary}
        secondaryKpis={heroKpis.secondary}
        minHeight={320}
      />

      {heroOnly ? null : (
        <>
          <PillTabs
            tabs={PANOFI_TABS}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as PanofiTabKey)}
            accentFrom="var(--accent-primary)"
            className="cosmo-tabs"
            ariaLabel="파노피 조업 화면"
            tabIdPrefix="panofi-tab"
            panelIdPrefix="panofi-panel"
          />

          <section
            id={`panofi-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`panofi-tab-${activeTab}`}
            className="cosmo-panel"
            data-panofi-active-tab={activeTab}
          >
            <ActivePanel />
          </section>
        </>
      )}
    </div>
  );
}
