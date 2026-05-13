'use client';
import React from 'react';
import { Anchor, Navigation, AlertTriangle } from 'lucide-react';
import CountUp from 'react-countup';
import s from './FleetCommandCenter.module.css';

export default function FleetHeroKPI({ climateRisk }: { climateRisk?: any }) {
  return (
    <div className={s.heroStrip}>
      <div className={s.heroHeader}>
        <h2 className={s.heroTitle}>
          <Anchor size={20} /> 선단 운영 커맨드 센터
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>26.05.13 (수) 기준</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }} />
          <span style={{ color: '#10b981', fontSize: '0.78rem', fontWeight: 700 }}>실시간 운항 중</span>
        </div>
      </div>

      <div className={s.kpiRow}>
        <div className={`${s.kpiCard} ${s.kpiCardHighlight}`}>
          <div className={s.kpiLabel}>⚡ 5/12 일간 어획량</div>
          <div className={`${s.kpiValue} ${s.kpiValueAccent}`}><CountUp end={335} duration={2} separator="," /><span className={s.kpiUnit}>톤</span></div>
          <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: 4 }}>태평양 135t + 대서양 200t</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>📅 월간 누계 어획량</div>
          <div className={s.kpiValue}><CountUp end={6052} duration={2} separator="," /><span className={s.kpiUnit}>톤</span></div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>태평양 3,802t + 대서양 2,250t</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>📊 연간 누계 어획량</div>
          <div className={s.kpiValue}><CountUp end={41537} duration={2.5} separator="," /><span className={s.kpiUnit}>톤</span></div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>태평양 29,631.5t + 대서양 11,905t</div>
        </div>
      </div>

      {/* Ratio bar */}
      <div className={s.ratioBar}>
        <span className={s.ratioLabel} style={{ color: '#38bdf8' }}>태평양 71%</span>
        <div className={s.ratioTrack}>
          <div className={s.ratioFill} style={{ width: '71%', background: 'linear-gradient(90deg, #38bdf8, #60a5fa)' }} />
          <div className={s.ratioFill} style={{ width: '29%', background: 'linear-gradient(90deg, #a78bfa, #818cf8)' }} />
        </div>
        <span className={s.ratioLabel} style={{ color: '#a78bfa', textAlign: 'right' }}>대서양 29%</span>
      </div>

      {/* Climate alert */}
      {climateRisk && (
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
