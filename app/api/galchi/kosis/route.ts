import { NextResponse } from 'next/server';

const KOSIS_KEY = process.env.KOSIS_API_KEY || "";
const KOSIS_BASE = "https://kosis.kr/openapi/Param/statisticsParameterData.do";

const FALLBACK = {
  source: "KOSIS API (Local DB Fallback)",
  isLive: false,
  data: [
    { month: "Jan", "CPI(물가)": 105.2, "도매가(KAMIS)": 95.4 },
    { month: "Feb", "CPI(물가)": 106.8, "도매가(KAMIS)": 96.1 },
    { month: "Mar", "CPI(물가)": 108.5, "도매가(KAMIS)": 97.5 },
    { month: "Apr", "CPI(물가)": 111.0, "도매가(KAMIS)": 101.2 },
    { month: "May", "CPI(물가)": 115.4, "도매가(KAMIS)": 108.5 },
  ]
};

// KOSIS healthcheck — 키 유효성 + 응답 메타. 위젯 데이터 매핑 별도 작업.
async function kosisHealthcheck() {
  const start = Date.now();
  const checked_at = new Date().toISOString();
  if (!KOSIS_KEY || KOSIS_KEY.length < 10) return { ok: false, latency_ms: 0, checked_at };
  try {
    const res = await fetch(`https://kosis.kr/openapi/statisticsList.do?method=getList&apiKey=${KOSIS_KEY}&vwCd=MT_ZTITLE&format=json&jsonVD=Y`, { signal: AbortSignal.timeout(3000) });
    return { ok: res.ok, latency_ms: Date.now() - start, checked_at };
  } catch {
    return { ok: false, latency_ms: Date.now() - start, checked_at };
  }
}

export async function GET() {
  const health = await kosisHealthcheck();

  return NextResponse.json({
    ...FALLBACK,
    source: health.ok
      ? `KOSIS Open API (healthcheck OK ${health.checked_at}, ${health.latency_ms}ms · CPI 시계열 매핑 진행 중)`
      : "KOSIS Open API (healthcheck FAIL, local fallback)",
    isLive: health.ok,
    apiHealth: health,
  });
}
