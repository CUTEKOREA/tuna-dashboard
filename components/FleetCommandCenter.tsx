'use client';
import React from 'react';
import FleetHeroKPI from './FleetHeroKPI';
import FleetRosterGrid from './FleetRosterGrid';
import { FleetChartSection, FleetDetailPanel } from './FleetAnalysisPanels';
import VdsStrategyMatrix from './VdsStrategyMatrix';
import PnaAccessFeeWidgets from './PnaAccessFeeWidgets';
import TakeawayBox from './TakeawayBox';
import s from './FleetCommandCenter.module.css';

const climateRisk = {
  sstAnomaly: '+1.2℃',
  impact: 'S/HAR(모승현) 부산 오리엔트 조선 상가수리(6/9~6/23) 진행, 6/27 출항 예정. S/EXP M/E 수리 후 6/16 출항 예정.',
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
          situation={<>6/16 기준 SEIN PHOENIX·BAO LUCKY BKK 하역 중, SHIN IZU 통영 하역 중. SEIN TOPAZ TARAWA 전재 중(S/CHA 990t 진행, S/JUP 980t 예정), LAKE WIN FUNAFUTI 전재 중. S/HAR 부산 오리엔트 조선 상가수리(6/9~6/23) 진행, 6/27 출항 예정. S/EXP 어기교대 완료, M/E 수리 후 6/16 출항 예정. P/DIS 6/10 그물 파망 사고로 6/12 ABIDJAN 입항 예정.</>}
          actionPlan={<>① 하역선 관리: SEIN PHOENIX(6/16 하역누계 6,125t, 잔량 830t)·BAO LUCKY(6/16 하역누계 2,994t, 잔량 1,808t) BKK 하역, SHIN IZU 통영 하역 모니터링. ② SHIN FUJI 6/14 BKK 도착 예정. ③ SEIN TOPAZ TARAWA 전재: S/CHA 990t 전재 후 6/11 출항, S/JUP 6/13 TARAWA 입항·980t 전재 예정. ④ SEIN GALAXY 6/11 FUNAFUTI 도착 예정 — MOAKONA 1,106t 전재(6/13 출항)·MOAMARI 6/13 입항(890t 전재) 일정 관리. ⑤ 대서양 선망: P/PATH(6/7 입항, 6/10 출항), P/QUEEN(6/10 입항, 6/12 출항), P/COM(6/11 입항, 6/13 출항) TEMA 하역 및 교대 점검. ⑥ P/DIS 그물 파망(6/10) — 6/12 ABIDJAN 입항 수리, P/GRACE 6/13 ABIDJAN 입항·그물 교체 후 6/16 출항 점검.</>}
          source="해양수산본부 일일 업무보고 260616"
        />
      </div>

      {/* VDS Strategy Matrix */}
      <VdsStrategyMatrix />

      {/* PNA 수역별 입어료 배정 */}
      <PnaAccessFeeWidgets />

    </div>
  );
}
