'use client';

import React, { useState } from 'react';
import {
  Factory,
  LayoutDashboard,
  Ship,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Building2,
  TrendingUp,
} from 'lucide-react';

import { bangkokWeeklyKpi } from '@/lib/data/bangkok-weekly';
import HeroZone from '../v2/HeroZone';
import { HeroNowStrip } from '../v2/HeroNowStrip';
import PillTabs, { type PillTab } from '../v2/PillTabs';
import '../cosmo/cosmo.css';
import '../panofi/panofi.css';
import { HomeTab } from './tabs/HomeTab';
import { PriceTab } from './tabs/PriceTab';
import { UnloadTab } from './tabs/UnloadTab';
import { CanneryTab } from './tabs/CanneryTab';
import { ClaimsTab } from './tabs/ClaimsTab';
import { LeadingTab } from './tabs/LeadingTab';
import { ProcessorsTab } from './tabs/ProcessorsTab';
import { QualityTab } from './tabs/QualityTab';

export type BangkokTabKey =
  | 'home'
  | 'price'
  | 'unload'
  | 'cannery'
  | 'claims'
  | 'leading'
  | 'processors'
  | 'quality';

export const BANGKOK_TABS: PillTab[] = [
  { key: 'home', label: '개관', icon: <LayoutDashboard size={15} /> },
  { key: 'price', label: '원어 시세', icon: <Tag size={15} /> },
  { key: 'unload', label: '하역·트레이더', icon: <Ship size={15} /> },
  { key: 'cannery', label: '캐너리·재고', icon: <Factory size={15} /> },
  { key: 'claims', label: '품질 클레임', icon: <ShieldAlert size={15} /> },
  { key: 'leading', label: '선행지표', icon: <TrendingUp size={15} /> },
  { key: 'processors', label: '가공사 조사', icon: <Building2 size={15} /> },
  { key: 'quality', label: '데이터 품질', icon: <ShieldCheck size={15} /> },
];

const PANELS: Record<BangkokTabKey, React.ComponentType> = {
  home: HomeTab,
  price: PriceTab,
  unload: UnloadTab,
  cannery: CanneryTab,
  claims: ClaimsTab,
  leading: LeadingTab,
  processors: ProcessorsTab,
  quality: QualityTab,
};

/**
 * 방콕사무소 주간보고 네이티브 대시보드 — iframe 표시본을 파노피와 같은
 * PillTabs 구조로 대체한다. 데이터는 lib/data/bangkok-weekly 인테이크 단일 통로.
 */
export default function BangkokDashboard({ heroOnly = false }: { heroOnly?: boolean } = {}) {
  const [activeTab, setActiveTab] = useState<BangkokTabKey>('home');
  const ActivePanel = PANELS[activeTab];

  // data-cosmo-dashboard 는 장식이 아니다 — Chart.readTokens() 가 이 속성으로
  // --cosmo-* 색 토큰 루트를 찾는다 (파노피와 동일 팔레트 공유).
  return (
    <div className="cosmo-root panofi-root" data-cosmo-dashboard data-bangkok-dashboard>
      <HeroZone
        variant="kpi"
        title="방콕사무소"
        subtitle={`분석 기간 ${bangkokWeeklyKpi.period} · 고유 ${bangkokWeeklyKpi.weeks}주`}
        primaryKpi={{
          label: '최신 시세',
          value: bangkokWeeklyKpi.latestPrice,
          unit: '($/MT)',
        }}
        secondaryKpis={[
          { label: '방콕 재고', value: bangkokWeeklyKpi.stockMt, unit: '(MT)' },
          { label: '2026 누적 하역', value: bangkokWeeklyKpi.cumUnloadMt, unit: '(MT)' },
          { label: '가공가능일수', value: bangkokWeeklyKpi.processDays, unit: '(일)' },
          { label: '하이솔트 확정액', value: bangkokWeeklyKpi.highSaltUsd, unit: '(USD)' },
        ]}
        minHeight={360}
        strip={(
          <HeroNowStrip
            items={[
              {
                now: true,
                eyebrow: '최신',
                title: '방콕 시세',
                body: `${bangkokWeeklyKpi.latestPrice.toLocaleString('ko-KR')} ($/MT)`,
              },
              {
                eyebrow: '재고',
                title: '방콕 재고',
                body: `${bangkokWeeklyKpi.stockMt.toLocaleString('ko-KR')} (MT)`,
              },
              {
                eyebrow: '누적',
                title: '2026 하역',
                body: `${bangkokWeeklyKpi.cumUnloadMt.toLocaleString('ko-KR')} (MT)`,
              },
            ]}
          />
        )}
      />

      {heroOnly ? null : (
        <>
          <PillTabs
            tabs={BANGKOK_TABS}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as BangkokTabKey)}
            accentFrom="var(--accent-primary)"
            className="cosmo-tabs"
            ariaLabel="방콕사무소 주간보고 화면"
            tabIdPrefix="bangkok-tab"
            panelIdPrefix="bangkok-panel"
          />

          <section
            id={`bangkok-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`bangkok-tab-${activeTab}`}
            className="cosmo-panel"
            data-bangkok-active-tab={activeTab}
          >
            <ActivePanel />
          </section>
        </>
      )}
    </div>
  );
}
