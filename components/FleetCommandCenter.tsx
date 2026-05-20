'use client';
import React from 'react';
import FleetHeroKPI from './FleetHeroKPI';
import FleetRosterGrid from './FleetRosterGrid';
import { FleetChartSection, FleetDetailPanel } from './FleetAnalysisPanels';
import TakeawayBox from './TakeawayBox';
import s from './FleetCommandCenter.module.css';

const climateRisk = {
  sstAnomaly: '+1.2℃',
  impact: 'S/HAR(모승현) 5/11 현장발 — 5/26 09:00 통영 입항 예정. SY-56 상가수리(5/14~5/27) 후 6/1 출항',
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
          situation={<>5/19 기준 태평양 일간 30t(월간 5,095t / 연간 30,924.5t), 대서양 일간 155t(월간 3,430t / 연간 13,085t). S/HAR(모승현) 5/11 현장발로 귀국 중(5/26 09:00 통영 입항 예정, 1,200t 선적). DINOK BKK 하역 완료, SEIN PHOENIX BKK 하역 대기 중, SHIN IZU 마산 하역 중, BAO LUCKY 5/22 BKK 도착 예정.</>}
          actionPlan={<>① S/PIO(1,035t)·MOAMARI(950t)·N/STAR(900t) 선적량 증가 — 운반선 배정 시점 선제 검토. ② BAO LUCKY 5/22 BKK 도착 + DINOK 하역 완료 및 PHOENIX 하역 대기 → 체선료 리스크 모니터링. ③ SHIN IZU 마산 하역 중(2,301t, 161t 함정 물량 포함) — 통관 및 냉동창고 사전 확보. ④ SY-56 상가수리 6/1 완료 후 즉시 출항 일정 확인. ⑤ MOAMARI 5/21 Tarawa 입항 후 Shin Fuji 편 950t 전재 예정.</>}
          source="해양수산본부 일일 업무보고 260520 (수)"
        />
      </div>
    </div>
  );
}
