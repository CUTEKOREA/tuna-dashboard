import rawOutlook from '../../public/data/skj_seasonal_outlook.json';

/**
 * SKJ 계절 패턴 참고선 — `scripts/forecast_skj_monthly.py` 산출물.
 * «예측»이 아니다: 계절+모멘텀 모델이 감쇠 계절 기준선과 통계적으로 구분되지 않아(DM p 0.12)
 * 기준선 자체를 내보낸다. 밴드는 롤링 백테스트의 선행(walk-forward) 잔차 10~90분위다.
 * Fable 5.1 독립 검증 조건(2026-09-02): 라벨은 «과거 같은 달 평균 변화(감쇠)», 최근 10년 병기.
 *
 * 앵커(출발점)는 방콕사무소 주간보고 시세다(2026-09-09 사용자 지시). 계절 변화율과 밴드는
 * 그대로 Atuna 32년 월별에서 온다 - 표본이 5배 길어 계절성 추정이 안정적이기 때문이다.
 * 두 계열은 겹치는 72개월에서 수준 상관 0.978 · 로그변화 상관 0.870 · 평균 절대차 2.1% 라
 * 상대 변화율을 옮겨 붙일 수 있다. Atuna 는 페이월 수동 동기화라 최신 달이 뒤처지는데,
 * 그 달에 앵커를 두면 점선이 화면의 굵은 선(방콕사무소)보다 낮은 데서 출발해 보인다.
 */
export type SkjSeasonalOutlook = {
  readonly kind: 'seasonal-baseline';
  readonly label: string;
  readonly source: string;
  readonly asOf: string;
  readonly anchorPrice: number;
  readonly anchorSource: string;
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
// 앵커 출처를 안 밝히면 화면이 «어느 계열에서 출발한 선인지»를 말하지 못한다
if (!o.anchorSource) throw new Error('skj_seasonal_outlook.json에 anchorSource가 없습니다.');
export const skjSeasonalOutlook: SkjSeasonalOutlook = o;
