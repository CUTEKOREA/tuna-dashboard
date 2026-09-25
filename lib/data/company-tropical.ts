import raw from '@/public/data/companies/tropical_v1.json';

/**
 * Tropical Canning (Thailand) PCL 기업 해부 인테이크 (참치 기업 해부 ⅬⅤ, 2026-09).
 *
 * 태국 송클라주 핫야이 퉁야이 본 캔공장의 SET 상장사. 대부분 고객 상표(OEM).
 * **최대주주 명의 24,585 %는 2021-12-18 사망한 전 의장 이름으로 남아 있고, 그 아들인 현 의장이 의장을 겸하는 세 매출처가 2025년 매출의 46,2 %를 사 갔다.**
 *
 * ⚠ **금칙 (정본 `~/tunawork/tropical/notes/00_기준선_메인확인.md` N 절 · `build/killed.py`).**
 *
 * 1. **「이사가 아닌 말레이시아 개인」 금지** — 24,585 % 명의인은 전 의장(2021 56-1). 나머지 Tan 성 주주를 가족으로 쓰지 않는다.
 * 2. **38,201 %(부자 명의 합)와 16,799 %(지배권 집단)는 구성원이 다르다** — 차이를 24,585 %로 설명하지 않는다.
 * 3. **Safcol Australia 는 TC 자회사가 아니다** — 감사 주석 「공동 최종 주주」. 97,8 %는 두 표 비율이지 「몫」이 아니다.
 * 4. **1H2026 미주 −21,5 %는 Section 301 발효(2026-07-24) 전** — 관세 탓 금지.
 * 5. **「참치 공장이지만」 금지** — 펫푸드군에 참치 원료 제품 포함. 펫푸드 역전은 2022 연간에 이어 두 번째.
 * 6. **인증 명의는 둘** — EII·ISSF 참여 증서 TCC, ISSF 준수보고서·MSC TC.
 * 7. **공장 등록은 두 곳** — 「한 부지」는 본 캔공장에만. tcb_sardine 사진은 고등어 토마토소스.
 * 8. **Greenpeace 보고서를 TC 제품과 잇지 않는다** — Safcol 이 이름에 올랐고 인니 5곳에 TC·PT Medan 없음.
 * 9. **Umios PWI 51 %·Pataya 25,1 %는 취득 계획·결정** — 완료 아님. Pattani ≠ Pataya. Nautilus 는 Pataya 브랜드.
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`tropical stats.${key} 가 숫자가 아니다`);
  return v;
}
const s = (key: string) => String(data.stats[key]);

export const tropicalMeta = data._meta;
export const tropicalCard = data.card;
export const tropicalStats = data.stats;
export const tropicalSourceNotes = data.sourcenotes;

/** 주주·지배 — 56-1·Settrade·SEC. */
export function control() {
  return {
    DBD: s('DBD'), 최대주주: n('최대주주_pct'), 부자합: n('부자합_pct'), 지배권: n('지배권집단_pct'), 사망일: s('사망일'),
    세매출처: n('세매출처_pct'), 특수관계: n('특수관계_pct'), TCC: n('TCC_매출'),
  };
}

/** 호주·제품 — 56-1 9.2.1·감사·검토 주석. */
export function sales() {
  return {
    Safcol2024: n('Safcol_2024'), Safcol2025: n('Safcol_2025'), 배수: n('Safcol_배수'), 호주1H: n('호주_1H_pct'), 호주1H전년: n('호주_1H2025_pct'),
    매출: n('매출_2025'), GPM: n('GPM_2025'), 순이익: n('순이익_2025'), 펫푸드1H: n('펫푸드_1H_pct'), 참치1H: n('참치_1H_pct'), TCB_kg: n('TCB_kg'),
  };
}

/** 관세·재무·공장. */
export function exposure() {
  return {
    S301: n('S301_pct'), 발효: s('S301_발효'), 미주: n('미주_1H_증감_pct'), 차입2025: n('은행차입_2025'), 차입2606: n('은행차입_2606'),
    재고증가: n('재고증가'), 명판: n('명판_t'), 생산: n('생산_t'), 인력: n('인력'),
  };
}
