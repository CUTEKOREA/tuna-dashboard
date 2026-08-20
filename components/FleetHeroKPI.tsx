'use client';
import React from 'react';
import { Anchor, Navigation } from 'lucide-react';
import CountUp from 'react-countup';
import {
  atlanticDailyReport,
  pacificDailyReport,
  purseSeineCatch,
} from '@/lib/fleet-operations-2026-08-16';
import TelemetryBadge from './TelemetryBadge';
import s from './FleetCommandCenter.module.css';

export default function FleetHeroKPI({ climateRisk, mode = 'daily' }: { climateRisk?: any; mode?: 'daily' | 'weekly' }) {
  const isWeekly = mode === 'weekly';
  const summary = purseSeineCatch.summary;

  // 일일 KPI 는 일일보고(태평양·대서양 선망)에서, 주간 KPI 는 주간 실적에서 온다.
  // 한때 일일 분기가 주간 분기의 복사본이라 「일일 운영」 탭이 주간 수치를 보여줬다 —
  // 자료가 있는데 화면이 안 쓰고 있었다.
  const pac = pacificDailyReport;
  const atl = atlanticDailyReport;
  const dailyTotal = pac.dailyCatchMt + atl.dailyCatchMt;
  const dailyMonthly = pac.monthlyCatchMt + atl.monthlyCatchMt;
  const dailyAnnual = pac.annualCatchMt + atl.annualCatchMt;
  const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
  const mt = (v: number) => v.toLocaleString('ko-KR');

  const kpiData = isWeekly
    ? {
        title: '주간 총 어획량',
        val1: summary.weeklyTotal, label1: `국적 ${summary.nationalWeekly}t + 합작 ${summary.jointWeekly}t`,
        val2: summary.monthlyTotal, label2: `국적 ${mt(summary.nationalMonthly)}t + 합작 ${mt(summary.jointMonthly)}t`,
        val3: summary.annualTotal, label3: `국적 ${mt(summary.nationalAnnual)}t + 합작 ${mt(summary.jointAnnual)}t`,
        ratioLeftLabel: `국적 ${pct(summary.nationalWeekly, summary.weeklyTotal)}%`,
        ratioRightLabel: `합작 ${pct(summary.jointWeekly, summary.weeklyTotal)}%`,
        ratioPercent: (summary.nationalWeekly / summary.weeklyTotal) * 100,
        syncDate: '26.08.10~08.16 · 8월 둘째주',
        badgeDate: purseSeineCatch.period.to,
      }
    : {
        title: '일일 총 어획량',
        val1: dailyTotal, label1: `태평양 ${mt(pac.dailyCatchMt)}t + 대서양 ${mt(atl.dailyCatchMt)}t`,
        val2: dailyMonthly, label2: `태평양 ${mt(pac.monthlyCatchMt)}t + 대서양 ${mt(atl.monthlyCatchMt)}t`,
        val3: dailyAnnual, label3: `태평양 ${mt(pac.annualCatchMt)}t + 대서양 ${mt(atl.annualCatchMt)}t`,
        ratioLeftLabel: `태평양 ${pct(pac.dailyCatchMt, dailyTotal)}%`,
        ratioRightLabel: `대서양 ${pct(atl.dailyCatchMt, dailyTotal)}%`,
        ratioPercent: dailyTotal > 0 ? (pac.dailyCatchMt / dailyTotal) * 100 : 0,
        syncDate: `${pac.asOf.slice(2).replace(/-/g, '.')} 기준 · ${pac.source.split('-').pop()}`,
        badgeDate: pac.asOf,
      };

  return (
    <div className={s.heroStrip}>
      <div className={s.heroHeader}>
        <h2 className={s.heroTitle}>
          <Anchor size={20} /> 선단 운영 커맨드 센터
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{kpiData.syncDate}</span>
        </h2>
        <TelemetryBadge status="STATIC" syncDate={kpiData.badgeDate} label="첨부 원문" />
      </div>

      <div className={s.kpiRow}>
        <div className={`${s.kpiCard} ${s.kpiCardHighlight}`}>
          <div className={s.kpiLabel}>{isWeekly ? '📊' : '⚡'} {kpiData.title}</div>
          <div className={`${s.kpiValue} ${s.kpiValueAccent}`} data-kpi-value={kpiData.val1}><CountUp end={kpiData.val1} duration={2} separator="," /><span className={s.kpiUnit}>MT</span></div>
          <div style={{ fontSize: '0.72rem', color: 'var(--dsc-ink-muted)', marginTop: 4 }}>{kpiData.label1}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>{'📅'} 월간 총 어획량</div>
          <div className={s.kpiValue}><CountUp end={kpiData.val2} duration={2} separator="," /><span className={s.kpiUnit}>MT</span></div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{kpiData.label2}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>{'📈'} 연간 총 어획량</div>
          <div className={s.kpiValue}><CountUp end={kpiData.val3} duration={2.5} separator="," /><span className={s.kpiUnit}>MT</span></div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{kpiData.label3}</div>
        </div>
      </div>

      {/* Ratio bar */}
      <div className={s.ratioBar}>
        <span className={s.ratioLabel} style={{ color: 'var(--accent-primary)' }}>{kpiData.ratioLeftLabel}</span>
        <div className={s.ratioTrack}>
          <div className={s.ratioFill} style={{ width: `${kpiData.ratioPercent}%`, background: 'var(--accent-primary)' }} />
          <div className={s.ratioFill} style={{ width: `${100 - kpiData.ratioPercent}%`, background: 'var(--dsc-ink-faint)' }} />
        </div>
        <span className={s.ratioLabel} style={{ color: 'var(--dsc-ink-muted)', textAlign: 'right' }}>{kpiData.ratioRightLabel}</span>
      </div>

      {/* Climate alert */}
      {climateRisk && !isWeekly && (
        <div className={s.alertBar} style={{ marginTop: 16 }}>
          <Navigation size={18} color="var(--color-warning)" />
          <div>
            <strong style={{ color: 'var(--color-warning)' }}>SST 변동: {climateRisk.sstAnomaly}</strong>
            <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{climateRisk.impact}</span>
          </div>
          <span className={s.statusBadge} style={{ background: 'rgba(var(--w-red-500-rgb), 0.1)', color: 'var(--color-danger)', marginLeft: 'auto' }}>Risk: {climateRisk.riskLevel}</span>
        </div>
      )}
    </div>
  );
}
