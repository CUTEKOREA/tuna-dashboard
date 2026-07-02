'use client';
import React from 'react';
import { Anchor, Navigation } from 'lucide-react';
import CountUp from 'react-countup';
import s from './FleetCommandCenter.module.css';

export default function FleetHeroKPI({ climateRisk }: { climateRisk?: any }) {
  return (
    <div className={s.heroStrip}>
      <div className={s.heroHeader}>
        <h2 className={s.heroTitle}>
          <Anchor size={20} /> 선단 운영 커맨드 센터
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>26.06.24 (수) 기준</span>
        </h2>
        {/* L-09: 정적 일일보고 데이터 — 라이브 위장 배지 금지, STATIC 정직 표기 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.25)', borderRadius: '20px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700 }}>STATIC · 일일 업무보고 26.06.24 동기화</span>
        </div>
      </div>

      <div className={s.kpiRow}>
        <div className={`${s.kpiCard} ${s.kpiCardHighlight}`}>
          <div className={s.kpiLabel}>{'⚡'} 일일 총 어획량</div>
          <div className={`${s.kpiValue} ${s.kpiValueAccent}`}><CountUp end={540} duration={2} separator="," /><span className={s.kpiUnit}>MT</span></div>
          <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: 4 }}>국적선 285t + 합작선 255t</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>{'📅'} 월간 총 어획량</div>
          <div className={s.kpiValue}><CountUp end={8504} duration={2} separator="," /><span className={s.kpiUnit}>MT</span></div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>국적선 5,434t + 합작선 3,070t</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>{'📊'} 연간 총 어획량</div>
          <div className={s.kpiValue}><CountUp end={56701} duration={2.5} separator="," /><span className={s.kpiUnit}>MT</span></div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>국적선 38,846t + 합작선 17,855t</div>
        </div>
      </div>

      {/* Ratio bar */}
      <div className={s.ratioBar}>
        <span className={s.ratioLabel} style={{ color: '#38bdf8' }}>국적선 64%</span>
        <div className={s.ratioTrack}>
          <div className={s.ratioFill} style={{ width: '64%', background: 'linear-gradient(90deg, #38bdf8, #60a5fa)' }} />
          <div className={s.ratioFill} style={{ width: '36%', background: 'linear-gradient(90deg, #a78bfa, #818cf8)' }} />
        </div>
        <span className={s.ratioLabel} style={{ color: '#a78bfa', textAlign: 'right' }}>합작선 36%</span>
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
