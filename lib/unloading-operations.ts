export type VesselStatusKind = 'progress' | 'waiting' | 'completed';

export function getVesselStatusKind(status: string): VesselStatusKind {
  const normalized = status.trim().toLowerCase();

  if (normalized.includes('하역대기') || normalized.includes('waiting')) {
    return 'waiting';
  }
  if (
    normalized.includes('하역중') ||
    normalized.includes('진행') ||
    normalized.includes('progress')
  ) {
    return 'progress';
  }
  return 'completed';
}

export function getUnloadingEtaLabel(
  status: string,
  remaining: number,
  estimatedDays: number,
): string {
  if (getVesselStatusKind(status) === 'waiting') return '하역 실적 대기';
  return remaining > 0 ? `+${estimatedDays}일 필요` : '하역 완료';
}
