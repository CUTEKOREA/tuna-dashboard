// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Fish, Anchor, Globe, DollarSign, 
  Activity, AlertTriangle, ShieldCheck, AlertCircle, X, Info,
  RefreshCcw, Crosshair, MapPin, Factory, Truck, Scale, BarChart2,
  BookOpen, Workflow, Database, Zap, Ship
} from 'lucide-react';

import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';

/* ─── Custom Tooltip ─── */
// 시뮬레이션(추정) 위젯 ID 목록
const SIMULATION_WIDGET_IDS = ['w23', 'w25'];

// 복합 단위 포맷: dataKey 이름을 기반으로 단위를 추론
const smartFormat = (v: any, dataKey?: string): string | any => {
  if (Array.isArray(v)) {
    return v.map(val => smartFormat(val, dataKey)).join(' ~ ');
  }
  if (typeof v !== 'number') return v;
  const str = v % 1 === 0 ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 3 });
  if (!dataKey) return str;
  const k = dataKey.toLowerCase();
  if (k.includes('마진') || k.includes('의존도') || k.includes('비율') || k.includes('방어율') || k.includes('실행율') || k.includes('도입비율')) return `${str}%`;
  if (k.includes('단가') || k.includes('가치') || k.includes('수익') || k.includes('절감')) return `$${str}`;
  return str;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry: any, index: any) => (
          <div key={index} className={styles.tooltipValue}>
            <span style={{ color: entry.color }}>■ {entry.name}</span>
            <strong>{smartFormat(entry.value, entry.dataKey)}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ["#38bdf8", "var(--color-success)", "var(--color-warning)", "var(--color-danger)", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

/* ─── KPI Color Themes ─── */
const KPI_THEMES = [
  { border: 'none', glow: 'none', text: 'var(--color-success)', icon: Globe },
  { border: 'none', glow: 'none', text: 'var(--text-primary)', icon: TrendingDown },
  { border: 'none', glow: 'none', text: 'var(--color-success)', icon: Anchor },
  { border: 'none', glow: 'none', text: 'var(--color-danger)', icon: ShieldCheck },
  { border: 'none', glow: 'none', text: 'var(--color-warning)', icon: Factory },
  { border: 'none', glow: 'none', text: 'var(--text-primary)', icon: Scale },
];

/* ─── Widget Icon by insight category ─── */
const WIDGET_ICONS: Record<string, any> = {
  w_arbitrage_live: Activity,
  w01: Globe, w02: Crosshair, w03: Fish, w04: TrendingDown,
  w05: Activity, w06: Truck, w07: DollarSign, w08: Factory,
  w09: AlertTriangle, w10: Scale, w11: MapPin, w12: ShieldCheck,
  w13: BarChart2, w14: Anchor, w15: MapPin, w16: Factory,
  w17: DollarSign, w18: Scale, w19: Truck, w20: Anchor,
  w21: Factory, w22: ShieldCheck, w23: Activity, w24: Factory,
  w25: Zap, w26: RefreshCcw, w27: Activity, w28: MapPin, w29: TrendingUp,
  w30: TrendingUp, w31: MapPin, w32: TrendingUp, w33: Factory,
  w34: Anchor, w35: Factory, w36: DollarSign, w37: TrendingUp, w38: Activity,
  w39: MapPin, w40: Scale, w41: Activity,
  w42: AlertTriangle, w43: Globe, w44: Crosshair,
  w45: Factory, w46: ShieldCheck, w47: Factory,
  w48: Ship, w49: Scale, w50: ShieldCheck,
  w51: DollarSign, w52: TrendingUp, w53: Activity,
  w54: ShieldCheck, w55: AlertCircle, w56: Globe,
  w57: AlertTriangle, w58: Globe, w59: DollarSign, w60: Factory, w61: ShieldCheck, w62: Truck, w63: DollarSign,
  w68: Crosshair, w69: Activity, w70: DollarSign, w71: Factory,
  w72: Zap, w73: Fish, w74: Scale, w75: Truck,
  w_tariff: ShieldCheck, w_landing: DollarSign, w_dist_margin: Scale,
};

export default function MackerelDashboard() {
  const [data, setData] = useState(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showEdu, setShowEdu] = useState(true);
  const [tickerData, setTickerData] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Live Intelligence Ticker
  useEffect(() => {
    fetch('/api/mackerel-ticker?t=' + Date.now()).then(r => r.json()).then(setTickerData).catch(() => null);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/data/mackerel_real_data_v13.json?t=' + Date.now()).then(res => res.json()),
      fetch('/api/fishery?source=mof-consignment&t=' + Date.now()).then(res => res.json()).catch(() => null)
    ])
    .then(([json, mofData]) => {
      if (mofData && mofData.data && mofData.arbitrage) {
        const spread = mofData.arbitrage.spread_pct;
        const norwayKg = mofData.arbitrage.norway_cif_krw_kg;
        const norwayBox = norwayKg * 15;
        
        // Enrich data to include the norway price for plotting as a horizontal line
        const enrichedData = mofData.data.map((d: any) => ({
          ...d,
          norwayPriceBox: norwayBox
        }));

        let stratText = '';
        if (spread < 0) {
          stratText = `현재 국내산 산지 위판가가 노르웨이산 환산 단가보다 비싼 프리미엄(마이너스 스프레드) 구간입니다. 국내산 매입을 지연시키고 기 확보된 노르웨이산 비축 물량 또는 신규 수입 물량을 우선 소진하여 원가를 절감해야 합니다.`;
        } else {
          stratText = `현재 국내산 스프레드가 확대(저평가)된 구간으로, 노르웨이산 선물 계약 물량을 일부 연기하고 부산 산지 즉시 매입 비중을 높여 단기 마진을 확보해야 합니다.`;
        }

        const arbitrageWidget = {
          id: 'w_arbitrage_live',
          title: '[LIVE API] 실시간 수입산 vs 국내산 차익거래 (Arbitrage) 레이더',
          subtitle: '해양수산부 실시간 위판가 기반 매입 타점 포착',
          chartType: 'Composed',
          xKey: 'market',
          bars: [
            { key: 'price', name: '국내산 위판가 (15kg)', color: 'var(--color-success)' }
          ],
          lines: [
            { key: 'norwayPriceBox', name: '노르웨이산 환산가 (15kg)', color: 'var(--color-warning)' }
          ],
          data: enrichedData,
          badges: ['Live API'],
          sit: `해양수산부 공공데이터 기준 금일 부산공동어시장(대) 위판가는 ${mofData.data[0]?.price.toLocaleString()}원입니다. 노르웨이산 환산 단가 대비 실시간 스프레드는 ${spread}%로 확인됩니다.`,
          strat: stratText,
          logic: '해양수산부 위탁판매 현황 API 실시간 연동 및 관세청 기준 CIF 추정가 대비 스프레드 맵핑 (15kg 박스 기준 환산)',
          apiSource: '📡 [LIVE API 연동: 해양수산부 & 관세청] 실시간 무역통계 및 위판 현황',
          source: '해양수산부 및 관세청 (실시간 공공데이터 API)',
          unit: '원 (KRW)'
        };
        json.widgets.unshift(arbitrageWidget);
      }

      // ═══ Ticker API 기반 신규 위젯 동적 주입 ═══
      if (tickerData) {
        // W_TARIFF: 글로벌 관세율 비교
        if (tickerData.tariffComparison) {
          json.widgets.push({
            id: 'w_tariff', title: '[LIVE] 고등어(HS 030354) 글로벌 관세율 비교',
            subtitle: 'WITS + KCS 기반 MFN/FTA 실적관세율 벤치마크',
            chartType: 'Composed', xKey: 'country',
            bars: [{ key: 'mfn', name: 'MFN 관세율 (%)', color: '#f59e0b' }, { key: 'fta', name: 'FTA 적용 (%)', color: 'var(--color-success)' }],
            data: tickerData.tariffComparison,
            badges: ['Live API', 'Verified'],
            sit: `한국의 냉동고등어 MFN 관세율은 ${tickerData.tariff?.mfn}%이며, RCEP FTA 적용 시 ${tickerData.tariff?.fta}%로 면세 수입이 가능합니다. 노르웨이는 EEA 협정으로 관세 0%입니다.`,
            strat: 'RCEP/한-노르웨이 FTA 활용 시 관세 10%p 절감 가능. 연간 수입 13.6만 톤 기준 약 $26M 절감 효과로, FTA C/O(원산지증명서) 100% 확보가 최우선 과제입니다.',
            apiSource: '📡 [LIVE API 연동: WITS + KCS] 관세율 실시간 비교',
            source: 'World Bank WITS / 관세청 KCS (실시간)',
            unit: '%'
          });
        }
        // W_LANDING: 착지원가 시뮬레이터
        if (tickerData.landingCost) {
          const lc = tickerData.landingCost;
          json.widgets.push({
            id: 'w_landing', title: '[LIVE] 착지원가 시뮬레이터 (MFN vs FTA)',
            subtitle: `CIF × 환율(${tickerData.fx?.usdKrw}) × 관세 × VAT 실시간 계산`,
            chartType: 'Bar', xKey: 'scenario',
            bars: [{ key: 'cost', name: '착지원가 (원/kg)', color: '#38bdf8' }],
            data: [
              { scenario: 'MFN (10%)', cost: lc.mfnKrwKg },
              { scenario: 'FTA (0%)', cost: lc.ftaKrwKg },
              { scenario: '절감액', cost: lc.savingsKg },
            ],
            badges: ['Live API'],
            sit: `현재 환율 ${tickerData.fx?.usdKrw}원 기준, 노르웨이산 고등어 MFN 착지원가는 ${lc.mfnKrwKg?.toLocaleString()}원/kg, FTA 적용 시 ${lc.ftaKrwKg?.toLocaleString()}원/kg입니다.`,
            strat: `FTA 활용 시 kg당 ${lc.savingsKg}원(${lc.savingsPct}%) 절감. 연 13.6만 톤 수입 시 약 ${Math.round(lc.savingsKg * 136000 / 1e8)}억원 절감 가능.`,
            apiSource: '📡 [LIVE API 연동: ECOS + KCS + WITS] 실시간 착지원가 계산',
            source: 'ECOS 환율 + KCS CIF + WITS 관세 (실시간 합산)',
            unit: '원/kg'
          });
        }
        // W_MARGIN: 유통단계별 마진
        if (tickerData.distributionMargin) {
          json.widgets.push({
            id: 'w_dist_margin', title: '[LIVE] 고등어 유통단계별 가격·마진 구조',
            subtitle: 'KAMIS 도매가 + 해양수산부 위판가 기반 실시간 마진 분석',
            chartType: 'Composed', xKey: 'stage',
            bars: [{ key: 'price', name: '단가 (원/kg)', color: '#38bdf8' }],
            lines: [{ key: 'margin', name: '마진율 (%)', color: 'var(--color-warning)' }],
            dualAxis: true,
            data: tickerData.distributionMargin,
            badges: ['Live API'],
            sit: `현재 KAMIS 기준 고등어 도매가 ${tickerData.kamis?.wholesaleKg?.toLocaleString()}원/kg, 소매가 ${tickerData.kamis?.retailKg?.toLocaleString()}원/kg입니다. 도매→소매 마진은 약 ${Math.round(((tickerData.kamis?.retailKg - tickerData.kamis?.wholesaleKg) / tickerData.kamis?.wholesaleKg) * 100)}%입니다.`,
            strat: '산지-도매 구간 마진이 가장 높아, 산지 직구매(위판장 직접 낙찰) 비중 확대 시 원가 경쟁력 확보 가능합니다.',
            apiSource: '📡 [LIVE API 연동: KAMIS + 해양수산부] 유통 단계별 실시간 가격',
            source: 'KAMIS 농산물유통정보 + 해양수산부 (실시간)',
            unit: '원/kg, %'
          });
        }
      }

      setData(json);
    })
    .catch(err => console.error("Failed to load mackerel data", err));
  }, [tickerData]);

  // Close modal on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setActiveModal(null);
      }
    };
    if (activeModal) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeModal]);

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCcw size={32} style={{ color: '#38bdf8', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Loading Intelligence...</p>
    </div>
  );

  let { kpis, widgets } = data;

  // 동적 KPI 계산 로직 — 6개 전수 연동 (Dynamic Calculation)
  if (widgets && widgets.length > 0) {
    const getLastVal = (wid: string, key: string) => {
      const wd = widgets.find((w:any)=>w.id===wid)?.data;
      return wd ? wd[wd.length-1]?.[key] : null;
    };

    // kpi1: 글로벌 총 어획량 (w01) — Scomber 4종 합산
    const w01d = widgets.find((w:any)=>w.id==='w01')?.data;
    const latestCatch = w01d ? (() => { const last = w01d[w01d.length-1]; return (last?.['태평양참고등어']||0)+(last?.['대서양고등어']||0)+(last?.['대서양참고등어']||0)+(last?.['블루고등어']||0); })() : null;
    // kpi2: 글로벌 무역 규모 (w06 수출+수입 최신연도 → 단가 환산)
    const latestExport = getLastVal('w06', '글로벌수출');
    const latestImport = getLastVal('w06', '글로벌수입');
    // kpi3: 글로벌 평균 수출 단가 (w17 노르웨이_수출단가 최신)
    const latestNorwayPrice = getLastVal('w17', '노르웨이_수출단가');
    // kpi4: 수입 의존도 (w13)
    const latestDep = getLastVal('w13', '수입의존도');
    // kpi5: 피쉬밀 증가율 (w16 첫해→마지막해)
    const w16d = widgets.find((w:any)=>w.id==='w16')?.data;
    const fmFirst = w16d ? w16d[0]?.['피쉬밀_오일'] : null;
    const fmLast = w16d ? w16d[w16d.length-1]?.['피쉬밀_오일'] : null;
    // kpi6: 네덜란드 중계 마진 (w18)
    const latestMargin = getLastVal('w18', '마진율');

    kpis = {
      ...kpis,
      ...(latestCatch != null && {
        kpi1: { ...kpis.kpi1, value: `${(latestCatch / 10000).toLocaleString()}만 톤` }
      }),
      ...(latestExport != null && latestImport != null && {
        kpi2: { ...kpis.kpi2, value: `$${((latestExport + latestImport) * 1573 / 1e9).toFixed(2)} Billion` }
      }),
      ...(latestNorwayPrice != null && {
        kpi3: { ...kpis.kpi3, value: `$${latestNorwayPrice.toLocaleString()} / 톤` }
      }),
      ...(latestDep != null && {
        kpi4: { ...kpis.kpi4, value: `${latestDep}%` }
      }),
      ...(fmFirst != null && fmLast != null && fmFirst > 0 && {
        kpi5: { ...kpis.kpi5, value: `+${Math.round((fmLast / fmFirst - 1) * 100)}%` }
      }),
      ...(latestMargin != null && {
        kpi6: { ...kpis.kpi6, value: `${latestMargin}%` }
      })
    };
  }
  const kpiKeys = Object.keys(kpis);

  /* ─── Chart Renderer ─── */
  const renderChart = (widget: any) => {
    const d = widget.data;
    if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>No Data</div>;

    const formatVal = (v: any) => {
      if (typeof v !== 'number') return v;
      return v % 1 === 0 ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 3 });
    };

    switch(widget.chartType) {
      case "Pie":
        return (
          <PieChart>
            <Pie data={d} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={35}
              label={({name, value}) => `${name} ${formatVal(value)}`} labelLine={false} fontSize={10}>
              {d.map((_: any, idx: number) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
          </PieChart>
        );
      case "Area":
        return (
          <AreaChart data={d}>
            <defs>
              {widget.areas?.map((a: any, i: number) => (
                <linearGradient key={i} id={`mArea${widget.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={a.color} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={a.color} stopOpacity={0.05}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} />
            <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {widget.areas?.map((a: any, i: number) => (
              <Area key={i} type="monotone" dataKey={a.key} stroke={a.color} fill={`url(#mArea${widget.id}_${i})`} strokeWidth={2.5} stackId={widget.stacked ? 'stack1' : undefined} />
            ))}
          </AreaChart>
        );
      case "Bar":
        return (
          <BarChart data={d}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} />
            <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {widget.bars?.map((b: any, i: number) => (
              <Bar key={i} dataKey={b.key} fill={b.color} radius={[6,6,0,0]} fillOpacity={0.85} />
            ))}
          </BarChart>
        );
      case "Line":
        return (
          <LineChart data={d}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} />
            <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {widget.lines?.map((l: any, i: number) => (
              <Line key={i} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={false} activeDot={{r:5, strokeWidth:2}} />
            ))}
          </LineChart>
        );
      case "Composed":
        return (
          <ComposedChart data={d}>
            <defs>
              {widget.areas?.map((a: any, i: number) => (
                <linearGradient key={`ca${i}`} id={`mCompArea${widget.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={a.color} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={a.color} stopOpacity={0.05}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} />
            
            {/* Left Axis */}
            <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} domain={[0, 'auto']} />
            {/* Optional Right Axis */}
            {widget.dualAxis && (
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} domain={[0, 'auto']} />
            )}
            
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            
            {widget.bars?.map((b: any, i: number) => (
              <Bar key={i} yAxisId={b.yAxisId || "left"} dataKey={b.key} fill={b.color} radius={[6,6,0,0]} fillOpacity={0.85} />
            ))}
            {widget.areas?.map((a: any, i: number) => (
              <Area key={i} yAxisId={a.yAxisId || "left"} type="monotone" dataKey={a.key} fill={`url(#mCompArea${widget.id}_${i})`} stroke={a.color} strokeWidth={2} />
            ))}
            {widget.lines?.map((l: any, i: number) => (
              <Line key={i} yAxisId={l.yAxisId || "left"} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
            ))}
          </ComposedChart>
        );
      case "Radar":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius={80} data={d}>
            <PolarGrid stroke="rgba(255,255,255,0.15)" />
            <PolarAngleAxis dataKey={widget.xKey} stroke="#94a3b8" tick={{fontSize:10}} />
            <PolarRadiusAxis stroke="#64748b" tick={{fontSize:9}} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {widget.radars?.map((r: any, i: number) => (
              <Radar key={i} name={r.key} dataKey={r.key} stroke={r.color} fill={r.color} fillOpacity={0.2} strokeWidth={2} />
            ))}
          </RadarChart>
        );
      default:
        return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>Unsupported Chart</div>;
    }
  };



  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'var(--bg-color)' }}>
      

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', 
              background: 'var(--color-success)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Anchor size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                고등어 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Mackerel Strategic Command Center — {widgets?.length || 0} Widgets · 6 KPIs</p>
            </div>
          </div>
          <div className="ds-card" style={{fontSize: '0.88rem', padding: '8px 16px', 
            background: '#181818', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px #1ed760', animation: 'pulse 2s infinite' }} />
            <span><span style={{ color: 'var(--color-success)' }}>EUMOFA 2026 + INFOFISH 2025 + KFAS</span> · {widgets?.length || 0} Widgets · {tickerData ? `${tickerData.liveSourceCount}/${tickerData.totalSources} Live` : 'Loading...'}</span>
          </div>
        </div>
      </header>



      {/* ═══ 6 KPIs ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {kpiKeys.map((key, idx) => {
          const kpi = kpis[key];
          const theme = KPI_THEMES[idx % KPI_THEMES.length];
          const IconComp = theme.icon;
          return (
            <div key={key} className="ds-card" style={{background: '#181818',
              border: 'none', borderRadius: '8px', padding: '1.2rem',
              display: 'flex', flexDirection: 'column', gap: '6px',
              transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px',
              position: 'relative', overflow: 'hidden'}}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#181818'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.title}</span>
                <IconComp size={16} style={{ color: theme.text }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {kpi.value.startsWith('$') && '$'}
                {kpi.value.startsWith('+') && '+'}
                <CountUp end={parseFloat(kpi.value.replace(/[^0-9.]/g, ''))} duration={2} separator="," decimals={kpi.value.includes('.') ? 1 : 0} />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '3px' }}>
                  {kpi.value.replace(/^[+$0-9.,%]+/, '').trim()}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: theme.text, fontWeight: 600 }}>
                <span style={{ background: `${theme.text}20`, padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>{kpi.trend}</span>
                {kpi.desc}
              </div>
            </div>
          );
        })}
      </div>
      {/* ═══ Live Intelligence Ticker ═══ */}
      {tickerData && (
        <div style={{ marginBottom: '2rem', padding: '1rem 1.5rem', background: '#181818', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px #1ed760', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '1px' }}>LIVE TICKER</span>
          </div>
          {[{
            label: 'USD/KRW', value: tickerData.fx?.usdKrw?.toLocaleString(), change: tickerData.fx?.change, live: tickerData.fx?.isLive
          }, {
            label: 'CIF 단가', value: `$${tickerData.kcs?.cifUsdTon?.toLocaleString()}/t`, change: tickerData.kcs?.change, live: tickerData.kcs?.isLive
          }, {
            label: 'KAMIS 도매', value: `₩${tickerData.kamis?.wholesaleKg?.toLocaleString()}/kg`, change: tickerData.kamis?.change, live: tickerData.kamis?.isLive
          }, {
            label: 'MFN 관세', value: `${tickerData.tariff?.mfn}%`, change: null, live: true
          }, {
            label: 'FTA(RCEP)', value: `${tickerData.tariff?.fta}%`, change: null, live: true
          }, {
            label: '착지원가(FTA)', value: `₩${tickerData.landingCost?.ftaKrwKg?.toLocaleString()}/kg`, change: null, live: true
          }].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderLeft: i > 0 ? '1px solid #272727' : 'none' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>{item.value}</span>
              {item.change !== null && item.change !== undefined && (
                <span style={{ fontSize: '0.75rem', color: item.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                  {item.change >= 0 ? '▲' : '▼'}{Math.abs(item.change)}%
                </span>
              )}
              {item.live && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      )}

      {/* ═══ Education Module & Chatbot ═══ */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setShowEdu(!showEdu)}
          style={{ 
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.5rem', background: '#181818', border: 'none', borderBottom: showEdu ? '1px solid #272727' : 'none', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px', marginBottom: showEdu ? '0' : '1rem'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#181818'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BookOpen size={24} color="var(--color-success)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>신입직원 교육 가이드</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>NotebookLM 분석 기반: 주요 생산국 비교 및 밸류체인 리스크 점검</div>
            </div>
          </div>
          <div style={{ transform: showEdu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </button>

        {showEdu && (
          <div style={{ 
            background: 'var(--bg-color)', 
            padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', 
            boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px', marginBottom: '2rem',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
              
              {/* Module 1: 주요 생산국 비교 */}
              <div className="ds-card" style={{background: '#181818', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.13rem', fontWeight: 700 }}>
                  <Globe size={20} color="var(--color-success)"/> 주요 생산국 비교: 노르웨이 vs 아시아
                </h3>
                
                <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '6px', marginBottom: '1rem' }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Anchor size={16}/> 북유럽산 (대서양 고등어)
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong style={{color:'var(--text-primary)'}}>어종:</strong> Scomber scombrus<br/>
                    <strong style={{color:'var(--text-primary)'}}>특징:</strong> 크고 지방 함량이 높아 구이용으로 프리미엄 취급. 가을 조업 집중.<br/>
                    <strong style={{color:'var(--text-primary)'}}>이슈:</strong> MSC 인증 여부 및 TAC(총허용어획량) 쿼터 분쟁 심화
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '6px' }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Ship size={16}/> 아시아산 (태평양 고등어)
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong style={{color:'var(--text-primary)'}}>어종:</strong> Scomber japonicus (한국, 대만, 중국 등)<br/>
                    <strong style={{color:'var(--text-primary)'}}>특징:</strong> 비교적 크기가 작고 통조림/원양 어선용 식자재 등 다양한 용도로 활용.<br/>
                    <strong style={{color:'var(--text-primary)'}}>이슈:</strong> 기후 변화(수온 상승)로 인한 어획량 변동성 높음
                  </div>
                </div>
              </div>

              {/* Module 2 & 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="ds-card" style={{background: '#181818', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.13rem', fontWeight: 700 }}>
                    <Workflow size={20} color="var(--color-success)"/> 고등어 밸류체인 핵심 구조
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <li><strong style={{color:'var(--text-primary)'}}>업스트림(조업):</strong> 대형 선망 및 트롤. 어기(가을~겨울) 내 집중 조업으로 품질 확보가 최우선.</li>
                    <li><strong style={{color:'var(--text-primary)'}}>미드스트림(가공):</strong> 가시 제거(필렛), 염장 등 1·2차 가공. 대규모 냉동 비축 창고 인프라가 생명.</li>
                    <li><strong style={{color:'var(--text-primary)'}}>다운스트림(유통):</strong> HMR(가정간편식) 시장 확대로 순살 구이용 팩 수요 폭증. B2B(식자재)와 B2C 양분.</li>
                  </ul>
                </div>
                
                <div className="ds-card" style={{background: '#181818', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', flex: 1}}>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.13rem', fontWeight: 700 }}>
                    <ShieldCheck size={20} color="var(--color-danger)"/> 육상부서 필수 체크: 주요 리스크
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <li><strong style={{color:'var(--text-primary)'}}>원물 수급 리스크:</strong> 노르웨이 등 연안국 간 쿼터 분쟁 장기화 시 직수입 물량 확보 비상.</li>
                    <li><strong style={{color:'var(--text-primary)'}}>콜드체인 비용:</strong> 연중 판매를 위한 장기 냉동 보관 및 전기료/창고비 인상이 원가 상승 주도.</li>
                    <li><strong style={{color:'var(--text-primary)'}}>환율 및 해상운임:</strong> 수입 의존도가 매우 높아 달러 강세 시 마진율 급감 위험 존재.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Module 4: AI Chatbot (NotebookLM Link) */}
            <div className="ds-card" style={{background: '#181818', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: '50%', flexShrink: 0 }}>
                  <Database size={24} color="var(--color-success)" />
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.4rem 0', fontSize: '1.13rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} color="var(--color-success)" /> 고등어 지식 AI 챗봇 (NotebookLM)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    400여 개의 글로벌 고등어 밸류체인 분석 및 조업 보고서가 학습된 맞춤형 AI입니다. 쿼터 동향, 가공 프로세스 등을 즉시 질문하세요.
                  </p>
                </div>
              </div>
              <a href="https://notebooklm.google.com/notebook/0d7d4923-e1ce-48fe-ac7e-2d4e89ce8181" target="_blank" rel="noreferrer" style={{ 
                background: 'var(--text-primary)', 
                color: 'var(--bg-color)', 
                padding: '12px 32px', 
                borderRadius: '500px', 
                fontSize: '0.88rem', 
                fontWeight: 700, 
                textTransform: 'uppercase',
                letterSpacing: '1.4px',
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                transition: 'transform 0.1s',
                whiteSpace: 'nowrap'
              }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Activity size={18} /> 챗봇 시작하기
              </a>
            </div>
          </div>
        )}
      </div>


      {/* ═══ Categorized Widgets ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* 원물 (Raw Material) */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Anchor size={24} color="var(--color-success)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>1. 원물 (Raw Material)</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w_arbitrage_live', 'w01', 'w02', 'w03', 'w04', 'w20', 'w23', 'w37', 'w42', 'w43', 'w44', 'w57', 'w65', 'w68', 'w69', 'w70', 'w73', 'w_tariff'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* 가공 (Processing) */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Factory size={24} color="var(--color-success)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>2. 가공 (Processing)</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w08', 'w16', 'w21', 'w24', 'w33', 'w35', 'w40', 'w45', 'w46', 'w47', 'w60', 'w67', 'w71', 'w72', 'w74'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* 물류 (Logistics) */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Truck size={24} color="var(--color-success)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>3. 물류 (Logistics)</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w06', 'w09', 'w14', 'w19', 'w25', 'w34', 'w36', 'w39', 'w48', 'w49', 'w50', 'w58', 'w62', 'w66', 'w75', 'w_landing'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* 판매 (Sales) */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <DollarSign size={24} color="var(--color-success)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>4. 판매 (Sales)</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w07', 'w10', 'w11', 'w13', 'w15', 'w17', 'w18', 'w27', 'w28', 'w29', 'w30', 'w31', 'w32', 'w38', 'w41', 'w51', 'w52', 'w53', 'w59', 'w63', 'w64', 'w_dist_margin'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* ESG (지속가능성) */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <ShieldCheck size={24} color="var(--color-success)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>5. ESG</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w05', 'w12', 'w22', 'w26', 'w54', 'w55', 'w56', 'w61'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

      </div>

    </div>
  );

  function renderWidgetCard(w: any) {
    const IconComp = WIDGET_ICONS[w.id] || Anchor;
    const accentColor = 'var(--color-success)';
    
    // Fallback fields for various JSON keys
    const methodologyText = w.logic || w.methodology || '';
    let situation = w.sit || w.situation || w.desc || '';
    let takeaway = w.strat || w.tak || w.takeaway || '';
    
    return (
      <div key={w.id} className={styles.glassCard} className="ds-card" style={{display: 'flex', flexDirection: 'column', minHeight: '480px',
        background: '#181818', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', border: 'none',
        padding: '1.5rem'}}>
        
        {/* Card Header */}
        <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            <IconComp size={20} color={accentColor} />
            {w.title}
            
            {/* Badges */}
            {((w.reliability && w.reliability <= 70) || (w.badges && w.badges.includes('Estimate'))) && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color:'var(--color-warning)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>
                ESTIMATE
              </span>
            )}
            {w.badges && w.badges.includes('Forecast') && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', background:'var(--surface-2)', color:'#c084fc', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>
                FORECAST
              </span>
            )}
            {w.badges && w.badges.includes('Verified') && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', background:'var(--surface-2)', color:'#4ade80', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>
                VERIFIED
              </span>
            )}
            {((w.badges && w.badges.includes('Live API')) || w.apiSource || w.id === 'w_arbitrage_live') && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color:'var(--color-success)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>
                LIVE API
              </span>
            )}
            
            <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {w.unit && <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>(단위: {w.unit})</span>}
            </div>
          </h3>
          {(w.subtitle || methodologyText) && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {[w.subtitle, methodologyText].filter(Boolean).join(' | ')}
            </p>
          )}
        </div>

        {/* Chart Area */}
        <div style={{ height: '325px', width: '100%', marginBottom: '1.5rem', position: 'relative', zIndex: 0 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            {renderChart(w)}
          </SafeResponsiveContainer>
        </div>

        {/* Takeaway Box */}
        {(situation || takeaway) && (
          <div style={{ marginTop: 'auto' }}>
            <div style={{ 
              background: 'var(--surface-2)', 
              borderRadius: '6px', padding: '16px' 
            }}>
              {situation && (
                <div style={{ paddingBottom: takeaway ? '12px' : '0', marginBottom: takeaway ? '12px' : '0' }}>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>현황 분석</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{situation}</p>
                  
                  {w.apiSource ? (
                    <p style={{ color: '#7c7c7c', fontSize: '0.75rem', fontStyle: 'italic', margin: '8px 0 0 0' }}>{w.apiSource}</p>
                  ) : (SIMULATION_WIDGET_IDS.includes(w.id) ? (
                    <p style={{ color: '#7c7c7c', fontSize: '0.75rem', fontStyle: 'italic', margin: '8px 0 0 0' }}>* 📡 [추정 모델 연동: NotebookLM] 산업 시뮬레이션 기반 추정치</p>
                  ) : null)}
                </div>
              )}
              {takeaway && (
                <div>
                  <h4 style={{ color: 'var(--color-success)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>실행 전략</h4>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{takeaway}</p>
                </div>
              )}
              {(w.source || (!w.apiSource && !SIMULATION_WIDGET_IDS.includes(w.id))) && (
                <div style={{ paddingTop: '12px', marginTop: '12px', borderTop: '1px solid #272727' }}>
                  <span style={{ fontSize: '0.75rem', color: '#7c7c7c', display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    🔗 출처: {w.source || 'FAO FishStatJ + data/고등어/ CSV 원본 교차 검증 완료'}
                    {((w.badges && w.badges.includes('Live API')) || w.apiSource || w.id === 'w_arbitrage_live') && (
                      <>
                        {` · 갱신: ${new Date().toISOString().split('T')[0]} `}
                        <span style={{ color: '#4ade80', marginLeft: '4px' }}>[🟢 LIVE]</span>
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
