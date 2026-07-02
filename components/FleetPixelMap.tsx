'use client';

import React, { useMemo } from 'react';
import s from './FleetPixelMap.module.css';

// --- Data ---
const pacificFleet = [
  { name: 'S/EXP', zone: 'N0009 W16410 (H)', type: 'pacific', status: 'fishing', note: '', load: 133, capa: 1200 },
  { name: 'S/PIO', zone: 'N0209 W15622 (KI)', type: 'pacific', status: 'fishing', note: '', load: 791, capa: 1200 },
  { name: 'S/CHA', zone: 'N0125 W15707 (KI)', type: 'pacific', status: 'fishing', note: '', load: 180, capa: 1200 },
  { name: 'S/HAR', zone: '부산', type: 'pacific', status: 'port', note: '상가수리(6/9~6/23) 후 6/28 출항 예정', load: 0, capa: 1200 },
  { name: 'S/JUP', zone: 'MAJURO', type: 'pacific', status: 'port', note: 'M/E 수리 예정 (출항 일정 기술자 확인)', load: 0, capa: 1200 },
  { name: 'S/SPR', zone: 'N0123 W15903 (KI)', type: 'pacific', status: 'fishing', note: '', load: 818, capa: 1200 },
  { name: 'MOAMARI', zone: 'N0005 W16554 (H)', type: 'pacific', status: 'fishing', note: '', load: 205, capa: 1200 },
  { name: 'MOAKONA', zone: 'S0013 W16424 (H)', type: 'pacific', status: 'fishing', note: '', load: 166, capa: 1200 },
  { name: 'N/SUN', zone: 'S0017 W16426 (H)', type: 'pacific', status: 'fishing', note: '6/25 X-MAS 입항, 전재 후 6/28 출항 예정', load: 1030, capa: 1200 },
  { name: 'N/STAR', zone: 'X-MAS', type: 'pacific', status: 'transship', note: 'SEIN VENUS 전재, 선장교대 후 6/25 출항 예정', load: 1060, capa: 1200 },
];

const atlanticFleet = [
  { name: 'P/MAS', zone: 'N0329 W01918 (H)', type: 'atlantic', status: 'fishing', note: '', load: 500, capa: 1200 },
  { name: 'P/DIS', zone: 'N0517 W00400 (C)', type: 'atlantic', status: 'fishing', note: '6/23 18:00 ABIDJAN 출항 완료', load: 380, capa: 1200 },
  { name: 'P/FORE', zone: 'N0609 W02055 (H)', type: 'atlantic', status: 'fishing', note: '', load: 460, capa: 1200 },
  { name: 'P/PATH', zone: 'S0143 W01705 (H)', type: 'atlantic', status: 'fishing', note: '', load: 380, capa: 1200 },
  { name: 'P/COM', zone: 'S0052 W01624 (H)', type: 'atlantic', status: 'fishing', note: '', load: 440, capa: 1200 },
  { name: 'P/QUEEN', zone: 'S0129 W02221 (H)', type: 'atlantic', status: 'fishing', note: '', load: 370, capa: 1200 },
  { name: 'P/GRACE', zone: 'S0813 W00944 (H)', type: 'atlantic', status: 'fishing', note: '', load: 65, capa: 1200 },
];

const carrierFleet = [
  { name: 'BAO LUCKY', zone: 'BKK', type: 'carrier', status: 'port', note: '하역 완료 (누: 4,848, 중: 45)', load: 4893, capa: 5800 },
  { name: 'SHIN FUJI', zone: 'BKK', type: 'carrier', status: 'port', note: '하역 중', load: 3096, capa: 3200 },
  { name: 'SEIN TOPAZ', zone: '해상', type: 'carrier', status: 'transit', note: '7/1 NINGBO 도착 예정', load: 4278, capa: 7300 },
  { name: 'LAKE WIN', zone: '해상', type: 'carrier', status: 'transit', note: '7/11 통영 도착 예정', load: 150, capa: 2300 },
  { name: 'SEIN VENUS', zone: 'X-MAS', type: 'carrier', status: 'transship', note: 'N/STAR, N/SUN 전재 중', load: 2090, capa: 5200 },
  { name: 'SEIN GALAXY', zone: 'FUNAFUTI', type: 'carrier', status: 'port', note: 'FUNAFUTI 대기 중', load: 1846, capa: 3500 },
  { name: 'HIKARI 1', zone: 'X-MAS', type: 'carrier', status: 'port', note: 'X-MAS 대기 중', load: 0, capa: 3700 },
  { name: 'SEIN KASAMA', zone: '해상', type: 'carrier', status: 'transit', note: '6/25 N02 W162 도착 예정', load: 0, capa: 7100 },
];

function getPacificCoordinates(zone: string): { x: number; y: number } {
  const z = zone.toUpperCase();
  if (z.includes('부산') || z.includes('통영')) return { x: 22, y: 35 };
  if (z.includes('BKK')) return { x: 18, y: 48 }; 
  if (z.includes('TARAWA')) return { x: 55, y: 55 };
  if (z.includes('FUNAFUTI')) return { x: 58, y: 62 };
  if (z.includes('MAJURO')) return { x: 48, y: 48 }; 
  if (z.includes('X-MAS')) return { x: 65, y: 60 }; 
  
  if (z.includes('S01') || z.includes('N00') || z.includes('S02')) {
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
  
  if (z.includes('W01') || z.includes('W00') || z.includes('S04') || z.includes('N03')) {
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
