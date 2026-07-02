'use client';
import React, { useState } from 'react';
import { ChevronDown, Trophy, BarChart3 } from 'lucide-react';
import { WeeklyCatchChart, MonthlyCatchChart, CumulativeChart, CumulativeTableData } from './FleetCharts';
import TakeawayBox from './TakeawayBox';
import s from './FleetCommandCenter.module.css';

const rankData = [
  { r: 1, cap: '김태엽', name: 'N/STAR', weekly: 375, daily: 53.57, badge: 'gold' },
  { r: 2, cap: '김승현', name: 'S/PIO', weekly: 300, daily: 42.86, badge: 'silver' },
  { r: 3, cap: '김형주', name: 'N/SUN', weekly: 235, daily: 33.57, badge: 'bronze' },
  { r: 4, cap: '김효원', name: 'S/SPR', weekly: 165, daily: 23.57, badge: '' },
  { r: 5, cap: '최용석', name: 'S/CHA', weekly: 140, daily: 20.00, badge: '' },
  { r: 6, cap: '이평규', name: 'KONA', weekly: 122, daily: 17.43, badge: '' },
  { r: 7, cap: '김정훈', name: 'MARI', weekly: 105, daily: 15.00, badge: '' },
  { r: 8, cap: '공준식', name: 'S/EXP', weekly: 5, daily: 0.71, badge: '' },
  { r: 9, cap: '모승현', name: 'S/HAR', weekly: 0, daily: 0, badge: '' },
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
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto', alignSelf: 'center' }}>26.06.28 보고 기준</span>
        </div>
        {activeTab === 'weekly' && (
          <>
            <WeeklyCatchChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>S/SPR(김효원) 215t, N/STAR(조태연) 205t으로 주간 1·2위 차지. 주간 총 어획량 954t(국적 520t, 합작 434t) 기록.</>}
                actionPlan={<>N/STAR 조태연 신임 선장 주간 2위 호실적. S/HAR(오복근), S/JUP(강창훈) 주간 실적 없음.</>}
              />
            </div>
          </>
        )}
        {activeTab === 'monthly' && (
          <>
            <MonthlyCatchChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>N/STAR 월간 누적 1,165t, S/SPR 927t 기록. 월간 총 어획량 5,889t(국적 2,403t, 합작 3,486t).</>}
                actionPlan={<>연간 누계 39,301t(국적 23,913t, 합작 15,388t) 달성으로 연간 목표 달성 궤도 유지.</>}
              />
            </div>
          </>
        )}
        {activeTab === 'cumulative' && (
          <>
            <CumulativeChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>조태연(N/STAR) 승선 후 4일간 일어획 51.3t으로 현어기 누계 전체 1위 랭크. 김효원(S/SPR) 30.4t으로 2위 유지.</>}
                actionPlan={<>N/STAR 조태연 신임 선장 조업 호조. S/EXP(공준식) 신임 선장 일어획 11.0t 기록하며 점진적 회복 중. 오복근(S/HAR) 승선 대기.</>}
              />
            </div>
          </>
        )}
      </div>

      {/* Ranking */}
      <div className={s.rankPanel}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={16} color="#fbbf24" /> 주간 선장실적 (Top 10)
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 'auto' }}>일일 업무보고 26.06.28 기준</span>
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
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({data.length}명) · 26.06.10 보고 기준</span>
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
              situation={<>김효원(S/SPR) 254일간 7,423t 달성하며 전체 일어획 1위(29.2t) 유지. 모승현(S/HAR) 29.0t으로 2위. 전체 일어획 평균 23.2t.</>}
              actionPlan={<>N/SUN 저실적 원인 긴급 분석 유지. KONA(이평규) 89일차 일어획 23.0t으로 평균 도달 — 적응기 후 괄목할 성과 개선 중.</>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
