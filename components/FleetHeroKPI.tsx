'use client';
import React from 'react';
import { Anchor, Navigation } from 'lucide-react';
import CountUp from 'react-countup';
import s from './FleetCommandCenter.module.css';

export default function FleetHeroKPI({ climateRisk, mode = 'daily' }: { climateRisk?: any; mode?: 'daily' | 'weekly' }) {
  const isWeekly = mode === 'weekly';

  const kpiData = isWeekly
    ? {
        title: '주간 총 어획량',
        val1: 1009, label1: '국적 587t + 합작 422t',
        val2: 3445, label2: '국적 1,531t + 합작 1,914t',
        val3: 42974, label3: '국적 25,592t + 합작 17,382t',
        ratioLeftLabel: '국적 58%', ratioRightLabel: '합작 42%', ratioPercent: 58,
        syncDate: '26.07.27 (월) 주간 실적 기준',
        syncLabel: 'STATIC · 주간 실적보고 26.07.27 동기화'
      }
    : {
        title: '일일 총 어획량',
        val1: 433, label1: '태평양 268t + 대서양 165t',
        val2: 11154, label2: '태평양 5,129.3t + 대서양 6,025t',
        val3: 71243, label3: '태평양 44,657.8t + 대서양 26,585t',
        ratioLeftLabel: '태평양 63%', ratioRightLabel: '대서양 37%', ratioPercent: 63,
        syncDate: '26.07.31 (금) 기준',
        syncLabel: 'STATIC · 일일 업무보고 26.07.31 동기화'
      };

  return (
    <div className={s.heroStrip}>
      <div className={s.heroHeader}>
        <h2 className={s.heroTitle}>
          <Anchor size={20} /> 선단 운영 커맨드 센터
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{kpiData.syncDate}</span>
        </h2>
        {/* L-09: 정적 일일보고 데이터 — 라이브 위장 배지 금지, STATIC 정직 표기 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.25)', borderRadius: '20px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700 }}>{kpiData.syncLabel}</span>
        </div>
      </div>

      <div className={s.kpiRow}>
        <div className={`${s.kpiCard} ${s.kpiCardHighlight}`}>
          <div className={s.kpiLabel}>{isWeekly ? '📊' : '⚡'} {kpiData.title}</div>
          <div className={`${s.kpiValue} ${s.kpiValueAccent}`}><CountUp end={kpiData.val1} duration={2} separator="," /><span className={s.kpiUnit}>MT</span></div>
          <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: 4 }}>{kpiData.label1}</div>
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
        <span className={s.ratioLabel} style={{ color: '#38bdf8' }}>{kpiData.ratioLeftLabel}</span>
        <div className={s.ratioTrack}>
          <div className={s.ratioFill} style={{ width: `${kpiData.ratioPercent}%`, background: 'linear-gradient(90deg, #38bdf8, #60a5fa)' }} />
          <div className={s.ratioFill} style={{ width: `${100 - kpiData.ratioPercent}%`, background: 'linear-gradient(90deg, #a78bfa, #818cf8)' }} />
        </div>
        <span className={s.ratioLabel} style={{ color: '#a78bfa', textAlign: 'right' }}>{kpiData.ratioRightLabel}</span>
      </div>

      {/* Climate alert */}
      {climateRisk && !isWeekly && (
        <div className={s.alertBar} style={{ marginTop: 16 }}>
          <Navigation size={18} color="var(--color-warning)" />
          <div>
            <strong style={{ color: 'var(--color-warning)' }}>SST 변동: {climateRisk.sstAnomaly}</strong>
            <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{climateRisk.impact}</span>
          </div>
          <span className={s.statusBadge} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', marginLeft: 'auto' }}>Risk: {climateRisk.riskLevel}</span>
        </div>
      )}
    </div>
  );
}
