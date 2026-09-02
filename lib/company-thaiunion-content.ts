/**
 * 「시장 이해 > 기업 해부 > Thaiunion」 자료 출처.
 *
 * 단계 서술은 **여기 있지 않다.** 조사보고서를 그대로 읽어 온다
 * (`lib/company-prose-stages.ts` · `scripts/build_report_prose.py`).
 * 손으로 쓰던 서술은 보고서 본문의 21%만 담았고 보고서를 고칠 때마다 두 번 일하게 했다.
 */
export const THAIUNION_SOURCE_NOTES: string[] = [
  '1차 출처는 Form 56-1 One Report FY2025(478쪽) - 감사 재무제표는 스캔 이미지라 OCR로 옮겼고, 표의 수치는 빌드 스크립트가 보고서 원문과 문자열 대조한다(자사주 과거 이력처럼 원문에 없는 표는 싣지 않았다).',
  '한국→태국 수출은 UN Comtrade 한국 신고 총계행(motCode=0·customsCode=C00) 기준이다. 회사 매입량과 범위가 달라 직접 견줄 수 없다.',
  '브랜드 SKU·소매가는 2026-08-20 실측이다 - WP REST API·Shopify GraphQL·사이트맵 전수 + Morrisons·Open Prices 376건. 차단된 소매(Tesco·Carrefour 등)는 미수집으로 남겼다.',
  '종업원 수는 공시끼리 어긋난다 - One Report 7.5절 12,529명 vs ISSF 프로필 "47,000명+". 어느 쪽도 단독 인용하지 않는다.',
  'TC25·SeaChange 실적은 FY2024(SR2024)까지다. 2025년 최종 성적표는 SR2025 미발간으로 미확보 - 100% 도달 여부는 아직 모른다.',
];
