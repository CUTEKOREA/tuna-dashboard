import { NextResponse } from "next/server";
import { DART_API_KEY, KOREA_SEAFOOD_COMPANIES } from "../../_shared/dart-client";

export const runtime = 'nodejs';
export const revalidate = 3600;

/**
 * 참치 상장 4사 내부자 지분변동 타임라인 (A-3 DART 내부자 시그널)
 * GET /api/tuna/insider-signal
 *
 * DART openAPI 2종 병렬 호출 (4사 x 2 = 8콜):
 *  - elestock.json   임원·주요주주 소유보고 (isu_exctv 필드군)
 *  - majorstock.json 주식 등의 대량보유상황(5%) 보고 (stkqy 필드군)
 *
 * 규율:
 *  - 취득 사유 필드가 API에 없으므로 '순매수' 표현 금지 → '지분 순증'으로만 표기
 *  - rcept_dt는 "YYYY-MM-DD" 하이픈 포함 (2026-07-06 실호출 검증) → ISO 문자열 사전순 비교
 *  - 응답 100건 제한 → 최근 180일 클라이언트 필터
 *  - L-10: DART_API_KEY는 dart-client의 fallback 키 패턴 재사용 (파싱은 본 라우트 자체 구현)
 *  - L-12: isLive 표준 필드 출력, fallback 분기도 isLive:false 명시
 */

const DART_BASE = "https://opendart.fss.or.kr/api";
const WINDOW_DAYS = 180;      // 이벤트 타임라인 윈도우
const NET_WINDOW_DAYS = 90;   // 지분 순증 합계 윈도우

const COMPANIES = [
  { name: "동원산업", code: KOREA_SEAFOOD_COMPANIES.동원산업 },   // 00118026
  { name: "사조산업", code: KOREA_SEAFOOD_COMPANIES.사조산업 },   // 00124799
  { name: "사조씨푸드", code: KOREA_SEAFOOD_COMPANIES.사조씨푸드 }, // 00124780
  { name: "신라교역", code: KOREA_SEAFOOD_COMPANIES.신라교역 },   // 00135962
] as const;

export type InsiderEvent = {
  company: string;
  date: string;                    // YYYY-MM-DD
  type: "임원보고" | "5%보고";
  reporter: string;
  position: string | null;         // 임원 직위 또는 주요주주 구분
  changeShares: number | null;     // 증감 주수 (지분 순증/순감, 음수 가능)
  holdShares: number | null;       // 보고 시점 보유 주수
  holdRatio: number | null;        // 보유 비율 % (5%보고만 존재)
  reason: string | null;           // 보고 사유 (5%보고 report_resn)
  rcept_no: string;                // DART 원문: dart.fss.or.kr/dsaf001/main.do?rcptNo={rcept_no}
};

type CompanySummary = {
  company: string;
  netChange90d: number;            // 90일 지분 순증 합계 (주)
  eventCount90d: number;
  eventCount180d: number;
};

/** "1,475,739" / "-241,683" / "0" → number, "-"·빈값 → null */
function num(s: unknown): number | null {
  if (typeof s !== "string") return null;
  const t = s.replace(/,/g, "").trim();
  if (t === "" || t === "-") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function isoDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 86400_000);
  return d.toISOString().slice(0, 10);
}

async function fetchDartJson(endpoint: string, corpCode: string): Promise<any[] | null> {
  try {
    const url = `${DART_BASE}/${endpoint}.json?crtfc_key=${DART_API_KEY()}&corp_code=${corpCode}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== "000" || !Array.isArray(data.list)) return null;
    return data.list;
  } catch {
    return null;
  }
}

const FALLBACK_DATA = {
  isLive: false,
  source: "DART 임원·주요주주 소유보고 fallback (실시간 조회 실패)",
  lastUpdated: null as string | null,
  windowDays: WINDOW_DAYS,
  netWindowDays: NET_WINDOW_DAYS,
  events: [] as InsiderEvent[],
  summary: COMPANIES.map((c) => ({
    company: c.name,
    netChange90d: 0,
    eventCount90d: 0,
    eventCount180d: 0,
  })) as CompanySummary[],
  apiHealth: { queried: COMPANIES.length * 2, fetched: 0 },
};

export async function GET() {
  try {
    const cutoff180 = isoDaysAgo(WINDOW_DAYS);
    const cutoff90 = isoDaysAgo(NET_WINDOW_DAYS);

    // 4사 x 2엔드포인트 = 8콜 병렬
    const results = await Promise.all(
      COMPANIES.flatMap((c) => [
        fetchDartJson("elestock", c.code).then((list) => ({ company: c.name, kind: "elestock" as const, list })),
        fetchDartJson("majorstock", c.code).then((list) => ({ company: c.name, kind: "majorstock" as const, list })),
      ])
    );

    const fetched = results.filter((r) => r.list !== null).length;
    const events: InsiderEvent[] = [];

    for (const r of results) {
      if (!r.list) continue;
      for (const item of r.list) {
        const date: string = item.rcept_dt || "";
        if (!date || date < cutoff180) continue; // 최근 180일 필터 (100건 제한 방어)

        if (r.kind === "elestock") {
          // 임원·주요주주 소유보고: 직위(등기임원) 또는 주주구분(10%이상주주)을 position에
          const ofcps = (item.isu_exctv_ofcps || "-").trim();
          const shrholdr = (item.isu_main_shrholdr || "-").trim();
          events.push({
            company: r.company,
            date,
            type: "임원보고",
            reporter: (item.repror || "").trim(),
            position: ofcps !== "-" ? ofcps : shrholdr !== "-" ? shrholdr : null,
            changeShares: num(item.sp_stock_lmp_irds_cnt),
            holdShares: num(item.sp_stock_lmp_cnt),
            holdRatio: num(item.sp_stock_lmp_rate),
            reason: null,
            rcept_no: item.rcept_no || "",
          });
        } else {
          events.push({
            company: r.company,
            date,
            type: "5%보고",
            reporter: (item.repror || "").trim(),
            position: (item.report_tp || "").trim() || null,
            changeShares: num(item.stkqy_irds),
            holdShares: num(item.stkqy),
            holdRatio: num(item.stkrt),
            reason: (item.report_resn || "").replace(/\s+/g, " ").trim().slice(0, 60) || null,
            rcept_no: item.rcept_no || "",
          });
        }
      }
    }

    // 최신순 정렬 (DART 응답은 오름차순 — 실호출 확인)
    events.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

    // 회사별 90일 지분 순증 합계 (취득 사유 필드 부재 → '순매수' 아님, '지분 순증')
    const summary: CompanySummary[] = COMPANIES.map((c) => {
      const mine180 = events.filter((e) => e.company === c.name);
      const mine90 = mine180.filter((e) => e.date >= cutoff90);
      return {
        company: c.name,
        netChange90d: mine90.reduce((acc, e) => acc + (e.changeShares ?? 0), 0),
        eventCount90d: mine90.length,
        eventCount180d: mine180.length,
      };
    });

    if (fetched === 0) {
      return NextResponse.json({ ...FALLBACK_DATA, lastUpdated: new Date().toISOString() });
    }

    return NextResponse.json(
      {
        isLive: true,
        source: `DART 임원·주요주주 소유보고 + 5% 대량보유 보고 실시간 (8콜 중 ${fetched}콜 성공)`,
        lastUpdated: new Date().toISOString(),
        windowDays: WINDOW_DAYS,
        netWindowDays: NET_WINDOW_DAYS,
        events,
        summary,
        apiHealth: { queried: COMPANIES.length * 2, fetched },
      },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    );
  } catch (e) {
    console.error("insider-signal API error:", e);
    return NextResponse.json({ ...FALLBACK_DATA, lastUpdated: new Date().toISOString() });
  }
}
