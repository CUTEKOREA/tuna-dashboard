export type FleetLoadSignalLevel = 'high' | 'nearCapacity';

export interface FleetLoadSignal {
  level: FleetLoadSignalLevel;
  label: '고적재' | '만재 임박';
  ratioPct: number;
}

export interface FleetLoadSignalStyle {
  color: '#f59e0b' | '#ef4444';
  dashArray: '5 4' | '2 3';
  fillOpacity: number;
  radius: number;
  weight: number;
}

export type FleetHoldUtilizationLevel = 'normal' | FleetLoadSignalLevel;

export interface FleetHoldCapacityValue {
  value: number;
  unit: 'MT' | '㎥';
}

export interface FleetHoldUtilization {
  ratioPct: number;
  barPct: number;
  level: FleetHoldUtilizationLevel;
}

/** 적재량과 어창 용량이 모두 MT일 때만 적재율을 만든다. ㎥는 임의 환산하지 않는다. */
export function resolveFleetHoldUtilization(
  loadedMt: number | null,
  capacity: FleetHoldCapacityValue | null | undefined,
): FleetHoldUtilization | null {
  if (
    loadedMt === null
    || !Number.isFinite(loadedMt)
    || loadedMt < 0
    || !capacity
    || capacity.unit !== 'MT'
    || !Number.isFinite(capacity.value)
    || capacity.value <= 0
  ) {
    return null;
  }

  const rawPct = loadedMt / capacity.value * 100;
  const roundedPct = Number(rawPct.toFixed(1));
  const ratioPct = rawPct < 90 && roundedPct >= 90 ? 89.9 : roundedPct;
  return {
    ratioPct,
    barPct: Math.min(rawPct, 100),
    level: rawPct >= 90 ? 'nearCapacity' : rawPct >= 75 ? 'high' : 'normal',
  };
}

/** 보고 적재량과 선복량이 모두 있을 때만 지도 적재 신호를 만든다. */
export function resolveFleetLoadSignal(
  loadedMt: number | null,
  capacityMt: number | null | undefined,
): FleetLoadSignal | null {
  if (loadedMt === null || loadedMt < 0 || capacityMt === null || capacityMt === undefined || capacityMt <= 0) {
    return null;
  }

  const ratio = loadedMt / capacityMt;
  if (ratio < 0.75) return null;
  const ratioPct = ratio < 0.9
    ? Math.min(89.9, Math.floor(ratio * 1_000) / 10)
    : Number((ratio * 100).toFixed(1));

  return {
    level: ratio >= 0.9 ? 'nearCapacity' : 'high',
    label: ratio >= 0.9 ? '만재 임박' : '고적재',
    ratioPct,
  };
}

/** 색상 외에도 원 크기와 점선 간격을 달리해 신호 단계를 구분한다. */
export function getFleetLoadSignalStyle(level: FleetLoadSignalLevel): FleetLoadSignalStyle {
  if (level === 'nearCapacity') {
    return {
      color: '#ef4444',
      dashArray: '2 3',
      fillOpacity: 0.16,
      radius: 28,
      weight: 3,
    };
  }

  return {
    color: '#f59e0b',
    dashArray: '5 4',
    fillOpacity: 0.12,
    radius: 22,
    weight: 2,
  };
}
