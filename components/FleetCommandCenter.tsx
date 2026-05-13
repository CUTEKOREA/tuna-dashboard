'use client';
import React from 'react';
import FleetHeroKPI from './FleetHeroKPI';
import FleetRosterGrid from './FleetRosterGrid';
import { FleetChartSection, FleetDetailPanel } from './FleetAnalysisPanels';
import TakeawayBox from './TakeawayBox';
import s from './FleetCommandCenter.module.css';

const climateRisk = {
  sstAnomaly: '+1.2℃',
  impact: 'S/HAR(모승현) 5/11 현장발 — 5/27경 한국 도착 예정. SY-56 상가수리(5/14~5/27) 후 6/1 출항',
  riskLevel: 'MODERATE',
};

export default function FleetCommandCenter() {
  return (
    <div className={s.wrapper}>
      {/* Zone 1: Hero KPIs */}
      <FleetHeroKPI climateRisk={climateRisk} />

      {/* Zone 3: Charts + Rankings */}
      <FleetChartSection />

      {/* Zone 4: Fleet Roster Grid */}
      <FleetRosterGrid />

      {/* Zone 5: Expandable Detail */}
      <FleetDetailPanel />

      {/* Final Takeaway */}
      <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 'var(--card-radius)', padding: 24 }}>
        <TakeawayBox
          situation={<>5/12 기준 태평양 일간 135t(월간 3,802t / 연간 29,631.5t), 대서양 일간 200t(월간 2,250t / 연간 11,905t). S/HAR(모승현) 5/11 현장발로 귀국 중(5/27 도착 예정, 1,200t 선적). DINOK BKK 하역 중, SEIN PHOENIX BKK 하역 대기. GENTA MARU 3척분 하역 스케줄(5/22~5/29) 확정.</>}
          actionPlan={<>① S/PIO(940t)·N/SUN(767t)·N/STAR(745t) 선적량 증가 — 운반선 배정 시점 선제 검토. ② BAO LUCKY 5/22 BKK 도착 + DINOK·PHOENIX 동시 하역 → 체선료 리스크 모니터링. ③ SHIN IZU 5/17 한국 도착(2,301t, 161t 함정 물량 포함) — 통관 및 냉동창고 사전 확보. ④ SY-56 상가수리 6/1 완료 후 즉시 출항 일정 확인.</>}
          source="해양수산본부 일일 업무보고 260513 (수)"
        />
      </div>
    </div>
  );
}
