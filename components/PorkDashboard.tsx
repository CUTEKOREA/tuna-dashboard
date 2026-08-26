'use client';
import React, { useState } from 'react';
import { W1_ASFCycle, W2_FeedMargin, W3_TradeSpread, W4_ESG, W5_Top10, W6_Trend, W7_KoreaSupply, W8_ImportPartners, W9_ASFSeafood, W10_Portfolio, W11_SelfSufficiency } from './PorkWidgets';
import PorkUsdaWidgets from './PorkUsdaWidgets';
import { InsightPorkSupplyChain, InsightAsfChinaFactor, InsightHogCornRatio } from './PorkEmpiricalInsights';
import { TelemetryBadge } from './TelemetryBadge';
import { asfCycleData, productionTrendData, selfSufficiencyData } from './porkData';
import HeroZone, { type HeroKpi } from './v2/HeroZone';
import PillTabs from './v2/PillTabs';
import styles from './PorkDashboard.module.css';

const KPIS = [
  { title: '중국 돈육 생산량 (2024)', value: '57,948천톤', trend: '📊', desc: '전년비 -1.5% 감소 · 글로벌 1위', telemetry: 'synced', syncDate: 'FAOSTAT' },
  { title: '한국 1인당 소비량', value: '41.4kg', trend: '📈', desc: '10년간 +34% 폭증', telemetry: 'synced', syncDate: 'FBS 22Y' },
  { title: '한국 총 수입량 (2024)', value: '594천톤', trend: '🚢', desc: '$22.1억 · 미국+스페인 양강', telemetry: 'synced', syncDate: 'Comtrade 24Y' },
  { title: 'ASF 최대 충격폭', value: '-20.9%', trend: '⚠️', desc: '2019 중국 생산량 급감', telemetry: 'synced', syncDate: 'QCL' },
  { title: '돈육 탄소 배출', value: '12.3kg', trend: '🌱', desc: 'CO2e/kg - 수산물 대비 6배', telemetry: 'synced', syncDate: 'FAO' },
  { title: '한국 돈육 자급률', value: '66%', trend: '🎯', desc: '34% 구조적 수입 의존', telemetry: 'synced', syncDate: 'PSD' },
] as const;

// 5-Pillar 네비게이터 메타 (돼지 시그니처 — pink/rose 톤)
const PILLARS = [
  { id: 'P1', num: '❶', label: '원료 수급', title: '🐷 Pillar I - 원료 수급', desc: '글로벌 생산량 모니터링 및 ASF 질병 헤징 전략', color: '#f43f5e', widgets: ['W1', 'W5', 'W6', 'W9'] },
  { id: 'P2', num: '❷', label: '가공·생산', title: '🏭 Pillar II - 가공 및 생산', desc: '사료가 연동 마진 관리 및 단백질 포트폴리오 최적화', color: '#ec4899', widgets: ['W2', 'W10'] },
  { id: 'P3', num: '❸', label: '물류·통관', title: '🚢 Pillar III - 물류 및 통관', desc: '대륙간 무역 단가 스프레드 및 수입 파트너 다변화', color: '#8b5cf6', widgets: ['W3', 'W8'] },
  { id: 'P4', num: '❹', label: '판매·수요', title: '📈 Pillar IV - 판매 및 수요', desc: '한국 수급 구조 분석 및 자급률 갭 공략', color: '#f97316', widgets: ['W7', 'W11'] },
  { id: 'P5', num: '❺', label: 'ESG·지속가능성', title: '🌱 Pillar V - ESG 및 지속가능성', desc: '탄소 배출 비교 및 그린 프리미엄 전략', color: '#10b981', widgets: ['W4'] },
] as const;

type PorkPillarId = (typeof PILLARS)[number]['id'];

const PORK_PILL_TABS = PILLARS.map((pillar) => ({
  key: pillar.id,
  label: pillar.label,
}));

const latestChinaProduction = asfCycleData[asfCycleData.length - 1];
const latestProductionTrend = productionTrendData[productionTrendData.length - 1];
const porkSelfSufficiency = selfSufficiencyData.find((item) => item.protein === '돼지고기');

const PORK_SECONDARY_KPIS: HeroKpi[] = [
  {
    label: '한국 돈육 생산량',
    value: latestProductionTrend.한국,
    unit: '(천 MT)',
  },
  ...(porkSelfSufficiency ? [{
    label: '한국 돈육 자급률',
    value: porkSelfSufficiency.selfRate,
    unit: '(%)',
  }] : []),
];

export function PorkHero() {
  return (
    <HeroZone
      variant="kpi"
      title="돼지고기"
      subtitle={`데이터 기준일 ${latestChinaProduction.year}년`}
      primaryKpi={{
        label: '중국 돈육 생산량',
        value: latestChinaProduction.production,
        unit: '(천 MT)',
      }}
      secondaryKpis={PORK_SECONDARY_KPIS}
    />
  );
}

const WIDGET_MAP: Record<string, React.FC<any>> = {
  W1: W1_ASFCycle, W2: W2_FeedMargin, W3: W3_TradeSpread, W4: W4_ESG,
  W5: W5_Top10, W6: W6_Trend, W7: W7_KoreaSupply, W8: W8_ImportPartners,
  W9: W9_ASFSeafood, W10: W10_Portfolio, W11: W11_SelfSufficiency,
};

export default function PorkDashboard({ heroOnly = false }: { heroOnly?: boolean }) {
  const [activePart, setActivePart] = useState<PorkPillarId>('P1');
  const porkHero = (
    <div className={styles.hero}>
      <PorkHero />
    </div>
  );

  if (heroOnly) {
    return (
      <div className={`${styles.dashboard} ${styles.heroOnly}`}>
        {porkHero}
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {porkHero}

      {/* ═══ KPIs ═══ */}
      <div data-mobile-stack className={styles.kpiGrid}>
        {KPIS.map((kpi, idx) => (
          <div key={idx} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>{kpi.title}</span>
              <TelemetryBadge status={kpi.telemetry} syncDate={kpi.syncDate} />
            </div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={styles.kpiTrend}>
              <span className={styles.trendMark}>{kpi.trend}</span>{kpi.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ 5-Pillar 밸류체인 네비게이터 ═══ */}
      <div className={styles.tabs}>
        <PillTabs
          tabs={PORK_PILL_TABS}
          activeKey={activePart}
          onChange={(key) => setActivePart(key as PorkPillarId)}
          accentFrom="var(--accent-primary)"
          ariaLabel="돼지고기 밸류체인 보기"
          tabIdPrefix="pork-tab"
          panelIdPrefix="pork-panel"
        />
      </div>

      {/* ═══ 5-PILLAR ARCHITECTURE (activePart 필터링) ═══ */}
      {PILLARS.filter(s => s.id === activePart).map((sec) => (
        <div
          key={sec.id}
          id={`pork-panel-${sec.id}`}
          role="tabpanel"
          aria-labelledby={`pork-tab-${sec.id}`}
          className={styles.section}
        >
          <div className={styles.sectionHeader}>
            <div className={styles.sectionAccent} />
            <div>
              <h2 className={styles.sectionTitle}>{sec.title}</h2>
              <p className={styles.sectionDesc}>{sec.desc}</p>
            </div>
          </div>
          <div data-mobile-stack className={styles.widgetGrid}>
            {sec.widgets.map((wId) => {
              const Comp = WIDGET_MAP[wId];
              if (!Comp) return null;
              return <Comp key={wId} accent={sec.color} />;
            })}
            {/* 🆕 USDA FAS GAIN + ESR — 중국·스페인·ASF·한국 시계열·Top10 */}
            {sec.id === 'P1' && <PorkUsdaWidgets filterPillar="S1" />}
            {sec.id === 'P3' && <PorkUsdaWidgets filterPillar="S3" />}
            {sec.id === 'P4' && <PorkUsdaWidgets filterPillar="S4" />}
            {/* 🆕 실증 인사이트 (Empirical Insights) */}
            {sec.id === 'P1' && <InsightAsfChinaFactor accent={sec.color} />}
            {sec.id === 'P2' && <InsightHogCornRatio accent={sec.color} />}
            {sec.id === 'P3' && <InsightPorkSupplyChain accent={sec.color} />}
          </div>
        </div>
      ))}
    </div>
  );
}
