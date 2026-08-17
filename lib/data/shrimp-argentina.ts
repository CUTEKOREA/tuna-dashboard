import raw from '@/public/data/shrimp_argentina.json';

/**
 * 아르헨티나 홍새우 조사 인테이크.
 *
 * 원자료는 사내 조사보고서 2종이다 — 한국시장(2026-08-11)·아세안 3국 가공(2026-08-12).
 * `scripts/build_shrimp_argentina_data.py` 가 옮겨 적고, 내보내기 전에 모든 수치가
 * 보고서 원문에 그대로 있는지 대조한다. 위젯이 이 JSON 을 보는 유일한 통로다.
 *
 * ⚠ **측정 경계.** 여기 수치는 통관·수출 신고 기준이라 새우 페이지의 다른 단계(FAO 생산
 *   통계)와 더할 수 없다. 중량 기준이 다르다. 이 경계를 화면에서 지운 채 숫자만 나란히
 *   놓으면 읽는 사람이 자연스럽게 더하게 된다.
 */

export type CatchPoint = { 연도: number; 어획: number; 구분: string };
export type LandingRow = { 경로: string; 물량: number; 비중: number };
export type ImportRow = { 원산지: string; 물량: number; 금액: number; 단가: number };
export type Route = {
  국가: string;
  건수: number;
  공장수: number;
  수입사수: number;
  역할: string;
  공장: string[];
  공장건수: number[];
  수입사: string[];
  검증: '실재' | '미입증';
};
export type ImporterRow = { 업체: string; 건수: number; 비중: number };
export type OriginRule = { 협정: string; hs0306: string; hs1605: string };

const data = raw as unknown as {
  meta: { source: string; measurementBoundary: string; recordCaveat: string };
  catch: CatchPoint[];
  landing2025: LandingRow[];
  koreaImports: ImportRow[];
  routes: Route[];
  hubFlow: { 연도: number; 합계: number }[];
  hub2025: { 국가: string; 물량: number }[];
  importers: ImporterRow[];
  originRules: OriginRule[];
};

export const argentinaMeta = data.meta;
export const argentinaCatch = data.catch;
export const argentinaLanding = data.landing2025;
export const argentinaRoutes = data.routes;
export const argentinaHubFlow = data.hubFlow;
export const argentinaHub2025 = data.hub2025;
export const argentinaImporters = data.importers;
export const argentinaOriginRules = data.originRules;

/** 한국 HS 030617 공급국. 물량 내림차순 — 표에 실린 순서가 아니라 크기 순으로 읽힌다. */
export const argentinaKoreaImports = [...data.koreaImports].sort((a, b) => b.물량 - a.물량);

/** 아르헨티나가 한국 HS 030617 에서 차지하는 몫. 보고서의 전체(2만7,848톤·2억2,217만$) 기준. */
export const KOREA_HS030617_TOTAL = { 물량: 27848, 금액: 222.17 } as const;

export function argentinaShare() {
  const arg = data.koreaImports.find((r) => r.원산지 === '아르헨티나');
  if (!arg) return null;
  return {
    물량비중: (arg.물량 / KOREA_HS030617_TOTAL.물량) * 100,
    금액비중: (arg.금액 / KOREA_HS030617_TOTAL.금액) * 100,
    단가: arg.단가,
  };
}

/** 전체 평균 신고단가. 금액(백만$)/물량(톤) → $/kg 이라 1000 을 곱하지 않는다. */
export const KOREA_AVG_UNIT_PRICE = 7.98;

/**
 * 가공경로 공장 중 방콕사무소 「가공사 조사」 탭에 프로파일이 있는 회사.
 *
 * 이름이 정확히 같지 않다 — 조사표는 `THAI UNION SEAFOOD / GROUP` 처럼 적는다.
 * 링크를 걸기 위한 대응이지 동일 법인 판정이 아니다.
 */
export const PROCESSOR_TAB_MATCH: Record<string, string> = {
  'KF Foods': 'KF FOODS',
  'Thai Spring Fish': 'THAI SPRING FISH',
  'Chocksamut Marine': 'CHOCKSAMUT MARINE',
  'Thai Union': 'THAI UNION SEAFOOD / GROUP',
};
