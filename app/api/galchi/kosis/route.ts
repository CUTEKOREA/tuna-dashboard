import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const KOSIS_KEY = process.env.KOSIS_API_KEY || "";

const FALLBACK = {
  source: "KOSIS API (로컬 표본 데이터)",
  isLive: false,
  data: [
    { month: "1월", "CPI(물가)": 105.2, "도매가(KAMIS)": 95.4 },
    { month: "2월", "CPI(물가)": 106.8, "도매가(KAMIS)": 96.1 },
    { month: "3월", "CPI(물가)": 108.5, "도매가(KAMIS)": 97.5 },
    { month: "4월", "CPI(물가)": 111.0, "도매가(KAMIS)": 101.2 },
    { month: "5월", "CPI(물가)": 115.4, "도매가(KAMIS)": 108.5 },
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
      ? `KOSIS Open API (키 정상 — CPI 시계열 실매핑 전, 로컬 표본 표시)`
      : "KOSIS Open API (healthcheck 실패, 로컬 표본 표시)",
    // L-09 정직 라벨: healthcheck 200은 데이터 연동이 아니다.
    // 표시 데이터가 하드코딩 표본인 동안 isLive는 CPI 실매핑 완료 전까지 false 고정.
    isLive: false,
    apiHealth: health,
  });
}
