'use client';

import React, { useMemo } from 'react';
import s from './FleetPixelMap.module.css';

// --- Data ---
const pacificFleet = [
  { name: 'S/EXP', zone: 'TARAWA', type: 'pacific', status: 'port', note: '어기교대, M/E 수리 후 출항 예정', load: 13, capa: 1200 },
  { name: 'S/PIO', zone: 'S0143 W17018 (KI)', type: 'pacific', status: 'fishing', note: '', load: 205, capa: 1200 },
  { name: 'S/CHA', zone: 'TARAWA', type: 'pacific', status: 'transship', note: '990t 전재 후 출항 예정', load: 990, capa: 1200 },
  { name: 'S/HAR', zone: '부산', type: 'pacific', status: 'port', note: '상가수리 후 6/27 출항 예정', load: 0, capa: 1200 },
  { name: 'S/JUP', zone: 'N0020 W17851 (US)', type: 'pacific', status: 'transship', note: '980t 전재 예정', load: 980, capa: 1200 },
  { name: 'S/SPR', zone: 'S0248 W17538 (KI)', type: 'pacific', status: 'fishing', note: '', load: 164, capa: 1200 },
  { name: 'MOAMARI', zone: 'S0136 W17101 (KI)', type: 'pacific', status: 'transship', note: '890t 전재 예정', load: 890, capa: 1200 },
  { name: 'MOAKONA', zone: 'FUNAFUTI', type: 'pacific', status: 'transship', note: '1,106t 전재 후 출항 예정', load: 1106, capa: 1200 },
  { name: 'N/SUN', zone: 'S0138 W16353 (H)', type: 'pacific', status: 'fishing', note: '', load: 575, capa: 1200 },
  { name: 'N/STAR', zone: 'S0145 W17014 (KI)', type: 'pacific', status: 'fishing', note: '', load: 560, capa: 1200 },
];

const atlanticFleet = [
  { name: 'P/MAS', zone: 'S0418 W01746 (H)', type: 'atlantic', status: 'fishing', note: '', load: 210, capa: 1200 },
  { name: 'P/DIS', zone: 'N0020 W01340 (H)', type: 'atlantic', status: 'fishing', note: '그물 파망 사고', load: 320, capa: 1200 },
  { name: 'P/FORE', zone: 'S0100 W01124 (H)', type: 'atlantic', status: 'fishing', note: '', load: 105, capa: 1200 },
  { name: 'P/PATH', zone: 'TEMA', type: 'atlantic', status: 'port', note: '하역 후 출항 예정', load: 630, capa: 1200 },
  { name: 'P/COM', zone: 'N0341 W00557 (C)', type: 'atlantic', status: 'port', note: '하역 후 출항 예정', load: 900, capa: 1200 },
  { name: 'P/QUEEN', zone: 'N0336 W00146 (G)', type: 'atlantic', status: 'port', note: '하역 후 출항 예정', load: 900, capa: 1200 },
  { name: 'P/GRACE', zone: 'N0145 W01722 (H)', type: 'atlantic', status: 'fishing', note: '그물 교체 후 출항 예정', load: 775, capa: 1200 },
];

const carrierFleet = [
  { name: 'SEIN PHOENIX', zone: 'BKK', type: 'carrier', status: 'port', note: '하역 중', load: 6955, capa: 7100 },
  { name: 'SHIN IZU', zone: '통영', type: 'carrier', status: 'port', note: '하역 중', load: 2301, capa: 2400 },
  { name: 'BAO LUCKY', zone: 'BKK', type: 'carrier', status: 'port', note: '하역 중', load: 4803, capa: 5800 },
  { name: 'SHIN FUJI', zone: 'BKK', type: 'carrier', status: 'transit', note: 'BKK 도착 예정', load: 3096, capa: 3200 },
  { name: 'SEIN TOPAZ', zone: 'TARAWA', type: 'carrier', status: 'port', note: '전재 중', load: 4278, capa: 7300 },
  { name: 'SEIN GALAXY', zone: 'FUNAFUTI', type: 'carrier', status: 'transit', note: 'FUNAFUTI 도착 예정', load: 1106, capa: 3500 },
  { name: 'LAKE WIN', zone: 'FUNAFUTI', type: 'carrier', status: 'port', note: '전재 중', load: 150, capa: 500 },
];

const allFleets = [...pacificFleet, ...atlanticFleet, ...carrierFleet];

// Helper: map string zone to approximate X, Y (0~100) on a custom Pacific-centered map
function getCoordinates(zone: string): { x: number; y: number } {
  const z = zone.toUpperCase();
  if (z.includes('부산') || z.includes('통영')) return { x: 22, y: 35 };
  if (z.includes('BKK')) return { x: 18, y: 48 }; // Bangkok
  if (z.includes('TARAWA')) return { x: 55, y: 55 };
  if (z.includes('FUNAFUTI')) return { x: 58, y: 62 };
  if (z.includes('TEMA') || z.includes('ABIDJAN') || z.includes('W01') || z.includes('W00')) return { x: 88, y: 52 }; // Atlantic (placed on the far right for this simplified map)
  
  // Parse rough coordinates like S0143 W17018
  // Very simplified logic for visual spread
  if (z.includes('S01') || z.includes('N00')) {
    const isUS = z.includes('(US)');
    const isH = z.includes('(H)');
    if (isUS) return { x: 65, y: 50 };
    if (isH) return { x: 62, y: 58 };
    return { x: 50 + (Math.random() * 10), y: 52 + (Math.random() * 8) };
  }
  
  return { x: 50, y: 50 }; // default
}

export default function FleetPixelMap() {
  
  // To avoid overlapping markers, we add slight random offsets for ships in the same general area
  const mappedFleets = useMemo(() => {
    const positions: Record<string, number> = {};
    return allFleets.map((ship) => {
      const basePos = getCoordinates(ship.zone);
      const posKey = `${basePos.x}-${basePos.y}`;
      if (positions[posKey]) {
        positions[posKey] += 1;
        basePos.x += (positions[posKey] * 1.5) * (positions[posKey] % 2 === 0 ? 1 : -1);
        basePos.y += (positions[posKey] * 1.5);
      } else {
        positions[posKey] = 1;
      }
      return { ...ship, pos: basePos };
    });
  }, []);

  return (
    <div className={s.mapContainer}>
      {/* SVG Continents Layer */}
      <svg className={s.worldMapSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Abstract blocks for continents to fit the retro theme */}
        <path className={s.landmass} d="M0,0 L25,0 L30,20 L25,40 L18,50 L12,48 L5,55 L0,50 Z" /> {/* Asia/Korea/China */}
        <path className={s.landmass} d="M15,65 L28,68 L32,80 L25,95 L10,88 Z" /> {/* Australia */}
        <path className={s.landmass} d="M90,0 L100,0 L100,100 L80,100 L75,70 L85,45 L80,30 L85,15 Z" /> {/* Americas / Africa (abstract right edge) */}
        {/* Small islands */}
        <rect className={s.landmass} x="45" y="45" width="1.5" height="1.5" />
        <rect className={s.landmass} x="54" y="54" width="2" height="1" /> {/* Tarawa */}
        <rect className={s.landmass} x="58" y="61" width="1.5" height="2" /> {/* Funafuti */}
        <rect className={s.landmass} x="68" y="40" width="3" height="2" /> {/* Hawaii */}
      </svg>

      {/* Ships */}
      {mappedFleets.map((ship, idx) => (
        <div 
          key={idx} 
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
      ))}

      {/* Legend */}
      <div className={s.legend}>
        <div className={s.legendTitle}>Map Legend</div>
        <div className={s.legendItem}>
          <div className={s.legendIcon}><div className={`${s.shipBody} ${s['fleet-pacific']}`} style={{backgroundColor:'#38bdf8'}}></div></div>
          <span>태평양 선망선</span>
        </div>
        <div className={s.legendItem}>
          <div className={s.legendIcon}><div className={`${s.shipBody} ${s['fleet-atlantic']}`} style={{backgroundColor:'#f59e0b'}}></div></div>
          <span>대서양 선망선</span>
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
  );
}
