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

/* ── 일평균 정의 (2026-08-17 SSOT) ─────────────────────────────────────────
   같은 «일평균»이 화면마다 다른 분모로 계산되던 것을 이름으로 갈라 고정한다.
   두 값은 서로 다른 질문에 답한다 — 통일 대상이 아니라 구분 대상.
   조정분(음수 보정)이 낀 항차는 누계÷횟수와 갈라질 수 있다 — 일일 보고값 합을 쓴다. */

type DailyReport = { dailyAmount: number };

/** 보고일 전체 기준 일평균 — 휴무 포함 «달력 진행 속도». 완료 예상일 산출용. */
export function avgPerReportDay(timeline: DailyReport[]): number | null {
  if (timeline.length === 0) return null;
  return timeline.reduce((sum, entry) => sum + entry.dailyAmount, 0) / timeline.length;
}

/** 양수 작업일 기준 일평균 — 휴무 제외 «하역 능력». 효율 비교용. */
export function avgPerWorkedDay(timeline: DailyReport[]): number | null {
  const worked = timeline.filter((entry) => entry.dailyAmount > 0);
  if (worked.length === 0) return null;
  return worked.reduce((sum, entry) => sum + entry.dailyAmount, 0) / worked.length;
}
