'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import {
  BadgeDollarSign,
  Boxes,
  Factory,
  Globe2,
  History,
  Info,
  LayoutDashboard,
  ShieldCheck,
  ShoppingCart,
  WalletCards,
} from 'lucide-react';

import { latest, latestMonth, meta, n } from '@/lib/data/cosmo';
import HeroZone, { type HeroKpi } from '../v2/HeroZone';
import PillTabs, { type PillTab } from '../v2/PillTabs';
import {
  CosmoNavigationProvider,
  type CosmoNavigate,
  type CosmoTabKey,
} from './CosmoNavigation';
import './cosmo.css';

function PanelLoading() {
  return <p className="cosmo-panel-loading" role="status">코스모 화면을 불러오는 중...</p>;
}

const HomeTab = dynamic(() => import('./tabs/HomeTab'), { loading: PanelLoading });
const CashTab = dynamic(() => import('./tabs/CashTab'), { loading: PanelLoading });
const HistoryTab = dynamic(() => import('./tabs/HistoryTab'), { loading: PanelLoading });
const MarketTab = dynamic(() => import('./tabs/MarketTab'), { loading: PanelLoading });
const ProductionTab = dynamic(() => import('./tabs/ProductionTab'), { loading: PanelLoading });
const ProfitTab = dynamic(() => import('./tabs/ProfitTab'), { loading: PanelLoading });
const QualityTab = dynamic(() => import('./tabs/QualityTab'), { loading: PanelLoading });
const SalesTab = dynamic(() => import('./tabs/SalesTab'), { loading: PanelLoading });
const ShareTab = dynamic(() => import('./tabs/ShareTab'), { loading: PanelLoading });
const SupplyTab = dynamic(() => import('./tabs/SupplyTab'), { loading: PanelLoading });

export const COSMO_TABS: PillTab[] = [
  { key: 'home', label: '경영요약', icon: <LayoutDashboard size={15} /> },
  { key: 'cash', label: '자금', icon: <WalletCards size={15} /> },
  { key: 'history', label: '장기 추이', icon: <History size={15} /> },
  { key: 'market', label: '시장·바이어', icon: <Globe2 size={15} /> },
  { key: 'production', label: '생산', icon: <Factory size={15} /> },
  { key: 'profit', label: '손익·원가', icon: <BadgeDollarSign size={15} /> },
  { key: 'quality', label: '데이터 품질', icon: <ShieldCheck size={15} /> },
  { key: 'sales', label: '판매·수주', icon: <ShoppingCart size={15} /> },
  { key: 'share', label: '대시보드 소개', icon: <Info size={15} /> },
  { key: 'supply', label: '구매·재고', icon: <Boxes size={15} /> },
];

const PANELS: Record<CosmoTabKey, React.ComponentType> = {
  home: HomeTab,
  cash: CashTab,
  history: HistoryTab,
  market: MarketTab,
  production: ProductionTab,
  profit: ProfitTab,
  quality: QualityTab,
  sales: SalesTab,
  share: ShareTab,
  supply: SupplyTab,
};

const heroKpis: { primary: HeroKpi; secondary: HeroKpi[] } = {
  primary: {
    label: '주간 판매',
    value: n(latest.salesWeekUsd) / 1e6,
    unit: '(백만 달러)',
    decimals: 2,
    accent: '#22d3ee',
  },
  secondary: [
    {
      label: '누적 순손익',
      value: n(latestMonth.netYtd) / 1e6,
      unit: '(백만 달러)',
      decimals: 2,
      accent: '#fb7185',
    },
    {
      label: '통조림 누적 수율',
      value: n(latest.production?.CBU?.cumYield) * 100,
      unit: '(%)',
      decimals: 1,
      accent: '#34d399',
    },
    {
      label: '현금 잔액',
      value: n(latest.cash.endUsd) / 1e6,
      unit: '(백만 달러)',
      decimals: 2,
      accent: '#fbbf24',
    },
  ],
};

export default function CosmoDashboard() {
  const [activeTab, setActiveTab] = useState<CosmoTabKey>('home');
  const [pendingAnchor, setPendingAnchor] = useState<string>();
  const ActivePanel = PANELS[activeTab];

  const navigate: CosmoNavigate = (tab, anchor) => {
    setActiveTab(tab);
    setPendingAnchor(anchor);
  };

  useEffect(() => {
    if (!pendingAnchor) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(pendingAnchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingAnchor(undefined);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, pendingAnchor]);

  return (
    <CosmoNavigationProvider onNavigate={navigate}>
      <div className="cosmo-root" data-cosmo-dashboard>
        <HeroZone
          variant="kpi"
          title="코스모 경영 대시보드"
          subtitle={`2026년 ${latest.week}주차 운영 지표 · 손익 1~${latestMonth.month}월 · 정적 원본 ${meta.weekCount}주`}
          primaryKpi={heroKpis.primary}
          secondaryKpis={heroKpis.secondary}
          minHeight={320}
        />

        <PillTabs
          tabs={COSMO_TABS}
          activeKey={activeTab}
          onChange={(key) => navigate(key as CosmoTabKey)}
          accentFrom="#22d3ee"
          accentTo="#3b82f6"
          className="cosmo-tabs"
          ariaLabel="코스모 업무 화면"
          tabIdPrefix="cosmo-tab"
          panelIdPrefix="cosmo-panel"
        />

        <section
          id={`cosmo-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`cosmo-tab-${activeTab}`}
          className="cosmo-panel"
          data-cosmo-active-tab={activeTab}
        >
          <ActivePanel />
        </section>
      </div>
    </CosmoNavigationProvider>
  );
}
