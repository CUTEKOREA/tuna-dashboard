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
  impact: 'S/HAR(모승현) 부산 오리엔트 조선 상가수리(6/9~6/23) 진행, 6/27 출항 예정. S/EXP M/E 수리 후 6/16 출항 예정.',
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
          situation={<>6/20 기준 SEIN PHOENIX BKK 하역 완료, BAO LUCKY BKK 하역 중, SHIN FUJI BKK 하역 중, SHIN IZU 통영 하역 중. SEIN TOPAZ TARAWA 대기 중, SEIN GALAXY·LAKE WIN FUNAFUTI 대기 중. S/HAR 부산 오리엔트 조선 상가수리 진행. S/JUP 6/18 출항 완료, SEIN KASAMA 편 M/E 수리 예정. P/DIS 파망 사고 수리 중, P/GRACE 하역 후 6/18 출항 예정.</>}
          actionPlan={<>① 하역선 관리: SEIN PHOENIX(BKK 하역 완료)·BAO LUCKY(잔량 1,415t) BKK 하역, SHIN FUJI 하역 모니터링. ② 전재 대기선 관리: SEIN TOPAZ TARAWA 대기, SEIN GALAXY(예상잔량 1,654t)·LAKE WIN FUNAFUTI 대기 모니터링. ③ S/JUP SEIN KASAMA 도착(6/20) 일정에 맞춰 M/E 부속 인수 후 6/22 MAJURO 입항 수리 일정 관리. ④ 대서양 선망: P/PATH, P/QUEEN, P/COM 등 출항 및 조업 현황 점검. P/GRACE 6/18 TEMA 출항 예정 점검.</>}
          source="해양수산본부 일일 업무보고 260618"
        />
      </div>

      {/* VDS Strategy Matrix */}
      <VdsStrategyMatrix />

      {/* PNA 수역별 입어료 배정 */}
      <PnaAccessFeeWidgets />

    </div>
  );
}
