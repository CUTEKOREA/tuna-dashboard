'use client';
import React, { useState } from 'react';
import { Ship, Anchor, Navigation, Package, ArrowUp, ArrowDown, MapPin } from 'lucide-react';
import s from './FleetCommandCenter.module.css';

/* ── Data ── */
export const pacificFleet = [
  { name: 'S/EXP', zone: 'S0331 W16728 (KI)', catch: 30, load: 672, capa: 1200, trend: [534, 591, 591, 612, 612, 672], status: 'fishing', note: '' },
  { name: 'S/PIO', zone: 'S0258 W16825 (KI)', catch: 0, load: 169, capa: 1200, trend: [1000, 39, 139, 139, 139, 169], status: 'fishing', note: '' },
  { name: 'S/CHA', zone: 'N0151 W15735 (KI)', catch: 0, load: 0, capa: 1200, trend: [450, 640, 800, 900, 900, 0], status: 'fishing', note: '7/28 07:40 X-MAS 입항, MING RUN 17편 약 900톤 전재 후 7/31 12:15 출항 완료' },
  { name: 'S/HAR', zone: 'S0700 W15206 (KI)', catch: 65, load: 526, capa: 1200, trend: [0, 300, 300, 310, 361, 526], status: 'fishing', note: '' },
  { name: 'S/JUP', zone: 'MAJURO', catch: 0, load: 0, capa: 1200, trend: [0, 0, 0, 0, 0, 0], status: 'port', note: '6/22 08:15 MAJURO 입항, M/E 수리 중 (출항 일정 M/E 기술자 확인)' },
  { name: 'S/SPR', zone: 'S0325 W16842 (KI)', catch: 40, load: 397, capa: 1200, trend: [75, 307, 357, 357, 357, 397], status: 'fishing', note: '' },
  { name: 'MOAMARI', zone: 'S0608 W15254 (KI)', catch: 0, load: 300, capa: 1200, trend: [0, 0, 0, 140, 210, 300], status: 'fishing', note: '' },
  { name: 'MOAKONA', zone: 'S0617 W15232 (KI)', catch: 23, load: 162, capa: 1200, trend: [284, 22, 22, 59, 80, 162], status: 'fishing', note: '' },
  { name: 'N/SUN', zone: 'S0618 W16434 (H)', catch: 0, load: 220, capa: 1200, trend: [40, 180, 190, 190, 190, 220], status: 'fishing', note: '' },
  { name: 'N/STAR', zone: 'S0642 W15142 (H)', catch: 110, load: 360, capa: 1200, trend: [650, 0, 0, 40, 90, 360], status: 'fishing', note: '' },
];

export const atlanticFleet = [
  { name: 'P/MAS', zone: 'N0357 W00250 (G)', catch: 0, load: 750, capa: 1200, trend: [0, 430, 490, 535, 750, 750], status: 'fishing', note: '7/31 09:00 TEMA 입항, 하역 후 8/3 출항 예정' },
  { name: 'P/DIS', zone: 'TEMA', catch: 0, load: 900, capa: 1200, trend: [0, 350, 420, 690, 900, 900], status: 'port', note: '7/29 12:30 TEMA 입항, 하역 후 8/1 출항 예정' },
  { name: 'P/FORE', zone: 'S0147 W01951 (H)', catch: 35, load: 690, capa: 1200, trend: [0, 380, 395, 475, 520, 690], status: 'fishing', note: '' },
  { name: 'P/PATH', zone: 'N0150 W00541 (C)', catch: 0, load: 900, capa: 1200, trend: [0, 465, 465, 660, 820, 900], status: 'fishing', note: '8/1 07:00 TEMA 입항, 하역 후 8/3 출항 예정' },
  { name: 'P/COM', zone: 'N0055 W01953 (H)', catch: 50, load: 900, capa: 1200, trend: [0, 150, 220, 450, 655, 900], status: 'fishing', note: '8/5 06:00 TEMA 입항, 하역 후 8/7 출항 예정' },
  { name: 'P/QUEEN', zone: 'N0024 W01335 (H)', catch: 40, load: 665, capa: 1200, trend: [0, 275, 305, 480, 580, 665], status: 'fishing', note: '' },
  { name: 'P/GRACE', zone: 'S0245 W02138 (H)', catch: 40, load: 370, capa: 1200, trend: [900, 50, 80, 130, 220, 370], status: 'fishing', note: '' },
];

const longlineFleet = [
  { name: 'SY-55', status: '7/19 부산 입항, 하역 및 상가수리(7/22~8/4) 후 8/8 출항 예정', badge: '입항 하역 중', badgeColor: '#38bdf8' },
  { name: 'TAIHO MARU', status: '338.699톤 (P-501, P-505) | 8/11경 부산 입항 예정', badge: '귀항 중', badgeColor: '#f59e0b' },
];

export const carrierFleet = [
  { name: 'SEIN VENUS', zone: 'BKK', capa: 5200, load: 3275, pct: Math.round(3275/5200*100), status: 'port', note: '방콕 하역 진행 상황은 하역 현황에서 확인', color: '#38bdf8' },
  { name: 'HIKARI 1', zone: 'GENSAN', capa: 3700, load: 3214, pct: Math.round(3214/3700*100), status: 'transit', note: 'GENSAN 도착 상태 확인 필요', color: '#38bdf8' },
  { name: 'SEIN KASAMA', zone: 'X-MAS', capa: 7100, load: 0, pct: 0, status: 'waiting', note: 'X-MAS 대기 중 | 예상잔량: 7,100t', color: '#f59e0b' },
  { name: 'MING RUN 17', zone: 'X-MAS', capa: 6500, load: 900, pct: Math.round(900/6500*100), status: 'waiting', note: 'X-MAS 대기 중 | C-900 전재 완료', color: '#f59e0b' },
  { name: 'SHIN IZU', zone: 'W165', capa: 2400, load: 0, pct: 0, status: 'waiting', note: 'NO2 W165 대기 중 | 예상잔량: 2,400t', color: '#f59e0b' },
  { name: 'SEIN GALAXY', zone: 'RABAUL', capa: 3500, load: 1846, pct: Math.round(1846/3500*100), status: 'waiting', note: 'MK-956, MI-890 | RABAUL 대기 중 (타사 출항 전재 예정)', color: '#f59e0b' },
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
          width: '100%', height: 4, background: 'rgba(140,170,255,0.12)',
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
    done: '✅ 완료', unloading: '📦 하역 중', waiting: '⏳ 대기', transit: '🚢 이동 중', port: '⚓ 하역·정박',
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
            {statusLabels[status] ?? '상태 확인 필요'}
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {load.toLocaleString()}t / {capa.toLocaleString()}t
        </span>
      </div>

      {/* Full-width gauge */}
      <div style={{
        width: '100%', height: 6, background: 'rgba(140,170,255,0.12)',
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
            summary="일간 268t · 월간 5,129.3t · 연간 44,657.8t"
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
            summary="일간 165t · 월간 6,025t · 연간 26,585t"
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
          <SectionHeader icon={Anchor} color="#f59e0b" title="연승선" count={longlineFleet.length} summary="입항·수리·하역 · 7/31 보고 기준" />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {longlineFleet.map(v => <LonglineCard key={v.name} {...v} />)}
          </div>
        </div>

        {/* Carriers */}
        <div className={s.rosterSection}>
          <SectionHeader icon={Package} color="#34d399" title="운반선" count={carrierFleet.length} summary="선적 9,235t · 예상잔량 9,500t" />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {carrierFleet.map(v => <CarrierCard key={v.name} {...v} />)}
          </div>
        </div>
      </div>
    </>
  );
}
