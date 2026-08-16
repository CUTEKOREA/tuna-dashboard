'use client';

import React, { useMemo, useState } from 'react';
import type { FleetDailyDetailPayload } from '@/lib/contracts/fleet-daily-api';
import { buildFleetRoster, formatFleetDailyNote } from '@/lib/fleet-daily-presentation';
import s from './FleetPixelMap.module.css';

interface PixelMapShip {
  name: string;
  zone: string;
  type: 'pacific' | 'carrier' | 'atlantic';
  status: 'reported';
  loadedMt: number | null;
  capacityMt: number | null;
  note: string;
  pos: { x: number; y: number };
}

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
    const coordinate = z.match(/([NS])(\d{2})(\d{2})\s+([EW])(\d{3})(\d{2})/);
    if (coordinate) {
      const lat = (Number(coordinate[2]) + Number(coordinate[3]) / 60) * (coordinate[1] === 'S' ? -1 : 1);
      const lon = (Number(coordinate[5]) + Number(coordinate[6]) / 60) * (coordinate[4] === 'W' ? -1 : 1);
      return { x: Math.max(24, Math.min(74, 48 + (lon + 165) * 1.7)), y: Math.max(28, Math.min(72, 50 - lat * 2)) };
    }
  }
  return { x: 50, y: 50 };
}

function getAtlanticCoordinates(zone: string): { x: number; y: number } {
  const z = zone.toUpperCase();
  if (z.includes('TEMA') || z.includes('ABIDJAN')) return { x: 75, y: 55 }; 
  
  if (/[SN]0\d{3}\s?W0/.test(z)) {
    const coordinate = z.match(/([NS])(\d{2})(\d{2})\s+([EW])(\d{3})(\d{2})/);
    if (coordinate) {
      const lat = (Number(coordinate[2]) + Number(coordinate[3]) / 60) * (coordinate[1] === 'S' ? -1 : 1);
      const lon = (Number(coordinate[5]) + Number(coordinate[6]) / 60) * (coordinate[4] === 'W' ? -1 : 1);
      return { x: Math.max(20, Math.min(80, 64 + lon * 1.45)), y: Math.max(25, Math.min(75, 50 - lat * 2)) };
    }
  }
  return { x: 50, y: 50 };
}

const ShipMarker = ({ ship, selected, onSelect }: { ship: PixelMapShip; selected: boolean; onSelect: () => void }) => {
  const detailsId = `ship-details-${ship.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <button
      type="button"
      aria-label={`${ship.name} 상세 보기`}
      aria-expanded={selected}
      aria-controls={detailsId}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && selected) {
          event.stopPropagation();
          onSelect();
        }
      }}
      className={`${s.shipMarker} ${s[`fleet-${ship.type}`]} ${s['state-reported'] ?? ''}`}
      style={{ left: `${ship.pos.x}%`, top: `${ship.pos.y}%` }}
    >
    <div className={s.shipBody}></div>
    <div id={detailsId} className={s.tooltip} hidden={!selected}>
      <div className={s.tooltipTitle}>{ship.name} <span style={{fontSize:'10px', color:'var(--w-slate-400)', fontWeight:'normal'}}>({ship.type})</span></div>
      <div className={s.tooltipInfo}>
        <div className={s.tooltipRow}>
          <span className={s.tooltipLabel}>위치</span>
          <span className={s.tooltipValue} style={{color:'#fff'}}>{ship.zone}</span>
        </div>
        <div className={s.tooltipRow}>
          <span className={s.tooltipLabel}>상태</span>
          <span className={s.tooltipValue}>
            보고 위치 📍
          </span>
        </div>
        <div className={s.tooltipRow}>
          <span className={s.tooltipLabel}>적재량</span>
          <span className={s.tooltipValue}>{(ship.loadedMt ?? 0).toLocaleString()} / {ship.capacityMt?.toLocaleString() ?? '미보고'} (MT)</span>
        </div>
      </div>
      {ship.note && <div className={s.tooltipNote}>{formatFleetDailyNote(ship.note)}</div>}
    </div>
    </button>
  );
};

export default function FleetPixelMap({ detail }: { detail: FleetDailyDetailPayload }) {
  const [selectedShip, setSelectedShip] = useState<string | null>(null);
  const roster = useMemo(() => buildFleetRoster(detail), [detail]);
  
  const mappedPacific = useMemo(() => {
    const positions: Record<string, number> = {};
    const combined = [
      ...roster.pacific.map((ship) => ({
        name: ship.name,
        zone: ship.zone,
        type: 'pacific' as const,
        status: 'reported' as const,
        loadedMt: ship.loadedMt,
        capacityMt: null,
        note: ship.note,
      })),
      ...roster.carrierPhysical.map((ship) => ({
        name: ship.name,
        zone: ship.zone,
        type: 'carrier' as const,
        status: 'reported' as const,
        loadedMt: ship.loadedMt,
        capacityMt: ship.capacityMt,
        note: ship.note,
      })),
    ];
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
  }, [roster]);

  const mappedAtlantic = useMemo(() => {
    const positions: Record<string, number> = {};
    return roster.atlantic.map((item) => {
      const ship = {
        name: item.name,
        zone: item.zone,
        type: 'atlantic' as const,
        status: 'reported' as const,
        loadedMt: item.loadedMt,
        capacityMt: null,
        note: item.note,
      };
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
  }, [roster]);

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
          
          {mappedPacific.map((ship) => <ShipMarker key={ship.name} ship={ship} selected={selectedShip === ship.name} onSelect={() => setSelectedShip((current) => current === ship.name ? null : ship.name)} />)}

          {/* Legend for Pacific */}
          <div className={s.legend}>
            <div className={s.legendTitle}>태평양 범례</div>
            <div className={s.legendItem}>
              <div className={s.legendIcon}><div className={`${s.shipBody} ${s['fleet-pacific']}`} style={{backgroundColor:'var(--w-sky-400)'}}></div></div>
              <span>태평양 선망선</span>
            </div>
            <div className={s.legendItem}>
              <div className={s.legendIcon}><div className={`${s.shipBody} ${s['fleet-carrier']}`} style={{backgroundColor:'var(--w-emerald-500)', width:'16px', height:'10px', borderRadius:'2px'}}></div></div>
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
          
          {mappedAtlantic.map((ship) => <ShipMarker key={ship.name} ship={ship} selected={selectedShip === ship.name} onSelect={() => setSelectedShip((current) => current === ship.name ? null : ship.name)} />)}

          {/* Legend for Atlantic */}
          <div className={s.legend}>
            <div className={s.legendTitle}>대서양 범례</div>
            <div className={s.legendItem}>
              <div className={s.legendIcon}><div className={`${s.shipBody} ${s['fleet-atlantic']}`} style={{backgroundColor:'var(--w-amber-500)'}}></div></div>
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
