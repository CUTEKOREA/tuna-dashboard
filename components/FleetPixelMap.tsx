'use client';

import React, { useMemo } from 'react';
import s from './FleetPixelMap.module.css';

// --- Data ---
const pacificFleet = [
  { name: 'S/EXP', zone: 'S0331 W16728 (KI)', type: 'pacific', status: 'fishing', note: '', load: 672, capa: 1200 },
  { name: 'S/PIO', zone: 'S0258 W16825 (KI)', type: 'pacific', status: 'fishing', note: '', load: 169, capa: 1200 },
  { name: 'S/CHA', zone: 'N0151 W15735 (KI)', type: 'pacific', status: 'fishing', note: '7/28 07:40 X-MAS 입항, MING RUN 17편 약 900톤 전재 후 7/31 12:15 출항 완료', load: 0, capa: 1200 },
  { name: 'S/HAR', zone: 'S0700 W15206 (KI)', type: 'pacific', status: 'fishing', note: '', load: 526, capa: 1200 },
  { name: 'S/JUP', zone: 'MAJURO', type: 'pacific', status: 'port', note: 'M/E 수리 중 (출항 일정 기술자 확인)', load: 0, capa: 1200 },
  { name: 'S/SPR', zone: 'S0325 W16842 (KI)', type: 'pacific', status: 'fishing', note: '', load: 397, capa: 1200 },
  { name: 'MOAMARI', zone: 'S0608 W15254 (KI)', type: 'pacific', status: 'fishing', note: '', load: 300, capa: 1200 },
  { name: 'MOAKONA', zone: 'S0617 W15232 (KI)', type: 'pacific', status: 'fishing', note: '', load: 162, capa: 1200 },
  { name: 'N/SUN', zone: 'S0618 W16434 (H)', type: 'pacific', status: 'fishing', note: '', load: 220, capa: 1200 },
  { name: 'N/STAR', zone: 'S0642 W15142 (H)', type: 'pacific', status: 'fishing', note: '', load: 360, capa: 1200 },
];

const atlanticFleet = [
  { name: 'P/MAS', zone: 'N0357 W00250 (G)', type: 'atlantic', status: 'fishing', note: '7/31 09:00 TEMA 입항, 하역 후 8/3 출항 예정', load: 750, capa: 1200 },
  { name: 'P/DIS', zone: 'TEMA', type: 'atlantic', status: 'port', note: '7/29 12:30 TEMA 입항, 하역 후 8/1 출항 예정', load: 900, capa: 1200 },
  { name: 'P/FORE', zone: 'S0147 W01951 (H)', type: 'atlantic', status: 'fishing', note: '', load: 690, capa: 1200 },
  { name: 'P/PATH', zone: 'N0150 W00541 (C)', type: 'atlantic', status: 'fishing', note: '8/1 07:00 TEMA 입항, 하역 후 8/3 출항 예정', load: 900, capa: 1200 },
  { name: 'P/COM', zone: 'N0055 W01953 (H)', type: 'atlantic', status: 'fishing', note: '8/5 06:00 TEMA 입항, 하역 후 8/7 출항 예정', load: 900, capa: 1200 },
  { name: 'P/QUEEN', zone: 'N0024 W01335 (H)', type: 'atlantic', status: 'fishing', note: '', load: 665, capa: 1200 },
  { name: 'P/GRACE', zone: 'S0245 W02138 (H)', type: 'atlantic', status: 'fishing', note: '', load: 370, capa: 1200 },
];

const carrierFleet = [
  { name: 'SEIN VENUS', zone: '해상', type: 'carrier', status: 'transit', note: '8/5 BKK 도착 예정', load: 3275, capa: 5200 },
  { name: 'HIKARI 1', zone: '해상', type: 'carrier', status: 'transit', note: '8/5 GENSAN 도착 예정', load: 3214, capa: 3700 },
  { name: 'SEIN KASAMA', zone: 'X-MAS', type: 'carrier', status: 'port', note: 'X-MAS 대기 중 (예상잔량 7,100t)', load: 0, capa: 7100 },
  { name: 'MING RUN 17', zone: 'X-MAS', type: 'carrier', status: 'port', note: 'X-MAS 대기 중 (C-900 전재 완료)', load: 900, capa: 6500 },
  { name: 'SHIN IZU', zone: '해상', type: 'carrier', status: 'port', note: 'NO2 W165 대기 중 (예상잔량 2,400t)', load: 0, capa: 2400 },
  { name: 'SEIN GALAXY', zone: 'RABAUL', type: 'carrier', status: 'port', note: 'RABAUL 대기 중 (타사 출항 전재 예정)', load: 1846, capa: 3500 },
];

function getPacificCoordinates(zone: string): { x: number; y: number } {
  const z = zone.toUpperCase();
  if (z.includes('부산') || z.includes('통영')) return { x: 22, y: 35 };
  if (z.includes('BKK')) return { x: 18, y: 48 }; 
  if (z.includes('TARAWA')) return { x: 55, y: 55 };
  if (z.includes('FUNAFUTI')) return { x: 58, y: 62 };
  if (z.includes('MAJURO')) return { x: 48, y: 48 };
  if (z.includes('X-MAS')) return { x: 65, y: 60 };
  if (z.includes('GENSAN')) return { x: 28, y: 50 };
  if (z.includes('RABAUL')) return { x: 42, y: 58 };

  if (/[SN]0\d{3}\s?W1/.test(z)) {
    const isUS = z.includes('(US)');
    const isH = z.includes('(H)');
    if (isUS) return { x: 65, y: 50 };
    if (isH) return { x: 62, y: 58 };
    return { x: 45 + (Math.random() * 15), y: 45 + (Math.random() * 15) };
  }
  return { x: 50, y: 50 };
}

function getAtlanticCoordinates(zone: string): { x: number; y: number } {
  const z = zone.toUpperCase();
  if (z.includes('TEMA') || z.includes('ABIDJAN')) return { x: 75, y: 55 }; 
  
  if (/[SN]0\d{3}\s?W0/.test(z)) {
    return { x: 35 + (Math.random() * 25), y: 40 + (Math.random() * 20) };
  }
  return { x: 50, y: 50 };
}

const ShipMarker = ({ ship }: { ship: any }) => (
  <div 
    className={`${s.shipMarker} ${s[`fleet-${ship.type}`]} ${s[`state-${ship.status === 'transship' ? 'transit' : ship.status}`]}`} 
    style={{ left: `${ship.pos.x}%`, top: `${ship.pos.y}%` }}
  >
    <div className={s.shipBody}></div>
    <div className={s.tooltip}>
      <div className={s.tooltipTitle}>{ship.name} <span style={{fontSize:'10px', color:'#94a3b8', fontWeight:'normal'}}>({ship.type})</span></div>
      <div className={s.tooltipInfo}>
        <div className={s.tooltipRow}>
          <span className={s.tooltipLabel}>위치</span>
          <span className={s.tooltipValue} style={{color:'#fff'}}>{ship.zone}</span>
        </div>
        <div className={s.tooltipRow}>
          <span className={s.tooltipLabel}>상태</span>
          <span className={s.tooltipValue}>
            {ship.status === 'fishing' && '조업 중 🎣'}
            {(ship.status === 'transit' || ship.status === 'transship') && '이동/전재 🌊'}
            {ship.status === 'port' && '하역/정박 ⚓'}
          </span>
        </div>
        <div className={s.tooltipRow}>
          <span className={s.tooltipLabel}>적재량</span>
          <span className={s.tooltipValue}>{ship.load.toLocaleString()} / {ship.capa.toLocaleString()} t</span>
        </div>
      </div>
      {ship.note && <div className={s.tooltipNote}>{ship.note}</div>}
    </div>
  </div>
);

export default function FleetPixelMap() {
  
  const mappedPacific = useMemo(() => {
    const positions: Record<string, number> = {};
    const combined = [...pacificFleet, ...carrierFleet];
    return combined.map((ship) => {
      const basePos = getPacificCoordinates(ship.zone);
      const posKey = `${basePos.x}-${basePos.y}`;
      if (positions[posKey]) {
        positions[posKey] += 1;
        basePos.x += (positions[posKey] * 2) * (positions[posKey] % 2 === 0 ? 1 : -1);
        basePos.y += (positions[posKey] * 2);
      } else {
        positions[posKey] = 1;
      }
      return { ...ship, pos: basePos };
    });
  }, []);

  const mappedAtlantic = useMemo(() => {
    const positions: Record<string, number> = {};
    return atlanticFleet.map((ship) => {
      const basePos = getAtlanticCoordinates(ship.zone);
      const posKey = `${basePos.x}-${basePos.y}`;
      if (positions[posKey]) {
        positions[posKey] += 1;
        basePos.x += (positions[posKey] * 2.5) * (positions[posKey] % 2 === 0 ? 1 : -1);
        basePos.y += (positions[posKey] * 2.5);
      } else {
        positions[posKey] = 1;
      }
      return { ...ship, pos: basePos };
    });
  }, []);

  return (
    <div className={s.mapsGrid}>
      {/* Pacific Map */}
      <div className={s.mapColumn}>
        <h4 className={s.mapTitle}>🌊 태평양 수역 <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>(국적·합작선 및 운반선)</span></h4>
        <div className={s.mapContainer}>
          <svg className={s.worldMapSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path className={s.landmass} d="M0,0 L25,0 L30,20 L25,40 L18,50 L12,48 L5,55 L0,50 Z" /> {/* Asia */}
            <path className={s.landmass} d="M15,65 L28,68 L32,80 L25,95 L10,88 Z" /> {/* Australia */}
            <path className={s.landmass} d="M90,0 L100,0 L100,100 L80,100 L75,70 L85,45 L80,30 L85,15 Z" /> {/* Americas */}
            <rect className={s.landmass} x="45" y="45" width="1.5" height="1.5" />
            <rect className={s.landmass} x="54" y="54" width="2" height="1" /> {/* Tarawa */}
            <rect className={s.landmass} x="58" y="61" width="1.5" height="2" /> {/* Funafuti */}
            <rect className={s.landmass} x="68" y="40" width="3" height="2" /> {/* Hawaii */}
          </svg>
          
          {mappedPacific.map((ship, idx) => <ShipMarker key={idx} ship={ship} />)}

          {/* Legend for Pacific */}
          <div className={s.legend}>
            <div className={s.legendTitle}>Pacific Legend</div>
            <div className={s.legendItem}>
              <div className={s.legendIcon}><div className={`${s.shipBody} ${s['fleet-pacific']}`} style={{backgroundColor:'#38bdf8'}}></div></div>
              <span>태평양 선망선</span>
            </div>
            <div className={s.legendItem}>
              <div className={s.legendIcon}><div className={`${s.shipBody} ${s['fleet-carrier']}`} style={{backgroundColor:'#10b981', width:'16px', height:'10px', borderRadius:'2px'}}></div></div>
              <span>운반선</span>
            </div>
            <div style={{height:'1px', background:'rgba(255,255,255,0.1)', margin:'4px 0'}}></div>
            <div className={s.legendItem}>
              <span style={{fontSize:'14px', width:'20px', textAlign:'center'}}>🎣</span>
              <span>조업 중 (그물)</span>
            </div>
            <div className={s.legendItem}>
              <span style={{fontSize:'14px', width:'20px', textAlign:'center'}}>🌊</span>
              <span>이동/전재 (물보라)</span>
            </div>
            <div className={s.legendItem}>
              <span style={{fontSize:'14px', width:'20px', textAlign:'center'}}>⚓</span>
              <span>정박/하역</span>
            </div>
          </div>
        </div>
      </div>

      {/* Atlantic Map */}
      <div className={s.mapColumn}>
        <h4 className={s.mapTitle}>🌊 대서양 수역 <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>(대서양 합작선)</span></h4>
        <div className={s.mapContainer}>
          <svg className={s.worldMapSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Americas on Left */}
            <path className={s.landmass} d="M0,0 L15,0 L10,30 L20,60 L25,100 L0,100 Z" /> 
            {/* Africa/Europe on Right */}
            <path className={s.landmass} d="M100,0 L60,0 L65,30 L70,50 L80,100 L100,100 Z" /> 
          </svg>
          
          {mappedAtlantic.map((ship, idx) => <ShipMarker key={idx} ship={ship} />)}

          {/* Legend for Atlantic */}
          <div className={s.legend}>
            <div className={s.legendTitle}>Atlantic Legend</div>
            <div className={s.legendItem}>
              <div className={s.legendIcon}><div className={`${s.shipBody} ${s['fleet-atlantic']}`} style={{backgroundColor:'#f59e0b'}}></div></div>
              <span>대서양 선망선</span>
            </div>
            <div style={{height:'1px', background:'rgba(255,255,255,0.1)', margin:'4px 0'}}></div>
            <div className={s.legendItem}>
              <span style={{fontSize:'14px', width:'20px', textAlign:'center'}}>🎣</span>
              <span>조업 중 (그물)</span>
            </div>
            <div className={s.legendItem}>
              <span style={{fontSize:'14px', width:'20px', textAlign:'center'}}>🌊</span>
              <span>이동/전재</span>
            </div>
            <div className={s.legendItem}>
              <span style={{fontSize:'14px', width:'20px', textAlign:'center'}}>⚓</span>
              <span>정박/하역</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
