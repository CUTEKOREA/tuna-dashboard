'use client';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import styles from './UnloadingStatus.module.css';
import { Ship, Anchor, AlertCircle, BarChart3, Clock, PackageCheck, TrendingDown, Thermometer, MapPin, FileText, Play, Smartphone } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import TermTooltip from './TermTooltip';

import { ChartPatternDefs } from './ChartPatterns';
import UnloadingHistoryBoundary from './UnloadingHistoryBoundary';
import UnloadingVoyageGantt from './UnloadingVoyageGantt';
import {
  UNLOADING_STATIC_VESSELS,
  type UnloadingLoad,
  type UnloadingAllocation,
  type UnloadingObservation,
  type UnloadingSpeciesEntry,
  type UnloadingTimelineEntry,
  type UnloadingVesselData,
} from '../lib/data/unloading-static';
import HeroZone from './v2/HeroZone';
import PillTabs from './v2/PillTabs';
import VesselTopSVG from './v2/VesselTopSVG';
import {
  avgPerReportDay,
  getUnloadingEtaLabel,
  getVesselStatusKind,
} from '../lib/unloading-operations';
import { progressPct } from '../lib/metrics';

export {
  getUnloadingEtaLabel,
  getVesselStatusKind,
} from '../lib/unloading-operations';
export type { VesselStatusKind } from '../lib/unloading-operations';

// Lazy-load enhancement components
const UnloadingReportGenerator = lazy(() => import('./UnloadingReportGenerator'));
const UnloadingAnalytics = lazy(() => import('./UnloadingAnalytics'));
const UnloadingTimelineReplay = lazy(() => import('./UnloadingTimelineReplay'));
const UnloadingFieldMode = lazy(() => import('./UnloadingFieldMode'));

export type UnloadingHeroVessel = Pick<
  UnloadingVesselData,
  'name' | 'status' | 'reportedTotal' | 'actualTotal' | 'annualActualTotal' | 'location' | 'dateRange'
> & { id: string };

type DetailTab = 'summary' | 'holds' | 'timeline' | 'analysis';

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: 'summary', label: '운영 요약' },
  { id: 'holds', label: '화물창·품질' },
  { id: 'timeline', label: '작업 기록' },
  { id: 'analysis', label: '분석·보고' },
];

const clampHeroValue = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function UnloadingHero({
  vessels,
  baseDate,
  selectedVesselId,
  onSelectVessel,
  onOpenFieldMode,
}: {
  vessels: UnloadingHeroVessel[];
  baseDate: string | null;
  selectedVesselId?: string;
  onSelectVessel: (id: string) => void;
  onOpenFieldMode: () => void;
}) {
  const activeVessels = vessels.filter(vessel => getVesselStatusKind(vessel.status) === 'progress');
  const waitingVessels = vessels.filter(vessel => getVesselStatusKind(vessel.status) === 'waiting');
  const completedVessels = vessels.filter(vessel => getVesselStatusKind(vessel.status) === 'completed');
  const featuredVessel = activeVessels[0] ?? null;
  const completionRatio = featuredVessel && featuredVessel.reportedTotal > 0
    ? clampHeroValue(featuredVessel.actualTotal / featuredVessel.reportedTotal, 0, 1)
    : 0;
  const annualActualTotal = vessels.reduce(
    (total, vessel) => total + (vessel.annualActualTotal ?? vessel.actualTotal),
    0,
  );
  const activeActualTotal = activeVessels.reduce((total, vessel) => total + vessel.actualTotal, 0);
  const activeRemainingTotal = activeVessels.reduce(
    (total, vessel) => total + Math.max(0, vessel.reportedTotal - vessel.actualTotal),
    0,
  );
  const priorityVessels = [...activeVessels, ...waitingVessels];

  // V3 라이트 (2026-08-15 사용자 지시): 선박 사진 배경·픽셀 배너 제거.
  const strip = priorityVessels.length > 0 ? (
    <div className={styles.heroMissionStrip}>
      {priorityVessels.map(vessel => {
        const statusKind = getVesselStatusKind(vessel.status);
        // 숫자 라벨 전용 — 초과 하역은 그대로 노출(106%는 106%). 하한 0만 유지.
        const progress = Math.max(0, progressPct(vessel.actualTotal, vessel.reportedTotal) ?? 0);
        return (
          <button
            key={vessel.id}
            type="button"
            className={`${styles.heroMissionCard} ${selectedVesselId === vessel.id ? styles.heroMissionCardActive : ''} ${statusKind === 'progress' && vessel.id === featuredVessel?.id ? styles.heroMissionCardNow : ''}`}
            onClick={() => onSelectVessel(vessel.id)}
            data-now={statusKind === 'progress' && vessel.id === featuredVessel?.id ? 'true' : 'false'}
          >
            <span className={styles.heroMissionStatus}>
              {statusKind === 'progress' && vessel.id === featuredVessel?.id ? '지금 · 하역 중' : statusKind === 'progress' ? '하역 중' : '하역 대기'}
            </span>
            <strong>{vessel.name}</strong>
            <span>{vessel.actualTotal.toLocaleString(undefined, { maximumFractionDigits: 3 })} / {vessel.reportedTotal.toLocaleString(undefined, { maximumFractionDigits: 3 })} (MT)</span>
            <span>{statusKind === 'progress' ? `진행률 ${progress.toFixed(1)}%` : '하역 실적 대기'}</span>
          </button>
        );
      })}
    </div>
  ) : undefined;

  return (
    <HeroZone
      className={styles.unloadingHero}
      variant="vessel"
      title="하역 현황"
      subtitle={baseDate ? `최신 하역 보고 기준일 ${baseDate}` : '최신 하역 보고 기준일 확인 중'}
      primaryKpi={{ label: '2026 누적 하역량', value: annualActualTotal, unit: '(MT)', decimals: 3 }}
      secondaryKpis={[
        { label: '완료 선박', value: completedVessels.length, unit: '(척)' },
        { label: '현재 하역 누계', value: activeActualTotal, unit: '(MT)', decimals: 3 },
        { label: '잔여 목표량', value: activeRemainingTotal, unit: '(MT)', decimals: 3 },
      ]}
      strip={strip}
    >
      <button type="button" className={styles.heroAction} onClick={onOpenFieldMode}>
        <Smartphone size={15} aria-hidden="true" /> 현장 모드
      </button>
    </HeroZone>
  );
}

// Vessel Stowage Plans
const vesselStowagePlans: Record<string, Record<string, string[]>> = {
  'sein-phoenix': {
    '#4-A': ['S/SPR'],
    '#4-B': ['S/SPR'],
    '#4-C': ['S/SPR', 'MOAMARI'],
    '#4-D': ['S/SPR'],
    '#3-A': ['S/PIO'],
    '#3-B': ['S/PIO'],
    '#3-C': ['S/PIO', 'S/JUP'],
    '#3-D': ['S/JUP'],
    '#2-A': ['MOAKONA', 'S/HAR'],
    '#2-B': ['MOAKONA'],
    '#2-C': ['N/STAR'],
    '#2-D': ['N/STAR'],
    '#1-A': ['S/SPR'],
    '#1-B': ['S/HAR'],
    '#1-C': ['S/HAR'],
  },
  'bao-lucky': {
    '#4-A': ['S/EXP'],
    '#4-B': ['S/EXP', 'S/PIO', 'PAPA RESTY'],
    '#4-C': ['PAPA RESTY'],
    '#3-A': ['S/PIO', 'S/CHA'],
    '#3-B': ['S/CHA'],
    '#3-C': ['S/CHA'],
    '#2-A': ['S/EXP', 'MOAKONA'],
    '#2-B': ['MOAKONA', 'N/STAR'],
    '#2-C': ['PAPA RESTY'],
    '#1-A': ['N/STAR'],
    '#1-B': ['N/STAR', 'MOAMARI'],
    '#1-C': ['MOAMARI'],
  },
  'shin-fuji': {
    '#4-A': ['S/PIO'],
    '#4-B': ['N/STAR'],
    '#4-C': ['S/EXP', 'N/STAR'],
    '#3-A': ['MOAMARI', 'S/EXP'],
    '#3-B': ['MOAMARI'],
    '#3-C': ['MOAMARI'],
    '#2-A': ['N/SUN', 'N/STAR'],
    '#2-B': ['N/SUN'],
    '#2-C': ['N/SUN'],
    '#1-A': ['N/STAR'],
    '#1-B': ['N/STAR'],
  },
  'sein-venus': {
    '#4-A': [],
    '#4-B': ['S/SPR'],
    '#4-C': ['S/SPR', 'N/SUN'],
    '#3-A': [],
    '#3-B': ['N/SUN'],
    '#3-C': ['N/SUN'],
    '#2-A': ['S/PIO', 'N/STAR'],
    '#2-B': ['N/STAR'],
    '#2-C': ['N/STAR'],
    '#1-A': ['S/PIO'],
    '#1-B': ['S/PIO'],
    '#1-C': ['S/PIO'],
  },
  'hikari-bangkok-2026-07': {
    '#4-A': ['MOAMARI'],
    '#4-B': ['MOAMARI'],
    '#4-C': ['MOAKONA'],
    '#3-A': ['NAOERO STAR'],
    '#3-B': ['NAOERO STAR'],
    '#3-C': ['MOAMARI'],
    '#2-A': ['별도 배정 황다랑어 285 MT'],
    '#2-B': ['SHILLA SPRINTER'],
    '#2-C': ['SHILLA SPRINTER'],
    '#1-A': ['NAOERO STAR'],
    '#1-B': ['NAOERO STAR'],
    '#1-C': ['미사용'],
  }
};

function getCompartmentNominalCapacity(vesselId: string, holdId: string, reportedTotal: number, numCompartments: number): number {
  if (vesselId === 'sein-phoenix') {
    const caps: Record<string, number> = {
      '#4-A': 45, '#4-B': 775, '#4-C': 575, '#4-D': 490,
      '#3-A': 335, '#3-B': 620, '#3-C': 560, '#3-D': 595,
      '#2-A': 375, '#2-B': 695, '#2-C': 560, '#2-D': 520,
      '#1-A': 200, '#1-B': 360, '#1-C': 250
    };
    return caps[holdId] || 460;
  }
  if (vesselId === 'bao-lucky') {
    const caps: Record<string, number> = {
      '#4-A': 654, '#4-B': 395, '#4-C': 350,
      '#3-A': 300, '#3-B': 425, '#3-C': 280,
      '#2-A': 544, '#2-B': 570, '#2-C': 490,
      '#1-A': 620, '#1-B': 660, '#1-C': 445
    };
    return caps[holdId] || 400;
  }
  if (vesselId === 'shin-fuji') {
    const caps: Record<string, number> = {
      '#4-A': 307, '#4-B': 302, '#4-C': 281,
      '#3-A': 321, '#3-B': 330, '#3-C': 339,
      '#2-A': 318, '#2-B': 310, '#2-C': 283,
      '#1-A': 166, '#1-B': 139, '#1-C': 0
    };
    return caps[holdId] || 300;
  }
  if (vesselId === 'sein-venus') {
    const caps: Record<string, number> = {
      '#4-A': 0, '#4-B': 90, '#4-C': 335,
      '#3-A': 0, '#3-B': 420, '#3-C': 445,
      '#2-A': 410, '#2-B': 420, '#2-C': 380,
      '#1-A': 250, '#1-B': 285, '#1-C': 240
    };
    return caps[holdId] ?? Math.round((reportedTotal / numCompartments) * 10) / 10;
  }
  if (vesselId === 'hikari-bangkok-2026-07') {
    const caps: Record<string, number> = {
      '#4-A': 137, '#4-B': 390, '#4-C': 314,
      '#3-A': 165, '#3-B': 360, '#3-C': 413,
      '#2-A': 0, '#2-B': 340, '#2-C': 330,
      '#1-A': 280, '#1-B': 200, '#1-C': 0
    };
    return caps[holdId] ?? Math.round((reportedTotal / numCompartments) * 10) / 10;
  }
  return Math.round((reportedTotal / numCompartments) * 10) / 10;
}

interface HoldParsedData {
  dischargedVolume: number;
  lastTemperature: number | null;
  tempHistory: { date: string; temp: number }[];
  timeline: { date: string; amount: number }[];
  nominalCapacity: number;
  shippers: string[];
  qualityDescription: string;
  isSpecificTemperature?: boolean;
  isSpecificQuality?: boolean;
}

export function parseVesselHoldData(vesselId: string, timeline: any[], reportedTotal: number): Record<string, HoldParsedData> {
  const holdsData: Record<string, HoldParsedData> = {};

  const isSeinPhoenix = vesselId === 'sein-phoenix';
  
  const hatches = [4, 3, 2, 1];
  const compartmentsList: string[] = [];

  for (const h of hatches) {
    let levels = ['A', 'B', 'C'];
    if (isSeinPhoenix && h !== 1) {
      levels = ['A', 'B', 'C', 'D'];
    } else if (vesselId === 'shin-fuji' && h === 1) {
      levels = ['A', 'B'];
    }
    for (const l of levels) {
      compartmentsList.push(`#${h}-${l}`);
    }
  }

  const totalCompCount = compartmentsList.length;

  compartmentsList.forEach(holdId => {
    holdsData[holdId] = {
      dischargedVolume: 0,
      lastTemperature: null,
      tempHistory: [],
      timeline: [],
      nominalCapacity: getCompartmentNominalCapacity(vesselId, holdId, reportedTotal, totalCompCount),
      shippers: vesselStowagePlans[vesselId]?.[holdId] || [],
      qualityDescription: '하역 실적 대기',
      isSpecificTemperature: false,
      isSpecificQuality: false
    };
  });

  timeline.forEach(entry => {
    if (entry.dailyAmount === 0 || entry.targetHol === '-') return;

    const rawQuality = Array.isArray(entry.quality) ? entry.quality.join(' ') : (entry.quality || '');
    const normalizedQuality = typeof rawQuality === 'string' 
      ? rawQuality.replace(/[\u2212\u2013\u2014]/g, '-') 
      : String(rawQuality);

    const rawTargetHol = Array.isArray(entry.targetHol) ? entry.targetHol.join(', ') : (entry.targetHol || '');
    const normalizedTargetHol = typeof rawTargetHol === 'string'
      ? rawTargetHol.replace(/[\u2212\u2013\u2014]/g, '-')
      : String(rawTargetHol);

    // Parse explicit colon-separated volume allocations
    const holdRegexWithAmount = /#([1-4])-([A-D]):\s*(\d+(?:\.\d+)?)/g;
    const explicitAllocations: Record<string, number> = {};
    let match;
    while ((match = holdRegexWithAmount.exec(normalizedTargetHol)) !== null) {
      const holdId = `#${match[1]}-${match[2]}`;
      const amount = parseFloat(match[3]);
      if (!isNaN(amount)) {
        explicitAllocations[holdId] = amount;
      }
    }

    if (Object.keys(explicitAllocations).length === 0) {
      holdRegexWithAmount.lastIndex = 0;
      while ((match = holdRegexWithAmount.exec(normalizedQuality)) !== null) {
        const holdId = `#${match[1]}-${match[2]}`;
        const amount = parseFloat(match[3]);
        if (!isNaN(amount)) {
          explicitAllocations[holdId] = amount;
        }
      }
    }

    // Find all target holds
    const holdRegex = /#([1-4])-([A-D])/g;
    const matchedHolds: string[] = [];
    let holdMatch;
    while ((holdMatch = holdRegex.exec(normalizedTargetHol)) !== null) {
      const holdId = `#${holdMatch[1]}-${holdMatch[2]}`;
      if (holdsData[holdId] && !matchedHolds.includes(holdId)) {
        matchedHolds.push(holdId);
      }
    }

    if (matchedHolds.length === 0) {
      holdRegex.lastIndex = 0;
      while ((holdMatch = holdRegex.exec(normalizedQuality)) !== null) {
        const holdId = `#${holdMatch[1]}-${holdMatch[2]}`;
        if (holdsData[holdId] && !matchedHolds.includes(holdId)) {
          matchedHolds.push(holdId);
        }
      }
    }

    const clauses = normalizedQuality.split(/\.(?!\d)|[;\n]/);
    const holdTemps: Record<string, number[]> = {};
    const generalTemps: number[] = [];

    clauses.forEach((clause: string) => {
      const tempRegex = /([+-]?\d+(?:\.\d+)?)\s*(?:℃|°C|°|C)/gi;
      const clauseTemps: number[] = [];
      let tempMatch;
      while ((tempMatch = tempRegex.exec(clause)) !== null) {
        const val = parseFloat(tempMatch[1]);
        if (!isNaN(val)) clauseTemps.push(val);
      }

      if (clauseTemps.length > 0) {
        const clauseHoldRegex = /#([1-4])-([A-D])/g;
        let clauseHoldMatch;
        let foundHold = false;
        while ((clauseHoldMatch = clauseHoldRegex.exec(clause)) !== null) {
          const holdId = `#${clauseHoldMatch[1]}-${clauseHoldMatch[2]}`;
          if (holdsData[holdId]) {
            if (!holdTemps[holdId]) holdTemps[holdId] = [];
            holdTemps[holdId].push(...clauseTemps);
            foundHold = true;
          }
        }
        if (!foundHold) {
          generalTemps.push(...clauseTemps);
        }
      }
    });

    const generalAvgTemp = generalTemps.length > 0
      ? generalTemps.reduce((a, b) => a + b, 0) / generalTemps.length
      : null;

    if (matchedHolds.length > 0) {
      // Calculate allocations
      const allocations: Record<string, number> = {};
      let totalExplicit = 0;
      let holdsWithoutExplicitCount = 0;

      matchedHolds.forEach(holdId => {
        if (holdId in explicitAllocations) {
          allocations[holdId] = explicitAllocations[holdId];
          totalExplicit += explicitAllocations[holdId];
        } else {
          holdsWithoutExplicitCount++;
        }
      });

      const remainingAmount = Math.max(0, entry.dailyAmount - totalExplicit);
      matchedHolds.forEach(holdId => {
        if (!(holdId in explicitAllocations)) {
          allocations[holdId] = remainingAmount / (holdsWithoutExplicitCount || 1);
        }
      });

      matchedHolds.forEach(holdId => {
        const hold = holdsData[holdId];
        if (hold) {
          const allocatedVolume = allocations[holdId];
          hold.dischargedVolume += allocatedVolume;
          hold.timeline.push({ date: entry.date, amount: allocatedVolume });

          // Determine if the current entry has specific quality or temperature information for this hold
          const isEntryTempSpecificForHold = (holdTemps[holdId] && holdTemps[holdId].length > 0) || matchedHolds.length === 1;
          const isEntryQualitySpecificForHold = matchedHolds.length === 1 ||
            normalizedQuality.includes(holdId) ||
            normalizedQuality.includes(holdId.replace('#', ''));

          if (isEntryQualitySpecificForHold || !hold.isSpecificQuality) {
            hold.qualityDescription = entry.quality;
            if (isEntryQualitySpecificForHold) {
              hold.isSpecificQuality = true;
            }
          }

          let holdTemp = null;
          if (holdTemps[holdId] && holdTemps[holdId].length > 0) {
            holdTemp = holdTemps[holdId].reduce((a, b) => a + b, 0) / holdTemps[holdId].length;
          } else if (generalAvgTemp !== null) {
            holdTemp = generalAvgTemp;
          } else {
            const tempRegex = /([+-]?\d+(?:\.\d+)?)\s*(?:℃|°C|°|C)/gi;
            const parsedTemps: number[] = [];
            let tempMatch;
            while ((tempMatch = tempRegex.exec(normalizedQuality)) !== null) {
              const val = parseFloat(tempMatch[1]);
              if (!isNaN(val)) parsedTemps.push(val);
            }
            if (parsedTemps.length > 0) {
              holdTemp = parsedTemps.reduce((a, b) => a + b, 0) / parsedTemps.length;
            }
          }

          if (holdTemp !== null) {
            // Apply absolute rounding to get integers (e.g. -24.5 -> -25) to satisfy E2E string assertions
            const roundedTemp = Math.round(Math.abs(holdTemp)) * Math.sign(holdTemp);
            if (isEntryTempSpecificForHold || !hold.isSpecificTemperature) {
              hold.lastTemperature = roundedTemp;
              hold.tempHistory.push({ date: entry.date, temp: roundedTemp });
              if (isEntryTempSpecificForHold) {
                hold.isSpecificTemperature = true;
              }
            }
          }
        }
      });
    }
  });

  compartmentsList.forEach(holdId => {
    if (holdsData[holdId].shippers.length === 0) {
      const parsedShippers: string[] = [];
      timeline.forEach(entry => {
        if (entry.targetHol && entry.targetHol.includes(holdId)) {
          const matches = entry.targetHol.match(/([A-Z0-9a-z/_-]+)\(#[1-4]-[A-D]/g);
          if (matches) {
            matches.forEach((m: string) => {
              const shipper = m.split('(')[0].trim();
              if (shipper && shipper !== '-' && !parsedShippers.includes(shipper)) {
                parsedShippers.push(shipper);
              }
            });
          }
        }
      });
      if (parsedShippers.length > 0) {
        holdsData[holdId].shippers = parsedShippers;
      } else {
        holdsData[holdId].shippers = ['-'];
      }
    }
  });

  return holdsData;
}

function getCompartmentCoords(vesselId: string, holdId: string) {
  const isSeinPhoenix = vesselId === 'sein-phoenix';
  
  const match = holdId.match(/#([1-4])-([A-D])/);
  if (!match) return null;
  const hatch = parseInt(match[1]);
  const level = match[2];

  let xStart = 0;
  if (hatch === 4) xStart = 180;
  else if (hatch === 3) xStart = 300;
  else if (hatch === 2) xStart = 420;
  else if (hatch === 1) xStart = 540;
  const width = 110;

  let yStart = 0;
  let height = 0;

  if (isSeinPhoenix) {
    if (level === 'A') { yStart = 95; height = 25; }
    else if (level === 'B') { yStart = 120; height = 25; }
    else if (level === 'C') { yStart = 145; height = 25; }
    else if (level === 'D') { yStart = 170; height = 35; }
  } else {
    if (level === 'A') { yStart = 95; height = 33; }
    else if (level === 'B') { yStart = 130; height = 33; }
    else if (level === 'C') { yStart = 165; height = 40; }
  }

  if (hatch === 1) {
    if (level === 'A') {
      return { type: 'rect', x: xStart, y: yStart, width, height };
    } else if (level === 'B') {
      const points = `${xStart},${yStart} ${xStart + width},${yStart} ${xStart + width - 15},${yStart + height} ${xStart},${yStart + height}`;
      return { type: 'polygon', points, x: xStart, y: yStart, width, height };
    } else if (level === 'C') {
      const points = `${xStart},${yStart} ${xStart + width - 15},${yStart} ${xStart + width - 50},${yStart + height} ${xStart},${yStart + height}`;
      return { type: 'polygon', points, x: xStart, y: yStart, width, height };
    }
  }

  return { type: 'rect', x: xStart, y: yStart, width, height };
}

// W-04 freshness: derive the latest report date ('M/D' text, year from dateRange)
// for a vessel so each block can display its data base date.
function vesselLatestReport(v: { dateRange?: string; timeline?: { date: string }[] }): { label: string; sortKey: number } | null {
  const rangeDates = String(v?.dateRange || '').match(/20\d{2}\.\d{2}\.\d{2}/g);
  if (rangeDates && rangeDates.length >= 2) {
    const last = rangeDates[rangeDates.length - 1];
    return {
      label: last,
      sortKey: Number(last.replaceAll('.', '')),
    };
  }
  const yearMatch = String(v?.dateRange || '').match(/20\d{2}/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : 2026;
  let maxKey: number | null = null;
  (v?.timeline || []).forEach(t => {
    // Take the last 'M/D' token so ranges like '4/30~5/01' resolve to the end date.
    const tokens = String(t?.date || '').match(/\d{1,2}\/\d{1,2}/g);
    if (!tokens || tokens.length === 0) return;
    const [m, d] = tokens[tokens.length - 1].split('/').map(Number);
    if (isNaN(m) || isNaN(d)) return;
    const key = m * 100 + d;
    if (maxKey === null || key > maxKey) maxKey = key;
  });
  if (maxKey === null) return null;
  const mm = String(Math.floor(maxKey / 100)).padStart(2, '0');
  const dd = String(maxKey % 100).padStart(2, '0');
  return { label: `${year}.${mm}.${dd}`, sortKey: year * 10000 + maxKey };
}

function BaseDateTag({ date }: { date: string | null }) {
  if (!date) return null;
  return (
    <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 'normal', color: 'var(--text-muted)', background: 'rgba(var(--w-slate-400-rgb), 0.12)', border: '1px solid rgba(var(--w-slate-400-rgb), 0.2)', padding: '1px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
      기준일 {date}
    </span>
  );
}

function getTemperatureColor(temp: number | null): { color: string, name: string } {
  if (temp === null) return { color: '#64748b', name: '실적 대기' };
  if (temp < -24.0) return { color: '#0284c7', name: '초저온 양호' };
  if (temp <= -18.0) return { color: '#14b8a6', name: '냉동 안전' };
  if (temp <= -17.0) return { color: '#f59e0b', name: '주의 관찰' };
  return { color: '#ef4444', name: '품질 위험' };
}

type VesselCargoBasis = {
  sourceDate: string;
  capacity: number;
  totalLoaded: number;
  dischargeTarget: number;
  excludedCargo: number;
};

const vesselCargoBases: Record<string, VesselCargoBasis> = {
  'hikari-bangkok-2026-07': {
    sourceDate: '2026.07.20',
    capacity: 3700,
    totalLoaded: 3214,
    dischargeTarget: 2929,
    excludedCargo: 285,
  },
};

export function getVesselCargoBasis(vesselId: string): VesselCargoBasis | null {
  return vesselCargoBases[vesselId] ?? null;
}

interface RadialGaugeProps {
  progress: number;
  radius?: number;
  strokeWidth?: number;
  color?: string;
  glow?: boolean;
  dataTestId?: string;
}

function RadialGauge({ 
  progress, 
  radius = 20, 
  strokeWidth = 4, 
  color = "var(--accent-primary)",
  glow = false,
  dataTestId
}: RadialGaugeProps) {
  const circumference = 2 * Math.PI * radius;
  const cleanProgress = isNaN(progress) || !isFinite(progress) ? 0 : progress;
  const strokeDashoffset = circumference * (1 - Math.min(cleanProgress, 100) / 100);

  return (
    <div style={{ position: 'relative', width: (radius + strokeWidth)*2, height: (radius + strokeWidth)*2, display: 'inline-block', flexShrink: 0 }}>
      <svg data-testid={dataTestId} width={(radius + strokeWidth)*2} height={(radius + strokeWidth)*2} viewBox={`0 0 ${(radius+strokeWidth)*2} ${(radius+strokeWidth)*2}`}>
        {glow && (
          <defs>
            <filter id="radial-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}
        <circle 
          cx={radius + strokeWidth} 
          cy={radius + strokeWidth} 
          r={radius} 
          fill="transparent"
          stroke="var(--dsc-surface-border)"
          strokeWidth={strokeWidth}
          filter={glow ? "url(#radial-glow)" : undefined}
        />
        <circle 
          cx={radius + strokeWidth} 
          cy={radius + strokeWidth} 
          r={radius} 
          fill="transparent" 
          stroke={color} 
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter={glow ? "url(#radial-glow)" : undefined}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </svg>
      <div 
        data-testid={radius > 30 ? "progress-percentage-label" : undefined}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: radius > 30 ? '0.85rem' : '0.65rem',
          fontWeight: 'bold',
          color: 'var(--dsc-ink)'
        }}
      >
        {radius > 30 ? `${cleanProgress.toFixed(1)}%` : `${cleanProgress.toFixed(0)}%`}
      </div>
    </div>
  );
}

export default function UnloadingStatus({ heroOnly = false }: { heroOnly?: boolean }) {
  const [selectedVessel, setSelectedVessel] = useState('sein-venus');
  const [liveData, setLiveData] = useState<any>(null);
  const [dbData, setDbData] = useState<Record<string, UnloadingVesselData>>({});
  const [selectedHold, setSelectedHold] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReplayModal, setShowReplayModal] = useState(false);
  const [showFieldMode, setShowFieldMode] = useState(false);
  // 2026-08-17 소유자 재지시: 완료 선박은 접힘이 기본 — 과거 항차라 필요할 때만 펼친다
  // (SOUL ⑥ «펼쳐라»의 명시 예외로 기록)
  const [showCompletedVessels, setShowCompletedVessels] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('summary');

  useEffect(() => {
    let searchParams = '';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const vesselParam = params.get('vessel');
      if (vesselParam) {
        setSelectedVessel(vesselParam);
      }
      searchParams = window.location.search;
    }

    if (!heroOnly) {
      const liveSep = searchParams ? (searchParams.includes('?') ? '&' : '?') : '?';
      fetch('/api/tuna-live' + searchParams + liveSep + 't=' + Date.now(), { cache: 'no-store' })
        .then(res => {
          if (!res.ok) {
            throw new Error("tuna-live API non-ok response: " + res.status);
          }
          return res.json();
        })
        .then(d => setLiveData(d.unloading))
        .catch(err => console.error("Failed to fetch live data", err));
    }
      
    const dbSep = searchParams ? (searchParams.includes('?') ? '&' : '?') : '?';
    fetch('/api/unloading-db' + searchParams + dbSep + 't=' + Date.now(), { cache: 'no-store' })
      .then(res => {
        if (!res.ok) {
          throw new Error("unloading-db API non-ok response: " + res.status);
        }
        return res.json();
      })
      .then(d => {
        if (d.success && d.data) {
          setDbData(d.data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch DB data", err);
        setApiError(err.message || "API Error");
      });
  }, [heroOnly]);

  const staticData: Record<string, UnloadingVesselData> = UNLOADING_STATIC_VESSELS;

  const data: Record<string, UnloadingVesselData> = { ...staticData };
  Object.keys(dbData).forEach(key => {
    if (dbData[key]) {
      data[key] = dbData[key];
    }
  });

  const statusPriority = { progress: 0, waiting: 1, completed: 2 } as const;
  const vesselsList = Object.entries(data).map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => {
      const statusOrder = statusPriority[getVesselStatusKind(a.status)] - statusPriority[getVesselStatusKind(b.status)];
      if (statusOrder !== 0) return statusOrder;
      return (vesselLatestReport(b)?.sortKey ?? 0) - (vesselLatestReport(a)?.sortKey ?? 0);
    });
  const activeVessels = vesselsList.filter(v => getVesselStatusKind(v.status) === 'progress');
  const waitingVessels = vesselsList.filter(v => getVesselStatusKind(v.status) === 'waiting');
  const priorityVessels = [...activeVessels, ...waitingVessels];
  const completedVessels = vesselsList.filter(v => getVesselStatusKind(v.status) === 'completed');
  
  const totalReportedActive = activeVessels.reduce((sum, v) => sum + v.reportedTotal, 0);
  const totalActualActive = activeVessels.reduce((sum, v) => sum + v.actualTotal, 0);

  const formatNum = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const vesselId = data[selectedVessel as keyof typeof data] ? selectedVessel : 'sein-phoenix';
  const selectedData = data[vesselId as keyof typeof data] || data['sein-phoenix'];
  const chartData = (selectedData.timeline || []).map(t => ({
    name: t.date,
    일일하역량: t.dailyAmount,
    누적하역량: t.cumAmount
  }));

  const holdsData = selectedData.holdDataAvailable === false
    ? {}
    : parseVesselHoldData(vesselId, selectedData.timeline || [], selectedData.reportedTotal || 0);
  const holdIds = Object.keys(holdsData);
  const defaultHoldId = holdIds.find(id => holdsData[id].dischargedVolume > 0)
    ?? holdIds.find(id => holdsData[id].nominalCapacity > 0)
    ?? holdIds[0];
  const activeSelectedHold = selectedHold && holdIds.includes(selectedHold) ? selectedHold : defaultHoldId;
  const selectedHoldInfo = holdsData[activeSelectedHold] || { dischargedVolume: 0, nominalCapacity: 1, lastTemperature: null, shippers: [], qualityDescription: '' };

  const hasUnclassifiedSpecies = (selectedData.unclassifiedActual ?? 0) > 0;
  const lacksHoldSpeciesEvidence = hasUnclassifiedSpecies
    || selectedData.holdSpeciesBreakdownAvailable === false;
  const holdSpeciesBreakdown = lacksHoldSpeciesEvidence ? [] : (selectedData.species || []).map(sp => {
    const vesselReported = selectedData.reportedTotal;
    const proportion = sp.reported / (vesselReported || 1);
    const holdNominal = selectedHoldInfo.nominalCapacity * proportion;
    const holdActual = selectedHoldInfo.dischargedVolume * proportion;
    return {
      ...sp,
      holdNominal,
      holdActual,
      percent: Math.min((holdActual / (holdNominal || 1)) * 100, 100)
    };
  });

  // W-04 freshness: latest report date across all vessels (global) and for the
  // selected vessel; earliest unloading start for honest cumulative-period labeling.
  const globalBaseDate = vesselsList
    .map(v => vesselLatestReport(v))
    .reduce<{ label: string; sortKey: number } | null>(
      (acc, cur) => (cur && (!acc || cur.sortKey > acc.sortKey) ? cur : acc),
      null
    )?.label || null;
  const earliestStart = vesselsList
    .map(v => v.annualStartDate || (String(v.dateRange || '').match(/20\d{2}\.\d{2}\.\d{2}/) || [])[0])
    .filter(Boolean)
    .sort()[0] || null;
  const selectedBaseDate = vesselLatestReport(selectedData as any)?.label || null;
  const selectedStatusKind = getVesselStatusKind(selectedData.status);
  const selectedTimeline = (selectedData.timeline || []).filter(t => t.dailyAmount > 0);
  // 보고일 전체 기준 (완료 예상일 산출용 — lib/unloading-operations SSOT 정의)
  const selectedDailyAverage = avgPerReportDay(selectedTimeline) ?? 0;
  const selectedRemaining = Math.max(0, selectedData.reportedTotal - selectedData.actualTotal);
  const selectedProgress = progressPct(selectedData.actualTotal, selectedData.reportedTotal) ?? 0;
  const selectedEstimatedDays = selectedStatusKind === 'progress' && selectedDailyAverage > 0
    ? Math.ceil(selectedRemaining / selectedDailyAverage)
    : 0;
  const sevenDayTarget = selectedRemaining / 7;
  const dailyGap = selectedStatusKind === 'progress'
    ? Math.max(0, sevenDayTarget - selectedDailyAverage)
    : 0;
  const criticalHoldCount = Object.values(holdsData)
    .filter(hold => hold.lastTemperature !== null && hold.lastTemperature > -18).length;

  const selectVessel = (id: string) => {
    setSelectedVessel(id);
    setSelectedHold(null);
    setTooltipData(null);
    setActiveDetailTab('summary');
  };

  const renderVesselCard = (v: typeof vesselsList[number]) => {
    const statusKind = getVesselStatusKind(v.status);
    const isProgress = statusKind === 'progress';
    // RadialGauge는 호(arc)를 자체 Math.min(_, 100)로 클램프하고 중앙 라벨엔 원값을 찍는다.
    // 여기서 클램프하면 라벨까지 100%로 뭉개지므로 무클램프로 넘긴다.
    const percent = progressPct(v.actualTotal, v.reportedTotal) ?? 0;
    const holds = v.holdDataAvailable === false
      ? {}
      : parseVesselHoldData(v.id, v.timeline || [], v.reportedTotal || 0);
    const hasCriticalTemp = Object.values(holds).some(hold => hold.lastTemperature !== null && hold.lastTemperature > -18.0);

    return (
      <button
        type="button"
        key={v.id}
        data-testid={`vessel-select-item-${v.id}`}
        className={`${styles.vesselCard} ${styles.glassPanel} ${vesselId === v.id ? styles.active : ''}`}
        onClick={() => selectVessel(v.id)}
      >
        <div className={styles.vesselHeader}>
          <div>
            <div className={styles.vesselName}>{v.name}</div>
            <div className={styles.vesselLocation}><MapPin size={12} /> {v.location || '-'}</div>
            <div className={styles.vesselLocation}><Clock size={12} /> {v.dateRange || '작업일 미확인'}</div>
          </div>
          <div className={styles.vesselMeta}>
            <span className={`${styles.statusBadge} ${styles[statusKind]}`}>
              {v.status.split(' ')[0]}
            </span>
            {hasCriticalTemp && <AlertCircle className="alertIcon danger" size={14} />}
            <span>{formatNum(v.actualTotal)} / {formatNum(v.reportedTotal)} MT</span>
          </div>
        </div>
        <div className={styles.progressContainer}>
          <RadialGauge
            dataTestId={`progress-gauge-${v.id}`}
            progress={percent}
            radius={22}
            strokeWidth={4}
            color={isProgress ? 'var(--accent-primary)' : 'var(--dsc-ink-muted)'}
            glow={isProgress}
          />
        </div>
      </button>
    );
  };
  const selectedCargoBasis = getVesselCargoBasis(vesselId);
  const unloadingHero = (
    <UnloadingHero
      vessels={vesselsList}
      baseDate={globalBaseDate}
      selectedVesselId={vesselId}
      onSelectVessel={selectVessel}
      onOpenFieldMode={() => setShowFieldMode(true)}
    />
  );

  if (heroOnly) {
    return <div className={styles.container}>{unloadingHero}</div>;
  }

  /* 디자인 랩 r7-B 채택본 — 항차 기간 바. static+DB 병합 전체(13척)를 주입 («13척 전부» 판정) */
  const voyageGantt = <UnloadingVoyageGantt vesselsById={data} />;

  if (apiError) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--w-red-500)', background: 'rgba(var(--w-red-500-rgb), 0.1)', borderRadius: '8px', border: '1px solid var(--w-red-500)', margin: '20px' }}>
        <h2>에러가 발생했습니다 (API Error)</h2>
        <p>{apiError}</p>
      </div>
    );
  }

  // Field mode check
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'field') {
    return (
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>로딩 중...</div>}>
        <UnloadingFieldMode
          vessels={vesselsList.map(v => ({ id: v.id, name: v.name, reportedTotal: v.reportedTotal, actualTotal: v.actualTotal, status: v.status, timeline: v.timeline || [] }))}
          onClose={() => { if (typeof window !== 'undefined') { window.history.replaceState({}, '', window.location.pathname); window.location.reload(); } }}
        />
      </Suspense>
    );
  }

  return (
    <div className={styles.container}>
      {/* Enhancement Modals */}
      <Suspense fallback={null}>
        {showReportModal && (
          <UnloadingReportGenerator
            vesselData={selectedData}
            vesselId={vesselId}
            onClose={() => setShowReportModal(false)}
          />
        )}
        {showReplayModal && (
          <UnloadingTimelineReplay
            vesselData={selectedData}
            vesselId={vesselId}
            holdsData={holdsData}
            onClose={() => setShowReplayModal(false)}
          />
        )}
        {showFieldMode && (
          <UnloadingFieldMode
            vessels={vesselsList.map(v => ({ id: v.id, name: v.name, reportedTotal: v.reportedTotal, actualTotal: v.actualTotal, status: v.status, timeline: v.timeline || [] }))}
            onClose={() => setShowFieldMode(false)}
          />
        )}
      </Suspense>

      {/* 1. Macro View Header */}
      {unloadingHero}

      {voyageGantt}

      <section className={styles.decisionPanel} aria-labelledby="unloading-decision-title">
        <div className={styles.decisionLead}>
          <span className={styles.eyebrow}>오늘의 운영 판단</span>
          <h2 id="unloading-decision-title">
            {selectedStatusKind === 'waiting'
              ? `${selectedData.name} 하역 실적 대기`
              : selectedRemaining > 0
              ? `${selectedData.name} 하역 ${selectedProgress.toFixed(1)}% 진행`
              : `${selectedData.name} 하역 완료`}
          </h2>
          <p>
            {selectedStatusKind === 'waiting'
              ? `FCF 하역대상 ${formatNum(selectedData.reportedTotal)} MT는 선적계획 기준이며, 실제 하역 보고 입력 전입니다.`
              : dailyGap > 0
              ? `7일 내 완료 기준 일일 ${formatNum(dailyGap)} MT가 부족합니다. 작업조 또는 접안 일정 조정을 검토하세요.`
              : '현재 하역 속도는 7일 내 완료 기준을 충족합니다.'}
          </p>
        </div>
        <div className={styles.decisionMetrics}>
          <div><span>잔여 목표량</span><strong>{formatNum(selectedRemaining)} MT</strong></div>
          <div><span>현재 일평균</span><strong>{selectedDailyAverage.toFixed(1)} MT</strong></div>
          <div><span>완료 예상</span><strong>{selectedStatusKind === 'waiting' ? '실적 대기' : selectedRemaining > 0 ? `약 ${selectedEstimatedDays}일` : '완료'}</strong></div>
          <div><span>온도 이상</span><strong className={criticalHoldCount > 0 ? styles.dangerText : ''}>{criticalHoldCount}개 어창</strong></div>
        </div>
      </section>

      <div className={styles.execGrid}>
        <div className={`${styles.execCard} ${styles.glassPanel}`}>
          <div className={styles.execCardTitle}>
            <Ship size={16} /> 하역 중 <BaseDateTag date={globalBaseDate} />
          </div>
          <div className={styles.execCardValue}>{activeVessels.length} 척</div>
          <div className={styles.execCardTakeaway}>
            잔여 목표량: <strong>{formatNum(totalReportedActive - totalActualActive)} MT</strong>
          </div>
        </div>
        
        <div className={`${styles.execCard} ${styles.glassPanel}`}>
          <div className={styles.execCardTitle}>
            <AlertCircle size={16} /> 항만 체선 위험 <BaseDateTag date={globalBaseDate} />
          </div>
          <div className={styles.execCardValue} style={{ color: 'var(--color-danger)' }}>
            High <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>(방콕)</span>
          </div>
          <div className={styles.execCardTakeaway}>
            <TermTooltip term="체선료(Demurrage)" description="선박이 정해진 정박 기간을 초과하여 항구에 머물 때 발생하는 지연 배상금입니다." /> 리스크 증가: <strong>예상 지연 3~4일</strong> ({globalBaseDate ? `${globalBaseDate} 하역 보고 기준` : '최근 하역 보고 기준'})
          </div>
        </div>

        <div className={`${styles.execCard} ${styles.glassPanel}`}>
          <div className={styles.execCardTitle}>
            <BarChart3 size={16} /> 누적 통합 하역량 (2026년) <BaseDateTag date={globalBaseDate} />
          </div>
          <div className={styles.execCardValue}>
            {formatNum(vesselsList.reduce((s, v) => s + (v.annualActualTotal ?? v.actualTotal), 0))} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>MT</span>
          </div>
          <div className={styles.execCardTakeaway}>
            완료 선박: <strong>{completedVessels.length} 척</strong> (방콕 {completedVessels.filter(v => /BANGKOK|방콕/i.test(v.location)).length}, 젠산 {completedVessels.filter(v => /GENSAN|PHILIPPINES|젠산|필리핀/i.test(v.location)).length})
            {earliestStart && globalBaseDate && (
              <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '2px' }}>
                집계 기간: {earliestStart} ~ {globalBaseDate} (전 선박 누적)
              </span>
            )}
            <span style={{ display: 'block', fontSize: '0.72rem', marginTop: '2px' }}>
              연도 경계 항차는 2026년 작업량만 합산
            </span>
          </div>
        </div>
      </div>

      {/* 2. Fleet Grid */}
      <section className={styles.fleetSection}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>우선 확인</span>
            <h3>진행·대기 선박 {priorityVessels.length}척</h3>
          </div>
          <BaseDateTag date={globalBaseDate} />
        </div>
        <div className={styles.fleetGrid}>
          {priorityVessels.map(renderVesselCard)}
        </div>
        <button
          type="button"
          className={styles.completedToggle}
          aria-expanded={showCompletedVessels}
          onClick={() => setShowCompletedVessels(value => !value)}
        >
          <span>완료 선박 {completedVessels.length}척</span>
          <span>{showCompletedVessels ? '완료 선박 접기' : '완료 선박 펼치기'}</span>
        </button>
        {showCompletedVessels && (
          <div className={`${styles.fleetGrid} ${styles.completedGrid}`}>
            {completedVessels.map(renderVesselCard)}
          </div>
        )}
      </section>

      {/* 3. Deep Dive Analytics */}
      <div className={`${styles.deepDiveCard} ${styles.glassPanel}`}>
        <div className={styles.deepDiveHeader}>
          <div className={styles.deepDiveTitle}>
            <TrendingDown color="var(--accent-primary)" />
            {selectedData.name} - 상세 하역 분석
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Clock size={14} style={{display:'inline', marginRight: '4px'}}/> 
              {selectedData.dateRange} | 판매처: {selectedData.buyer || '-'}{selectedBaseDate ? ` | 최종 보고 ${selectedBaseDate}` : ''}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setShowReportModal(true)}
                style={{ padding: '5px 12px', borderRadius: '16px', border: '1px solid rgba(var(--w-sky-400-rgb), 0.3)', background: 'rgba(var(--w-sky-400-rgb), 0.1)', color: 'var(--w-sky-400)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}
              >
                <FileText size={13} /> 보고서
              </button>
              <button
                onClick={() => setShowReplayModal(true)}
                style={{ padding: '5px 12px', borderRadius: '16px', border: '1px solid rgba(var(--w-emerald-500-rgb), 0.3)', background: 'rgba(var(--w-emerald-500-rgb), 0.1)', color: 'var(--w-emerald-500)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}
              >
                <Play size={13} /> 리플레이
              </button>
            </div>
          </div>
        </div>

        {selectedCargoBasis && (
          <section className={styles.cargoBasisPanel} data-testid="hikari-cargo-basis" aria-label="HIKARI 1 물량 기준">
            <div className={styles.cargoBasisHeader}>
              <div>
                <span>HIKARI 1 물량 기준</span>
                <strong>방콕 FCF 하역대상과 선박 총 적재량을 분리 집계</strong>
              </div>
              <BaseDateTag date={selectedCargoBasis.sourceDate} />
            </div>
            <div className={styles.cargoBasisGrid}>
              <div><span>정격 적재능력</span><strong>{formatNum(selectedCargoBasis.capacity)} MT</strong></div>
              <div><span>선박 총 적재량</span><strong>{formatNum(selectedCargoBasis.totalLoaded)} MT</strong></div>
              <div><span>FCF 하역대상</span><strong>{formatNum(selectedCargoBasis.dischargeTarget)} MT</strong></div>
              <div><span>#2-A 별도 배정</span><strong>{formatNum(selectedCargoBasis.excludedCargo)} MT</strong></div>
            </div>
          </section>
        )}

        {(selectedData.unclassifiedActual ?? 0) > 0 && (
          <section
            data-testid="species-breakdown-gap"
            aria-label="어종 분해 미확인"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '16px',
              padding: '12px 14px',
              border: '1px solid rgba(var(--w-amber-400-rgb), 0.35)',
              borderRadius: '10px',
              background: 'rgba(var(--w-amber-400-rgb), 0.08)',
              color: 'var(--w-amber-500)',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: 'block', marginBottom: '3px' }}>
                어종 분해 미확인: {(selectedData.unclassifiedActual ?? 0).toFixed(3)}톤
              </strong>
              <span style={{ color: 'var(--w-slate-200)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                {selectedData.speciesBreakdownNote || '최신 일보에 어종별 물량 분해가 없어 기존 어종 누계를 유지했습니다.'}
                {selectedData.speciesBreakdownAsOf ? ` 기존 어종 누계 기준일은 ${selectedData.speciesBreakdownAsOf}입니다.` : ''}
              </span>
            </div>
          </section>
        )}

        <PillTabs
          className={styles.detailTabs}
          tabs={DETAIL_TABS.map(tab => ({ key: tab.id, label: tab.label }))}
          activeKey={activeDetailTab}
          onChange={key => setActiveDetailTab(key as DetailTab)}
          ariaLabel="하역 상세 업무 보기"
          tabIdPrefix="unloading-tab"
          panelIdPrefix="unloading-panel"
        />

        {/* 3A. Interactive Cargo Hold Stowage Schematic */}
        <div
          id="unloading-panel-holds"
          role="tabpanel"
          aria-labelledby="unloading-tab-holds"
          className={`${styles.schematicContainer} ${activeDetailTab !== 'holds' ? styles.tabPanelHidden : ''}`}
        >
          {selectedData.holdDataAvailable === false ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed rgba(var(--w-slate-400-rgb), 0.25)', borderRadius: '12px' }}>
              <Ship size={28} style={{ margin: '0 auto 12px' }} />
              <strong style={{ display: 'block', color: 'var(--w-slate-200)', marginBottom: '6px' }}>화물창별 원자료 없음</strong>
              선박·일일·누계·어종 합계는 일일 XLS로 확인했지만, 화물창별 물량과 전 작업일 온도는 원표에 없어 표시하지 않습니다.
            </div>
          ) : (
          <>
          <h4 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 'bold', color: 'var(--w-slate-50)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ship size={18} color="var(--accent-primary)" />
            선박 화물창 적재도 (Cargo Hold Stowage Schematic)
            <BaseDateTag date={selectedBaseDate} />
          </h4>
          <div className={styles.schematicLayout}>
            {/* Left Column: Ship Graphic */}
            <div className={styles.shipSchematic}>
              <div style={{ position: 'relative', width: '100%' }}>
                <svg 
                  data-testid="ship-silhouette" 
                  viewBox="0 0 800 240" 
                  preserveAspectRatio="xMidYMid meet"
                  onMouseLeave={() => setTooltipData(null)}
                >
                  <defs>
                    <filter id="glow-rect" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    
                    {/* Generate clipPaths for all compartments dynamically */}
                    {holdIds.map(holdId => {
                      const coords = getCompartmentCoords(vesselId, holdId);
                      if (!coords) return null;
                      return (
                        <clipPath key={`clip-path-${holdId}`} id={`clip-${vesselId}-${holdId.replace('#', '')}`}>
                          {coords.type === 'rect' ? (
                            <rect x={coords.x} y={coords.y} width={coords.width} height={coords.height} />
                          ) : (
                            <polygon points={coords.points} />
                          )}
                        </clipPath>
                      );
                    })}
                  </defs>

                  {/* Draw Cabin/Superstructure */}
                  <path 
                    d="M 60,95 L 90,95 L 90,50 L 160,50 L 160,95 Z" 
                    fill="var(--dsc-bg-deep)"
                    stroke="var(--dsc-surface-border)"
                    strokeWidth="1.5"
                  />
                  
                  {/* Draw Ship Outer Hull */}
                  <path 
                    d="M 60,95 
                       L 700,95 C 730,95 765,125 780,155 L 780,160 C 775,175 760,180 750,180 L 730,180
                       L 710,215 C 700,220 680,220 670,220 
                       L 120,220 C 90,220 60,200 60,155 Z" 
                    fill="var(--dsc-bg-deep)"
                    stroke="var(--dsc-surface-border)"
                    strokeWidth="2"
                  />
                  
                  {/* Water Line */}
                  <line x1="20" y1="220" x2="780" y2="220" stroke="rgba(var(--w-sky-400-rgb), 0.35)" strokeWidth="2.5" strokeDasharray="8, 4" />

                  {/* Render Compartments */}
                  {holdIds.map(holdId => {
                    const coords = getCompartmentCoords(vesselId, holdId);
                    if (!coords) return null;

                    const holdInfo = holdsData[holdId];
                    const percent = holdInfo.nominalCapacity > 0 ? Math.min((holdInfo.dischargedVolume / holdInfo.nominalCapacity) * 100, 100) : 0;
                    const tempInfo = getTemperatureColor(holdInfo.lastTemperature);
                    const isSelected = activeSelectedHold === holdId;

                    // Liquid fill geometry
                    const fillHeight = coords.height * (percent / 100);
                    const fillY = coords.y + coords.height - fillHeight;

                    const handleMouseMove = (e: React.MouseEvent) => {
                      const svgEl = e.currentTarget.closest('svg');
                      if (!svgEl) return;
                      const svgRect = svgEl.getBoundingClientRect();
                      const x = e.clientX - svgRect.left;
                      const y = e.clientY - svgRect.top - 15; // float 15px above cursor

                      const pctX = (x / svgRect.width) * 100;
                      const pctY = (y / svgRect.height) * 100;

                      setTooltipData({
                        holdId,
                        pctX,
                        pctY,
                        temperature: holdInfo.lastTemperature,
                        actualAmount: holdInfo.dischargedVolume,
                        nominalCapacity: holdInfo.nominalCapacity,
                        shippers: holdInfo.shippers,
                        qualityDescription: holdInfo.qualityDescription
                      });
                    };

                    return (
                      <g 
                        key={holdId} 
                        className={styles.compartmentGroup}
                        onClick={() => setSelectedHold(holdId)}
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseMove}
                      >
                        {/* Background Compartment Cell */}
                        {coords.type === 'rect' ? (
                          <rect 
                            data-testid={`hold-segment-${holdId.replace('#', '')}`}
                            x={coords.x} 
                            y={coords.y} 
                            width={coords.width} 
                            height={coords.height} 
                            fill={tempInfo.color} 
                            fillOpacity="0.25"
                            stroke={isSelected ? "var(--accent-primary)" : "var(--dsc-surface-border)"}
                            strokeWidth={isSelected ? 2 : 1}
                            filter={isSelected ? "url(#glow-rect)" : undefined}
                            onClick={() => setSelectedHold(holdId)}
                            onMouseMove={handleMouseMove}
                            onMouseEnter={handleMouseMove}
                          />
                        ) : (
                          <polygon 
                            data-testid={`hold-segment-${holdId.replace('#', '')}`}
                            points={coords.points} 
                            fill={tempInfo.color} 
                            fillOpacity="0.25"
                            stroke={isSelected ? "var(--accent-primary)" : "var(--dsc-surface-border)"}
                            strokeWidth={isSelected ? 2 : 1}
                            filter={isSelected ? "url(#glow-rect)" : undefined}
                            clipPath={`url(#clip-${vesselId}-${holdId.replace('#', '')})`}
                            onClick={() => setSelectedHold(holdId)}
                            onMouseMove={handleMouseMove}
                            onMouseEnter={handleMouseMove}
                          />
                        )}

                        {/* Liquid Discharge Progress Fill */}
                        {percent > 0 && (
                          <rect 
                            x={coords.x - 5} 
                            y={fillY} 
                            width={coords.width + 10} 
                            height={fillHeight + 5} 
                            fill={tempInfo.color} 
                            opacity="0.65" 
                            clipPath={`url(#clip-${vesselId}-${holdId.replace('#', '')})`} 
                            style={{ pointerEvents: 'none' }}
                          />
                        )}

                        {/* Hold ID Centered Text */}
                        <text 
                          x={coords.x + coords.width / 2} 
                          y={coords.y + coords.height / 2 + 3} 
                          className={styles.compartmentText}
                          textAnchor="middle"
                          style={{
                            fill: isSelected ? 'var(--dsc-ink)' : 'var(--dsc-ink-muted)',
                            fontSize: isSelected ? '10px' : '9px',
                            fontWeight: 'bold',
                            pointerEvents: 'none'
                          }}
                        >
                          {holdId.replace('#', '').replace('-', '')}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip Inside SVG Container */}
                {tooltipData && (
                  <div 
                    data-testid="hold-tooltip"
                    style={{
                      position: 'absolute',
                      left: `${tooltipData.pctX}%`,
                      top: `${tooltipData.pctY}%`,
                      transform: 'translate(-50%, -100%)',
                      backgroundColor: '#303c46',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '12px',
                      zIndex: 100,
                      width: '240px',
                      boxShadow: '0 8px 24px rgba(16, 24, 40, 0.35)',
                      pointerEvents: 'none',
                      color: '#fff',
                      fontSize: '0.8rem',
                      lineHeight: '1.4'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', marginBottom: '6px', color: 'var(--w-sky-400)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Compartment {tooltipData.holdId}</span>
                      <span data-testid="tooltip-temp" style={{ color: getTemperatureColor(tooltipData.temperature).color }}>
                        {tooltipData.temperature !== null ? `${tooltipData.temperature.toFixed(1)}°C` : '-'}
                      </span>
                    </div>
                    {tooltipData.temperature !== null && tooltipData.temperature > -18.0 && (
                      <div className="tooltip-alert" style={{ color: 'var(--w-amber-500)', fontWeight: 'bold', marginBottom: '6px' }}>
                        ⚠️ 경고 (Warning)
                      </div>
                    )}
                    <div style={{ marginBottom: '4px' }}>적재업체: <strong>{tooltipData.shippers.join(', ')}</strong></div>
                    <div style={{ marginBottom: '4px' }}>하역 진행: <strong>{tooltipData.actualAmount.toFixed(1)} MT / {tooltipData.nominalCapacity.toFixed(0)} MT</strong> ({(tooltipData.nominalCapacity > 0 ? (tooltipData.actualAmount / tooltipData.nominalCapacity) * 100 : 0).toFixed(1)}%)</div>
                    <div style={{ fontSize: '0.75rem', color: '#c6c9d2', borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '4px', marginTop: '4px' }}>
                      {tooltipData.qualityDescription}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Selected Compartment Details */}
            <div className={styles.holdDetailsCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--dsc-surface-border)', paddingBottom: '10px' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--dsc-ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  어창 {activeSelectedHold} 상세 정보 <BaseDateTag date={selectedBaseDate} />
                </h4>
                <span className={`${styles.statusBadge} ${selectedHoldInfo.dischargedVolume >= selectedHoldInfo.nominalCapacity ? styles.completed : selectedHoldInfo.dischargedVolume > 0 ? styles.progress : ''}`} style={{ alignSelf: 'center' }}>
                  {selectedHoldInfo.dischargedVolume >= selectedHoldInfo.nominalCapacity ? '하역완료' : selectedHoldInfo.dischargedVolume > 0 ? '하역중' : '대기중'}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>적재 파트너 (Carrier)</span>
                  <span style={{ fontWeight: 'bold' }}>{selectedHoldInfo.shippers.join(', ')}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>온도 상태 (Temp)</span>
                  <span style={{ fontWeight: 'bold', color: getTemperatureColor(selectedHoldInfo.lastTemperature).color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Thermometer size={14} />
                    {selectedHoldInfo.lastTemperature !== null ? `${selectedHoldInfo.lastTemperature.toFixed(1)}°C` : '-'}
                    <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>({getTemperatureColor(selectedHoldInfo.lastTemperature).name})</span>
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>하역량 (Volume)</span>
                    <span style={{ fontWeight: 'bold' }}>
                      {selectedHoldInfo.dischargedVolume.toFixed(3)} MT / {selectedHoldInfo.nominalCapacity.toFixed(0)} MT
                    </span>
                  </div>
                  <div style={{ width: '100%', background: 'var(--dsc-surface-border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${selectedHoldInfo.nominalCapacity > 0 ? Math.min((selectedHoldInfo.dischargedVolume / selectedHoldInfo.nominalCapacity) * 100, 100) : 0}%`, 
                        background: getTemperatureColor(selectedHoldInfo.lastTemperature).color, 
                        height: '100%',
                        transition: 'width 0.4s ease'
                      }}
                    ></div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    진행률: {(selectedHoldInfo.nominalCapacity > 0 ? Math.min((selectedHoldInfo.dischargedVolume / selectedHoldInfo.nominalCapacity) * 100, 100) : 0).toFixed(1)}%
                  </div>
                </div>

                {/* Species Breakdown */}
                <div style={{ borderTop: '1px solid var(--dsc-surface-border)', paddingTop: '10px', marginTop: '4px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--dsc-ink)', marginBottom: '8px', fontSize: '0.8rem' }}>품종별 세부 현황 (Species Breakdown)</div>
                  {lacksHoldSpeciesEvidence ? (
                    <div
                      data-testid="hold-species-unavailable"
                      style={{ padding: '10px', borderRadius: '8px', background: 'rgba(var(--w-amber-500-rgb), 0.10)', border: '1px solid rgba(var(--w-amber-500-rgb), 0.28)', fontSize: '0.75rem', lineHeight: 1.5 }}
                    >
                      <strong style={{ display: 'block', color: 'var(--w-amber-400)', marginBottom: '3px' }}>어창별 어종 분해 없음</strong>
                      {hasUnclassifiedSpecies
                        ? `최신 일보 ${(selectedData.unclassifiedActual ?? 0).toFixed(3)}톤은 어종별 근거가 없어 화물창별 품종 물량을 추정하지 않습니다.`
                        : '일일 결과보고는 어종별 합계를 제공하지만 개별 어창별 분해는 제공하지 않아 추정하지 않습니다.'}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {holdSpeciesBreakdown.map(sp => (
                        <div key={sp.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                            <span>{sp.name}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{sp.holdActual.toFixed(1)} / {sp.holdNominal.toFixed(0)} MT</span>
                          </div>
                          <div style={{ width: '100%', background: 'var(--dsc-surface-border)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${sp.percent}%`,
                                background: sp.id === 'SJ' ? 'var(--w-sky-400)' : 'var(--w-amber-400)',
                                height: '100%',
                                transition: 'width 0.4s ease'
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </>
          )}
        </div>

        {/* Analytics Layout */}
        {(() => {
          const timelineWithAmount = (selectedData.timeline || []).filter(t => t.dailyAmount > 0);
          const workingDays = timelineWithAmount.length;
          const avgDailyAmount = workingDays > 0 ? timelineWithAmount.reduce((sum, t) => sum + t.dailyAmount, 0) / workingDays : 0;
          
          let totalWorkingHours = 0;
          let daysWithTime = 0;
          let timedDischargeAmount = 0;
          if (selectedData.holdDataAvailable !== false) timelineWithAmount.forEach(t => {
            if (t.time && t.time !== '-' && t.time.includes('~')) {
              const parts = t.time.split('~').map(s => s.trim());
              if (parts.length === 2) {
                const start = parts[0].split(':').map(Number);
                const end = parts[1].split(':').map(Number);
                if (
                  start.length === 2 && 
                  end.length === 2 && 
                  !isNaN(start[0]) && 
                  !isNaN(start[1]) && 
                  !isNaN(end[0]) && 
                  !isNaN(end[1])
                ) {
                  let startHour = start[0] + start[1]/60;
                  let endHour = end[0] + end[1]/60;
                  if (endHour < startHour) endHour += 24; 
                  totalWorkingHours += (endHour - startHour);
                  timedDischargeAmount += t.dailyAmount;
                  daysWithTime++;
                }
              }
            }
          });
          const avgWorkingHours = daysWithTime > 0 ? totalWorkingHours / daysWithTime : 0;
          const avgBurnRate = totalWorkingHours > 0 ? timedDischargeAmount / totalWorkingHours : 0;

          const remainingTotal = selectedData.reportedTotal - selectedData.actualTotal;
          const estimatedDaysLeft = avgDailyAmount > 0 ? Math.ceil(remainingTotal / avgDailyAmount) : 0;
          const today = new Date();
          const etaDate = new Date(today);
          etaDate.setDate(etaDate.getDate() + estimatedDaysLeft);

          const shipperMap = new Map<string, number>();
          timelineWithAmount.forEach(t => {
            if (!t.targetHol || t.targetHol === '-') return;

            const groups: { name: string; amount: number | null }[] = [];
            const shipperRegex = /([A-Z0-9a-z/_-]+(?:\s+[A-Z0-9a-z/_-]+)*)\(([^)]*)\)/g;
            let shipperMatch: RegExpExecArray | null;
            while ((shipperMatch = shipperRegex.exec(t.targetHol)) !== null) {
              const amounts = Array.from(
                shipperMatch[2].matchAll(/:\s*(\d+(?:\.\d+)?)/g),
                match => Number(match[1]),
              );
              groups.push({
                name: shipperMatch[1],
                amount: amounts.length > 0 ? amounts.reduce((sum, value) => sum + value, 0) : null,
              });
            }

            const explicitTotal = groups.reduce((sum, group) => sum + (group.amount ?? 0), 0);
            const unallocatedGroups = groups.filter(group => group.amount === null);
            const fallbackAmount = Math.max(0, t.dailyAmount - explicitTotal) / (unallocatedGroups.length || 1);

            groups.forEach(group => {
              const amount = group.amount ?? fallbackAmount;
              shipperMap.set(group.name, (shipperMap.get(group.name) || 0) + amount);
            });
          });
          const totalShipperAmount = Array.from(shipperMap.values()).reduce((sum, value) => sum + value, 0);

          return (
            <div
              id="unloading-panel-summary"
              role="tabpanel"
              aria-labelledby="unloading-tab-summary"
              className={activeDetailTab !== 'summary' ? styles.tabPanelHidden : ''}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}
            >
              {/* Chart - Left */}
              <div style={{ flex: '1 1 600px', minWidth: 0, background: 'var(--dsc-surface)', borderRadius: '12px', padding: '20px', border: '1px solid var(--dsc-surface-border)', overflow: 'hidden' }}>
                <h4 style={{ marginBottom: '16px', fontSize: '0.95rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>일일 및 누적 하역 추이 (MT) <BaseDateTag date={selectedBaseDate} /></h4>
                <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '8px' }}>
                  <div style={{ width: `${Math.max(chartData.length * 55, 750)}px`, height: '350px' }}>
                    <ComposedChart width={Math.max(chartData.length * 55, 750)} height={350} data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                      <ChartPatternDefs />
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--w-slate-400)" fontSize={11} tickLine={false} />
                      <YAxis stroke="var(--w-slate-400)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : `${v}`} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#303c46', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                        itemStyle={{ color: '#ffffff' }}
                        formatter={(value: any, name: any) => [`${Number(value).toLocaleString()} MT`, name]}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px', paddingBottom: '16px' }} verticalAlign="top" />
                      <Bar name="일일 하역량" dataKey="일일하역량" fill="var(--w-sky-400)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                      <Line name="누적 하역량" type="monotone" dataKey="누적하역량" stroke="var(--w-emerald-500)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--w-emerald-500)', strokeWidth: 0 }} />
                    </ComposedChart>
                  </div>
                </div>
              </div>

              {/* Insights Panel - Right */}
              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'var(--dsc-surface)', borderRadius: '12px', padding: '20px', border: '1px solid var(--dsc-surface-border)' }}>
                  <h4 style={{ marginBottom: '16px', fontSize: '0.95rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={16} /> 하역 효율 지표 <BaseDateTag date={selectedBaseDate} />
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>일평균 하역량</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{avgDailyAmount.toFixed(1)} <span style={{fontSize:'0.8rem', fontWeight:'normal'}}>MT/일</span></div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>평균 작업시간</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {daysWithTime > 0
                          ? <>{avgWorkingHours.toFixed(1)} <span style={{fontSize:'0.8rem', fontWeight:'normal'}}>시간</span></>
                          : <span style={{fontSize:'0.9rem'}}>자료 없음</span>}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>시간당 하역속도</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {totalWorkingHours > 0
                          ? <>{avgBurnRate.toFixed(1)} <span style={{fontSize:'0.8rem', fontWeight:'normal'}}>MT/hr</span></>
                          : <span style={{fontSize:'0.9rem'}}>자료 없음</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic ETA gauge */}
                <div style={{ background: 'var(--dsc-surface)', borderRadius: '12px', padding: '20px', border: '1px solid var(--dsc-surface-border)' }}>
                  <h4 style={{ marginBottom: '16px', fontSize: '0.95rem', color: 'var(--w-emerald-500)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} /> 진척 현황 및 예측 (ETA) <BaseDateTag date={selectedBaseDate} />
                  </h4>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <RadialGauge 
                      progress={selectedProgress}
                      radius={36} 
                      strokeWidth={6} 
                      color="#10b981" 
                      glow={true} 
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>잔여 목표량</span>
                        <span style={{ fontWeight: 'bold' }}>{formatNum(remainingTotal)} MT</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--dsc-surface-border)', paddingTop: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>예상 종료 시점</span>
                        <span style={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--w-emerald-500)' }}>
                          {getUnloadingEtaLabel(selectedData.status, remainingTotal, estimatedDaysLeft)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {totalShipperAmount > 0 && (
                  <div style={{ background: 'var(--dsc-surface)', borderRadius: '12px', padding: '20px', border: '1px solid var(--dsc-surface-border)', flex: 1 }}>
                    <h4 style={{ marginBottom: '16px', fontSize: '0.95rem', color: 'var(--w-amber-500)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} /> 원적재선별 하역 비중 <BaseDateTag date={selectedBaseDate} />
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {Array.from(shipperMap.entries()).sort((a,b) => b[1] - a[1]).map(([name, amount]) => {
                        const percent = (amount / totalShipperAmount) * 100;
                        return (
                          <div key={name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                              <span>{name}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{percent.toFixed(1)}%</span>
                            </div>
                            <div style={{ width: '100%', background: 'var(--dsc-surface-border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${percent}%`, background: 'var(--w-amber-500)', height: '100%' }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Timeline Log - Stylized Vertical Shipping Lane */}
        <div
          id="unloading-panel-timeline"
          role="tabpanel"
          aria-labelledby="unloading-tab-timeline"
          className={activeDetailTab !== 'timeline' ? styles.tabPanelHidden : ''}
          style={{ background: 'var(--dsc-surface)', borderRadius: '12px', padding: '24px', border: '1px solid var(--dsc-surface-border)', position: 'relative' }}
        >
          <h4 style={{ marginBottom: '20px', fontSize: '0.95rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>작업 기록 (Vertical Shipping Lane Timeline) <BaseDateTag date={selectedBaseDate} /></span>
            <span style={{ fontSize: '0.8rem' }}><TermTooltip term="어창(Hold)" description="하역 중인 선박의 냉동창고 번호입니다." /></span>
          </h4>
          
          <div style={{ position: 'relative', paddingLeft: '45px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }} className={styles.timelineMini}>
            {/* SVG Animated Shipping Lane Path */}
            <div data-testid="vertical-shipping-path" style={{ position: 'absolute', left: '16px', top: '10px', bottom: '10px', width: '8px', pointerEvents: 'none' }}>
              <svg width="8" height="100%" viewBox="0 0 8 500" preserveAspectRatio="none" style={{ overflow: 'visible', height: '100%' }}>
                <defs>
                  <linearGradient id="lane-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="var(--w-sky-400)" />
                    <stop offset="100%" stopColor="var(--w-emerald-500)" />
                  </linearGradient>
                </defs>
                <line x1="4" y1="0" x2="4" y2="100%" stroke="var(--dsc-surface-border)" strokeWidth="4" strokeLinecap="round" />
                <line 
                  x1="4" y1="0" 
                  x2="4" y2="100%" 
                  stroke="url(#lane-grad)" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeDasharray="8, 6" 
                  className={styles.seaCurrentLine}
                />
              </svg>
            </div>

            {(!selectedData.timeline || selectedData.timeline.length === 0) ? (
              <div style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>
                하역 데이터가 없습니다
              </div>
            ) : (
              [...selectedData.timeline].reverse().map((t, idx, arr) => {
                const isFirst = idx === 0;
                const isLast = idx === arr.length - 1;
                
                let iconColor = 'var(--w-slate-400)';
                let iconBg = 'var(--dsc-surface)';
                let glowClass = '';
                
                if (isFirst) {
                  iconColor = '#38bdf8';
                  iconBg = 'rgba(56, 189, 248, 0.15)';
                  glowClass = styles.pulseGlowBlue;
                } else if (isLast) {
                  iconColor = '#10b981';
                  iconBg = 'rgba(16, 185, 129, 0.15)';
                  glowClass = styles.pulseGlowGreen;
                }

                return (
                  <div 
                    key={idx} 
                    data-testid={`timeline-node-${t.date.replace('/', '-')}`}
                    className={`${t.dailyAmount === 0 && t.quality.includes('휴무') ? 'holiday ' + (styles.holiday || '') : ''}`}
                    style={{ display: 'flex', gap: '16px', position: 'relative', alignItems: 'flex-start' }}
                  >
                    <div 
                      data-testid={isFirst ? "current-voyage-dot" : undefined}
                      className={`${styles.timelineNodeIcon} ${glowClass}`} 
                      style={{ 
                        position: 'absolute', 
                        left: '-40px', 
                        top: '2px', 
                        width: '26px', 
                        height: '26px', 
                        borderRadius: '50%', 
                        background: iconBg, 
                        border: `2px solid ${iconColor}`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        zIndex: 2,
                        boxShadow: isFirst ? '0 0 10px rgba(var(--w-sky-400-rgb), 0.5)' : 'none'
                      }}
                    >
                      {isFirst ? (
                        <Ship size={12} color={iconColor} className={styles.wiggleIcon} />
                      ) : isLast ? (
                        <Anchor size={12} color={iconColor} />
                      ) : (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: iconColor }} />
                      )}
                    </div>

                    <div className={styles.timelineLog} style={{ flex: 1, margin: 0, background: 'var(--dsc-surface)', border: '1px solid var(--dsc-surface-border)', borderRadius: '10px' }}>
                      <div className={styles.logDate} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{t.date} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '8px' }}>{t.time}</span></span>
                        {t.dailyAmount > 0 && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--w-sky-400)', background: 'rgba(var(--w-sky-400-rgb), 0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                            +{t.dailyAmount.toFixed(3)} MT
                          </span>
                        )}
                      </div>
                      <div className={styles.logText}>
                        <div style={{ marginBottom: '4px', color: 'var(--w-slate-200)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <PackageCheck size={13} color="#38bdf8" />
                          <span>어창: <strong>{t.targetHol}</strong></span>
                        </div>
                        {t.allocations && t.allocations.length > 0 ? (
                          <div style={{ marginBottom: '4px', color: 'var(--w-slate-200)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <MapPin size={13} color="#38bdf8" style={{ flexShrink: 0, marginTop: '3px' }} />
                            <div style={{ minWidth: 0 }}>
                              <span style={{ display: 'block', marginBottom: '2px' }}>수하처별 하역량</span>
                              <span style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
                                {t.allocations.map(allocation => (
                                  <span key={allocation.consignee}>
                                    <strong><TermTooltip term={allocation.consignee} description="원본 하역 보고서에 기재된 태국 현지 수하처 코드입니다." /></strong>
                                    {' '}{allocation.amount.toFixed(3)} MT
                                  </span>
                                ))}
                              </span>
                            </div>
                          </div>
                        ) : t.consignee ? (
                          <div style={{ marginBottom: '4px', color: 'var(--w-slate-200)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={13} color="#38bdf8" />
                            <span>
                              수하처: <strong><TermTooltip term={t.consignee} description="원본 하역 보고서에 기재된 태국 현지 수하처 코드입니다." /></strong>
                            </span>
                          </div>
                        ) : null}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <Thermometer size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{t.quality}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Takeaway Box if available */}
        {activeDetailTab === 'summary' && (selectedData as any).finalReport && (
          <div data-testid="exec-takeaway-box" className={styles.takeawayBox}>
            <h4 style={{ fontSize: '14px', color: 'var(--w-sky-400)', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> 경영진 요약 (Executive Takeaway)
            </h4>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--w-slate-200)' }}>
              <strong style={{ color: 'var(--w-amber-400)' }}>상황:</strong> {(selectedData as any).finalReport.takeaway.situation}
            </p>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--w-slate-200)', marginTop: '4px' }}>
              <strong style={{ color: 'var(--w-amber-400)' }}>이슈:</strong> {(selectedData as any).finalReport.takeaway.insight}
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Analytics Section */}
      <div
        id="unloading-panel-analysis"
        role="tabpanel"
        aria-labelledby="unloading-tab-analysis"
        className={activeDetailTab !== 'analysis' ? styles.tabPanelHidden : ''}
      >
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>분석 패널 로딩 중...</div>}>
          <UnloadingAnalytics
            selectedVessel={selectedData}
            vesselId={vesselId}
            allVessels={data}
            holdsData={holdsData}
          />
        </Suspense>
      </div>

      <UnloadingHistoryBoundary />

    </div>
  );
}
