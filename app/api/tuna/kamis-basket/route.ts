import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 1800; // 30분 캐시 — KAMIS 일 1회 갱신 데이터에 충분

/**
 * 단백질 대체재 상대가격 바스켓 — KAMIS 부류 600(수산물) 서울 소매가
 * GET /api/tuna/kamis-basket
 *
 * 품목: 611 고등어(국산 염장, 1손) · 613 갈치(국산 냉장, 1마리)
 *       615 명태(냉동, 1마리) · 619 물오징어(연근해 냉동, 1마리)
 * 주의: 615는 명태 — 오징어는 반드시 619. 부류 600에 참치 품목 없음.
 *
 * 로직: 오늘(KST) 기준 호출, dpr1 "-"(휴장·미집계)면 최대 5일 소급 재시도.
 * 주말(일요일)엔 KAMIS가 JSON이 아닌 응답을 반환하기도 하므로(2026-07-05 실측)
 * 일자별 파싱 실패는 개별 catch 후 다음 날짜로 계속 소급.
 */

// L-10: env 우선, 없으면 하드코딩 fallback 키로 라이브 시도
const KAMIS_KEY =
  process.env.KAMIS_API_KEY || "f3557f2e-fe2e-4609-9fc7-b01492beb192";
const KAMIS_CERT_ID = process.env.KAMIS_CERT_ID || "7849";
const KAMIS_BASE = "https://www.kamis.or.kr/service/price/xml.do";

// 대상 4품목 (item_code → 표시명)
const TARGETS: { code: string; name: string }[] = [
  { code: "611", name: "고등어" },
  { code: "613", name: "갈치" },
  { code: "615", name: "명태" },
  { code: "619", name: "오징어" },
];

interface BasketItem {
  code: string;
  name: string; // 표시명 (한글)
  kind: string; // 품종/규격 (예: 국산(염장))
  unit: string; // 1손 / 1마리
  price: number; // 당일 소매가 (원)
  prevPrice: number | null; // 전일 소매가 (원)
  changePct: number | null; // 전일 대비 등락률 (%)
}

// 2026-07-03 실호출 실측값 기반 정직 fallback (L-09/L-12)
const FALLBACK = {
  isLive: false,
  source: "KAMIS 부류 600 소매가 — 2026-07-03 실측 스냅샷 (fallback)",
  baseDate: "2026-07-03",
  lastUpdated: "2026-07-03",
  items: [
    { code: "611", name: "고등어", kind: "국산(염장)", unit: "1손", price: 5359, prevPrice: 5861, changePct: -8.6 },
    { code: "613", name: "갈치", kind: "국산(냉장)", unit: "1마리", price: 11975, prevPrice: 13250, changePct: -9.6 },
    { code: "615", name: "명태", kind: "냉동(원양수입통합)", unit: "1마리", price: 3958, prevPrice: 3958, changePct: 0 },
    { code: "619", name: "오징어", kind: "연근해(냉동)", unit: "1마리", price: 5140, prevPrice: 4810, changePct: 6.9 },
  ] as BasketItem[],
};

function parsePrice(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(String(v).replace(/[,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function kstDateString(daysAgo: number): string {
  // 서버 TZ 무관 KST 날짜 산출
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000 - daysAgo * 86400000);
  return kst.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function fetchBasketForDay(regday: string): Promise<BasketItem[] | null> {
  const url = new URL(KAMIS_BASE);
  url.searchParams.set("action", "dailyPriceByCategoryList");
  url.searchParams.set("p_product_cls_code", "01"); // 01=소매
  url.searchParams.set("p_country_code", "1101"); // 서울
  url.searchParams.set("p_regday", regday);
  url.searchParams.set("p_convert_kg_yn", "N"); // 단위 그대로 (1손/1마리)
  url.searchParams.set("p_item_category_code", "600"); // 수산물
  url.searchParams.set("p_cert_key", KAMIS_KEY);
  url.searchParams.set("p_cert_id", KAMIS_CERT_ID);
  url.searchParams.set("p_returntype", "json");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;

  // 주말엔 JSON 아닌 본문이 오는 경우 실측 — 파싱 실패는 null 반환해 소급 계속
  let payload: any;
  try {
    payload = await res.json();
  } catch {
    return null;
  }

  // 오류 시 data가 배열(["001"] 등)로 오는 KAMIS 특성 가드
  const data = payload?.data;
  if (!data || Array.isArray(data) || data.error_code !== "000") return null;
  const rows: any[] = Array.isArray(data.item) ? data.item : [];
  if (rows.length === 0) return null;

  const items: BasketItem[] = [];
  for (const t of TARGETS) {
    // 품목별 첫 행 중 dpr1이 유효한 행 채택 (rank 大 우선 순서 그대로)
    const row = rows.find(
      (r) => String(r?.item_code ?? "") === t.code && parsePrice(r?.dpr1) != null
    );
    if (!row) return null; // 4품목 전부 유효해야 해당 일자 채택
    const price = parsePrice(row.dpr1) as number;
    const prevPrice = parsePrice(row.dpr2);
    const changePct =
      prevPrice != null ? Math.round(((price - prevPrice) / prevPrice) * 1000) / 10 : null;
    // kind_name 예: "국산(염장)(1손)" — 말미 단위 괄호 분리
    const kindRaw = String(row.kind_name ?? "").trim();
    const unit = String(row.unit ?? "").trim() || "단위 미상";
    const kind = kindRaw.replace(/\(1[^)]*\)\s*$/, "").trim() || kindRaw;
    items.push({ code: t.code, name: t.name, kind, unit, price, prevPrice, changePct });
  }
  return items;
}

export async function GET() {
  try {
    // 오늘부터 최대 5일 소급 (주말·미집계 "-" 대응)
    for (let daysAgo = 0; daysAgo <= 5; daysAgo++) {
      const regday = kstDateString(daysAgo);
      let items: BasketItem[] | null = null;
      try {
        items = await fetchBasketForDay(regday);
      } catch {
        items = null; // 일자별 실패는 소급 계속
      }
      if (items && items.length === TARGETS.length) {
        return NextResponse.json({
          isLive: true, // L-12 표준 필드
          source: `KAMIS 부류 600 소매가 (dailyPriceByCategoryList · 서울 · ${regday})`,
          baseDate: regday,
          lastUpdated: new Date().toISOString(),
          items,
        });
      }
    }
  } catch (e) {
    console.error("KAMIS basket API error:", e);
  }

  // 정직 fallback — isLive:false 명시 (L-09)
  return NextResponse.json(FALLBACK);
}
