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
