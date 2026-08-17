/**
 * KCS 집계에서 $/MT 산출 + 스케일 보정 (2026-08-17 SSOT — 3곳 복붙이던 휴리스틱).
 *
 * 입력: amt = 천USD, wgt = kg (관세청 원단위). 산식 (amt*1000)/(wgt/1000) = USD/MT.
 * 스케일 클램프는 원천 데이터의 단위 표기 흔들림(kg↔톤, USD↔천USD)을 눌러 담는
 * 휴리스틱이다 — 참치·고등어 원어 $/MT의 상식 범위(수백~수천)를 벗어나면 1000배
 * 보정한다. 틀리면 1000배 오차이므로 이 정책은 여기 한 곳에서만 손댄다.
 */
export function usdPerTonFromKcs(amtThousandUsd: number, wgtKg: number): number | null {
  if (!Number.isFinite(amtThousandUsd) || !Number.isFinite(wgtKg) || wgtKg <= 0) return null;
  let pricePerTon = Math.round((amtThousandUsd * 1000) / (wgtKg / 1000));
  if (pricePerTon > 10000) pricePerTon = Math.round(pricePerTon / 1000);
  if (pricePerTon < 100) pricePerTon = Math.round(pricePerTon * 1000);
  return pricePerTon;
}
