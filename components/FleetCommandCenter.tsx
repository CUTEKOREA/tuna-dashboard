'use client';
import React from 'react';
import FleetHeroKPI from './FleetHeroKPI';
import FleetRosterGrid from './FleetRosterGrid';
import { FleetChartSection, FleetDetailPanel } from './FleetAnalysisPanels';
import FleetPixelMap from './FleetPixelMap';
import VdsStrategyMatrix from './VdsStrategyMatrix';
import PnaAccessFeeWidgets from './PnaAccessFeeWidgets';
import TakeawayBox from './TakeawayBox';
import s from './FleetCommandCenter.module.css';

const climateRisk = {
  sstAnomaly: '+1.2℃',
  impact: 'SEIN TOPAZ 7/24 GENSAN 하역 중. HIKARI 1 8/5 GENSAN 도착 예정. S/JUP MAJURO M/E 수리 중(출항 일정 기술자 확인). SY-55 상가수리(7/22~8/4) 진행 중.',
  riskLevel: 'MODERATE',
};

export default function FleetCommandCenter() {
  return (
    <div className={s.wrapper}>
      {/* Zone 1: Hero KPIs */}
      <FleetHeroKPI climateRisk={climateRisk} />

      {/* Zone 2: Fleet Mini-map */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2em' }}>🗺️</span> 선대 운영 미니맵 (Fleet Mini-map)
        </h3>
        <FleetPixelMap />
      </div>

      {/* Zone 3: Charts + Rankings */}
      <FleetChartSection />

      {/* Zone 4: Fleet Roster Grid */}
      <FleetRosterGrid />

      {/* Zone 5: Expandable Detail */}
      <FleetDetailPanel />

      {/* Final Takeaway */}
      <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 'var(--card-radius)', padding: 24 }}>
        <TakeawayBox
          situation={<>7/23 기준 SEIN TOPAZ 7/24 GENSAN 잔량 하역 중. SEIN VENUS 8/6 BKK 도착 예정. HIKARI 1 8/5 GENSAN 도착 예정(전재 물량 3,214t). SEIN KASAMA X-MAS 대기, SHIN IZU N04 W169 대기, SEIN GALAXY RABAUL 대기 중(타사 물량 전재). S/JUP 6/22 MAJURO 입항(M/E 수리 중, 출항 일정 기술자 확인). SY-55 7/19 부산 입항, 하역 및 상가수리(7/22~8/4) 후 8/8 출항 예정. TAIHO MARU 8/11경 부산 입항 예정(338.699t).</>}
          actionPlan={<>① 운반선 관리: SEIN TOPAZ GENSAN 하역 완료 확인 및 후속 일정 조율, SEIN VENUS(8/6 BKK) 및 HIKARI 1(8/5 GENSAN) 도착 일정 모니터링, 대기선박(SEIN KASAMA, SHIN IZU, SEIN GALAXY) 스케줄 관리. ② 태평양 선망: MOAMARI 및 MOAKONA 조업 활동 복귀 모니터링, S/JUP M/E 수리 진행 상황 및 출항 일정 점검. ③ 연승선 운영: SY-55 상가수리(7/22~8/4) 진행 확인, TAIHO MARU(8/11경 입항) 입항 준비. ④ 대서양 선망: P/DIS(110t) 및 P/COM(130t) 고어획 조업 지속 모니터링.</>}
          source="해양수산본부 일일 업무보고 260724"
        />
      </div>

      {/* VDS Strategy Matrix */}
      <VdsStrategyMatrix />

      {/* PNA 수역별 입어료 배정 */}
      <PnaAccessFeeWidgets />

    </div>
  );
}
