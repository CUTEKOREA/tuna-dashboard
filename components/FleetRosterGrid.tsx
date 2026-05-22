'use client';
import React, { useState } from 'react';
import { Ship, Anchor, Navigation, Package, ArrowUp, ArrowDown, Minus, MapPin, Waves, Truck } from 'lucide-react';
import s from './FleetCommandCenter.module.css';

/* ── Data ── */
const pacificFleet = [
  { name: 'S/EXP', zone: 'KI', catch: 0, load: 319, capa: 1200, trend: [280, 295, 310, 305, 319], status: 'fishing', note: '' },
  { name: 'S/PIO', zone: 'KI', catch: 0, load: 1035, capa: 1200, trend: [820, 870, 920, 980, 1035], status: 'fishing', note: '' },
  { name: 'S/CHA', zone: 'KI', catch: 0, load: 440, capa: 1200, trend: [350, 380, 400, 420, 440], status: 'fishing', note: '' },
  { name: 'S/HAR', zone: 'US', catch: 0, load: 1200, capa: 1200, trend: [1050, 1100, 1150, 1180, 1200], status: 'returning', note: '5/26 통영 입항' },
  { name: 'S/JUP', zone: 'KI', catch: 0, load: 445, capa: 1200, trend: [360, 390, 410, 430, 445], status: 'fishing', note: '' },
  { name: 'S/SPR', zone: 'KI', catch: 0, load: 544, capa: 1200, trend: [380, 420, 460, 500, 544], status: 'fishing', note: '' },
  { name: 'MOAMARI', zone: 'H', catch: 5, load: 950, capa: 1200, trend: [850, 880, 910, 935, 950], status: 'transship', note: '5/21 TARAWA 전재' },
  { name: 'MOAKONA', zone: 'KI', catch: 5, load: 402, capa: 1200, trend: [320, 350, 370, 390, 402], status: 'fishing', note: '' },
  { name: 'N/SUN', zone: 'H', catch: 23, load: 797, capa: 1200, trend: [680, 720, 750, 775, 797], status: 'transship', note: '5/21 TARAWA 전재' },
  { name: 'N/STAR', zone: 'KI', catch: 20, load: 900, capa: 1200, trend: [780, 820, 850, 880, 900], status: 'fishing', note: '' },
];

const atlanticFleet = [
  { name: 'P/MAS', zone: 'H', catch: 10, load: 540, capa: 1200, trend: [440, 470, 500, 520, 540], status: 'fishing', note: '' },
  { name: 'P/DIS', zone: 'H', catch: 20, load: 720, capa: 1200, trend: [600, 640, 670, 700, 720], status: 'fishing', note: '' },
  { name: 'P/FORE', zone: 'H', catch: 15, load: 550, capa: 1200, trend: [450, 480, 510, 530, 550], status: 'fishing', note: '' },
  { name: 'P/PATH', zone: 'H', catch: 50, load: 410, capa: 1200, trend: [280, 320, 350, 380, 410], status: 'fishing', note: '' },
  { name: 'P/COM', zone: 'H', catch: 35, load: 445, capa: 1200, trend: [330, 360, 390, 420, 445], status: 'fishing', note: '' },
  { name: 'P/QUEEN', zone: 'H', catch: 15, load: 450, capa: 1200, trend: [360, 380, 410, 430, 450], status: 'fishing', note: '' },
  { name: 'P/GRACE', zone: 'H', catch: 10, load: 315, capa: 1200, trend: [240, 260, 280, 300, 315], status: 'fishing', note: '' },
];

const longlineFleet = [
  { name: 'SY-56', status: '상가수리(5/14~5/27) → 6/1 출항', badge: '🚢 입항', badgeColor: '#38bdf8' },
  { name: 'P-505', status: '발전기 수리 · 5/27 타히티 입항 → 5/31 출항', badge: '🔧 수리', badgeColor: '#fbbf24' },
  { name: 'GENTA MARU', status: '355t 하역 예정 (SY-52·P-502·P-501)', badge: '📦 하역', badgeColor: '#34d399' },
];

const carrierFleet = [
  { name: 'DINOK', capa: 4500, load: 4534, pct: 101, status: 'done', note: 'BKK 하역 완료', color: '#64748b' },
  { name: 'SHIN IZU', capa: 2400, load: 2301, pct: 96, status: 'unloading', note: '마산 하역 중', color: '#34d399' },
  { name: 'SEIN PHOENIX', capa: 7100, load: 6955, pct: 98, status: 'waiting', note: 'BKK 하역 대기', color: '#f59e0b' },
  { name: 'BAO LUCKY', capa: 5800, load: 4803, pct: 83, status: 'transit', note: '5/22 BKK 도착', color: '#38bdf8' },
  { name: 'SHIN FUJI', capa: 3200, load: 1670, pct: 52, status: 'waiting', note: 'TARAWA 대기', color: '#38bdf8' },
  { name: 'SEIN TOPAZ', capa: 7300, load: 100, pct: 1, status: 'waiting', note: 'TARAWA 대기', color: '#38bdf8' },
];

/* ── Status helpers ── */
const statusConfig: Record<string, { label: string; color: string; pulse: boolean }> = {
  fishing:    { label: '조업 중',   color: '#10b981', pulse: true },
  returning:  { label: '귀항 중',   color: '#f59e0b', pulse: false },
  transship:  { label: '전재 예정', color: '#38bdf8', pulse: false },
  port:       { label: '입항',      color: '#64748b', pulse: false },
};

/* ── Mini Sparkline (pure SVG) ── */
function MiniSparkline({ data, color, width = 64, height = 24 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`spark-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color.replace('#','')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      <circle cx={(data.length - 1) / (data.length - 1) * width} cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2} r="2.5" fill={color} />
    </svg>
  );
}

/* ── Vessel Card Component ── */
function VesselCard({ name, zone, catchAmt, load, capa, trend, status, note }: {
  name: string; zone: string; catchAmt: number; load: number; capa: number; trend: number[]; status: string; note: string;
}) {
  const [hovered, setHovered] = useState(false);
  const pct = Math.min(Math.round((load / capa) * 100), 100);
  const st = statusConfig[status] || statusConfig.fishing;
  const isActive = catchAmt > 0;

  // Color based on load %
  const loadColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : pct >= 40 ? '#38bdf8' : '#10b981';
  const trendDir = trend.length >= 2 ? trend[trend.length - 1] - trend[trend.length - 2] : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.2)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
        borderRadius: 12,
        padding: '16px',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${st.color}, transparent)`,
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity 0.3s',
      }} />

      {/* Header: Name + Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>{name}</span>
          <span style={{
            fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            background: `${st.color}18`, color: st.color, border: `1px solid ${st.color}30`,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {st.pulse && (
              <span style={{
                width: 5, height: 5, borderRadius: '50%', background: st.color,
                boxShadow: `0 0 6px ${st.color}`,
                display: 'inline-block',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
            )}
            {st.label}
          </span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: '0.7rem', color: 'var(--text-muted)',
        }}>
          <MapPin size={11} />
          {zone}
        </div>
      </div>

      {/* Body: Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
        {/* Daily catch */}
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2, fontWeight: 500 }}>일간 어획</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{
              fontSize: '1.3rem', fontWeight: 800,
              color: isActive ? '#10b981' : '#475569',
            }}>
              {isActive ? catchAmt : '-'}
            </span>
            {isActive && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>t</span>}
            {isActive && trendDir !== 0 && (
              <span style={{ display: 'flex', alignItems: 'center', marginLeft: 2 }}>
                {trendDir > 0 ? <ArrowUp size={12} color="#10b981" /> : <ArrowDown size={12} color="#ef4444" />}
              </span>
            )}
          </div>
        </div>

        {/* Sparkline */}
        <div style={{ opacity: hovered ? 1 : 0.7, transition: 'opacity 0.3s' }}>
          <MiniSparkline data={trend} color={loadColor} width={72} height={28} />
        </div>

        {/* Cumulative */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2, fontWeight: 500 }}>누적 적재</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>{load.toLocaleString()}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>t</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: note ? 8 : 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>적재율</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: loadColor }}>{pct}%</span>
        </div>
        <div style={{
          width: '100%', height: 4, background: 'rgba(255,255,255,0.06)',
          borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%', borderRadius: 2,
            background: `linear-gradient(90deg, ${loadColor}88, ${loadColor})`,
            transition: 'width 1s ease',
          }} />
        </div>
      </div>

      {/* Note */}
      {note && (
        <div style={{
          fontSize: '0.7rem', color: st.color, fontWeight: 500,
          padding: '4px 8px', borderRadius: 6,
          background: `${st.color}08`,
          marginTop: 4,
        }}>
          {note}
        </div>
      )}
    </div>
  );
}

/* ── Carrier Card Component ── */
function CarrierCard({ name, capa, load, pct, status, note, color }: {
  name: string; capa: number; load: number; pct: number; status: string; note: string; color: string;
}) {
  const [hovered, setHovered] = useState(false);
  const isDone = status === 'done';
  const statusLabels: Record<string, string> = {
    done: '✅ 완료', unloading: '📦 하역 중', waiting: '⏳ 대기', transit: '🚢 이동 중',
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.2)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
        borderRadius: 12,
        padding: '14px 16px',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-1px)' : 'none',
        opacity: isDone ? 0.6 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', textDecoration: isDone ? 'line-through' : 'none' }}>{name}</span>
          <span style={{
            fontSize: '0.62rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            background: `${color}18`, color, border: `1px solid ${color}30`,
          }}>
            {statusLabels[status] || status}
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {load.toLocaleString()}t / {capa.toLocaleString()}t
        </span>
      </div>

      {/* Full-width gauge */}
      <div style={{
        width: '100%', height: 6, background: 'rgba(255,255,255,0.06)',
        borderRadius: 3, overflow: 'hidden', marginBottom: 6,
      }}>
        <div style={{
          width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: 3,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: 'width 1s ease',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{note}</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{pct}%</span>
      </div>
    </div>
  );
}

/* ── Longline Card ── */
function LonglineCard({ name, status, badge, badgeColor }: { name: string; status: string; badge: string; badgeColor: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.2)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: 'all 0.25s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>{name}</span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{status}</span>
      </div>
      <span style={{
        fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px',
        borderRadius: 20, background: `${badgeColor}18`,
        color: badgeColor, border: `1px solid ${badgeColor}30`,
      }}>
        {badge}
      </span>
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ icon: Icon, color, title, count, summary }: {
  icon: any; color: string; title: string; count: number; summary: string;
}) {
  return (
    <div style={{
      padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: '1px solid var(--panel-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={color} />
        </div>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{count}척 운항</div>
        </div>
      </div>
      <div style={{
        fontSize: '0.72rem', color: '#34d399', fontWeight: 600,
        padding: '4px 12px', borderRadius: 20,
        background: 'rgba(52,211,153,0.08)',
        border: '1px solid rgba(52,211,153,0.15)',
      }}>
        {summary}
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function FleetRosterGrid() {
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      <div className={s.rosterGrid}>
        {/* Pacific */}
        <div className={s.rosterSection}>
          <SectionHeader
            icon={Navigation} color="#38bdf8"
            title="태평양 선망" count={pacificFleet.length}
            summary="주간 923t · 월간 3,233t · 연간 19,760t"
          />
          <div data-mobile-stack style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {pacificFleet.map(v => (
              <VesselCard
                key={v.name} name={v.name} zone={v.zone}
                catchAmt={v.catch} load={v.load} capa={v.capa}
                trend={v.trend} status={v.status} note={v.note}
              />
            ))}
          </div>
        </div>

        {/* Atlantic */}
        <div className={s.rosterSection}>
          <SectionHeader
            icon={Ship} color="#a78bfa"
            title="대서양 선망" count={atlanticFleet.length}
            summary="주간 485t · 월간 1,747t · 연간 11,050t"
          />
          <div data-mobile-stack style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {atlanticFleet.map(v => (
              <VesselCard
                key={v.name} name={v.name} zone={v.zone}
                catchAmt={v.catch} load={v.load} capa={v.capa}
                trend={v.trend} status={v.status} note={v.note}
              />
            ))}
          </div>
        </div>

        {/* Longline */}
        <div className={s.rosterSection}>
          <SectionHeader icon={Anchor} color="#f59e0b" title="연승선" count={longlineFleet.length} summary="입항·수리·하역" />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {longlineFleet.map(v => <LonglineCard key={v.name} {...v} />)}
          </div>
        </div>

        {/* Carriers */}
        <div className={s.rosterSection}>
          <SectionHeader icon={Package} color="#34d399" title="운반선" count={carrierFleet.length} summary="선적 15,829t · 잔량 6,163t" />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {carrierFleet.map(v => <CarrierCard key={v.name} {...v} />)}
          </div>
        </div>
      </div>
    </>
  );
}
