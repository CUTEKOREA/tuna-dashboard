import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireEnv } from '../_shared/env';

export const runtime = 'nodejs';
export const revalidate = 300; // 5분 캐시

/* ============================================================
 * 실시간 API 클라이언트
 * ============================================================ */

// 관세청 KCS nitemtrade — 참치 조제품(HS 160414) 월별 수출입 실적.
// 구 UNI-PASS trtImpExpStas는 2026-07 기준 404(서비스 종료) — L-11 mackerel 패턴으로 재배선.
type TunaTradeStats = {
  monthly: { month: string; impUnit: number; expUnit: number }[]; // USD/Ton
  latestImpUnit: number | null;   // 최신월 수입단가 (USD/Ton)
  ytdImpDlrM: number | null;      // 연간 누적 수입액 (Million USD)
  period: string;
};

async function fetchKCSTunaTrade(): Promise<TunaTradeStats | null> {
  try {
    // try 안에서 읽는다. 키 미설정은 API 사용 불가와 같으므로 아래 catch가
    // null로 떨어뜨린다 — 이 라우트는 빌드 시 프리렌더되므로 밖에서 던지면 빌드가 깨진다.
    const key = requireEnv('DATA_GO_KR_NEW_KEY');
    const now = new Date();
    const yyyy = now.getFullYear();
    const yyyyMM = `${yyyy}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const url = `https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList` +
      `?serviceKey=${key}&strtYymm=${yyyy}01&endYymm=${yyyyMM}&hsSgn=160414`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), next: { revalidate: 300 } });
    if (!res.ok) return null;
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    if (items.length === 0) return null;

    // 월별 합산 (impWgt/expWgt: kg, impDlr/expDlr: USD — L-11 단위 규약)
    const totals: Record<string, { impDlr: number; impWgt: number; expDlr: number; expWgt: number }> = {};
    for (const m of items) {
      const s = m[1];
      const year = s.match(/<year>([\s\S]*?)<\/year>/)?.[1] ?? '';
      if (year.includes('총계')) continue;
      const raw = year.replace(/\D/g, '');
      if (raw.length !== 6) continue;
      const mk = `${raw.slice(0, 4)}-${raw.slice(4, 6)}`;
      if (!totals[mk]) totals[mk] = { impDlr: 0, impWgt: 0, expDlr: 0, expWgt: 0 };
      totals[mk].impDlr += parseFloat(s.match(/<impDlr>([\d.]+)<\/impDlr>/)?.[1] ?? '0');
      totals[mk].impWgt += parseFloat(s.match(/<impWgt>([\d.]+)<\/impWgt>/)?.[1] ?? '0');
      totals[mk].expDlr += parseFloat(s.match(/<expDlr>([\d.]+)<\/expDlr>/)?.[1] ?? '0');
      totals[mk].expWgt += parseFloat(s.match(/<expWgt>([\d.]+)<\/expWgt>/)?.[1] ?? '0');
    }
    const months = Object.keys(totals).sort();
    if (months.length === 0) return null;

    const monthly = months.map(mk => ({
      month: mk,
      impUnit: totals[mk].impWgt > 0 ? Math.round((totals[mk].impDlr / totals[mk].impWgt) * 1000) : 0, // USD/Ton
      expUnit: totals[mk].expWgt > 0 ? Math.round((totals[mk].expDlr / totals[mk].expWgt) * 1000) : 0,
    })).filter(r => r.impUnit > 0 || r.expUnit > 0);

    const lastWithImp = [...monthly].reverse().find(r => r.impUnit > 0);
    const ytdImpDlr = months.reduce((acc, mk) => acc + totals[mk].impDlr, 0);
    return {
      monthly,
      latestImpUnit: lastWithImp ? lastWithImp.impUnit : null,
      ytdImpDlrM: ytdImpDlr > 0 ? Math.round(ytdImpDlr / 1_000_000) : null,
      period: `${months[0]}~${months[months.length - 1]}`,
    };
  } catch { return null; }
}

// WTI Crude Oil (CL=F) via Yahoo Finance API
async function fetchWTICrude(): Promise<Record<number, number>> {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1wk&range=6mo');
    const json = await res.json();
    const timestamps = json.chart.result[0].timestamp;
    const closes = json.chart.result[0].indicators.quote[0].close;
    const monthlySum: Record<number, number> = {};
    const monthlyCount: Record<number, number> = {};
    
    for (let i = 0; i < timestamps.length; i++) {
      if (!closes[i]) continue;
      const d = new Date(timestamps[i] * 1000);
      if (d.getFullYear() === 2026) {
        const m = d.getMonth() + 1;
        monthlySum[m] = (monthlySum[m] || 0) + closes[i];
        monthlyCount[m] = (monthlyCount[m] || 0) + 1;
      }
    }
    const monthlyAvg: Record<number, number> = {};
    for (const m in monthlySum) {
      monthlyAvg[m] = monthlySum[m] / monthlyCount[m];
    }
    return monthlyAvg;
  } catch { return {}; }
}

export async function GET() {
  const filePath = path.join(process.cwd(), 'public/data/tuna_real_data_v3.json');
  let data: any;
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read JSON:', error);
    return NextResponse.json({ error: 'Failed to load static data' }, { status: 500 });
  }

  // ── 병렬 API 호출 ──────────────────────────────────────────
  const [liveTrade, liveWtiCrude] = await Promise.all([
    fetchKCSTunaTrade(),
    fetchWTICrude(),
  ]);

  const timestamp = new Date().toISOString();

  // ── KPI 업데이트 (라이브 값 우선, 실패 시 fallback) ─────────
  // ── KPI 업데이트 (핵심 5개 지표 + Telemetry 상태 추가) ─────────
  data.kpis = {
    // L-09: NOAA fetch 미구현 — 정적 수록값임을 정직 표기 (라이브 연동 시 telemetry 분기 복원)
    kpi_climate_risk: {
      title: '기후 리스크 지수 (엘니뇨 영향)',
      value: 'HIGH',
      trend: '🔥',
      desc: '서부 태평양 수온 +1.2°C 아노말리 · 출처: NOAA 전망 자체 정리(정적 수록)',
      telemetry: 'static',
      syncDate: '2026 상반기 정리',
      isLive: false
    },
    kpi_quota: {
      title: 'RFMO 쿼터 소진율 (WCPFC 태평양)',
      value: '82.5%',
      trend: '⚠️ Alert',
      desc: '눈다랑어 15,336톤·참다랑어 883톤 배정 · 출처: WCPFC, 2024년 배정치',
      telemetry: 'static',
      syncDate: '2024년 배정치',
      isLive: false
    },
    kpi_import_price: liveTrade?.latestImpUnit ? (() => {
      const impSeries = liveTrade.monthly.filter(r => r.impUnit > 0);
      const prev = impSeries.length >= 2 ? impSeries[impSeries.length - 2].impUnit : null;
      return {
        title: '참치 조제품 평균 수입 단가 (USD/Ton)',
        value: `$${liveTrade.latestImpUnit.toLocaleString()}`,
        trend: prev === null ? '—' : liveTrade.latestImpUnit >= prev ? '▲ 전월比' : '▼ 전월比',
        desc: `관세청 KCS nitemtrade HS 160414 통관 실측 (${liveTrade.period}) [🟢 LIVE KCS API]`,
        telemetry: 'live',
        isLive: true
      };
    })() : {
      title: '참치 조제품 평균 수입 단가 (USD/Ton)',
      value: '$—',
      trend: '—',
      desc: '관세청 KCS nitemtrade 조회 실패 — 값 미표시 (허수 방지)',
      telemetry: 'static',
      syncDate: new Date().toISOString().slice(0, 10),
      isLive: false
    },
    // 구 kpi_retail_price(KAMIS 614)는 허구 연동으로 제거 — KAMIS에 참치캔 품목 부재 (2026-07-06 P0 정정).
    // 국내 소매가 축은 소비자원 참가격 위젯(B-1)으로 대체 예정.
    kpi_import_value: liveTrade?.ytdImpDlrM ? {
      title: '참치 조제품 연간 누적 수입액 (HS 160414)',
      value: `$${liveTrade.ytdImpDlrM.toLocaleString()}M`,
      trend: '▲',
      desc: `관세청 KCS nitemtrade 연간 누적 통관 실측 (${liveTrade.period}) [🟢 LIVE KCS API]`,
      telemetry: 'live',
      isLive: true
    } : {
      title: '참치 조제품 연간 누적 수입액 (HS 160414)',
      value: '$—',
      trend: '—',
      desc: '관세청 KCS nitemtrade 조회 실패 — 값 미표시 (허수 방지)',
      telemetry: 'static',
      syncDate: new Date().toISOString().slice(0, 10),
      isLive: false
    },
    kpi_market_share: {
      title: '글로벌 캔 참치 수출 점유율 (한국 vs 태국)',
      value: '0.3% / 29.0%',
      trend: '태국 1위 유지',
      desc: 'HS 160414 수출액 기준(전 보고국 합 $8.6B, Comtrade 총계행) · 태국 29.0% 1위, 에콰도르 16.3%·중국 12.2%·스페인 9.2% · 한국은 0.3%(캔 수출 미미) · 출처: UN Comtrade 2024 via agri_data',
      telemetry: 'synced',
      syncDate: '2026-06-06',
      isLive: false
    }
  };



  // ── 위젯 실시간 오버라이드 (L-09/L-12: fetch 성공 시에만 LIVE, 실패 시 STATIC + 실데이터 기준일) ──
  const w01IsLive = !!(liveTrade && liveTrade.monthly.length > 0);
  const realTimeWidgets: any[] = [
    {
      id: 'w01_paradigm',
      title: '참치 수출입 단가 추이 (관세청 통관)',
      chartType: 'composed', xAxis: 'Month', unit: 'USD/Ton',
      reliability: 100,
      isLive: w01IsLive,
      syncDate: w01IsLive ? new Date().toISOString().slice(0, 10) : '2026-04 기준(자체 구성)',
      source: w01IsLive
        ? `관세청 KCS nitemtrade HS 160414 월별 통관 실측 (${liveTrade!.period}) [🟢 LIVE]`
        : '관세청 통관 기반 자체 구성 (2026.01~04) · KCS 조회 실패 — 정적 표시',
      situation: '[단가 스프레드 확대] 관세청 실측 통관 데이터 분석 결과, 참치 원어 수입 단가는 글로벌 조업량 한계로 인해 점진적 상승세를 보이고 있으나, 고부가가치 가공품의 수출 단가가 더 가파르게 상승하며 마진 스프레드가 확대되고 있습니다.',
      takeaway: '[가공 마진 락인] 원어 확보 경쟁 심화에 대비해 장기 공급망을 구축하고, 캔/파우치 등 프리미엄 가공품 수출 비중을 늘려 글로벌 수출 시장의 단가 상승 랠리(Rally)를 극대화해야 합니다.',
      methodology: 'KCS nitemtrade HS 160414 월별 합산 — 단가 = 금액(USD) ÷ 중량(kg) × 1000 (USD/Ton). 조회 실패 시 직전 자체 구성값 표시',
      data: w01IsLive
        ? liveTrade!.monthly.map(r => ({
            Month: `${parseInt(r.month.slice(5), 10)}월`,
            수입단가: r.impUnit,
            수출단가: r.expUnit,
          }))
        : [
            { Month: '1월', 수입단가: 1350, 수출단가: 2100 },
            { Month: '2월', 수입단가: 1380, 수출단가: 2150 },
            { Month: '3월', 수입단가: 1420, 수출단가: 2130 },
            { Month: '4월', 수입단가: 1450, 수출단가: 2200 },
          ],
      lines: [
        { key: '수입단가', name: '수입 단가 (USD/Ton)', color: '#F6465D' },
        { key: '수출단가', name: '수출 단가 (USD/Ton)', color: '#0ECB81' },
      ],
    },
    {
      id: 'w02_bluefin',
      title: '참치 어가 추이 및 유가 동향',
      chartType: 'line', xAxis: 'Month', unit: 'USD/Ton',
      reliability: 100,
      isLive: false,
      syncDate: '2026-05 기준(수기)',
      source: 'Atuna 시세 & Singapore MGO (수기 업데이트) · 기준: 2026-05',
      situation: '호르무즈 해협 위기로 선박용 가스유(LSMGO)가 올 초 620달러 선에서 3월 1,624달러까지 약 2.4배 폭등했습니다. 2026년 5월 기준 1,258달러로 진정세를 보였으나, 연초 대비 여전히 2배 높은 수준을 유지하여 선단 수익성에 구조적 압박이 지속된 상황입니다.',
      takeaway: '유가 및 물류비 변동성 리스크를 방어하기 위해 AI 기반 음향 부표(Echosounder buoy)를 즉각 투입하여 탐색 유류비를 획기적으로 감축하고, 어획 수율 개선에 집중하는 FUI 혁신을 최우선으로 추진해야 합니다.',
      methodology: '가다랑어/황다랑어(Atuna 시세)와 싱가포르 MGO 가격 매칭',
      data: [
        { Month: '1월', 가다랑어: 1525, 황다랑어: 2500, 유가: 620 },
        { Month: '2월', 가다랑어: 1580, 황다랑어: 2500, 유가: 686 },
        { Month: '3월', 가다랑어: 1780, 황다랑어: 2500, 유가: 1624 },
        { Month: '4월', 가다랑어: 2025, 황다랑어: 2500, 유가: 1482 },
        { Month: '5월', 가다랑어: 2100, 황다랑어: 2500, 유가: 1258 },
      ],
      lines: [
        { key: '가다랑어', name: '가다랑어 (SKJ)', color: '#2196F3' },
        { key: '황다랑어', name: '황다랑어 (YFT)', color: '#FFC107' },
        { key: '유가', name: 'Singapore MGO (유가)', color: '#FF5252', strokeDasharray: '5 5' },
      ],
    },
  ];

  // ── w62_fuel_impact 라이브 유가 오버라이드 ──────────────────
  const wtiMonths = Object.keys(liveWtiCrude).sort((a, b) => Number(a) - Number(b));
  if (wtiMonths.length > 0) {
    const monthNames = ['', '1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
    const fuelData = wtiMonths.map(m => ({
      Month: monthNames[Number(m)],
      WTI: Math.round(liveWtiCrude[Number(m)] * 10) / 10,
    }));
    const latestWti = fuelData[fuelData.length - 1]?.WTI || 0;
    realTimeWidgets.push({
      id: 'w62_fuel_impact',
      title: 'MGO 유가 충격 (Fuel Impact Index)',
      chartType: 'line', xAxis: 'Month', unit: 'USD/bbl',
      reliability: 100,
      isLive: true, // 이 위젯은 wtiMonths 파싱 성공 시에만 push됨 (실제 라이브)
      source: `Yahoo Finance WTI Crude (CL=F) 실시간 · EUMOFA Fuel Cost Report 2026 · 갱신: ${timestamp.slice(0,10)} [🟢 LIVE]`,
      situation: `[유가 실시간 추적] WTI 원유 최신 월평균 $${latestWti}/bbl. 해상 가스유(MGO)는 WTI 대비 평균 1.3~1.5배 프리미엄으로 형성되며, 참치 조업 원가의 20~50%를 차지하는 핵심 변동비입니다.`,
      takeaway: '[연료비 헤지] 유가 변동성이 직접적으로 조업 수익성을 좌우합니다. 연료 효율 극대화(AI 항로 최적화)와 장기 MGO 선물 계약을 통한 원가 안정화가 최우선 과제입니다.',
      methodology: 'Yahoo Finance WTI Crude Oil (CL=F) 주간 데이터를 월간 평균으로 집계',
      data: fuelData,
      lines: [{ key: 'WTI', name: 'WTI 원유 (USD/bbl)', color: '#FF5252' }],
    } as any);
  }

  data.widgets = data.widgets.map((widget: any) => {
    const override = realTimeWidgets.find(w => w.id === widget.id);
    return override || widget;
  });
  realTimeWidgets.forEach(w => {
    if (!data.widgets.find((e: any) => e.id === w.id)) data.widgets.push(w);
  });

  return NextResponse.json({
    ...data,
    _meta: {
      lastUpdated: timestamp,
      liveApis: {
        kcs_trade: liveTrade ? '🟢 LIVE' : '🟡 Cached',
        wti_crude: wtiMonths.length > 0 ? '🟢 LIVE' : '🟡 Cached',
      },
    },
  });
}
