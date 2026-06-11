// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, ComposedChart, Area, Scatter, ScatterChart, XAxis, YAxis, ZAxis, CartesianGrid, Legend, Cell, Tooltip as RT } from 'recharts';
import { Globe, TrendingUp, ShoppingCart, Target, Zap, Shield, Factory, Truck, Leaf } from 'lucide-react';
import WidgetCard from './WidgetCard';
import * as D from './beefData';
import { ChartPatternDefs, getA11yBarProps, A11Y_PALETTE } from './ChartPatterns';

// KCS LIVE hook (W6 한국 수입 파트너)
function useKcsImports() {
  const [state, setState] = useState<{
    data: typeof D.koreaImportPartnersData;
    isLive: boolean;
    source: string;
    fetched: boolean;
  }>({ data: D.koreaImportPartnersData, isLive: false, source: '관세청 정적 캐시', fetched: false });
  useEffect(() => {
    let alive = true;
    fetch('/api/beef/korea-imports', { signal: AbortSignal.timeout(20000) })
      .then(r => r.json())
      .then(d => { if (alive && d.data) setState({ ...d, fetched: true }); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return state;
}

// KOSIS LIVE hook (W7 한국 수급)
function useKosisSupply() {
  const [state, setState] = useState<{
    data: typeof D.koreaSupplyData;
    isLive: boolean;
    source: string;
    fetched: boolean;
  }>({ data: D.koreaSupplyData, isLive: false, source: 'KOSIS + KREI 정적 캐시', fetched: false });
  useEffect(() => {
    let alive = true;
    fetch('/api/beef/korea-supply', { signal: AbortSignal.timeout(20000) })
      .then(r => r.json())
      .then(d => { if (alive && d.data) setState({ ...d, fetched: true }); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return state;
}

// KAMIS LIVE hook (W8 한우 가격)
function useKamisHanwoo() {
  const [state, setState] = useState<{
    data: typeof D.priceGapData;
    isLive: boolean;
    partialLive: boolean;
    seriesLive: { hanwoo: boolean; usImport: boolean; auImport: boolean };
    source: string;
    fetched: boolean;
  }>({ data: D.priceGapData, isLive: false, partialLive: false, seriesLive: { hanwoo: false, usImport: false, auImport: false }, source: 'KAMIS 정적 캐시', fetched: false });
  useEffect(() => {
    let alive = true;
    fetch('/api/beef/hanwoo-price', { signal: AbortSignal.timeout(20000) })
      .then(r => r.json())
      .then(d => { if (alive && d.data) setState({ ...d, fetched: true }); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return state;
}

// UN Comtrade LIVE 데이터 hook (W5 무역 흐름)
function useComtradeBeef() {
  const [state, setState] = useState<{
    data: typeof D.tradeFlowData;
    isLive: boolean;
    source: string;
    fetched: boolean;
  }>({ data: D.tradeFlowData, isLive: false, source: 'UN Comtrade 정적 캐시', fetched: false });

  useEffect(() => {
    let alive = true;
    fetch('/api/beef/trade-flow', { signal: AbortSignal.timeout(25000) })
      .then(r => r.json())
      .then(d => { if (alive && d.data) setState({ ...d, fetched: true }); })
      .catch(() => { /* fallback 유지 */ });
    return () => { alive = false; };
  }, []);

  return state;
}

// USDA NASS LIVE 데이터 hook (W3 도축장 가동률)
function useNassSlaughter() {
  const [state, setState] = useState<{
    data: typeof D.slaughterData;
    isLive: boolean;
    source: string;
    fetched: boolean;
  }>({ data: D.slaughterData, isLive: false, source: 'USDA NASS + MLA 정적 캐시', fetched: false });

  useEffect(() => {
    let alive = true;
    fetch('/api/beef/slaughter-rate', { signal: AbortSignal.timeout(20000) })
      .then(r => r.json())
      .then(d => { if (alive && d.data) setState({ ...d, fetched: true }); })
      .catch(() => { /* fallback 유지 */ });
    return () => { alive = false; };
  }, []);

  return state;
}

// FAOSTAT LIVE 데이터 공용 hook (W1+W2 통합 endpoint)
function useFaostatProduction() {
  const [state, setState] = useState<{
    productionTrend: typeof D.productionTrendData;
    top5: typeof D.top5ProducersData;
    isLive: boolean;
    source: string;
    fetchedAt: string;
    fetched: boolean;
  }>({
    productionTrend: D.productionTrendData,
    top5: D.top5ProducersData,
    isLive: false,
    source: 'FAOSTAT 정적 캐시',
    fetchedAt: '',
    fetched: false,
  });

  useEffect(() => {
    let alive = true;
    fetch('/api/beef/global-production', { signal: AbortSignal.timeout(20000) })
      .then(r => r.json())
      .then(d => { if (alive && d.productionTrend) setState({ ...d, fetched: true }); })
      .catch(() => { /* fallback 유지 */ });
    return () => { alive = false; };
  }, []);

  return state;
}

const CT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
      <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
          <span style={{ color: e.color }}>■ {e.name}</span>
          <strong>{typeof e.value === 'number' ? e.value.toLocaleString() : e.value}</strong>
        </div>
      ))}
    </div>
  );
};
// 시그니처 그라디언트: red → rose → amber (한우 마블링 컨셉)
const COLORS = ['#dc2626', '#e11d48', '#f59e0b', '#fb923c', '#ef4444', '#f43f5e', '#fbbf24', '#fdba74', '#b91c1c', '#9f1239'];

const W = ({ title, icon, sub, accent, telemetry, sit, strat, source, pillar, status, children }: any) => (
  <WidgetCard
    title={title}
    icon={icon}
    iconColor={accent || '#dc2626'}
    pillar={pillar}
    cardDesc={sub || ''}
    telemetry={{ status: status || 'STATIC', syncDate: telemetry }}
    chartHeight={375}
    chart={children}
    takeaway={{ situation: sit, actionPlan: strat, source }}
  />
);

export function W1_ProductionTrend({ accent }: any) {
  const { productionTrend, isLive, source } = useFaostatProduction();
  const latest = productionTrend[productionTrend.length - 1];
  const first = productionTrend[0];
  const growth = ((latest.production - first.production) / first.production * 100).toFixed(1);
  return <W title="글로벌 소고기 생산량 10년 추이" icon={Globe} accent={accent} pillar="S1"
    status={isLive ? 'LIVE' : 'STATIC'}
    sub="세계 소고기(쇠고기) 생산량(천 톤) 및 글로벌 산지 가격 지수 | FAOSTAT 작물가축통계(QCL) 2015-2024"
    telemetry={isLive ? 'FAOSTAT REST (1h 캐시)' : 'FAOSTAT QCL 2015-2024 정적'}
    sit={`${latest.year}년 글로벌 생산량 ${(latest.production / 10).toFixed(0)}만톤 — 10년간 ${Number(growth) > 0 ? '+' : ''}${growth}% 성장. 가격 지수는 100→${latest.price}로 +${latest.price - 100}% 변동, 공급 대비 신흥국 수요가 우세.`}
    strat="중국·동남아 수요 급증으로 인한 구조적 가격 상승 사이클. 브라질·호주 산지 직매입선 확보 시 중간 유통 마진 대폭 절감 가능(업계 추정)."
    source={source}>
    <ComposedChart data={productionTrend}>
      <ChartPatternDefs /><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} />
      <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
      <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} />
      <RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar yAxisId="left" dataKey="production" name="생산량 (천톤)" fill="#dc2626" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
      <Line yAxisId="right" type="monotone" dataKey="price" name="산지 가격 지수" stroke="#f59e0b" strokeWidth={2.5} dot={true} />
    </ComposedChart>
  </W>;
}

export function W2_Top5Producers({ accent }: any) {
  const { top5, isLive, source } = useFaostatProduction();
  const sumPct = top5.reduce((a, b) => a + b.pct, 0);
  return <W title="글로벌 Top 5 생산국 점유율" icon={Target} accent={accent} pillar="S1"
    status={isLive ? 'LIVE' : 'STATIC'}
    sub="국가별 소고기 생산량(천 톤) 및 글로벌 점유율 | FAOSTAT 작물가축통계(QCL) 2023"
    telemetry={isLive ? 'FAOSTAT REST (1h 캐시)' : 'FAOSTAT QCL 2023 정적'}
    sit={`${top5[0]?.country}(${top5[0]?.pct}%)·${top5[1]?.country}(${top5[1]?.pct}%) 양강 ${(top5[0]?.pct + top5[1]?.pct).toFixed(1)}% 장악. 상위 5국 합산 ${sumPct.toFixed(1)}% — 돼지고기(중국 단독 44%) 대비 분산도 우수.`}
    strat="단일국 의존 리스크는 낮으나 브라질 BSE/벌목 환경 리스크는 EU 그린딜 규제 강화 시 즉시 발화 가능. 호주·미국 이중 헤지 권장."
    source={source}>
    <BarChart data={top5} layout="vertical"><ChartPatternDefs /><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal vertical={false} />
      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
      <YAxis type="category" dataKey="country" stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} width={70} />
      <RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar dataKey="production" name="생산량 (천톤)" radius={[0, 4, 4, 0]}>{top5.map((_, i) => {
        const props = getA11yBarProps(i);
        return <Cell key={i} fill={props.fill} stroke={props.stroke} color={props.color} />;
      })}</Bar>
    </BarChart>
  </W>;
}

export function W3_SlaughterUtil({ accent }: any) {
  const { data, isLive, source } = useNassSlaughter();
  const latest = data[data.length - 1];
  const first = data[0];
  const auDelta = latest.auUtil - first.auUtil;
  return <W title="호주·미국 도축장 가동률 + 도체중" icon={Factory} accent={accent} pillar="S2"
    status={isLive ? 'LIVE' : 'STATIC'}
    sub="미국·호주 주요 도축장 가동률(%) + 평균 도체중(kg) 추이 | 미국 농업통계국(USDA NASS) + 호주 축산공사(MLA)"
    telemetry={isLive ? 'NASS QuickStats (1d 캐시)' : 'USDA NASS + MLA 정적 2024-2025Q1'}
    sit={`호주 가동률이 ${first.month} ${first.auUtil}% → ${latest.month} ${latest.auUtil}% ${auDelta > 0 ? '급등' : '감소'} — 미·호 사이클 ${auDelta > 5 ? '역전' : '안정'}. 미국 최신 ${latest.usUtil}% / 호주 ${latest.auUtil}%, 도체중 미 ${latest.usCarcassKg}kg / 호 ${latest.auCarcassKg}kg.`}
    strat="2025년 호주 공급 사이클 정점 진입. 호주산 장기 선도 계약 조기 체결로 단가 절감 기회(업계 추정 4-6%) 확보 검토."
    source={source}>
    <ComposedChart data={data}><ChartPatternDefs /><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} />
      <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} domain={[60, 100]} />
      <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} domain={[300, 400]} />
      <RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar yAxisId="left" dataKey="usUtil" name="미국 가동률 (%)" fill={A11Y_PALETTE[0]} radius={[4, 4, 0, 0]} />
      <Bar yAxisId="left" dataKey="auUtil" name="호주 가동률 (%)" fill={A11Y_PALETTE[1]} radius={[4, 4, 0, 0]} />
      <Line yAxisId="right" type="monotone" dataKey="usCarcassKg" name="미국 도체중 (kg)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
      <Line yAxisId="right" type="monotone" dataKey="auCarcassKg" name="호주 도체중 (kg)" stroke="#fb923c" strokeWidth={2} dot={{ r: 3 }} />
    </ComposedChart>
  </W>;
}

export function W4_FeedMargin({ accent }: any) {
  return <W title="사료 곡물가 vs 비육 마진 비율" icon={TrendingUp} accent={accent} pillar="S2"
    sub="옥수수·대두박 가격 지수 vs 비육우/곡물가 비율(Feeder Ratio) — 2 이상 시 비육 수익성 양호 | 시카고상품거래소(CBOT) 2022-2023"
    telemetry="시카고상품거래소(CBOT) 2022-2023"
    sit="2022-Q3 곡물가 피크 시 비육 비율 1.3까지 추락 — 비육업자 대량 도축으로 시장 단기 공급 과잉 → 1년 후 공급 부족 사이클 도래."
    strat="옥수수 선물 가격 110 돌파 시 6개월 후 도축 헤드 -10% 예상. 호주 사료 미사용 그래스피드 비중 30%까지 확대로 사료 변동성 헤지."
    source="시카고상품거래소(CBOT) 옥수수·대두박 선물 + 미국 농업통계국(USDA NASS) Feeder Cattle">
    <ComposedChart data={D.feedMarginData}>
      <ChartPatternDefs /><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis dataKey="quarter" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} />
      <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} />
      <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} domain={[1, 3]} />
      <RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Line yAxisId="left" type="monotone" dataKey="cornIndex" name="옥수수 가격 지수" stroke="#f59e0b" strokeWidth={2.5} />
      <Line yAxisId="left" type="monotone" dataKey="soyIndex" name="대두박 가격 지수" stroke="#fb923c" strokeWidth={2} strokeDasharray="5 5" />
      <Bar yAxisId="right" dataKey="feederRatio" name="비육우/곡물 비율" fill="#dc2626" radius={[4, 4, 0, 0]}>{D.feedMarginData.map((e, i) => <Cell key={i} fill={e.feederRatio < 1.5 ? '#ef4444' : e.feederRatio > 2 ? '#10b981' : '#f59e0b'} />)}</Bar>
    </ComposedChart>
  </W>;
}

export function W5_TradeFlow({ accent }: any) {
  const { data, isLive, source } = useComtradeBeef();
  const top1 = data[0];
  const top1Bn = (top1.value / 1000).toFixed(1);
  const total = data.reduce((a, b) => a + b.value, 0);
  const top3Pct = ((data.slice(0, 3).reduce((a, b) => a + b.value, 0) / total) * 100).toFixed(0);
  return <W title="글로벌 무역 흐름 Top 8 경로" icon={Truck} accent={accent} pillar="S3"
    status={isLive ? 'LIVE' : 'STATIC'}
    sub="국가간 소고기 무역 흐름 상위 8개 경로 — 무역액(백만 달러) 및 물량(천 톤) | 유엔 무역통계(UN Comtrade) HS 0201+0202"
    telemetry={isLive ? 'UN Comtrade (1w 캐시)' : 'UN Comtrade 정적 2023'}
    sit={`${top1.route} 단일 경로 $${top1Bn}B(${top1.volume.toLocaleString()}천톤) — 글로벌 최대. Top 3 합산 전체의 ${top3Pct}%로 고집중. 한국이 미·호 양강의 4대 시장.`}
    strat="브·중 단일축이 흔들리면 (브라질 ESG 제재 등) 호주산 공급 부족 즉시 발생. 우루과이·뉴질랜드 백업 라인 조기 구축 권장."
    source={source}>
    <BarChart data={data} layout="vertical" margin={{ left: 5 }}>
      <ChartPatternDefs /><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal vertical={false} />
      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={v => `$${v.toLocaleString()}M`} />
      <YAxis type="category" dataKey="route" stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} width={110} />
      <RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar dataKey="value" name="무역액 (백만 달러)" radius={[0, 4, 4, 0]}>{data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Bar>
    </BarChart>
  </W>;
}

export function W6_KoreaImports({ accent }: any) {
  const { data, isLive, source } = useKcsImports();
  const usAuPct = ((data.find(d => d.country === '미국')?.pct || 0) + (data.find(d => d.country === '호주')?.pct || 0)).toFixed(1);
  return <W title="한국 수입 파트너 다변화 추이" icon={Globe} accent={accent} pillar="S3"
    status={isLive ? 'LIVE' : 'STATIC'}
    sub="한국 소고기 수입 파트너 국가별 물량(톤) + 2018→2023년 점유율 변화 | 관세청(KCS) 무역통계(TM)"
    telemetry={isLive ? 'KCS 관세청 (1w 캐시)' : 'KCS 정적 2023'}
    sit={`미·호 양강 ${usAuPct}% 장악 (${data[0]?.country} ${data[0]?.pct}% / ${data[1]?.country} ${data[1]?.pct}%). 2018년 90.7% 대비 ${(90.7 - Number(usAuPct)).toFixed(1)}%p 감소 — 광우병 우려 점진 해소 + 다변화 진행.`}
    strat="미·호 의존도 80% 이하로 낮추기 위해 우루과이·아르헨티나 직거래선 확장. 단가 절감 및 광우병 리스크 분산 동시 도모(업계 추정 8-12% 절감)."
    source={source}>
    <BarChart data={data} layout="vertical">
      <ChartPatternDefs /><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal vertical={false} />
      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
      <YAxis type="category" dataKey="country" stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} width={70} />
      <RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar dataKey="volume" name="수입량 (톤)" radius={[0, 4, 4, 0]}>{data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Bar>
    </BarChart>
  </W>;
}

export function W7_KoreaSupply({ accent }: any) {
  const { data, isLive, source } = useKosisSupply();
  const first = data[0];
  const last = data[data.length - 1];
  const perCapitaDelta = (((last.perCapita - first.perCapita) / first.perCapita) * 100).toFixed(0);
  const selfDelta = (last.selfRate - first.selfRate).toFixed(1);
  return <W title="한국 소고기 수급 구조 + 1인당 소비량" icon={ShoppingCart} accent={accent} pillar="S4"
    status={isLive ? 'LIVE' : 'STATIC'}
    sub="한국 국내 생산·수입·1인당 연간 소비량 시계열 | 국가통계포털(KOSIS) + 한국농촌경제연구원(KREI) 식량수급표 — 라이브 시 생산량만 KOSIS 사육두수 기반 추정, 수입·소비는 정적"
    telemetry={isLive ? 'KOSIS API (1w 캐시)' : 'KOSIS + KREI 정적 2015-2023'}
    sit={`1인당 소비 ${first.year}~${last.year} ${first.perCapita}→${last.perCapita}kg(+${perCapitaDelta}%). 자급률 ${first.selfRate}%→${last.selfRate}%로 ${selfDelta}%p ${Number(selfDelta) < 0 ? '폭락' : '변동'} — 수입 의존 구조 더욱 심화.`}
    strat="자급률 갭이 지속 확대 추세 — 안정적 수입 인프라(콜드체인+장기 계약) 선점 기업이 향후 5년 시장 주도. 콜드체인 CAPEX 우선 배정."
    source={source}>
    <ComposedChart data={data}>
      <ChartPatternDefs /><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} />
      <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} />
      <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} domain={[10, 16]} />
      <RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar yAxisId="left" dataKey="production" name="국내 생산 (천톤)" fill="#dc2626" radius={[4, 4, 0, 0]} />
      <Bar yAxisId="left" dataKey="imports" name="수입 (천톤)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      <Line yAxisId="right" type="monotone" dataKey="perCapita" name="1인당 소비 (kg)" stroke="#fb923c" strokeWidth={2.5} dot={{ r: 3 }} />
    </ComposedChart>
  </W>;
}

export function W8_PriceGap({ accent }: any) {
  const { data, isLive, partialLive, source } = useKamisHanwoo();
  const latest = data[data.length - 1];
  // 수입육 시리즈는 라이브 경로에서 null일 수 있음 (KAMIS 품목코드 미확정 — 합성·추정값 미생성, A-01)
  const hasUs = data.some((d: any) => typeof d.usImport === 'number' && d.usImport > 0);
  const hasAu = data.some((d: any) => typeof d.auImport === 'number' && d.auImport > 0);
  const gapUs = hasUs && latest.usImport ? (latest.hanwoo / latest.usImport).toFixed(2) : null;
  const gapAu = hasAu && latest.auImport ? (latest.hanwoo / latest.auImport).toFixed(2) : null;
  const sit = `최신 ${latest.month}: 한우 ₩${latest.hanwoo.toLocaleString()}/kg`
    + (gapUs ? `, 미국산 ₩${latest.usImport.toLocaleString()} (갭 ${gapUs}배)` : '')
    + (gapAu ? `, 호주산 ₩${latest.auImport.toLocaleString()} (갭 ${gapAu}배)` : '')
    + (hasUs && hasAu
      ? ' — 외식·B2B 채널 미·호산 압도적 우위.'
      : hasUs
        ? ' — 호주산 수입육은 KAMIS 품목코드 미확정으로 라이브 미연동(추정값 미표시).'
        : ' — 미국산·호주산 수입육 도매가는 KAMIS 품목코드 미확정으로 라이브 미연동(추정값 미표시).');
  return <W title="한우 vs 수입육 도매 가격 갭" icon={TrendingUp} accent={accent} pillar="S4"
    status={isLive ? 'LIVE' : 'STATIC'}
    sub="한우 1등급 vs 미국·호주 수입육 도매가(원/kg) 분기 시계열 | 한국농수산식품유통공사(KAMIS) — 라이브 연동은 한우 한정, 수입육은 품목코드 확정 전까지 정적 캐시 또는 미표시"
    telemetry={isLive ? (partialLive ? '한우 KAMIS LIVE · 수입육 미연동 (1d 캐시)' : 'KAMIS (1d 캐시)') : 'KAMIS 정적 2023-2024'}
    sit={sit}
    strat="한우는 명절·선물 프리미엄 채널에만 집중, 일반 외식 B2B는 호주산 위주로 매입. 호주산 단가 변동성 헤지 위해 6개월 선도 매입 계약."
    source={source}>
    <LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} />
      <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
      <RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Line type="monotone" dataKey="hanwoo" name="한우 1등급" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} />
      {hasUs && <Line type="monotone" dataKey="usImport" name="미국산 수입" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />}
      {hasAu && <Line type="monotone" dataKey="auImport" name="호주산 수입" stroke="#fb923c" strokeWidth={2} dot={{ r: 3 }} />}
    </LineChart>
  </W>;
}

export function W9_DiseaseRisk({ accent }: any) {
  return <W title="국가별 광우병·구제역 발병 리스크 맵" icon={Shield} accent={accent} pillar="S4"
    sub="2018-2024 광우병(BSE)/구제역(FMD) 발병 건수 vs 수출 영향도(%) | 세계동물보건기구(WOAH) 동물보건정보시스템(WAHIS)"
    telemetry="WOAH WAHIS 2018-2024"
    sit="인도(12건/82%) · 중국(8건/65%) 고위험. 호주·독일 무발병 — 청정국 프리미엄 자격. 미국 1건/5% — 안정. 브라질 3건/35%로 중위험 — EU 그린딜 강화 시 즉시 +%P."
    strat="청정국(호주·독일·뉴질랜드)에서 프리미엄 라인 소싱, 중위험국(브라질·아르헨)은 5% 이내 분산 매입. 고위험국은 우회 가공거점도 차단."
    source="세계동물보건기구(WOAH) 동물보건정보시스템(WAHIS)">
    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
      <XAxis type="number" dataKey="outbreaks" name="발병 건수" stroke="#64748b" tick={{ fontSize: 9 }} label={{ value: '2018-2024 발병 건수', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
      <YAxis type="number" dataKey="exportImpact" name="수출 영향도(%)" stroke="#64748b" tick={{ fontSize: 9 }} label={{ value: '수출 영향도 (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
      <ZAxis range={[200, 800]} />
      <RT content={<CT />} cursor={{ strokeDasharray: '3 3' }} />
      <Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Scatter name="국가별 리스크" data={D.diseaseRiskData} fill="#dc2626">
        {D.diseaseRiskData.map((e, i) => <Cell key={i} fill={e.exportImpact > 60 ? '#ef4444' : e.exportImpact > 30 ? '#f59e0b' : '#10b981'} />)}
      </Scatter>
    </ScatterChart>
  </W>;
}

export function W10_CarbonFootprint({ accent }: any) {
  return <W title="단백질별 탄소 발자국 비교" icon={Leaf} accent={accent} pillar="S5"
    sub="1kg 생산 당 온실가스 배출량(kg CO2e/kg) — 소고기 vs 타 단백질 원천 | 식량농업기구(FAO) LEAP + Poore & Nemecek 2018"
    telemetry="FAO LEAP + Poore & Nemecek 2018"
    sit="소고기 99.5kg CO2e/kg — 돈육(12.3) 대비 8배, 수산물(2.9) 대비 34배. EU 탄소국경조정제도(CBAM) 적용 시 추가 비용 발생 예상(업계 추정 kg당 €0.5~1.2)."
    strat="ESG 보고서에서 소고기는 '리스크 항목'으로 분류, 가능한 수산물·가금류 비중 확대. 소고기 라인은 그래스피드·탄소상쇄 인증 한정으로만 유지."
    source="식량농업기구(FAO) Livestock Environmental Assessment + Poore & Nemecek(2018) Science 360:987">
    <BarChart data={D.carbonFootprintData} layout="vertical">
      <ChartPatternDefs /><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal vertical={false} />
      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} />
      <YAxis type="category" dataKey="category" stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} width={90} />
      <RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar dataKey="carbon" name="CO2e (kg/kg 제품)" radius={[0, 4, 4, 0]}>{D.carbonFootprintData.map((e, i) => <Cell key={i} fill={e.carbon > 50 ? '#dc2626' : e.carbon > 10 ? '#f59e0b' : '#10b981'} />)}</Bar>
    </BarChart>
  </W>;
}

export function W11_Premium({ accent }: any) {
  return <W title="그래스피드·유기농 프리미엄 시장 분포" icon={Zap} accent={accent} pillar="S5"
    sub="소고기 세분 시장별 평균 소매가(달러/kg) + 점유율(%) | 미국 농업마케팅서비스(USDA AMS) Retail Report + 닐슨(Nielsen) 2023"
    telemetry="USDA AMS + Nielsen 2023"
    sit="관행 76% / 그래스피드 12% / 유기농 7% / 듀얼인증 3% / 와규·한우 2%. 듀얼인증 단가 $38.7/kg — 관행($18.5) 대비 2.1배, 마진율 우위(업계 추정)."
    strat="와규·한우 + 듀얼인증 프리미엄 라인(합산 5%)이 가격 프리미엄 집중 구간. 듀얼인증 호주 그래스피드 직소싱으로 차별화된 고마진 라인업 구축."
    source="미국 농업마케팅서비스(USDA AMS) Retail Lamb·Beef Report + 닐슨(Nielsen) Premium Meat Tracker 2023">
    <ComposedChart data={D.premiumData}>
      <ChartPatternDefs /><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis dataKey="segment" stroke="#64748b" tick={{ fontSize: 8, fill: '#64748b' }} angle={-15} textAnchor="end" height={70} interval={0} />
      <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={v => `$${v}`} />
      <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
      <RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar yAxisId="left" dataKey="price" name="평균 소매가 (달러/kg)" fill="#dc2626" radius={[4, 4, 0, 0]} />
      <Line yAxisId="right" type="monotone" dataKey="share" name="점유율 (%)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
    </ComposedChart>
  </W>;
}
