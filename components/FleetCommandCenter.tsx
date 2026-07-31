'use client';
import React, { useState } from 'react';
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
  impact: 'S/CHA 7/28 X-MAS 입항, MING RUN 17편 약 900t 전재 후 7/31 12:15 출항 완료. S/JUP MAJURO M/E 수리 중(출항 일정 기술자 확인). SY-55 상가수리(7/22~8/4) 진행 중. SEIN KASAMA·SHIN IZU·SEIN GALAXY 대기 중.',
  riskLevel: 'MODERATE',
};

export default function FleetCommandCenter() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  return (
    <div className={s.wrapper}>
      {/* Top Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('daily')}
          style={{
            padding: '8px 16px',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: activeTab === 'daily' ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'daily' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            background: 'none',
            border: 'none',
            borderBottomWidth: '2px',
            borderBottomStyle: 'solid',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          일일 현황
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          style={{
            padding: '8px 16px',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: activeTab === 'weekly' ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'weekly' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            background: 'none',
            border: 'none',
            borderBottomWidth: '2px',
            borderBottomStyle: 'solid',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          주간/월간 실적
        </button>
      </div>

      {activeTab === 'daily' && (
        <>
          {/* Daily Hero KPIs */}
          <FleetHeroKPI mode="daily" climateRisk={climateRisk} />

          {/* Daily Takeaway (Moved to top) */}
          <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 'var(--card-radius)', padding: 24, marginBottom: 24 }}>
            <TakeawayBox
              situation={<>7/30 기준 S/CHA 7/28 X-MAS 입항, MING RUN 17편 약 900t 전재 후 7/31 12:15 출항 완료. SEIN VENUS 8/5 BKK 도착 예정(3,275t). HIKARI 1 8/5 GENSAN 도착 예정(3,214t). SEIN KASAMA X-MAS 대기, SHIN IZU NO2 W165 대기, SEIN GALAXY RABAUL 대기 중(타사 출항 전재 예정). S/JUP 6/22 MAJURO 입항(M/E 수리 중, 출항 일정 기술자 확인). SY-55 7/19 부산 입항, 하역 및 상가수리(7/22~8/4) 후 8/8 출항 예정. TAIHO MARU 8/11경 부산 입항 예정(338.699t).</>}
              actionPlan={<>① 운반선 관리: MING RUN 17 X-MAS C-900 전재 완료 확인, SEIN VENUS(8/5 BKK) 및 HIKARI 1(8/5 GENSAN) 도착 일정 모니터링, 대기선박(SEIN KASAMA, SHIN IZU, SEIN GALAXY) 스케줄 관리. ② 태평양 선망: 일간 268t — S/EXP(30t)·S/HAR(65t)·N/STAR(110t) 조업세 호조, S/JUP M/E 수리 진행 상황 및 출항 일정 점검. ③ 연승선 운영: SY-55 상가수리(7/22~8/4) 진행 확인, TAIHO MARU(8/11경 입항) 입항 준비. ④ 대서양 선망: 일간 165t — P/COM(50t)·P/QUEEN(40t)·P/GRACE(40t)·P/FORE(35t) 고른 조업, TEMA 입항 예정(P/MAS 7/31, P/DIS 7/29~8/1, P/PATH 8/1, P/COM 8/5) 하역 일정 관리.</>}
              source="해양수산본부 일일 업무보고 260731"
            />
          </div>

          {/* Zone 2: Fleet Mini-map */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2em' }}>🗺️</span> 선대 운영 미니맵 (Fleet Mini-map)
            </h3>
            <FleetPixelMap />
          </div>

          {/* Zone 4: Fleet Roster Grid */}
          <FleetRosterGrid />
        </>
      )}

      {activeTab === 'weekly' && (
        <>
          {/* Zone 1: Hero KPIs */}
          <FleetHeroKPI mode="weekly" />

          {/* Zone 3: Charts + Rankings */}
          <FleetChartSection />

          {/* Zone 5: Expandable Detail */}
          <FleetDetailPanel />
        </>
      )}

      {/* Global Bottom Sections */}
      {/* VDS Strategy Matrix */}
      <VdsStrategyMatrix />

      {/* PNA 수역별 입어료 배정 */}
      <PnaAccessFeeWidgets />

    </div>
  );
}
