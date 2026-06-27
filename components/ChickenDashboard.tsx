// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { Line, BarChart, Bar, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ReferenceArea
} from 'recharts';
import {
  Globe, TrendingUp, AlertTriangle, Factory, DollarSign, Scale, RefreshCcw,
  Target, Leaf, ShieldAlert, Building2
} from 'lucide-react';
import styles from './MackerelStrategy.module.css';
import WidgetCard from './WidgetCard';
import { TelemetryBadge } from './TelemetryBadge';

import ChickenCorporateWidget from './ChickenCorporateWidget';
import ChickenPartsWidget from './ChickenPartsWidget';
import { InsightTimeGapArbitrage } from './ChickenThaiInsightsA';
import { InsightPartnerMatch } from './ChickenThaiInsightsB';
import { ChartPatternDefs, getA11yBarProps } from './ChartPatterns';
import ChickenUsdaWidgets from './ChickenUsdaWidgets';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((e: any, i: number) => (
          <div key={i} className={styles.tooltipValue}>
            <span style={{ color: e.color }}>■ {e.name}</span>
            <strong>{typeof e.value === 'number' ? e.value.toLocaleString() : e.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const KPI_THEMES = [
  { border: 'rgba(245,158,11,0.5)', glow: 'rgba(245,158,11,0.25)', text: '#f59e0b', icon: Globe },
  { border: 'rgba(217,119,6,0.5)', glow: 'rgba(217,119,6,0.25)', text: '#d97706', icon: TrendingUp },
  { border: 'rgba(234,88,12,0.5)', glow: 'rgba(234,88,12,0.25)', text: '#ea580c', icon: Factory },
  { border: 'rgba(249,115,22,0.5)', glow: 'rgba(249,115,22,0.25)', text: '#f97316', icon: DollarSign },
  { border: 'rgba(180,83,9,0.5)', glow: 'rgba(180,83,9,0.25)', text: '#b45309', icon: Scale },
  { border: 'rgba(220,38,38,0.5)', glow: 'rgba(220,38,38,0.25)', text: '#dc2626', icon: ShieldAlert },
];

const CHICKEN_KPIS: Record<string, any> = {
  k1: { title: '태국산 가공육 전환율 (현재/목표)', value: '13%→25%', trend: '📈', desc: '자사 소싱 전략 지표 (수입 점유율 통계 아님) — B2B 프랜차이즈 스펙인 적용', telemetry: 'static', syncDate: '전략 목표' },
  k2: { title: '한국 총 수입량 (2023 역대최대)', value: '23.5만톤', trend: '💰', desc: '관세 할당(TRQ) 최적화 효과', telemetry: 'static', syncDate: 'KITA 2023' },
  k3: { title: '태국 선도 계약 마진 스프레드', value: '+22.4%', trend: '🛡️', desc: '중매인 마진(4.3%) 완전 회피', telemetry: 'static', syncDate: '추정 (선도계약)' },
  k4: { title: '고부가가치(가공육) 수입 비중', value: '64.5%', trend: '🍗', desc: '글로벌 1위 허브 태국 독점', telemetry: 'static', syncDate: 'FAO 23Y' },
  k5: { title: 'CBOT 옥수수 선물 (사료비)', value: '$4.15↓', trend: '📉', desc: '사육두수 헷징 골든크로스', telemetry: 'static', syncDate: 'CBOT 스냅샷' },
  k6: { title: '수입국 HPAI 청정 진단', value: 'S-Grade', trend: '✨', desc: '태국: 2009년 이후 청정 유지', telemetry: 'static', syncDate: 'OIE/WOAH 스냅샷' },
};

const WIDGET_ICONS: Record<string, any> = {
  w_chicken_global_production: Globe,
  w_chicken_global_export: Target,
  w_chicken_trade_shift: Factory,
  w_chicken_arbitrage: Scale,
  // archived 2026-05-24 — forensic grade C: w_chicken_risk_radar (정성 추정, OIE 미연동)
  w_chicken_processing: Factory,
  w_chicken_corporates: Building2,
  w_chicken_feed_cost: Leaf,
  // archived 2026-05-24 — forensic grade C: w_chicken_eudr_esg (자체 ESG 추정, MSCI 무관)
};

// C-Level PEF Executive Override Protocol (V3.0)
const ENHANCED_INSIGHTS: Record<string, {sit: string, strat: string}> = {
  "w_chicken_trade_shift": {
    sit: `<div>
<p>"HPAI 청정국 지위"란 OIE/WOAH가 인증하는 sanitary 등급. 청정국은 EU·일본·한국 등 prime market 수출 권한 확보, 발병국은 즉시 100% 수입 차단.</p>
<p>현황: <strong>브라질 = HPAI 발병 위험 + 단순 냉동육 위주. 태국 = HPAI 19년 청정 + 고부가 가공육(순살·꼬치) 수출 70%+</strong>. 두 origin은 동일 commodity가 아닌 완전히 다른 위험·부가가치 등급 — 분리 운영 필수.</p>
</div>`,
    strat: `<div>
<p><strong>재정의</strong>: 브라질→태국 전환은 단순 sourcing 다변화가 아닌 <strong>"국내 중간 벤더 마진(4.3%) 회피 + HPAI 위험 zero화의 dual instrument"</strong>.</p>
<p><strong>3단계</strong>: ① GFPT·Betagro LTA(장기계약) 즉시 체결 — 마진 스프레드 20~30% 확보 ② 여름철 복날 쇼티지 시즌 3개월 전 비축 ③ 중간 벤더 우회 직납 구조로 4.3% 마진 내재화.</p>
</div>`
  },
  "w_chicken_feed_cost": {
    sit: `<div>
<p>"CBOT 옥수수 선물"이란 시카고상품거래소에서 거래되는 글로벌 사료 곡물 벤치마크. 닭 사육 원가의 60~70%가 사료 — 옥수수 단가 변동이 곧 닭 마진 변동.</p>
<p>전망(2025E 추정 포함): <strong>CBOT 옥수수 $4.15(2025E)로 전년 대비 하락세 전망 — 사료비 저점 구간. 단, 브라질 HPAI 확산으로 글로벌 사육두수 감축 + 곡물 수요 감소 동시 진행</strong>. 단기 lock-in 윈도우 1~2분기 한정.</p>
</div>`,
    strat: `<div>
<p><strong>재정의</strong>: 곡물가 하락은 단순 원가 절감이 아닌 <strong>"사료비를 12개월 고정하여 마진 변동성을 상당 폭 제어할 수 있는 계약 타이밍 기회"</strong>.</p>
<p><strong>3단계</strong>: ① CBOT 옥수수 forward 선매수 — 12개월 사료비 lock-in ② B2B 프랜차이즈 연간 공급 물량 고정 — 원가 변동성 완충 ③ 사료비 반등 시나리오 대비 태국 공급사와 장기 고정가 계약(LTA) 병행 검토.</p>
</div>`
  },
  // archived 2026-05-24 — w_chicken_eudr_esg (forensic grade C, _archive/api/chicken/eudr-esg/)
  "w_chicken_arbitrage": {
    sit: `<div>
<p>"시간 차익거래(Time Arbitrage)"란 물류 리드타임이 다른 origin 간의 공급 격차를 활용해 가격 변동을 monetize하는 트레이딩 기법. HPAI 발병 시점 대비 리드타임 격차가 마진의 핵심 결정 변수.</p>
<p>업계추정: <strong>태국 현지 공장 발주 → 부산항 입항 15~20일. HPAI 발병 시 리드타임이 짧을수록 가격 상승폭은 비선형적으로 증가</strong>. 태국 10~14일 vs 브라질 56일 차이가 위기 시 vendor 운명 결정.</p>
</div>`,
    strat: `<div>
<p><strong>재정의</strong>: 리드타임 격차는 단순 물류 advantage가 아닌 <strong>"HPAI 사이클 시즌마다 프리미엄 가격을 강제 수취할 systematic arbitrage instrument"</strong>.</p>
<p><strong>3단계</strong>: ① 부산 냉동창고 B2B 직배송망 선제 구축 — 24시간 출고 capa ② 프랜차이즈 긴급 발주 라인 셋업 — premium price 30%+ ③ 태국 램차방→부산 10일 직항 lock — 브라질 발병 시즌마다 손실 없는 가격 결정권 확보.</p>
</div>`
  }
};

// 5-Pillar 네비게이터 메타 (닭고기 시그니처 그라디언트 — 룰북 D-04 amber→orange→red)
const PILLARS = [
  { id: "P1", num: "❶", label: "원료 수급", title: "🐟 Pillar I — 원료 수급", desc: "미국 및 중국 내수 장악 및 사료비 연동 헷징 전략", color: "#f59e0b",
    widgets: ["w_chicken_global_production", "w_chicken_feed_cost", "w_chicken_fx_simulator"] },
  { id: "P2", num: "❷", label: "가공·생산", title: "🏭 Pillar II — 가공 및 생산", desc: "단순 원물에서 고부가 가공육으로의 밸류체인 전환", color: "#d97706",
    widgets: ["w_chicken_trade_shift"] },
  { id: "P3", num: "❸", label: "물류·통관", title: "🚢 Pillar III — 물류 및 통관", desc: "도착 리드타임 활용 시간 차익거래 및 B2B 직송망", color: "#ea580c",
    widgets: ["w_chicken_arbitrage"] },
  { id: "P4", num: "❹", label: "판매·수요", title: "📈 Pillar IV — 판매 및 수요", desc: "프랜차이즈 직거래 스펙인을 통한 유통 마진 극대화", color: "#f97316",
    widgets: ["w_chicken_global_export", "w_chicken_protein_spread", "w_chicken_season_balance"] },
  { id: "P5", num: "❺", label: "ESG·지속가능성", title: "🌱 ❺ ESG 및 지속가능성", desc: "EUDR 반사이익 및 청정 프리미엄 (재구성 중 — MSCI ESG·WOAH WAHIS 실측 연동 예정)", color: "#b45309",
    widgets: [] } // archived 2026-05-24: w_chicken_eudr_esg, w_chicken_risk_radar (forensic grade C)
];

export default function ChickenDashboard() {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [activePart, setActivePart] = useState<'P1' | 'P2' | 'P3' | 'P4' | 'P5'>('P1');

  
  useEffect(() => {
    Promise.all([
      fetch('/api/chicken/global-production').then(r => r.json()),
      fetch('/api/chicken/global-export').then(r => r.json()),
      fetch('/api/chicken/trade-shift').then(r => r.json()),
      fetch('/api/chicken/arbitrage').then(r => r.json()),
      fetch('/api/chicken/processing').then(r => r.json()),
      fetch('/api/chicken/corporates').then(r => r.json()),
      fetch('/api/chicken/feed-cost').then(r => r.json())
      // archived 2026-05-24: /api/chicken/risk-radar, /api/chicken/eudr-esg (forensic grade C)
    ])
    .then((responses) => {
      // Inject C-Level Override & V3.0 compliance
      const processed = responses.map(w => {
        if (!w) return w;
        if (ENHANCED_INSIGHTS[w.id]) {
          w.sit = ENHANCED_INSIGHTS[w.id].sit;
          w.strat = ENHANCED_INSIGHTS[w.id].strat;
        }
        // L-12/L-07: 라우트가 선언한 정직 신호(isLive·telemetry.status·syncDate)를 그대로 소비.
        // truthiness 격상 금지 — isLive === true 일 때만 LIVE, 라우트가 SYNCED를 선언했을 때만 SYNCED.
        const declared = String(w.telemetry?.status || w.telemetryStatus || '').toLowerCase();
        w.telemetryStatus = w.isLive === true ? 'live' : declared === 'synced' ? 'synced' : 'static';
        if (!w.syncDate && w.telemetry?.syncDate) w.syncDate = w.telemetry.syncDate;
        // syncDate 부재 시 위조 fallback 금지 — TelemetryBadge가 날짜를 생략함 (패턴 E 정정)
        return w;
      });
      
      const NEW_WIDGETS = [
        {
          id: 'w_chicken_protein_spread',
          title: '대체 단백질 가격 스프레드 추적기',
          subtitle: '오징어/새우 어획량 급감에 따른 육계 반사이익 마진',
          chartType: 'Composed',
          xKey: 'month',
          telemetryStatus: 'static',
          syncDate: 'FAOSTAT·KCS 스냅샷',
          sit: `<div>
<p>"대체 단백질 가격 스프레드(Substitute Protein Spread)"란 어종·축종 간 가격 elasticity의 cross-section. 수산물 단가 급등 시 소비자는 자동으로 닭고기로 substitution — 닭고기는 수산물 단가의 mirror image instrument.</p>
<p>업계추정: <strong>오징어·새우 어획량 감소로 수산 단백질 단가 상승 국면에서 닭고기 대체 수요가 증가하는 경향이 관측됨. 대체 수요 전환 시 5~8% 추가 마진 확보 가능성 있음</strong>. 단, 수산 단가와 닭고기 수요 간 교차탄력성은 품목별·시기별 편차가 크므로 실측 확인 필요.</p>
</div>`,
          strat: `<div>
<p><strong>재정의</strong>: 대체재 상승은 외부 변수가 아닌 <strong>"수산 위기를 닭고기 마진 확장으로 자동 변환할 substitution arbitrage 시그널"</strong>.</p>
<p><strong>3단계</strong>: ① 수산 단가 지수 +15% 돌파 즉시 프랜차이즈 직납 단가 5~8% 선제 상향 ② 수산 헤지펀드 short 포지션 대비 닭고기 long 포지션 비중 확대 ③ "치킨이 대안" 마케팅 캠페인 동시 launch — 소비자 substitution 가속.</p>
</div>`,
          source: 'FAOSTAT · KCS Export',
          areas: [{key: 'seafoodIndex', color: '#38bdf8', name: '수산물 단가지수'}],
          lines: [{key: 'chickenMargin', color: '#f59e0b', name: '육계 반사이익 마진(%)'}],
          data: [
            { month: '1월', seafoodIndex: 100, chickenMargin: 4.2 },
            { month: '2월', seafoodIndex: 105, chickenMargin: 4.5 },
            { month: '3월', seafoodIndex: 112, chickenMargin: 5.1 },
            { month: '4월', seafoodIndex: 118, chickenMargin: 6.3 },
            { month: '5월', seafoodIndex: 125, chickenMargin: 7.8 },
            { month: '6월', seafoodIndex: 130, chickenMargin: 8.5, isForecast: true },
          ]
        },
        {
          id: 'w_chicken_season_balance',
          title: '삼복 계절성 수요 vs 냉동 출하 밸런스',
          subtitle: '초복/중복/말복 스팟가 방어를 위한 출하량 조절',
          chartType: 'Bar',
          xKey: 'week',
          telemetryStatus: 'static',
          syncDate: 'KAMIS 스냅샷',
          sit: `<div>
<p>"삼복(三伏)"이란 초복·중복·말복 7~8월 한국 닭고기 소비 최절정 시즌. 주간 수요가 평시 대비 2~3배 폭증, vendor의 연간 P&L 결정 분기.</p>
<p>시나리오 추정: <strong>여름철 삼복 스팟 수요 폭증 (W27 초복 28,000톤 vs 평시 12,000톤 가정) → 국내 냉동 비축 출하 지연으로 일시적 shortage 발생. 스팟가 최고점 도달 전 출하 timing이 마진의 결정 변수</strong>. 출하 1주 늦으면 단가 30% 차이.</p>
</div>`,
          strat: `<div>
<p><strong>재정의</strong>: 삼복은 단순 성수기가 아닌 <strong>"비축 → 방출 타이밍 1주 차이가 연간 P&L 20%를 좌우하는 high-stakes operations 게임"</strong>.</p>
<p><strong>3단계</strong>: ① 초복 2주 전부터 자체 비축 물량 집중 방출 — 도매 단가 변동성 흡수 ② AI 기반 일별 출하 알고리즘 도입 — 인간 직관 의존 제거 ③ 중복·말복 spot price spike 직전 forward 단가 lock-in으로 P&L 변동성 헷지.</p>
</div>`,
          source: 'KAMIS · KCS',
          bars: [
            {key: 'demand', color: '#ef4444', name: '시장 스팟 수요(톤)'},
            {key: 'supply', color: '#3b82f6', name: '냉동 비축 출하(톤)'}
          ],
          data: [
            { week: 'W24', demand: 12000, supply: 11500 },
            { week: 'W25', demand: 15000, supply: 13000 },
            { week: 'W26', demand: 19000, supply: 14500 },
            { week: 'W27(초복)', demand: 28000, supply: 18000 },
            { week: 'W28', demand: 24000, supply: 19000 },
            { week: 'W29(중복)', demand: 26000, supply: 18500, isForecast: true },
          ]
        },
        {
          id: 'w_chicken_fx_simulator',
          title: '환율-사료 단가 3단계 시뮬레이터',
          subtitle: '고환율 장기화에 따른 육계 농가 원가 변동 What-If',
          chartType: 'Composed',
          xKey: 'scenario',
          telemetryStatus: 'static',
          syncDate: 'What-If 시나리오',
          sit: `<div>
<p>"What-if 시뮬레이션"이란 환율을 외생 변수로 두고 사료비·생산량 변동을 시나리오별로 정량 예측하는 risk model. 영세 농가는 환율 50원 변동에도 줄도산 가능 — 본질적으로 currency-sensitive 산업.</p>
<p>시나리오(What-If): <strong>원/달러 환율 1,400원 돌파 시 수입 사료비 폭등 → 영세 농가 줄도산 + 국내 생산량 10% 감소 우려. Bull(1,400) 시나리오에서 원가 +12.8%, Extreme(1,450)에서 +18.5%</strong>. 환율은 한국 닭고기 산업의 single biggest external risk.</p>
</div>`,
          strat: `<div>
<p><strong>재정의</strong>: 고환율은 국내 vendor의 위협이 아닌 <strong>"태국 직수입 비중을 자동 확대시키는 sourcing rebalancing 트리거"</strong>. 국내 생산 감소가 곧 수입 vendor의 점유율 expansion.</p>
<p><strong>3단계</strong>: ① Base 시나리오(1,350원) 초과 환율 발생 시 태국산 직수입 비중 25%까지 단계적 확대 ② USD/THB 분기별 forward 헷지로 환차손 완충 ③ Extreme 시나리오(1,450) 대비 외환 위험 헷지 수단(NDF·선물환 등) 검토.</p>
</div>`,
          source: 'CBOT · FX Macro',
          bars: [{key: 'costIncrease', color: '#ea580c', name: '원가 상승폭(%)'}],
          lines: [{key: 'localProduction', color: '#10b981', name: '국내 사육량 지수'}],
          data: [
            { scenario: 'Bear(1300)', costIncrease: 2.1, localProduction: 98 },
            { scenario: 'Base(1350)', costIncrease: 5.5, localProduction: 95 },
            { scenario: 'Bull(1400)', costIncrease: 12.8, localProduction: 88, isForecast: true },
            { scenario: 'Extreme(1450)', costIncrease: 18.5, localProduction: 82, isForecast: true },
          ]
        }
      ];

      setWidgets([...processed, ...NEW_WIDGETS].filter(Boolean));
    })
    .catch(e => console.error(e));
  }, []);

  if (widgets.length === 0) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', flexDirection:'column', gap:'1rem' }}>
      <RefreshCcw size={32} style={{ color:'var(--color-success)', animation:'spin 1s linear infinite' }} />
      <p style={{ color:'#94a3b8' }}>닭고기 인텔리전스 데이터 로딩 중...</p>
    </div>
  );

  const getWidget = (id: string) => widgets.find(w => w.id === id);

  const renderChart = (w: any) => {
    if (!w) return null;
    const d = w.data;
    
    if (!d?.length) return (
      <div style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#64748b',background:'rgba(255,255,255,0.02)',borderRadius:'8px',border:'1px dashed rgba(255,255,255,0.1)'}}>
        <AlertTriangle size={24} style={{marginBottom:'8px',opacity:0.5}}/>
        <span style={{fontSize:'0.85rem',fontWeight:600}}>데이터 집계 중</span>
        <span style={{fontSize:'0.7rem',opacity:0.7,marginTop:'4px'}}>정적 스냅샷 데이터 로딩 중</span>
      </div>
    );
    const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />;
    
    const forecastStartIndex = d.findIndex((item: any) => item.isForecast);
    const hasForecast = forecastStartIndex !== -1;
    const forecastStartKey = hasForecast ? d[forecastStartIndex][w.xKey] : null;
    const forecastEndKey = hasForecast ? d[d.length - 1][w.xKey] : null;

    const CustomXAxisTick = (props: any) => {
      const { x, y, payload } = props;
      const item = d.find((i: any) => i[w.xKey] === payload.value);
      const isForecast = item?.isForecast;
      
      // V3.0 X-Axis Forensic Truncation (Max 6 chars, strip eng parenthesis)
      let displayValue = payload.value;
      if (typeof displayValue === 'string') {
        displayValue = displayValue.replace(/\(.*?\)/g, '').trim();
        if (displayValue.length > 6) displayValue = displayValue.substring(0, 6) + '..';
      }

      return (
        <g transform={`translate(${x},${y})`}>
          <text 
            x={0} y={0} dy={16} 
            textAnchor={d?.length > 5 ? "end" : "middle"} 
            fill={isForecast ? 'var(--color-warning)' : '#64748b'} 
            fontSize={9} 
            fontStyle={isForecast ? 'italic' : 'normal'}
            fontWeight={isForecast ? 'bold' : 'normal'}
            transform={d?.length > 5 ? "rotate(-35)" : ""}
          >
            {displayValue}
          </text>
        </g>
      );
    };

    const xAxis = <XAxis dataKey={w.xKey} stroke="#64748b" tick={<CustomXAxisTick />} height={d?.length > 5 ? 45 : 30} />;
    const yFmt = (v: number) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v.toLocaleString();

    switch(w.chartType) {
      case "Bar":
        return (
          <BarChart data={d}>
            <ChartPatternDefs />
            {grid}{xAxis}
            {w.bars && <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" wrapperStyle={{fontSize:'10px', paddingBottom:'10px'}} />
            {hasForecast && <ReferenceArea x1={forecastStartKey} x2={forecastEndKey} fill="rgba(245,158,11,0.05)" stroke="rgba(245,158,11,0.2)" strokeDasharray="3 3" />}
            {w.bars?.map((b:any,i:number) => {
              const p = getA11yBarProps(i);
              return <Bar yAxisId="left" key={`b${i}`} dataKey={b.key} fill={p.fill} color={b.color || p.color} radius={[4,4,0,0]} fillOpacity={0.85} name={b.name} />;
            })}
          </BarChart>
        );
      case "Composed":
        return (
          <ComposedChart data={d}>
            <ChartPatternDefs />
            {grid}{xAxis}
            {w.areas && <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />}
            {w.bars && <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />}
            {w.lines && <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" wrapperStyle={{fontSize:'10px', paddingBottom:'10px'}} />
            {hasForecast && <ReferenceArea x1={forecastStartKey} x2={forecastEndKey} fill="rgba(245,158,11,0.05)" stroke="rgba(245,158,11,0.2)" strokeDasharray="3 3" />}
            {w.areas?.map((a:any,i:number) => (
              <Area yAxisId="left" key={`a${i}`} type="monotone" dataKey={a.key} fill={a.color} stroke={a.color} fillOpacity={0.4} strokeWidth={2} name={a.name} />
            ))}
            {w.bars?.map((b:any,i:number) => {
              const p = getA11yBarProps(i);
              return <Bar yAxisId="left" key={`b${i}`} dataKey={b.key} fill={p.fill} color={b.color || p.color} radius={[4,4,0,0]} fillOpacity={0.85} name={b.name} />;
            })}
            {w.lines?.map((l:any,i:number) => (
              <Line yAxisId="right" key={`l${i}`} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={true} activeDot={{r:5}} name={l.name} />
            ))}
          </ComposedChart>
        );
      case "Radar":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={d}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey={w.xKey} tick={{fill:'#94a3b8', fontSize:10}} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fontSize:9, fill:'#64748b'}} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" wrapperStyle={{fontSize:'10px', paddingBottom:'10px'}} />
            {w.radars?.map((r:any,i:number) => (
              <Radar key={i} name={r.name} dataKey={r.key} stroke={r.color} fill={r.color} fillOpacity={0.3} />
            ))}
          </RadarChart>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding:'0 1.5rem 3rem', color:'#f8fafc', minHeight:'100vh', fontFamily:"'Inter',sans-serif" }}>

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom:'2rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{ width:'44px', height:'44px', borderRadius:'8px', background: 'var(--surface-3)', display:'flex', alignItems:'center', justifyContent:'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Factory size={24} color="var(--color-warning)" />
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.5px', color: '#f8fafc' }}>
                🐔 육계 글로벌 밸류체인 장악 대시보드
              </h1>
              <p style={{ margin:0, fontSize:'0.8rem', color:'#94a3b8' }}>
                [V4.2 S-Grade] USDA FAS·KITA·FAOSTAT 스냅샷 기반 수출입·차익거래 분석
              </p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ fontSize:'0.8rem', padding:'0.5rem 1rem', background: '#11182f', border: '1px solid rgba(140,170,255,0.10)', borderRadius:'8px', color:'#94a3b8' }}>
              <span style={{ color:'var(--color-warning)' }}>PEF Command Center:</span> USDA FAS·KITA·FAOSTAT 스냅샷 기반 정적 데이터
            </div>
          </div>
        </div>
      </header>

      {/* ═══ KPIs ═══ */}
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'1rem', marginBottom:'2rem' }}>
        {Object.keys(CHICKEN_KPIS).map((key, idx) => {
          const kpi = CHICKEN_KPIS[key]; const t = KPI_THEMES[idx % KPI_THEMES.length]; const I = t.icon;
          return (
            <div key={key} style={{ background: '#11182f', border: '1px solid rgba(255,255,255,0.03)', borderRadius:'12px', padding:'1.2rem', display:'flex', flexDirection:'column', gap:'6px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:'-15px', right:'-15px', width:'60px', height:'60px', borderRadius:'50%', background:`radial-gradient(circle,${t.glow},transparent)`, pointerEvents:'none' }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'0.72rem', color:'#94a3b8', fontWeight:600 }}>{kpi.title}</span>
                {kpi.telemetry ? <TelemetryBadge status={kpi.telemetry} syncDate={kpi.syncDate} /> : <I size={14} style={{ color: t.text }} />}
              </div>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#f8fafc', marginTop:'4px' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize:'0.68rem', color:t.text, fontWeight:600 }}>
                <span style={{ background:`${t.text}20`, padding:'2px 5px', borderRadius:'4px', marginRight:'4px' }}>{kpi.trend}</span>{kpi.desc}
              </div>
            </div>
          );
        })}
      </div>



      {/* ═══ 5-Pillar 밸류체인 네비게이터 ═══ */}
      <div style={{ background: 'linear-gradient(180deg, rgba(20, 28, 52, 0.5), rgba(20, 28, 52, 0.2))', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '6px', marginBottom: '2rem', boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(140,170,255,0.10)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '4px 0 8px', borderBottom: '1px solid rgba(140,170,255,0.10)', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요</span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {PILLARS.map((s, idx) => {
            const isActive = activePart === s.id;
            return (
              <button key={s.id} onClick={() => setActivePart(s.id as any)}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(140,170,255,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${s.color}40`; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; } }}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px 8px 14px', background: isActive ? `${s.color}12` : 'transparent', border: `1.5px solid ${isActive ? s.color : 'transparent'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: isActive ? `0 0 20px ${s.color}25, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none', overflow: 'hidden' }}>
                {isActive && (<div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px', background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`, borderRadius: '3px 3px 0 0' }} />)}
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? s.color : 'rgba(140,170,255,0.12)', color: isActive ? '#0a0f1f' : 'rgba(148,163,184,0.6)', fontSize: '0.75rem', fontWeight: 800, boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none' }}>{idx + 1}</div>
                <span style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, color: isActive ? s.color : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ 5-PILLAR ARCHITECTURE (activePart 필터링) ═══ */}
      {PILLARS.filter(s => s.id === activePart).map((sec) => (
        <div key={sec.id} style={{ marginBottom: '4rem' }}>
          <div style={{ marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
            <div style={{ width:'4px', height:'28px', background:`linear-gradient(180deg,${sec.color},${sec.color}99)`, borderRadius:'2px' }} />
            <div>
              <h2 style={{ margin:0, fontSize:'1.2rem', fontWeight:800, color:'#f8fafc', letterSpacing:'-0.3px' }}>{sec.title}</h2>
              <p style={{ margin:'4px 0 0 0', fontSize:'0.8rem', color:'#94a3b8' }}>{sec.desc}</p>
            </div>
          </div>
          <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem' }}>
            {sec.widgets.map((wId: string, idx: number) => {
              const w = getWidget(wId);
              if (!w) return null;
              const Icon = WIDGET_ICONS[w.id] || Target;
              const pillarS = sec.id.replace('P', 'S') as 'S1'|'S2'|'S3'|'S4'|'S5';
              const status: 'LIVE'|'SYNCED'|'STATIC' = w.telemetryStatus === 'live' ? 'LIVE' : w.telemetryStatus === 'synced' ? 'SYNCED' : 'STATIC';
              return (
                <WidgetCard key={w.id}
                  title={w.title}
                  icon={Icon}
                  iconColor={sec.color}
                  pillar={pillarS}
                  cardDesc={w.subtitle || ''}
                  telemetry={{ status, syncDate: w.syncDate }}
                  chartHeight={375}
                  chart={renderChart(w)}
                  takeaway={{
                    situation: w.sit || '',
                    actionPlan: w.strat || '',
                    source: w.source || '자체추정',
                  }}
                />
              );
            })}
            
            {/* Inject specific complex widgets into specific pillars */}
            {sec.id === 'P2' && <ChickenPartsWidget />}
            {sec.id === 'P3' && <InsightTimeGapArbitrage />}
            {sec.id === 'P4' && <ChickenCorporateWidget />}
            {sec.id === 'P4' && <InsightPartnerMatch />}

            {/* 🆕 USDA FAS GAIN — 한국·브라질·중국 닭고기 시장 (S1·S4) */}
            {sec.id === 'P1' && <ChickenUsdaWidgets filterPillar="S1" />}
            {sec.id === 'P4' && <ChickenUsdaWidgets filterPillar="S4" />}
          </div>
        </div>
      ))}



    </div>
  );
}
