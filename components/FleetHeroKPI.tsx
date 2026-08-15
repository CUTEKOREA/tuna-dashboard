'use client';
import React from 'react';
import { Anchor, Navigation } from 'lucide-react';
import CountUp from 'react-countup';
import { purseSeineCatch } from '@/lib/fleet-operations-2026-08-09';
import TelemetryBadge from './TelemetryBadge';
import s from './FleetCommandCenter.module.css';

export default function FleetHeroKPI({ climateRisk, mode = 'daily' }: { climateRisk?: any; mode?: 'daily' | 'weekly' }) {
  const isWeekly = mode === 'weekly';
  const summary = purseSeineCatch.summary;

  const kpiData = isWeekly
    ? {
        title: '주간 총 어획량',
        val1: summary.weeklyTotal, label1: `국적 ${summary.nationalWeekly}t + 합작 ${summary.jointWeekly}t`,
        val2: summary.monthlyTotal, label2: `국적 ${summary.nationalMonthly.toLocaleString()}t + 합작 ${summary.jointMonthly.toLocaleString()}t`,
        val3: summary.annualTotal, label3: `국적 ${summary.nationalAnnual.toLocaleString()}t + 합작 ${summary.jointAnnual.toLocaleString()}t`,
        ratioLeftLabel: '국적 36%', ratioRightLabel: '합작 64%', ratioPercent: summary.nationalWeekly / summary.weeklyTotal * 100,
        syncDate: '26.08.03~08.09 · 8월 첫째주',
      }
    : {
        title: '주간 총 어획량',
        val1: summary.weeklyTotal, label1: `국적 ${summary.nationalWeekly}t + 합작 ${summary.jointWeekly}t`,
        val2: summary.monthlyTotal, label2: `국적 ${summary.nationalMonthly.toLocaleString()}t + 합작 ${summary.jointMonthly.toLocaleString()}t`,
        val3: summary.annualTotal, label3: `국적 ${summary.nationalAnnual.toLocaleString()}t + 합작 ${summary.jointAnnual.toLocaleString()}t`,
        ratioLeftLabel: '국적 36%', ratioRightLabel: '합작 64%', ratioPercent: summary.nationalWeekly / summary.weeklyTotal * 100,
        syncDate: '26.08.03~08.09 · 8월 첫째주',
      };

  return (
    <div className={s.heroStrip}>
      <div className={s.heroHeader}>
        <h2 className={s.heroTitle}>
          <Anchor size={20} /> 선단 운영 커맨드 센터
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{kpiData.syncDate}</span>
        </h2>
        <TelemetryBadge status="STATIC" syncDate="2026-08-09" label="첨부 원문" />
      </div>

      <div className={s.kpiRow}>
        <div className={`${s.kpiCard} ${s.kpiCardHighlight}`}>
          <div className={s.kpiLabel}>{isWeekly ? '📊' : '⚡'} {kpiData.title}</div>
          <div className={`${s.kpiValue} ${s.kpiValueAccent}`}><CountUp end={kpiData.val1} duration={2} separator="," /><span className={s.kpiUnit}>MT</span></div>
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
