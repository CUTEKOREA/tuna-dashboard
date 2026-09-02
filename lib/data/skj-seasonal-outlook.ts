import rawOutlook from '../../public/data/skj_seasonal_outlook.json';

/**
 * SKJ 8→11월 계절 패턴 전망 — `scripts/forecast_skj_monthly.py` 산출물.
 * «예측»이 아니다: 계절+모멘텀 모델이 감쇠 계절 기준선과 통계적으로 구분되지 않아(DM p 0.12)
 * 기준선 자체를 내보낸다. 밴드는 롤링 백테스트의 선행(walk-forward) 잔차 10~90분위다.
 * Fable 5.1 독립 검증 조건(2026-09-02): 라벨은 «과거 같은 달 평균 변화(감쇠)», 최근 10년 병기.
 */
export type SkjSeasonalOutlook = {
  readonly kind: 'seasonal-baseline';
  readonly label: string;
  readonly source: string;
  readonly asOf: string;
  readonly anchorPrice: number;
  readonly targetMonth: string;
  readonly value: number;
  readonly band80: readonly [number, number];
  readonly bandMethod: string;
  readonly history: { readonly years: number; readonly down: number; readonly meanPct: number };
  readonly recent10y: { readonly years: number; readonly down: number; readonly meanPct: number | null };
  readonly notForecast: string;
};

const o = rawOutlook as unknown as SkjSeasonalOutlook;
if (o.kind !== 'seasonal-baseline' || !(o.band80[0] < o.value && o.value < o.band80[1])) {
  throw new Error('skj_seasonal_outlook.json이 계절 기준선 계약과 맞지 않습니다.');
}
export const skjSeasonalOutlook: SkjSeasonalOutlook = o;
