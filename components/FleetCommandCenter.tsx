'use client';

import React, { useState } from 'react';
import { AlertTriangle, CalendarClock, Ship, TrendingUp } from 'lucide-react';
import FleetHeroKPI from './FleetHeroKPI';
import FleetRosterGrid from './FleetRosterGrid';
import { FleetChartSection, FleetDetailPanel } from './FleetAnalysisPanels';
import FleetPixelMap from './FleetPixelMap';
import VdsStrategyMatrix from './VdsStrategyMatrix';
import PnaAccessFeeWidgets from './PnaAccessFeeWidgets';
import VesselVdsStatus from './VesselVdsStatus';
import { carrierLoads, nationalVds, purseSeineCatch } from '@/lib/fleet-operations-2026-08-09';
import HeroZone from './v2/HeroZone';
import PillTabs from './v2/PillTabs';
import VesselTopSVG from './v2/VesselTopSVG';
import s from './FleetCommandCenter.module.css';

type FleetTaskTab = 'operations' | 'vessels' | 'performance' | 'access';

const taskTabs = [
  { id: 'operations', label: '오늘의 운영' },
  { id: 'vessels', label: '선박·수역' },
  { id: 'performance', label: '실적 분석' },
  { id: 'access', label: 'VDS·입어료' },
] as const;

const nationalOverrunCount = nationalVds.areas.flatMap((area) => area.rows).filter((row) => row.remaining < 0).length;
const jointWeeklyShare = Math.round(purseSeineCatch.summary.jointWeekly / purseSeineCatch.summary.weeklyTotal * 100);
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const carrierFillRatio = clamp(
  carrierLoads.loadedTotalMt / (carrierLoads.loadedTotalMt + carrierLoads.expectedRemainingMt),
  0,
  1,
);
const seinerHatches = Array.from({ length: 6 }, (_, hatchIndex) => ({
  id: `seiner-hatch-${hatchIndex + 1}`,
  intensity: clamp(carrierFillRatio * 6 - hatchIndex, 0, 1),
}));
// 선체는 우측 상단에 치우쳐 배치 — KPI 행(좌하단)과 겹치지 않게 (Raktor 구도)
const heroBackground = (
  <div className={s.heroVessel} aria-hidden>
    <VesselTopSVG kind="seiner" hatches={seinerHatches} />
  </div>
);

const decisions = [
  { icon: TrendingUp, level: '생산', title: `합작선 주간 비중 ${jointWeeklyShare}%`, detail: `${purseSeineCatch.summary.jointWeekly} M/T · KONA 183, MARI 140 M/T 견인`, tone: 'primary' },
  { icon: AlertTriangle, level: 'VDS', title: `국적선 음수 잔여 ${nationalOverrunCount}건`, detail: '키리바시·투발루·나우루 등 수역별 추가권리 확인', tone: 'danger' },
  { icon: Ship, level: '전재', title: `운반선 선적 ${carrierLoads.loadedTotalMt.toLocaleString()} M/T`, detail: `예상잔량 ${carrierLoads.expectedRemainingMt.toLocaleString()} M/T · 방콕/X-MAS/RABAUL 관리`, tone: 'warning' },
  { icon: CalendarClock, level: '대서양', title: '8월 11일 일간 220 M/T', detail: 'P/MAS 120 · P/PATH 60 · P/DIS 40 M/T', tone: 'primary' },
] as const;

export default function FleetCommandCenter() {
  const [activeTab, setActiveTab] = useState<FleetTaskTab>('operations');

  return (
    <div className={s.wrapper}>
      <HeroZone
        className={s.fleetHero}
        variant="vessel"
        title="선단 운영"
        subtitle="주간 어획·VDS는 8월 9일, 대서양은 8월 11일, 운반선은 8월 12일 기준"
        background={heroBackground}
        primaryKpi={{ label: '주간 어획량', value: purseSeineCatch.summary.weeklyTotal, unit: '(M/T)' }}
        secondaryKpis={[
          { label: '8월 누적 어획량', value: purseSeineCatch.summary.monthlyTotal, unit: '(M/T)' },
          { label: '연간 누적 어획량', value: purseSeineCatch.summary.annualTotal, unit: '(M/T)' },
          { label: '운반선 선적량', value: carrierLoads.loadedTotalMt, unit: '(M/T)', decimals: 1, accent: '#f59e0b' },
        ]}
        strip={(
          <div className={s.missionStrip}>
            {decisions.map(({ icon: Icon, level, title, detail, tone }) => (
              <article key={title} className={`${s.missionCard} ${s[`decision_${tone}`]}`}>
                <Icon size={18} aria-hidden="true" />
                <div><span className={s.decisionLevel}>{level}</span><strong>{title}</strong><p>{detail}</p></div>
              </article>
            ))}
          </div>
        )}
      />
      <PillTabs
        className={s.taskTabs}
        tabs={taskTabs.map((tab) => ({ key: tab.id, label: tab.label }))}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as FleetTaskTab)}
        ariaLabel="선단 업무 보기"
        tabIdPrefix="fleet-tab"
        panelIdPrefix="fleet-panel"
      />

      <section id="fleet-panel-operations" role="tabpanel" aria-labelledby="fleet-tab-operations" className={s.tabPanel} hidden={activeTab !== 'operations'}>
          {/* P1 재구성 때 유실됐던 일간 KPI 패널 복원 — 히어로(주간)와 모드가 달라 중복 아님 */}
          <FleetHeroKPI mode="daily" />
          <details className={s.reportDetails}>
            <summary>업무보고 원문 펼치기</summary>
            <p>주간 어획과 VDS는 8월 9일, 대서양 위치·어획은 8월 11일, 운반선은 8월 12일 기준입니다. 모집단과 기준일이 달라 단일 합계로 합산하지 않습니다.</p>
          </details>
      </section>

      <section id="fleet-panel-vessels" role="tabpanel" aria-labelledby="fleet-tab-vessels" className={s.tabPanel} hidden={activeTab !== 'vessels'}>
          <div className={s.sectionHeading}><div><span className={s.eyebrow}>선박·수역</span><h3>예외 선박과 수역별 배치</h3></div><span>지도는 보고 좌표의 개략 위치입니다</span></div>
          <FleetPixelMap />
          <FleetRosterGrid />
      </section>

      <section id="fleet-panel-performance" role="tabpanel" aria-labelledby="fleet-tab-performance" className={s.tabPanel} hidden={activeTab !== 'performance'}>
          <FleetHeroKPI mode="weekly" />
          <FleetChartSection />
          <FleetDetailPanel />
      </section>

      <section id="fleet-panel-access" role="tabpanel" aria-labelledby="fleet-tab-access" className={s.tabPanel} hidden={activeTab !== 'access'}>
          <div className={s.accessAlert}><AlertTriangle size={18} aria-hidden="true" /><div><strong>국적선과 키리바시 선박을 분리 집계</strong><p>국적선 6척과 키리바시 선박 4척은 별도 모집단입니다. 음수 잔여는 원문을 그대로 표시했습니다.</p></div></div>
          <VesselVdsStatus />
          <VdsStrategyMatrix />
          <PnaAccessFeeWidgets />
      </section>
    </div>
  );
}
