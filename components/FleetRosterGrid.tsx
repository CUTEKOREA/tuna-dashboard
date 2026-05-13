'use client';
import React from 'react';
import { Ship, Anchor, Navigation, Package } from 'lucide-react';
import s from './FleetCommandCenter.module.css';

const pacificFleet = [
  { name: 'S/EXP', pos: 'S0207 W17245 (KI)', catch: 14, load: 214, note: '' },
  { name: 'S/PIO', pos: 'S0355 W16843 (KI)', catch: 35, load: 940, note: '' },
  { name: 'S/CHA', pos: 'S0313 W16952 (KI)', catch: 10, load: 280, note: '' },
  { name: 'S/HAR', pos: 'S0059 E17730 (KI)', catch: 0, load: 1200, note: '5/11 현장발, 5/27경 한국 도착 예정' },
  { name: 'S/JUP', pos: 'S0250 W17307 (KI)', catch: 0, load: 280, note: '' },
  { name: 'S/SPR', pos: 'S0210 W17227 (KI)', catch: 9, load: 214, note: '' },
  { name: 'MOAMARI', pos: 'N0400 W17359 (H)', catch: 0, load: 795, note: '' },
  { name: 'MOAKONA', pos: 'S0205 W17219 (KI)', catch: 7, load: 304, note: '' },
  { name: 'N/SUN', pos: 'N0411 W17358 (H)', catch: 25, load: 767, note: '' },
  { name: 'N/STAR', pos: 'S0206 W17220 (KI)', catch: 35, load: 745, note: '' },
];

const atlanticFleet = [
  { name: 'P/MAS', pos: 'N0124 W00950 (H)', catch: 20, load: 330 },
  { name: 'P/DIS', pos: 'N0135 W00829 (L)', catch: 30, load: 530 },
  { name: 'P/FORE', pos: 'N0040 W01216 (H)', catch: 40, load: 385 },
  { name: 'P/PATH', pos: 'N0107 W01623 (H)', catch: 30, load: 265 },
  { name: 'P/COM', pos: 'N0146 W01716 (H)', catch: 35, load: 275 },
  { name: 'P/QUEEN', pos: 'N0155 W01512 (H)', catch: 15, load: 290 },
  { name: 'P/GRACE', pos: 'N0109 W01616 (H)', catch: 30, load: 175 },
];

const longlineFleet = [
  { name: 'SY-51', status: '3/14 부산 입항, 하역 및 상가수리(3/17~3/31) 후 5/16 출항 예정', badge: '🔧 수리', badgeColor: '#fbbf24' },
  { name: 'SY-56', status: '4/12 현장발, 5/11 부산 입항. 하역 및 상가수리(5/14~5/27) 후 6/1 출항 예정 (269.594t)', badge: '🚢 입항', badgeColor: '#38bdf8' },
  { name: 'GENTA MARU', status: '355.126t (SY-52, P-502, P-501). 5/22 P-502 155.725t, 5/26 P-501 102.011t, 5/29 SY-52 97.390t 하역 예정', badge: '📦 하역', badgeColor: '#34d399' },
];

const carrierFleet = [
  { name: 'DINOK', capa: 4500, load: 4385, note: 'BKK 하역 중 (E-66, J-630, C-900, H-1,210, S-450, E-1,129)', done: false },
  { name: 'SEIN PHOENIX', capa: 7100, load: 6955, note: 'BKK 하역 대기 중 (NT-1,080, MK-750, S-420, J-1,030, P-1,080, H-930, MI-485, S-1,180)', done: false },
  { name: 'BAO LUCKY', capa: 5800, load: 4803, note: '5/22 BKK 도착 예정 (MI-885, NT-1,035, C-865, P-375, MK-870, E-773, 타사 물량-930)', done: false },
  { name: 'SHIN IZU', capa: 2400, load: 2301, note: '5/17 한국 도착 예정 (S-50(20), C-130, P-200, MK-69(49), E-117(92), J-730, S-1,005)', done: false },
  { name: 'SHIN FUJI', capa: 3200, load: 3200, note: 'TARAWA 대기 중', done: false },
  { name: 'SEIN TOPAZ', capa: 7300, load: 5918, note: 'TARAWA 대기 중 (타사 물량-1,381.80)', done: false },
];

function VesselRow({ name, pos, catchAmt, load }: { name: string; pos: string; catchAmt: number; load: number }) {
  const isActive = catchAmt > 0;
  const zoneMatch = pos.match(/\(([^)]+)\)/);
  const zone = zoneMatch ? zoneMatch[1] : pos;
  return (
    <div className={s.vesselCard} title={pos}>
      <div>
        <div className={s.vesselName}>{name}</div>
        <div className={s.vesselMeta}>{zone} 수역</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          일간 <span style={{ color: isActive ? '#34d399' : '#64748b', fontWeight: 600 }}>{catchAmt > 0 ? `${catchAmt}t` : '-'}</span>
          {' / '}누적 <span style={{ color: '#f59e0b', fontWeight: 600 }}>{load > 0 ? `${load}t` : '-'}</span>
        </div>
      </div>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? '#10b981' : load > 0 ? '#f59e0b' : '#475569', boxShadow: isActive ? '0 0 6px #10b981' : 'none' }} />
    </div>
  );
}

function CarrierRow({ name, capa, load, note, done }: { name: string; capa: number; load: number; note: string; done: boolean }) {
  const pct = capa > 0 ? Math.round((load / capa) * 100) : 0;
  const color = done ? '#64748b' : pct > 90 ? '#34d399' : pct > 60 ? '#f59e0b' : '#38bdf8';
  return (
    <div className={s.vesselCard}>
      <div>
        <div className={s.vesselName}>{name}</div>
        <div className={s.vesselMeta}>용량 {capa.toLocaleString()}t</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>{load > 0 ? `${load.toLocaleString()}t` : '대기'}</span>
          <span style={{ color }}>{pct > 0 ? `${pct}%` : '-'}</span>
        </div>
        <div className={s.miniGauge}>
          <div className={s.miniGaugeFill} style={{ width: `${pct}%`, background: color }} />
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{note}</div>
      </div>
      <div />
    </div>
  );
}

export default function FleetRosterGrid() {
  return (
    <div className={s.rosterGrid}>
      {/* Pacific */}
      <div className={s.rosterSection}>
        <div className={s.rosterHeader}>
          <Navigation size={16} color="#38bdf8" /> 태평양 선망 ({pacificFleet.length}척)
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>5/12 일간 135t · 월간 3,802t · 연간 29,631.5t</span>
        </div>
        <div className={s.rosterBody}>
          {pacificFleet.map(v => <VesselRow key={v.name} name={v.name} pos={v.pos} catchAmt={v.catch} load={v.load} />)}
        </div>
      </div>

      {/* Atlantic */}
      <div className={s.rosterSection}>
        <div className={s.rosterHeader}>
          <Ship size={16} color="#a78bfa" /> 대서양 선망 ({atlanticFleet.length}척)
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>5/12 일간 200t · 월간 2,250t · 연간 11,905t</span>
        </div>
        <div className={s.rosterBody}>
          {atlanticFleet.map(v => <VesselRow key={v.name} name={v.name} pos={v.pos} catchAmt={v.catch} load={v.load} />)}
        </div>
      </div>

      {/* Longline */}
      <div className={s.rosterSection}>
        <div className={s.rosterHeader}>
          <Anchor size={16} color="#f59e0b" /> 연승선 ({longlineFleet.length}척)
        </div>
        <div className={s.rosterBody}>
          {longlineFleet.map(v => (
            <div key={v.name} className={s.vesselCard}>
              <div>
                <div className={s.vesselName}>{v.name}</div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.status}</div>
              <span className={s.statusBadge} style={{ background: `${v.badgeColor}20`, color: v.badgeColor }}>{v.badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Carriers */}
      <div className={s.rosterSection}>
        <div className={s.rosterHeader}>
          <Package size={16} color="#34d399" /> 운반선 ({carrierFleet.length}척)
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>선적량 18,444(161)t · 예상잔량 9,118t</span>
        </div>
        <div className={s.rosterBody}>
          {carrierFleet.map(v => <CarrierRow key={v.name} {...v} />)}
        </div>
      </div>
    </div>
  );
}
