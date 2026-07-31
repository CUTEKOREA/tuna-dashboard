'use client';
import React, { useState } from 'react';
import { ChevronDown, Trophy, BarChart3 } from 'lucide-react';
import { WeeklyCatchChart, MonthlyCatchChart, CumulativeChart, CumulativeTableData } from './FleetCharts';
import TakeawayBox from './TakeawayBox';
import s from './FleetCommandCenter.module.css';

const rankData = [
  { r: 1, cap: '김정훈', name: 'MARI', weekly: 195.00, daily: 27.86, badge: 'gold' },
  { r: 2, cap: '최용석', name: 'S/CHA', weekly: 190.00, daily: 27.14, badge: 'silver' },
  { r: 3, cap: '김효원', name: 'S/SPR', weekly: 182.00, daily: 26.00, badge: 'bronze' },
  { r: 4, cap: '조태연', name: 'N/STAR', weekly: 105.00, daily: 15.00, badge: '' },
  { r: 5, cap: '김형주', name: 'N/SUN', weekly: 100.00, daily: 14.29, badge: '' },
  { r: 6, cap: '오복근', name: 'S/HAR', weekly: 95.00, daily: 13.57, badge: '' },
  { r: 7, cap: '공준식', name: 'S/EXP', weekly: 81.30, daily: 11.61, badge: '' },
  { r: 8, cap: '김승현', name: 'S/PIO', weekly: 39.00, daily: 5.57, badge: '' },
  { r: 9, cap: '이평규', name: 'KONA', weekly: 22.00, daily: 3.14, badge: '' },
  { r: 10, cap: '강창훈', name: 'S/JUP', weekly: 0, daily: 0, badge: '' },
];

const tabs = [
  { id: 'weekly', label: '주간 어획' },
  { id: 'monthly', label: '월간 추이' },
  { id: 'cumulative', label: '현어기 누적' },
] as const;

const badgeClass: Record<string, string> = { gold: s.badgeGold, silver: s.badgeSilver, bronze: s.badgeBronze };
const rowClass: Record<number, string> = { 1: s.rowTop1, 2: s.rowTop2, 3: s.rowTop3 };
const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
const titles: Record<string, string> = { gold: '👑 참치왕', silver: '⚔️ 엘리트', bronze: '🎯 스나이퍼' };

export function FleetChartSection() {
  const [activeTab, setActiveTab] = useState<string>('weekly');

  return (
    <div className={s.analysisGrid}>
      {/* Charts */}
      <div className={s.chartPanel}>
        <div className={s.chartTabs}>
          {tabs.map(t => (
            <button key={t.id} className={`${s.chartTab} ${activeTab === t.id ? s.chartTabActive : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto', alignSelf: 'center' }}>26.07.27 (7/20~26) 보고 기준</span>
        </div>
        {activeTab === 'weekly' && (
          <>
            <WeeklyCatchChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>MARI(김정훈) 195t 주간 1위. S/CHA(최용석) 190t 2위. 주간 총 어획량 1,009t(국적 587t, 합작 422t) 기록.</>}
                actionPlan={<>S/JUP(강창훈) 주간 실적 없음 — 수리 및 대기 중.</>}
              />
            </div>
          </>
        )}
        {activeTab === 'monthly' && (
          <>
            <MonthlyCatchChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>MARI 7월 655t, N/STAR 800t 등 합작선 호조. 7월 월간 총 어획량 3,445t(국적 1,531t, 합작 1,914t).</>}
                actionPlan={<>연간 누계 42,974t(국적 25,592t, 합작 17,382t). MARI 연간 10,725t으로 선단 최다.</>}
              />
            </div>
          </>
        )}
        {activeTab === 'cumulative' && (
          <>
            <CumulativeChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>조태연(N/STAR) 일어획 40.2t으로 현어기 누계 1위. 김효원(S/SPR) 29.4t 2위, 김정훈(MARI) 23.4t 3위.</>}
                actionPlan={<>전체 일어획 평균 20.9t. 오복근(S/HAR) 13.6t으로 10위 기록.</>}
              />
            </div>
          </>
        )}
      </div>

      {/* Ranking */}
      <div className={s.rankPanel}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={16} color="#fbbf24" /> 주간 선장실적 (Top 10)
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 'auto' }}>주간 실적 (7/20~26) 기준</span>
        </h3>
        <table className={s.rankTable}>
          <thead>
            <tr><th>순위</th><th>선장</th><th>선박</th><th>일평균 어획량</th><th>주간 어획량</th></tr>
          </thead>
          <tbody>
            {rankData.map(r => (
              <tr key={r.r} className={rowClass[r.r] || ''}>
                <td>{medals[r.r] || r.r}</td>
                <td style={{ fontWeight: 700 }}>
                  {r.cap}
                  {r.badge && <span className={`${s.badge} ${badgeClass[r.badge]}`}>{titles[r.badge]}</span>}
                </td>
                <td>{r.name}</td>
                <td style={{ fontWeight: 700, color: r.daily >= 25 ? '#34d399' : r.daily < 15 ? 'var(--accent-danger)' : 'var(--text-main)' }}>{r.daily}</td>
                <td style={{ color: 'var(--text-muted)' }}>{r.weekly}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FleetDetailPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const data = CumulativeTableData;

  return (
    <div className={s.expandPanel}>
      <div className={s.expandHeader} onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>선장 현어기 누적 실적 상세</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({data.length}명) · 26.07.27 (7/20~26) 보고 기준</span>
        </div>
        <ChevronDown size={18} className={`${s.expandChevron} ${isOpen ? s.expandChevronOpen : ''}`} color="var(--text-muted)" />
      </div>
      <div className={`${s.expandBody} ${isOpen ? s.expandBodyOpen : ''}`}>
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--panel-border)' }}>
            <table className={s.rankTable}>
              <thead>
                <tr>
                  <th>순위</th><th>선장</th><th>선박</th><th>승선일</th><th>어기일수</th><th>누적(t)</th><th>일어획(t)</th><th>1위 대비</th><th>평균 대비</th>
                </tr>
              </thead>
              <tbody>
                {[...data].sort((a, b) => a.rank - b.rank).map(r => (
                  <tr key={r.rank} className={rowClass[r.rank] || ''}>
                    <td>{medals[r.rank] || r.rank}</td>
                    <td style={{ fontWeight: 700 }}>{r.cap}</td>
                    <td>{r.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.date}</td>
                    <td>{r.days}일</td>
                    <td style={{ fontWeight: 700 }}>{r.catchTotal.toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: r.daily >= 25 ? '#34d399' : r.daily < 15 ? 'var(--accent-danger)' : 'var(--text-main)' }}>{r.daily}</td>
                    <td className={parseFloat(r.diff) >= 0 ? s.diffPositive : s.diffNegative}>{r.diff}</td>
                    <td className={parseFloat(r.avgDiff) >= 0 ? s.diffPositive : s.diffNegative}>{r.avgDiff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16 }}>
            <TakeawayBox
              situation={<>조태연(N/STAR) 어기일수 25일, 일어획 40.2t 달성 전체 일어획 1위. 김효원(S/SPR) 29.4t으로 2위. 전체 일어획 평균 20.9t.</>}
              actionPlan={<>MARI(김정훈) 1만톤 누적 달성. KONA(이평규) 일어획 19.1t 기록 중.</>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
