import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * KOSIS API healthcheck — 키 유효성 + 응답 지연 측정
 * 위젯 데이터는 정적 (CPI 시계열 매핑 작업 별도 필요), 헬스 표기만 LIVE
 */
async function kosisHealthcheck(): Promise<{ ok: boolean; latency_ms: number; checked_at: string }> {
  const key = process.env.KOSIS_API_KEY;
  const start = Date.now();
  const checked_at = new Date().toISOString();
  if (!key || key.length < 10) return { ok: false, latency_ms: 0, checked_at };
  try {
    const url = `https://kosis.kr/openapi/statisticsList.do?method=getList&apiKey=${key}&vwCd=MT_ZTITLE&format=json&jsonVD=Y`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return { ok: res.ok, latency_ms: Date.now() - start, checked_at };
  } catch {
    return { ok: false, latency_ms: Date.now() - start, checked_at };
  }
}

export async function GET() {
  const health = await kosisHealthcheck();

  const data = {
    id: "w_kosis_squid_cpi",
    title: "오징어 수입단가 vs 자급률 디커플링",
    subtitle: "squid_korea_supply.json 2000~2023 실측 기반 수입단가·자급률 비교",
    isLiveApi: false,
    apiHealth: health,  // KOSIS 키 헬스체크 메타데이터, 위젯 시계열은 정적 실측
    reliability: 98,
    chartType: "line",
    xKey: "year",
    lines: [
      { key: "import_cost_per_ton", color: "#ef4444", name: "수입단가($/톤)" },
      { key: "self_sufficiency_pct", color: "#3b82f6", name: "자급률(%)" }
    ],
    data: [
      { year: "2000", import_cost_per_ton: 2187, self_sufficiency_pct: 95.7 },
      { year: "2005", import_cost_per_ton: 2023, self_sufficiency_pct: 89.7 },
      { year: "2010", import_cost_per_ton: 2550, self_sufficiency_pct: 87.0 },
      { year: "2015", import_cost_per_ton: 2376, self_sufficiency_pct: 82.0 },
      { year: "2018", import_cost_per_ton: 3605, self_sufficiency_pct: 33.6 },
      { year: "2020", import_cost_per_ton: 3137, self_sufficiency_pct: 40.3 },
      { year: "2023", import_cost_per_ton: 3223, self_sufficiency_pct: 35.6 }
    ],
    sit: "squid_korea_supply.json 기준 오징어 수입단가는 2000년 $2,187/톤에서 2023년 $3,223/톤으로 상승했습니다. 같은 기간 자급률은 95.7%에서 35.6%로 낮아져, 가격 압력은 CPI 추정선이 아니라 국내 공급 기반 약화와 수입 의존 확대의 디커플링으로 봐야 합니다.",
    strat: "수입단가와 자급률을 분리해 관리하십시오. 자급률 40% 하회 구간에서는 국내 어획 회복을 전제로 한 조달 계획보다 수입 원료 계약, 가공 라인 원료 규격, 환율 헤지를 함께 묶은 조달 포트폴리오가 우선입니다.",
    source: `data/squid_korea_supply.json (2000~2023 정적 실측 시계열 · KOSIS healthcheck ${health.ok ? "OK" : "FAIL"})`
  };

  return NextResponse.json(data);
}
