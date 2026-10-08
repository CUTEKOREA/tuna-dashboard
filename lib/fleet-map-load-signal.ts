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
  /** true = ㎥ 용량을 0.7 MT/㎥ 로 환산한 추정 적재율 */
  estimated: boolean;
  /** 계산에 쓴 MT 용량 (환산 시 환산값) */
  capacityMtEquivalent: number;
}

/**
 * m³ 어창 용량의 MT 환산 계수 - 냉동 가다랑어 브라인 웰 업계 통용값.
 * 2026-08-28 소유자 확정 (그전까지는 임의 환산 금지 정책으로 미산출 처리했음).
 * 환산 계산 결과는 estimated=true 로 표기해 실측 MT 용량과 구분한다.
 */
export const HOLD_M3_TO_MT_FACTOR = 0.7;

/** 적재율 계산. MT 는 실측, ㎥ 는 0.7 MT/㎥ 환산 추정(estimated) - 소유자 확정 계수. */
export function resolveFleetHoldUtilization(
  loadedMt: number | null,
  capacity: FleetHoldCapacityValue | null | undefined,
): FleetHoldUtilization | null {
  if (
    loadedMt === null
    || !Number.isFinite(loadedMt)
    || loadedMt < 0
    || !capacity
    || !Number.isFinite(capacity.value)
    || capacity.value <= 0
  ) {
    return null;
  }

  const capacityMt = capacity.unit === 'MT'
    ? capacity.value
    : capacity.value * HOLD_M3_TO_MT_FACTOR;
  const estimated = capacity.unit !== 'MT';

  const rawPct = loadedMt / capacityMt * 100;
  const roundedPct = Number(rawPct.toFixed(1));
  const ratioPct = rawPct < 90 && roundedPct >= 90 ? 89.9 : roundedPct;
  return {
    ratioPct,
    barPct: Math.min(rawPct, 100),
    level: rawPct >= 90 ? 'nearCapacity' : rawPct >= 75 ? 'high' : 'normal',
    estimated,
    capacityMtEquivalent: estimated ? Number(capacityMt.toFixed(1)) : capacityMt,
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
