'use client';
import React, { useState } from 'react';
import { ChevronDown, Trophy, BarChart3 } from 'lucide-react';
import { WeeklyCatchChart, MonthlyCatchChart, CumulativeChart, CumulativeTableData } from './FleetCharts';
import TakeawayBox from './TakeawayBox';
import s from './FleetCommandCenter.module.css';

const rankData = [
  { r: 1, cap: '모승현', name: 'S/HAR', days: 367, total: 11415, daily: 31.1, badge: 'gold' },
  { r: 2, cap: '김효원', name: 'S/SPR', days: 226, total: 6374, daily: 28.2, badge: 'silver' },
  { r: 3, cap: '정윤채', name: 'S/EXP', days: 373, total: 9372, daily: 25.1, badge: 'bronze' },
  { r: 4, cap: '김태엽', name: 'N/STAR', days: 370, total: 8840, daily: 23.9, badge: '' },
  { r: 5, cap: '김승현', name: 'S/PIO', days: 109, total: 2560, daily: 23.5, badge: '' },
  { r: 6, cap: '김정훈', name: 'MARI', days: 389, total: 8740, daily: 22.5, badge: '' },
  { r: 7, cap: '이평규', name: 'KONA', days: 61, total: 1206, daily: 19.8, badge: '' },
  { r: 8, cap: '강창훈', name: 'S/JUP', days: 335, total: 6395, daily: 19.1, badge: '' },
  { r: 9, cap: '최용석', name: 'S/CHA', days: 127, total: 2165, daily: 17.1, badge: '' },
  { r: 10, cap: '김형주', name: 'N/SUN', days: 203, total: 2702, daily: 13.3, badge: '' },
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
                situation={<>PIO(김승현) 795t으로 주간 1위 독주. CHA(최용석) 75t 극심한 부진 — 전체 평균의 1/5 수준.</>}
                actionPlan={<>CHA 부진 원인(기상/어군/장비) 긴급 분석. SPR(김효원) 185t도 평년 대비 하락세 — 어장 이동 여부 확인 필요.</>}
              />
            </div>
          </>
        )}
        {activeTab === 'monthly' && (
          <>
            <MonthlyCatchChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>월별 누적 기준 HAR(모승현)이 5개월 연속 상위권 유지. SPR은 4월 1,555t 폭발 후 5월 급감세.</>}
                actionPlan={<>SPR 4→5월 급감 원인 파악(어장 이동 vs 기계 문제). EXP 하향 추세 지속 — 3분기 실적 리스크 점검.</>}
              />
            </div>
          </>
        )}
        {activeTab === 'cumulative' && (
          <>
            <CumulativeChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>모승현(S/HAR) 일어획 31.1t으로 전체 1위. 김형주(N/SUN) 13.3t으로 최하위 — 평균 대비 -10.04t.</>}
                actionPlan={<>N/SUN 저실적 구조적 원인(합작선 운영 효율, 어장 접근성) 심층 분석. KONA(이평규) 61일차 아직 초기 — 추이 관찰.</>}
              />
            </div>
          </>
        )}
      </div>

      {/* Ranking */}
      <div className={s.rankPanel}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={16} color="#fbbf24" /> 선장 실적 순위 (현어기 일어획)
        </h3>
        <table className={s.rankTable}>
          <thead>
            <tr><th>#</th><th>선장</th><th>선박</th><th>일어획</th><th>누적</th></tr>
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
                <td style={{ fontWeight: 700, color: r.daily >= 25 ? '#34d399' : r.daily < 15 ? 'var(--accent-danger)' : 'var(--text-main)' }}>{r.daily}t</td>
                <td style={{ color: 'var(--text-muted)' }}>{r.total.toLocaleString()}t</td>
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
              situation={<>모승현(S/HAR) 367일간 11,415t 달성, '1만톤 클럽' 가입. 전체 일어획 평균 23.37t 대비 +7.75t로 독보적 성과. 반면 김형주(N/SUN)은 203일간 일어획 13.3t으로 평균 대비 -10.04t — 구조적 저실적 패턴.</>}
              actionPlan={<>N/SUN 저실적 원인(합작선 한계 vs 어장 배정 문제) 긴급 분석 착수. KONA(이평규) 61일 조기 단계 — 60일 후 재평가. PIO(김승현) 109일차 일어획 23.5t, 안정 궤도 진입 확인.</>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
