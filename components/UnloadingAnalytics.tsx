'use client';
import React, { useState, useMemo } from 'react';
import styles from './UnloadingAnalytics.module.css';
import {
  TrendingUp, Thermometer, Bell, AlertTriangle, CheckCircle,
  Info, BarChart3, Target, Clock
} from 'lucide-react';
// Pure SVG charts — recharts fails in lazy-loaded tab context
import { A11Y_PALETTE } from './ChartPatterns';
import { getVesselStatusKind } from '../lib/unloading-operations';

// ─── Types ───────────────────────────────────────────────

interface SpeciesData {
  id: string;
  name: string;
  reported: number;
  actual: number;
  surplus: number;
}

interface TimelineEntry {
  date: string;
  time: string;
  targetHol: string;
  dailyAmount: number;
  cumAmount: number;
  quality: string;
}

interface SelectedVessel {
  name: string;
  reportedTotal: number;
  actualTotal: number;
  surplus: number;
  status: string;
  species: SpeciesData[];
  timeline: TimelineEntry[];
  dateRange?: string;
}

interface HoldData {
  dischargedVolume: number;
  lastTemperature: number | null;
  tempHistory: { date: string; temp: number }[];
  timeline: { date: string; amount: number }[];
  nominalCapacity: number;
  shippers: string[];
  qualityDescription: string;
}

interface UnloadingAnalyticsProps {
  selectedVessel: SelectedVessel;
  vesselId: string;
  allVessels: Record<string, any>;
  holdsData: Record<string, HoldData>;
}

// ─── Helpers ─────────────────────────────────────────────

/** Parse work hours from time string like "08:10 ~ 20:30" */
function parseWorkHours(timeStr: string): number {
  if (!timeStr || timeStr === '-') return 0;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*~\s*(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  const start = parseInt(match[1]) + parseInt(match[2]) / 60;
  const end = parseInt(match[3]) + parseInt(match[4]) / 60;
  return end > start ? end - start : 0;
}

/** Get working days count from timeline (days with actual work, dailyAmount > 0) */
function getWorkingDays(timeline: TimelineEntry[]): number {
  return timeline.filter(t => t.dailyAmount > 0).length;
}

/** Get total calendar days from dateRange or timeline */
function getTotalDays(vessel: { dateRange?: string; timeline?: TimelineEntry[] }): number {
  if (vessel.dateRange) {
    const dates = vessel.dateRange.match(/(\d{4})\.(\d{2})\.(\d{2})/g);
    if (dates && dates.length >= 2) {
      const parts1 = dates[0].split('.').map(Number);
      const parts2 = dates[1].split('.').map(Number);
      const d1 = new Date(parts1[0], parts1[1] - 1, parts1[2]);
      const d2 = new Date(parts2[0], parts2[1] - 1, parts2[2]);
      return Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    }
  }
  return (vessel.timeline || []).length || 1;
}

export function getAnalyticsStatus(status: string) {
  const kind = getVesselStatusKind(status);
  return {
    kind,
    label: kind === 'progress' ? '하역중' : kind === 'waiting' ? '하역대기' : '하역완료',
    comparable: kind !== 'waiting',
    completed: kind === 'completed',
  };
}

export function getTemperatureEvidenceLabel(count: number, allBelowThreshold: boolean): string {
  if (count === 0) return '하역 온도 실적 대기';
  return allBelowThreshold
    ? '전 기간 어창 온도 -18℃ 이하 유지'
    : '일부 어창 -18℃ 이상 관찰';
}

/** Check if vessel is still in progress */
function isInProgress(status: string): boolean {
  return getVesselStatusKind(status) === 'progress';
}

/** Format number with locale */
function fmt(n: number, decimals = 1): string {
  return n.toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// Hold line colors — use A11Y palette plus extras for many holds
const HOLD_COLORS = [
  ...A11Y_PALETTE,
  '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e',
  '#a855f7', '#22d3ee', '#fb923c'
];

// ─── Component ───────────────────────────────────────────

export default function UnloadingAnalytics({
  selectedVessel,
  vesselId,
  allVessels,
  holdsData,
}: UnloadingAnalyticsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: '📊 예측 분석', icon: <BarChart3 size={14} /> },
    { label: '🌡️ 품질 모니터링', icon: <Thermometer size={14} /> },
    { label: '🔔 알림 허브', icon: <Bell size={14} /> },
  ];

  // ─── Panel 1: Smart Predictive Analytics ───

  const benchmarkData = useMemo(() => {
    return Object.entries(allVessels).map(([id, v]: [string, any]) => {
      const statusMeta = getAnalyticsStatus(v.status || '');
      const workDays = getWorkingDays(v.timeline || []);
      const totalDays = statusMeta.comparable ? getTotalDays(v) : 0;
      const dailyAvg = workDays > 0 ? v.actualTotal / workDays : 0;

      // Compute total work hours to get MT/hr
      let totalHours = 0;
      let timedAmount = 0;
      (v.timeline || []).forEach((t: TimelineEntry) => {
        const hours = parseWorkHours(t.time);
        if (hours > 0) {
          totalHours += hours;
          timedAmount += t.dailyAmount;
        }
      });
      const mtPerHr = totalHours > 0 ? timedAmount / totalHours : 0;

      return {
        id,
        name: v.name || id,
        totalDays,
        workDays,
        dailyAvg,
        mtPerHr,
        actualTotal: v.actualTotal || 0,
        status: v.status || '',
        statusKind: statusMeta.kind,
        statusLabel: statusMeta.label,
        comparable: statusMeta.comparable,
        isSelected: id === vesselId,
      };
    });
  }, [allVessels, vesselId]);

  const selectedBenchmark = benchmarkData.find(b => b.isSelected);
  const comparableBenchmarks = benchmarkData.filter(b => b.comparable);
  const avgDailyAvg = comparableBenchmarks.length > 0
    ? comparableBenchmarks.reduce((s, b) => s + b.dailyAvg, 0) / comparableBenchmarks.length
    : 0;

  const comparisonPct = avgDailyAvg > 0 && selectedBenchmark?.comparable
    ? ((selectedBenchmark.dailyAvg - avgDailyAvg) / avgDailyAvg * 100)
    : 0;

  // Daily target guide
  const dailyTargetData = useMemo(() => {
    if (!isInProgress(selectedVessel.status)) {
      return { remaining: 0, recommendedDaily: 0, indicator: 'green' as const, daysLeft: 0 };
    }
    const remaining = selectedVessel.reportedTotal - selectedVessel.actualTotal;
    // Estimate remaining working days: assume ~5 per week
    const workDays = getWorkingDays(selectedVessel.timeline);
    const totalDays = getTotalDays(selectedVessel);
    const workRatio = totalDays > 0 ? workDays / totalDays : 0.7;
    // Estimate 7 more calendar days, apply workRatio
    const estWorkDaysLeft = Math.max(1, Math.round(7 * workRatio));
    const recommendedDaily = remaining > 0 ? remaining / estWorkDaysLeft : 0;

    const actualDailyAvg = workDays > 0 ? selectedVessel.actualTotal / workDays : 0;
    let indicator: 'green' | 'yellow' | 'red' = 'green';
    if (actualDailyAvg > 0) {
      const ratio = recommendedDaily / actualDailyAvg;
      if (ratio > 1.3) indicator = 'red';
      else if (ratio > 1.1) indicator = 'yellow';
    }

    return { remaining, recommendedDaily, indicator, daysLeft: estWorkDaysLeft };
  }, [selectedVessel]);

  // Efficiency trend (MT/hr per working day)
  const efficiencyTrend = useMemo(() => {
    const workingEntries = selectedVessel.timeline.filter(t => t.dailyAmount > 0 && t.time !== '-');
    return workingEntries.map(t => {
      const hours = parseWorkHours(t.time);
      return {
        date: t.date,
        mtPerHr: hours > 0 ? Math.round((t.dailyAmount / hours) * 10) / 10 : 0,
      };
    });
  }, [selectedVessel.timeline]);

  const avgEfficiency = efficiencyTrend.length > 0
    ? efficiencyTrend.reduce((s, e) => s + e.mtPerHr, 0) / efficiencyTrend.length
    : 0;

  // ─── Panel 2: Quality Intelligence ───

  // Temperature history chart data — merge all holds
  const { tempChartData, holdIds } = useMemo(() => {
    const holdIdList = Object.keys(holdsData).filter(
      id => holdsData[id].tempHistory.length > 0
    );
    // Collect all unique dates
    const dateSet = new Set<string>();
    holdIdList.forEach(id => {
      holdsData[id].tempHistory.forEach(th => dateSet.add(th.date));
    });
    const sortedDates = Array.from(dateSet).sort((a, b) => {
      const [am, ad] = a.split('/').map(Number);
      const [bm, bd] = b.split('/').map(Number);
      return (am * 100 + ad) - (bm * 100 + bd);
    });

    const data = sortedDates.map(date => {
      const point: Record<string, any> = { date };
      holdIdList.forEach(id => {
        const entry = holdsData[id].tempHistory.find(th => th.date === date);
        point[id] = entry ? entry.temp : null;
      });
      return point;
    });

    return { tempChartData: data, holdIds: holdIdList };
  }, [holdsData]);

  // Quality summary
  const qualitySummary = useMemo(() => {
    let allBelowThreshold = true;
    let someBelowThreshold = false;
    let minTemp = Infinity;
    let maxTemp = -Infinity;
    let sumTemp = 0;
    let countTemp = 0;

    Object.values(holdsData).forEach(hold => {
      hold.tempHistory.forEach(th => {
        if (th.temp > -18) {
          allBelowThreshold = false;
          someBelowThreshold = true;
        }
        minTemp = Math.min(minTemp, th.temp);
        maxTemp = Math.max(maxTemp, th.temp);
        sumTemp += th.temp;
        countTemp++;
      });
      if (hold.lastTemperature !== null && hold.lastTemperature > -18) {
        allBelowThreshold = false;
        someBelowThreshold = true;
      }
    });

    const avgTemp = countTemp > 0 ? sumTemp / countTemp : 0;

    // Check if quality notes mention 양호
    let qualityGood = false;
    const lastEntry = selectedVessel.timeline[selectedVessel.timeline.length - 1];
    if (lastEntry) {
      const q = typeof lastEntry.quality === 'string' ? lastEntry.quality : '';
      if (q.includes('양호')) qualityGood = true;
    }

    return {
      allBelowThreshold: countTemp === 0 || allBelowThreshold,
      someBelowThreshold: !allBelowThreshold && someBelowThreshold,
      qualityGood,
      minTemp: countTemp > 0 ? minTemp : null,
      maxTemp: countTemp > 0 ? maxTemp : null,
      avgTemp: countTemp > 0 ? avgTemp : null,
    };
  }, [holdsData, selectedVessel.timeline]);

  // ─── Panel 3: Alert Hub ───

  const alerts = useMemo(() => {
    type AlertItem = {
      severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'COMPLETED';
      title: string;
      description: string;
      timestamp: string;
      sortOrder: number;
    };

    const items: AlertItem[] = [];
    const now = new Date().toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    // 1. Temperature alerts
    Object.entries(holdsData).forEach(([holdId, hold]) => {
      if (hold.lastTemperature !== null && hold.lastTemperature > -18) {
        items.push({
          severity: 'CRITICAL',
          title: `어창 ${holdId} 온도 경고`,
          description: `현재 온도 ${hold.lastTemperature}℃ — 기준치(-18℃) 초과. 즉시 점검 필요.`,
          timestamp: now,
          sortOrder: 0,
        });
      }
    });

    // 2. Surplus alerts
    const surplusPct = selectedVessel.reportedTotal > 0
      ? Math.abs(selectedVessel.surplus) / selectedVessel.reportedTotal * 100
      : 0;
    if (getAnalyticsStatus(selectedVessel.status).completed && surplusPct > 3) {
      const direction = selectedVessel.surplus > 0 ? '초과' : '부족';
      items.push({
        severity: 'WARNING',
        title: `물량 ${direction} 경고`,
        description: `신고량 대비 ${fmt(surplusPct, 1)}% ${direction} (${fmt(Math.abs(selectedVessel.surplus), 3)} MT). 원인 분석 권장.`,
        timestamp: now,
        sortOrder: 1,
      });
    }

    // 3. Work time alerts (long shift)
    const workEntries = selectedVessel.timeline.filter(t => t.dailyAmount > 0);
    if (workEntries.length > 0) {
      const lastWorkEntry = workEntries[workEntries.length - 1];
      const lastHours = parseWorkHours(lastWorkEntry.time);
      if (lastHours > 12) {
        items.push({
          severity: 'WARNING',
          title: '장시간 작업 감지',
          description: `${lastWorkEntry.date}일 작업시간 ${fmt(lastHours, 1)}시간 — 12시간 초과 근무. 피로도 관리 필요.`,
          timestamp: lastWorkEntry.date,
          sortOrder: 1,
        });
      }
    }

    // 4. Next day plan
    if (workEntries.length > 0) {
      const lastQuality = typeof workEntries[workEntries.length - 1].quality === 'string'
        ? workEntries[workEntries.length - 1].quality
        : '';
      const nextDayMatch = lastQuality.match(/명일[^.]*약?\s*(\d[\d,.]*)\s*톤[^.]*(?:예정|계획)/);
      if (nextDayMatch) {
        items.push({
          severity: 'INFO',
          title: '명일 하역 계획',
          description: `${nextDayMatch[0]}`,
          timestamp: workEntries[workEntries.length - 1].date,
          sortOrder: 2,
        });
      }
    }

    // 5. Completion alert
    if (getAnalyticsStatus(selectedVessel.status).completed) {
      items.push({
        severity: 'COMPLETED',
        title: '하역 완료',
        description: `${selectedVessel.name} — 총 ${fmt(selectedVessel.actualTotal, 3)} MT 하역 완료.`,
        timestamp: workEntries.length > 0 ? workEntries[workEntries.length - 1].date : '',
        sortOrder: 3,
      });
    }

    // Sort by severity
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [selectedVessel, holdsData]);

  // ─── Render helpers ───

  const renderSeverityBadge = (severity: string) => {
    const cls =
      severity === 'CRITICAL' ? styles.severityCritical :
      severity === 'WARNING' ? styles.severityWarning :
      severity === 'COMPLETED' ? styles.severityCompleted :
      styles.severityInfo;
    return <span className={`${styles.alertSeverity} ${cls}`}>{severity}</span>;
  };

  const renderAlertIcon = (severity: string) => {
    const cls =
      severity === 'CRITICAL' ? styles.alertIconCritical :
      severity === 'WARNING' ? styles.alertIconWarning :
      severity === 'COMPLETED' ? styles.alertIconCompleted :
      styles.alertIconInfo;
    const icon =
      severity === 'CRITICAL' ? <AlertTriangle size={16} /> :
      severity === 'WARNING' ? <AlertTriangle size={16} /> :
      severity === 'COMPLETED' ? <CheckCircle size={16} /> :
      <Info size={16} />;
    return <div className={`${styles.alertIcon} ${cls}`}>{icon}</div>;
  };

  // ─── Pure SVG Chart Renderer ─────────────────────────────────

  function SvgLineChart({
    data,
    lines,
    width = 700,
    height = 260,
    yLabel = '',
    refLine,
    showLegend = false,
  }: {
    data: Record<string, any>[];
    lines: { key: string; color: string; label?: string }[];
    width?: number;
    height?: number;
    yLabel?: string;
    refLine?: { y: number; color: string; label: string };
    showLegend?: boolean;
  }) {
    if (data.length === 0) return null;

    const margin = { top: 16, right: 20, bottom: 36, left: 50 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    // Collect all numeric values across all lines
    const allVals: number[] = [];
    data.forEach(d => {
      lines.forEach(l => {
        const v = d[l.key];
        if (v !== null && v !== undefined && !isNaN(v)) allVals.push(v);
      });
    });
    if (refLine) allVals.push(refLine.y);

    if (allVals.length === 0) return null;

    const minVal = Math.floor(Math.min(...allVals) - 1);
    const maxVal = Math.ceil(Math.max(...allVals) + 1);
    const yRange = maxVal - minVal || 1;

    const xStep = data.length > 1 ? chartW / (data.length - 1) : chartW;

    const toX = (i: number) => margin.left + (data.length > 1 ? i * xStep : chartW / 2);
    const toY = (v: number) => margin.top + chartH - ((v - minVal) / yRange) * chartH;

    // Y-axis ticks (5 ticks)
    const yTicks: number[] = [];
    for (let i = 0; i <= 4; i++) {
      yTicks.push(minVal + (yRange * i) / 4);
    }

    return (
      <svg width={width} height={height + (showLegend ? 30 : 0)} style={{ display: 'block' }}>
        {/* Grid lines */}
        {yTicks.map((v, i) => (
          <line key={i} x1={margin.left} x2={width - margin.right} y1={toY(v)} y2={toY(v)}
            stroke="var(--chart-grid)" strokeDasharray="3 3" />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((v, i) => (
          <text key={i} x={margin.left - 6} y={toY(v) + 3} textAnchor="end"
            fill="var(--w-slate-400)" fontSize={10}>
            {Math.round(v * 10) / 10}{yLabel}
          </text>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text key={i} x={toX(i)} y={height - 6} textAnchor="middle"
            fill="var(--w-slate-400)" fontSize={10}>
            {d.date}
          </text>
        ))}

        {/* Reference line */}
        {refLine && (
          <>
            <line x1={margin.left} x2={width - margin.right}
              y1={toY(refLine.y)} y2={toY(refLine.y)}
              stroke={refLine.color} strokeDasharray="6 4" strokeWidth={1.5} />
            <text x={width - margin.right - 4} y={toY(refLine.y) - 5}
              textAnchor="end" fill={refLine.color} fontSize={10}>
              {refLine.label}
            </text>
          </>
        )}

        {/* Data lines */}
        {lines.map(line => {
          const points = data
            .map((d, i) => ({ x: toX(i), y: d[line.key], idx: i }))
            .filter(p => p.y !== null && p.y !== undefined && !isNaN(p.y));

          if (points.length === 0) return null;

          const pathD = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${toY(p.y)}`)
            .join(' ');

          return (
            <React.Fragment key={line.key}>
              <path d={pathD} fill="none" stroke={line.color} strokeWidth={2} />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={toY(p.y)} r={3}
                  fill={line.color} stroke="none" />
              ))}
            </React.Fragment>
          );
        })}

        {/* Legend */}
        {showLegend && (
          <g transform={`translate(${margin.left}, ${height + 4})`}>
            {lines.map((l, i) => (
              <g key={l.key} transform={`translate(${i * 80}, 0)`}>
                <rect x={0} y={2} width={12} height={3} rx={1.5} fill={l.color} />
                <text x={16} y={10} fill="var(--w-slate-400)" fontSize={10}>{l.label || l.key}</text>
              </g>
            ))}
          </g>
        )}
      </svg>
    );
  }

  return (
    <div className={styles.container}>
      {/* Tab Bar */}
      <div className={styles.tabBar}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ Tab 0: Smart Predictive Analytics ═══ */}
      {activeTab === 0 && (
        <div className={styles.tabContent}>
          <div className={styles.section}>

            {/* 1a. Vessel Benchmark Comparison */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <BarChart3 size={14} style={{ color: 'var(--w-sky-400)' }} />
                선박 벤치마크 비교
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.benchmarkTable}>
                  <thead>
                    <tr>
                      <th>선박명</th>
                      <th>총 일수</th>
                      <th>작업일</th>
                      <th>일평균 (MT)</th>
                      <th>MT/hr</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarkData.map(row => (
                      <tr key={row.id} className={row.isSelected ? styles.highlightRow : ''}>
                        <td style={{ fontWeight: row.isSelected ? 700 : 400, whiteSpace: 'nowrap' }}>
                          {row.isSelected && <span style={{ color: 'var(--w-sky-400)', marginRight: 4 }}>▸</span>}
                          {row.name}
                        </td>
                        <td>{row.comparable ? `${row.totalDays}일` : '—'}</td>
                        <td>{row.comparable ? `${row.workDays}일` : '—'}</td>
                        <td>{row.comparable ? fmt(row.dailyAvg) : '—'}</td>
                        <td>{row.comparable ? (row.mtPerHr > 0 ? fmt(row.mtPerHr) : '-') : '—'}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${
                            row.statusKind === 'progress'
                              ? styles.badgeProgress
                              : row.statusKind === 'waiting'
                                ? styles.badgeWaiting
                                : styles.badgeCompleted
                          }`}>
                            {row.statusLabel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedBenchmark?.comparable && (
                <div className={styles.comparisonMsg}>
                  <TrendingUp size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  현재 하역 속도가 벤치마크 평균보다{' '}
                  <strong style={{ color: comparisonPct >= 0 ? 'var(--w-emerald-400)' : '#f87171' }}>
                    {Math.abs(comparisonPct).toFixed(1)}% {comparisonPct >= 0 ? '높음' : '낮음'}
                  </strong>
                  {' '}(일평균 {fmt(selectedBenchmark.dailyAvg)} MT vs 평균 {fmt(avgDailyAvg)} MT)
                </div>
              )}
            </div>

            {/* 1b. Daily Target Guide */}
            {isInProgress(selectedVessel.status) && (
              <div className={styles.card}>
                <div className={styles.cardTitle}>
                  <Target size={14} style={{ color: 'var(--w-amber-500)' }} />
                  일일 목표 가이드
                </div>
                <div className={styles.targetRow}>
                  <div>
                    <div className={styles.targetValue}>
                      {fmt(dailyTargetData.recommendedDaily)}
                      <span className={styles.targetUnit}> MT/일</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--w-slate-400)', marginTop: 4 }}>
                      잔여 {fmt(dailyTargetData.remaining)} MT · 예상 {dailyTargetData.daysLeft}일 남음
                    </div>
                  </div>
                  <div
                    className={`${styles.targetIndicator} ${
                      dailyTargetData.indicator === 'green' ? styles.indicatorGreen :
                      dailyTargetData.indicator === 'yellow' ? styles.indicatorYellow :
                      styles.indicatorRed
                    }`}
                  >
                    {dailyTargetData.indicator === 'green' && '✅ 순조로운 진행'}
                    {dailyTargetData.indicator === 'yellow' && '⚠️ 다소 지연'}
                    {dailyTargetData.indicator === 'red' && '🚨 상당한 지연'}
                  </div>
                </div>
              </div>
            )}

            {/* 1c. Efficiency Trend */}
            {efficiencyTrend.length > 1 && (
              <div className={styles.card}>
                <div className={styles.cardTitle}>
                  <TrendingUp size={14} style={{ color: 'var(--w-emerald-500)' }} />
                  하역 효율 추이 (MT/hr)
                </div>
                <div className={styles.chartWrap} style={{ width: '100%', overflowX: 'auto' }}>
                  <SvgLineChart
                    data={efficiencyTrend}
                    lines={[{ key: 'mtPerHr', color: '#38bdf8', label: 'MT/hr' }]}
                    width={Math.max(efficiencyTrend.length * 50, 600)}
                    height={220}
                    refLine={{
                      y: Math.round(avgEfficiency * 10) / 10,
                      color: '#f59e0b',
                      label: `평균 ${(Math.round(avgEfficiency * 10) / 10)} MT/hr`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Tab 1: Quality Intelligence ═══ */}
      {activeTab === 1 && (
        <div className={styles.tabContent}>
          <div className={styles.section}>

            {/* 2a. Temperature Trend Chart */}
            {tempChartData.length > 0 && (
              <div className={styles.card}>
                <div className={styles.cardTitle}>
                  <Thermometer size={14} style={{ color: 'var(--w-red-500)' }} />
                  어창별 온도 추이
                </div>
                <div className={styles.chartWrap} style={{ width: '100%', overflowX: 'auto' }}>
                  <SvgLineChart
                    data={tempChartData}
                    lines={holdIds.map((id, i) => ({
                      key: id,
                      color: HOLD_COLORS[i % HOLD_COLORS.length],
                      label: id,
                    }))}
                    width={Math.max(tempChartData.length * 55, 700)}
                    height={300}
                    yLabel="℃"
                    refLine={{ y: -18, color: '#ef4444', label: '경고 라인 (-18℃)' }}
                    showLegend
                  />
                </div>
              </div>
            )}

            {/* 2b. Quality Summary Card */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <CheckCircle size={14} style={{ color: 'var(--w-emerald-500)' }} />
                품질 종합 평가
              </div>
              <div className={styles.qualitySummary}>
                {qualitySummary.avgTemp === null ? (
                  getVesselStatusKind(selectedVessel.status) === 'waiting' ? (
                    <div className={styles.qualityRow}>
                      <span className={styles.qualityIcon}>⚪</span>
                      {getTemperatureEvidenceLabel(0, true)}
                    </div>
                  ) : (
                    <div className={styles.qualityGood}>
                      <Info size={18} />
                      <div>
                        <strong>온도 데이터 없음</strong>
                        <span>화물창별 하역 온도 원자료가 없어 전체 기간 안전 여부를 판정하지 않습니다.</span>
                      </div>
                    </div>
                  )
                ) : qualitySummary.allBelowThreshold ? (
                  <div className={styles.qualityRow}>
                    <span className={styles.qualityIcon}>🟢</span>
                    {getTemperatureEvidenceLabel(1, true)}
                  </div>
                ) : (
                  <div className={styles.qualityRow}>
                    <span className={styles.qualityIcon}>🟡</span>
                    {getTemperatureEvidenceLabel(1, false)}
                  </div>
                )}
                {qualitySummary.qualityGood && (
                  <div className={styles.qualityRow}>
                    <span className={styles.qualityIcon}>✅</span>
                    외관상태 양호
                  </div>
                )}
              </div>

              {qualitySummary.minTemp !== null && (
                <div className={styles.tempStats}>
                  <div className={styles.tempStatCard}>
                    <div className={styles.tempStatLabel}>최저 온도</div>
                    <div className={styles.tempStatValue} style={{ color: 'var(--w-sky-400)' }}>
                      {qualitySummary.minTemp}℃
                    </div>
                  </div>
                  <div className={styles.tempStatCard}>
                    <div className={styles.tempStatLabel}>최고 온도</div>
                    <div className={styles.tempStatValue} style={{ color: qualitySummary.maxTemp! > -18 ? 'var(--w-red-500)' : 'var(--w-slate-50)' }}>
                      {qualitySummary.maxTemp}℃
                    </div>
                  </div>
                  <div className={styles.tempStatCard}>
                    <div className={styles.tempStatLabel}>평균 온도</div>
                    <div className={styles.tempStatValue}>
                      {fmt(qualitySummary.avgTemp!)}℃
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Tab 2: Alert Hub ═══ */}
      {activeTab === 2 && (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <Bell size={15} style={{ color: 'var(--w-amber-500)' }} />
              실시간 알림
              <span style={{ fontSize: '0.7rem', color: 'var(--w-slate-400)', fontWeight: 400, marginLeft: 'auto' }}>
                {alerts.length}건
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✅</div>
                <div>현재 발생한 알림이 없습니다.</div>
              </div>
            ) : (
              <div className={styles.alertList}>
                {alerts.map((alert, i) => (
                  <div key={i} className={styles.alertCard}>
                    {renderAlertIcon(alert.severity)}
                    <div className={styles.alertBody}>
                      <div className={styles.alertHeader}>
                        {renderSeverityBadge(alert.severity)}
                        <span className={styles.alertTitle}>{alert.title}</span>
                      </div>
                      <div className={styles.alertDesc}>{alert.description}</div>
                      {alert.timestamp && (
                        <div className={styles.alertTimestamp}>
                          <Clock size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                          {alert.timestamp}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
