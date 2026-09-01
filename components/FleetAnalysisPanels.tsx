'use client';
import React, { useState } from 'react';
import { ChevronDown, Trophy, BarChart3 } from 'lucide-react';
import { WeeklyCatchChart, MonthlyCatchChart, CumulativeChart, CumulativeTableData, DailyCatchTrendChart } from './FleetCharts';
import TakeawayBox from './TakeawayBox';
import s from './FleetCommandCenter.module.css';
import { purseSeineCatch } from '@/lib/fleet-operations-2026-08-23';
import { fleetDailyPublicSeries } from '@/lib/data/fleet-daily-public';

const rankData = purseSeineCatch.weeklyRanking.map((item) => ({
  r: item.rank, cap: item.captain, name: item.vessel, weekly: item.catchMt, daily: item.dailyAverageMt,
  badge: item.rank === 1 ? 'gold' : item.rank === 2 ? 'silver' : item.rank === 3 ? 'bronze' : '',
}));
const weeklyPeriod = `${purseSeineCatch.period.from.slice(2).replaceAll('-', '.')}~${purseSeineCatch.period.to.slice(5).replace('-', '.')}`;
const weeklyLabel = purseSeineCatch.source.split(' - ').at(-1) ?? '주간 실적';

const dailyTrendSituation = (() => {
  const series = fleetDailyPublicSeries;
  const sum = (values: (number | null)[]) => values.reduce<number>((total, value) => total + (value ?? 0), 0);
  const pacific = sum(series.pacific.totalMt);
  const atlantic = sum(series.atlantic.totalMt);
  const days = series.dates.length;
  const format = (value: number) => Math.round(value).toLocaleString('ko-KR');
  return `${series.dates[0]}~${series.dates.at(-1)} 일일보고 ${days}건 기준으로 태평양 ${format(pacific)}t, 대서양 ${format(atlantic)}t을 조업했습니다. 하루 평균은 태평양 ${(pacific / days).toFixed(1)}t, 대서양 ${(atlantic / days).toFixed(1)}t입니다.`;
})();

const tabs = [
  { id: 'weekly', label: '주간 어획' },
  { id: 'monthly', label: '월간 추이' },
  { id: 'cumulative', label: '현어기 누적' },
  { id: 'daily', label: '일간 추이' },
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
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto', alignSelf: 'center' }}>{weeklyPeriod} 보고 기준</span>
        </div>
        {activeTab === 'weekly' && (
          <>
            <WeeklyCatchChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>N/SUN(김형주) 145t 주간 1위, S/SPR(김효원) 140t 2위, S/EXP(공준식) 130t 3위입니다. 주간 총 어획량은 645t(국적 460t, 합작 185t)입니다.</>}
                actionPlan={<>S/JUP·MARI는 주간 어획이 없습니다. 상위 3척과 무실적 2척의 수역·조업일수·선박 상태를 대조해 배치를 조정하십시오.</>}
                source={purseSeineCatch.source}
              />
            </div>
          </>
        )}
        {activeTab === 'monthly' && (
          <>
            <MonthlyCatchChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>8월 누계 3,313t(국적 1,534t, 합작 1,779t)입니다. 합작선 비중은 53.7%로 직전 주 59.7%에서 낮아졌습니다.</>}
                actionPlan={<>연간 누계 48,146t 중 S/SPR이 6,881t으로 최대이고 N/STAR가 6,405t으로 뒤를 잇습니다. 합작선 의존과 국적선 생산 회복을 함께 관리하십시오.</>}
                source={purseSeineCatch.source}
              />
            </div>
          </>
        )}
        {activeTab === 'cumulative' && (
          <>
            <CumulativeChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>김효원(S/SPR) 일어획 27.1t으로 현어기 1위, 김정훈(MARI) 22.9t 2위, 김승현(S/PIO) 19.2t 3위입니다. N/STAR는 이진우 선장 승선 후 12일·40t을 조업했습니다.</>}
                actionPlan={<>선단 평균 19.1t 대비 하위 5척은 원인별로 수역·조업일수·선박 상태를 대조하십시오.</>}
                source={`선장 실적 누계 (현어기) · ${purseSeineCatch.period.to}`}
              />
            </div>
          </>
        )}
        {activeTab === 'daily' && (
          <>
            <DailyCatchTrendChart />
            <div style={{ marginTop: 16 }}>
              <TakeawayBox
                situation={<>{dailyTrendSituation}</>}
                actionPlan={<>해역 합계는 일일보고 머리글의 일간 어획량이고 선박별 선은 상세 행 값입니다. 두 값이 어긋나는 날은 원문 검산 항목과 함께 확인하십시오.</>}
                source={`해양수산본부 일일업무보고 ${fleetDailyPublicSeries.dates[0]}~${fleetDailyPublicSeries.dates.at(-1)} · ${fleetDailyPublicSeries.dates.length}건`}
              />
            </div>
          </>
        )}
      </div>

      {/* Ranking */}
      <div className={s.rankPanel}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={16} color="#fbbf24" /> 주간 선장실적 (Top 10)
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 'auto' }}>{weeklyLabel} 기준</span>
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
                <td style={{ fontWeight: 700, color: r.daily >= 25 ? 'var(--w-emerald-400)' : r.daily < 15 ? 'var(--accent-danger)' : 'var(--text-main)' }}>{r.daily}</td>
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
  // 2026-08-15 사용자 지시: 상세 표는 기본 펼침
  const [isOpen, setIsOpen] = useState(true);
  const data = CumulativeTableData;

  return (
    <div className={s.expandPanel}>
      <div className={s.expandHeader} onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>선장 현어기 누적 실적 상세</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({data.length}명) · {purseSeineCatch.period.to.slice(2).replaceAll('-', '.')} 보고 기준</span>
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
                    <td style={{ fontWeight: 700, color: r.daily >= 25 ? 'var(--w-emerald-400)' : r.daily < 15 ? 'var(--accent-danger)' : 'var(--text-main)' }}>{r.daily}</td>
                    <td className={parseFloat(r.diff) >= 0 ? s.diffPositive : s.diffNegative}>{r.diff}</td>
                    <td className={parseFloat(r.avgDiff) >= 0 ? s.diffPositive : s.diffNegative}>{r.avgDiff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16 }}>
            <TakeawayBox
              situation={<>김효원(S/SPR) 어기 338일·일어획 27.1t으로 1위, 김정훈(MARI) 22.9t으로 2위입니다. 선단 평균은 19.1t입니다. N/STAR는 이진우 선장 승선 후 12일·40t으로 집계됩니다.</>}
              actionPlan={<>MARI(김정훈)는 11,485t 누적으로 최대이나 일어획은 22.9t 2위입니다. 순위와 누계 물량을 분리해 평가하십시오.</>}
              source={`선장 실적 누계 (현어기) · ${purseSeineCatch.period.to}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
