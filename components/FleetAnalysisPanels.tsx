'use client';
import React, { useState } from 'react';
import { ChevronDown, Trophy, BarChart3 } from 'lucide-react';
import { WeeklyCatchChart, MonthlyCatchChart, CumulativeChart, CumulativeTableData } from './FleetCharts';
import TakeawayBox from './TakeawayBox';
import s from './FleetCommandCenter.module.css';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const rankData = [
  { r: 1, cap: '김효원', name: 'S/SPR', weekly: 334.00, daily: 47.71, badge: 'gold' },
  { r: 2, cap: '김태엽', name: 'N/STAR', weekly: 170.00, daily: 24.29, badge: 'silver' },
  { r: 3, cap: '강창훈', name: 'S/JUP', weekly: 165.00, daily: 23.57, badge: 'bronze' },
  { r: 4, cap: '김승현', name: 'S/PIO', weekly: 130.00, daily: 18.57, badge: '' },
  { r: 5, cap: '최용석', name: 'S/CHA', weekly: 130.00, daily: 18.57, badge: '' },
  { r: 6, cap: '김정훈', name: 'MARI', weekly: 130.00, daily: 18.57, badge: '' },
  { r: 7, cap: '이평규', name: 'KONA', weekly: 130.00, daily: 18.57, badge: '' },
  { r: 8, cap: '정윤채', name: 'S/EXP', weekly: 119.00, daily: 17.00, badge: '' },
  { r: 9, cap: '김형주', name: 'N/SUN', weekly: 55.00, daily: 7.86, badge: '' },
  { r: 10, cap: '모승현', name: 'S/HAR', weekly: 45.00, daily: 6.43, badge: '' },
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
        </div>
        {activeTab === 'weekly' && (
          <>
            <WeeklyCatchChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>SPR(김효원) 334t으로 주간 1위. HAR(모승현) 45t으로 일시적 부진 — 어장 이동에 따른 조업일수 감소 여파.</>}
                actionPlan={<>HAR 하락 원인(어장 이동 및 기상 영향) 분석. SPR 일평균 47.71t으로 양호한 성과 지속 여부 모니터링.</>}
              />
            </div>
          </>
        )}
        {activeTab === 'monthly' && (
          <>
            <MonthlyCatchChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>월간 어획 기준 SPR이 4,430t으로 최상위 유지, HAR이 4,160t으로 뒤를 이음. SUN은 3월 실적 부재 영향으로 1,772t에 머무름.</>}
                actionPlan={<>SPR 및 HAR의 높은 월간 실적 유지 전략 점검. SUN의 3월 무조업 극복을 위한 2분기 조업 효율 극대화 방안 수립.</>}
              />
            </div>
          </>
        )}
        {activeTab === 'cumulative' && (
          <>
            <CumulativeChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>모승현(S/HAR) 일어획 30.6t으로 전체 1위. 김형주(N/SUN) 13.1t으로 최하위 — 평균 대비 -10.13t.</>}
                actionPlan={<>N/SUN 저실적 구조적 원인(합작선 운영 효율, 어장 접근성) 심층 분석. KONA(이평규) 68일차 초기 단계로 추이 지속 관찰.</>}
              />
            </div>
          </>
        )}
      </div>

      {/* Ranking */}
      <div className={s.rankPanel}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={16} color="#fbbf24" /> 주간 선장실적 (Top 10)
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
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({data.length}명)</span>
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
              situation={<>모승현(S/HAR) 374일간 11,460t 달성, '1만톤 클럽' 가입. 전체 일어획 평균 23.3t 대비 +7.38t로 성과. 반면 김형주(N/SUN)은 210일간 일어획 13.1t으로 평균 대비 -10.13t — 구조적 저실적 패턴.</>}
              actionPlan={<>N/SUN 저실적 원인(합작선 한계 vs 어장 배정 문제) 긴급 분석 착수. KONA(이평규) 68일 조기 단계 — 60일 후 재평가. PIO(김승현) 116일차 일어획 23.2t, 안정 궤도 진입 확인.</>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
