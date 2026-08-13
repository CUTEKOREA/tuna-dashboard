import { requireEnv } from './env';
/**
 * DART (전자공시시스템) 공유 클라이언트
 *
 * 한국 상장사·외감 대상의 재무·공시 라이브 데이터.
 * 룰북 V4.2 L-10 (Fallback 키 패턴) 준수.
 *
 * 사용:
 *   import { fetchDartList, fetchSinglAcnt, KOREA_SEAFOOD_COMPANIES } from "@/app/api/_shared/dart-client";
 *   const list = await fetchDartList({ corp_code: '00128524', bgn_de: '20260101' });
 */

export const DART_API_KEY = () => requireEnv('DART_API_KEY');

const DART_BASE = "https://opendart.fss.or.kr/api";

/**
 * 한국 주요 수산·식품 회사 corp_code 매핑.
 * 출처: opendart.fss.or.kr corpCode.xml — 2026-07-06 전 코드 company.json 실호출 재검증.
 * (구버전은 6개 코드가 무효/타사였음: 신라교역 자리에 하림 00857727이 박혀 있던 것 포함)
 */
export const KOREA_SEAFOOD_COMPANIES = {
  // 참치 (Tuna)
  동원산업: "00118026",       // 원양어업 1위, 참치 통조림 (stock 006040)
  사조산업: "00124799",       // 참치 어업·통조림 (stock 007160)
  신라교역: "00135962",       // 참치 가공·유통 (프로젝트 발주처, stock 004970)
  사조씨푸드: "00124780",     // 참치 유통·가공 (stock 014710)
  동원수산: "00118044",       // 원양어업 (stock 030720)
  // 가공·통조림
  동원에프앤비: "00340917",   // 동원F&B — 2025-07-31 상장폐지(동원산업 완전자회사), 분기 XBRL 미조회 가능
  CJ제일제당: "00635134",     // CJ제일제당 (stock 097950) — 가공식품·새우·연어
  // 닭고기·축산
  하림지주: "00148364",       // 닭고기 1위 (stock 003380)
  // 빵·디저트 (연어)
  삼립F: "00125530",          // SPC삼립 (DART명 '삼립', stock 005610)
  // 새우 가공 (동원홈푸드는 비상장·비공시 → 모회사 동원F&B 위 항목 사용)
  // 동원홈푸드: 비상장, DART 재무공시 없음 (corp_code 없음)
  // 기타 후보
  사조대림: "00109718",       // 사조 그룹 (stock 003960)
  한성기업: "00161860",       // 고등어·통조림 (stock 003680)
} as const;

export type DartListItem = {
  corp_code: string;
  corp_name: string;
  stock_code: string;
  report_nm: string;
  rcept_no: string;
  rcept_dt: string;
  flr_nm: string;
};

/**
 * DART 공시검색 (list.json) — 회사·날짜·키워드 기반.
 */
export async function fetchDartList(params: {
  corp_code?: string;
  bgn_de?: string;       // YYYYMMDD
  end_de?: string;       // YYYYMMDD
  pblntf_ty?: string;    // A 정기공시 B 주요사항 등
  page_no?: number;
  page_count?: number;
}): Promise<{ ok: boolean; total_count: number; list: DartListItem[]; raw?: any }> {
  const qs = new URLSearchParams({
    crtfc_key: DART_API_KEY(),
    page_count: String(params.page_count || 10),
    page_no: String(params.page_no || 1),
  });
  if (params.corp_code) qs.set("corp_code", params.corp_code);
  if (params.bgn_de) qs.set("bgn_de", params.bgn_de);
  if (params.end_de) qs.set("end_de", params.end_de);
  if (params.pblntf_ty) qs.set("pblntf_ty", params.pblntf_ty);

  try {
    const res = await fetch(`${DART_BASE}/list.json?${qs}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: false, total_count: 0, list: [] };
    const data = await res.json();
    if (data.status !== "000") {
      return { ok: false, total_count: 0, list: [], raw: data };
    }
    return {
      ok: true,
      total_count: data.total_count || 0,
      list: data.list || [],
    };
  } catch {
    return { ok: false, total_count: 0, list: [] };
  }
}

/**
 * 단일회사 재무정보 (fnlttSinglAcntAll.json).
 * @param corp_code 회사코드
 * @param bsns_year 사업연도 (예: 2024)
 * @param reprt_code 11011 사업보고서 / 11012 반기 / 11013 1Q / 11014 3Q
 */
export async function fetchSinglAcnt(params: {
  corp_code: string;
  bsns_year: string;
  reprt_code?: "11011" | "11012" | "11013" | "11014";
  fs_div?: "CFS" | "OFS";
}): Promise<{ ok: boolean; list: any[] }> {
  const qs = new URLSearchParams({
    crtfc_key: DART_API_KEY(),
    corp_code: params.corp_code,
    bsns_year: params.bsns_year,
    reprt_code: params.reprt_code || "11011",
    fs_div: params.fs_div || "CFS", // CFS 연결 / OFS 별도
  });
  try {
    const res = await fetch(`${DART_BASE}/fnlttSinglAcntAll.json?${qs}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { ok: false, list: [] };
    const data = await res.json();
    if (data.status !== "000") return { ok: false, list: [] };
    return { ok: true, list: data.list || [] };
  } catch {
    return { ok: false, list: [] };
  }
}

/**
 * 핵심 재무 추출 (매출·영업이익·순이익).
 */
export function extractKeyFinancials(list: any[]): {
  revenue: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
} {
  let revenue: number | null = null;
  let operatingIncome: number | null = null;
  let netIncome: number | null = null;

  for (const item of list) {
    const account = item.account_nm || "";
    const value = parseInt((item.thstrm_amount || "0").replace(/,/g, ""), 10);
    if (Number.isNaN(value)) continue;

    if (account.includes("매출액") || account === "수익(매출액)") revenue = value;
    else if (account.includes("영업이익") && !account.includes("증감")) operatingIncome = value;
    else if (account.includes("당기순이익") && !account.includes("증감")) netIncome = value;
  }
  return { revenue, operatingIncome, netIncome };
}
