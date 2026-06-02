'use client';
import React from 'react';
import FleetHeroKPI from './FleetHeroKPI';
import FleetRosterGrid from './FleetRosterGrid';
import { FleetChartSection, FleetDetailPanel } from './FleetAnalysisPanels';
import VdsStrategyMatrix from './VdsStrategyMatrix';
import TakeawayBox from './TakeawayBox';
import s from './FleetCommandCenter.module.css';

const climateRisk = {
  sstAnomaly: '+1.2℃',
  impact: 'S/HAR(모승현) 통영 입항 및 상가수리(6/7~6/21) 예정. SY-56 상가수리 후 6/2 11:00 출항',
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
          situation={<>6/2 기준 SEIN PHOENIX, BAO LUCKY BKK 하역 중. S/HAR 부산 접안 및 상가수리(6/7~6/21) 예정. S/EXP TARAWA 어기교대 및 전재 완료(6/7 출항). P/DIS, P/FORE TEMA 입항 및 하역 진행 후 6/2~3 출항 예정. SY-56 상가수리 후 6/2 11:00 출항 예정.</>}
          actionPlan={<>① SEIN PHOENIX, BAO LUCKY 하역 진행 중 — 지속 모니터링. ② SHIN FUJI 6/14 BKK 도착 예정. ③ SHIN IZU 통영 하역 대기 중(우천/휴일) — 6/4 하역 재개 예정. ④ SEIN TOPAZ TARAWA 대기 중(S/SPR 전재 예정). ⑤ SEIN GALAXY 6/8 TARAWA 인근 도착 예정. ⑥ P-505 발전기 수리 및 5/31 타히티 출항 완료.</>}
          source="해양수산본부 일일 업무보고 260602 (화)"
        />
      </div>

      {/* VDS Strategy Matrix */}
      <VdsStrategyMatrix />

    </div>
  );
}
