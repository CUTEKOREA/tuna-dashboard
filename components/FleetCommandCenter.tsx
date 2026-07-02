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
  impact: 'S/HAR 부산 조선 상가수리 후 6/28 출항 예정. N/STAR 선장 교대 후 6/25 출항 예정. S/JUP MAJURO M/E 수리 대기 중.',
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
          situation={<>6/24 기준 BAO LUCKY BKK 하역 완료, SHIN FUJI BKK 하역 중, LAKE WIN 통영 도착 예정(7/11). SEIN TOPAZ NINGBO 도착 예정(7/1). SEIN VENUS X-MAS 전재 중. SEIN GALAXY FUNAFUTI 대기, HIKARI 1 X-MAS 대기. S/HAR 부산 오리엔트 조선 상가수리 후 6/28 출항 예정. S/JUP 6/22 MAJURO 입항, M/E 수리 예정. P/DIS 6/23 ABIDJAN 출항 완료.</>}
          actionPlan={<>① 하역선 관리: BAO LUCKY 하역 완료 후 일정 확인, SHIN FUJI(잔량 3,096t) BKK 하역 모니터링, SEIN TOPAZ(NINGBO) 및 LAKE WIN(통영) 입항 일정 관리. ② 전재 대기선 관리: SEIN VENUS X-MAS 전재(N/SUN, N/STAR 물량) 및 SEIN GALAXY(FUNAFUTI), HIKARI 1(X-MAS) 대기 모니터링. ③ 태평양 수리/교대: S/HAR 6/28 출항, S/JUP M/E 기술자 일정 확인, N/STAR 선장 교대(김태엽→조태연) 후 6/25 출항 점검. ④ 대서양 선망: P/DIS 출항 완료 후 조업 복귀, 기타 선박 조업 모니터링.</>}
          source="해양수산본부 일일 업무보고 260624"
        />
      </div>

      {/* VDS Strategy Matrix */}
      <VdsStrategyMatrix />

      {/* PNA 수역별 입어료 배정 */}
      <PnaAccessFeeWidgets />

    </div>
  );
}
