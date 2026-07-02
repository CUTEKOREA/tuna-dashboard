import { z } from 'zod';

/**
 * KCS(관세청) 통관 라우트 응답 계약 (월별 추이 + 대상국 비중형)
 * 대상: /api/kim/customs, /api/kim/customs-seasoned 등
 *
 * 이번 세션(2026-06) 김 국가별 LIVE 버그(statKor→국가 오인)·단위 오류·dest 합계 붕괴를
 * 재발 방지하기 위한 계약. 라우트가 LIVE든 fallback이든 이 형태를 반드시 만족해야 한다.
 */
export const KcsMonthlyPoint = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'month must be YYYY-MM'),
  volume: z.number().finite().nonnegative(), // 톤
  value: z.number().finite().nonnegative(),  // 천USD
});

export const KcsDestPoint = z.object({
  name: z.string().min(1),
  value: z.number().finite().nonnegative(), // 비중 %
  fill: z.string().optional(),
});

export const KcsMonthlyDestResponse = z.object({
  isLive: z.boolean(),          // L-12 표준 필드 의무
  destIsLive: z.boolean(),
  hsCode: z.string().min(1),
  source: z.string().min(1),
  monthly: z.array(KcsMonthlyPoint).min(1),
  dest: z.array(KcsDestPoint).min(1),
  timestamp: z.string().optional(),
});

export type KcsMonthlyDestResponseT = z.infer<typeof KcsMonthlyDestResponse>;

/** dest 비중 합이 ~100%인지 (동적 top-N + 기타 정합성) */
export function assertDestSharesSaneish(dest: { value: number }[]): { ok: boolean; sum: number } {
  const sum = dest.reduce((s, d) => s + d.value, 0);
  return { ok: sum >= 95 && sum <= 101, sum: Math.round(sum * 10) / 10 };
}
