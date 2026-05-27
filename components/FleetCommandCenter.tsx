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
          situation={<>5/26 기준 SEIN PHOENIX BKK 하역 중. 금일 224.690t(UC, S/SPR #4-A,#4-B) 하역, 누계 587.670t / 잔 6,367.330t. 제품 온도 -24.0~-26.0℃ 양호. 명일(5/27) 약 245t 예정. S/HAR 통영 입항 완료(상가수리 6/7~6/21). S/EXP TARAWA 입항, M/E 수리 후 6/7 출항. P/MAS TEMA 입항, 하역 후 5/27 출항.</>}
          actionPlan={<>① SEIN PHOENIX 하역 진행 중(587.670t/6,955t, 진척 8.5%) — 일 평균 약 196t 하역 속도로 약 32일 소요 예상. ② BAO LUCKY BKK 하역 대기 중(4,803t) — PHOENIX 하역 완료 후 즉시 투입 조율. ③ SHIN FUJI TARAWA 전재 중(3,096t) — N/STAR 900t, S/PIO 1,250t 전재 예정. ④ SHIN IZU 6/1 통영 하역(2,301t, 함정 161t 포함) — 통관 및 냉동창고 확보. ⑤ GENTA MARU P-501 하역 중, 5/29 SY-52 97t 예정.</>}
          source="해양수산본부 일일 업무보고 260526 (화) + SEIN PHOENIX 하역보고 5/26"
        />
      </div>
    </div>
  );
}
