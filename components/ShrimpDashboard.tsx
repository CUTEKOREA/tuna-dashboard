"use client";

import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Scatter
} from 'recharts';
import { 
  TrendingUp, Fish, Anchor, Globe, DollarSign, 
  Activity, AlertTriangle, ShieldCheck, AlertCircle,
  RefreshCcw, MapPin, Factory, Scale, BarChart2,
  Database, Ship, Layers
} from 'lucide-react';
import TermTooltip from './TermTooltip';
import WidgetCard from './WidgetCard';
import { TelemetryBadge } from './TelemetryBadge';
import { ChartPatternDefs, getA11yBarProps } from './ChartPatterns';
import ShrimpFTAQuarterly from './ShrimpFTAQuarterly';
import { truncateXAxis } from '../lib/chart-standards';

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(20, 28, 52, 0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', color: 'var(--w-slate-50)', fontSize: '0.88rem' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>{label}</p>
        {payload.map((entry: any, index: any) => {
          if (entry.value === undefined || entry.name === undefined || entry.name === '') return null;
          if (isNaN(Number(entry.value))) return null;
          return (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
              <span style={{ color: entry.color }}>■ {entry.name}</span>
              <strong style={{ fontWeight: 600 }}>{typeof entry.value === 'number' 
                ? (Number.isInteger(entry.value) 
                  ? entry.value.toLocaleString() 
                  : entry.value.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 2}))
                : entry.value}</strong>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ["#38bdf8", "var(--color-success)", "var(--color-warning)", "var(--color-danger)", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

/* ─── KPI Themes ─── */
/* KPI 테마는 인덱스가 아니라 kpi 키에 고정한다.
   인덱스 배정이면 '양식 비중'에 경고 삼각형이, '교역액'에 위험 빨강이 붙어
   없는 의미가 생긴다. 색은 값의 성격에만 쓴다 — 집중도(kpi3)만 경고색. */
const KPI_THEMES: Record<string, { text: string; icon: any }> = {
  kpi1: { text: 'var(--text-primary)', icon: Database },      // 총생산 — 중립 규모
  kpi2: { text: 'var(--color-success)', icon: TrendingUp },   // 양식 비중 — 구조 전환
  kpi3: { text: 'var(--color-warning)', icon: AlertTriangle },// 단일종 64% — 취약성
  kpi4: { text: 'var(--text-primary)', icon: Globe },         // 교역액 — 중립 규모
  kpi5: { text: 'var(--text-primary)', icon: Ship },          // 최대 수출국 — 중립
  kpi6: { text: 'var(--text-primary)', icon: Scale },         // 한국 수입 — 중립
};
const KPI_THEME_FALLBACK = { text: 'var(--text-primary)', icon: Database };

/* ─── Widget Icons (v4 위젯 + 시리즈 6개국) ─── */
const WIDGET_ICONS: Record<string, any> = {
  w01_paradigm_shift: Activity, w02_top10_by_source: BarChart2, w03_species_concentration: Layers,
  w_series_country_roles: Globe, w04_argentina_landings: Anchor, w50_kfas_bft_pathogen: AlertCircle,
  w03_processing: Factory, w_proc1_type_production: Factory,
  w08_processing_reversal: RefreshCcw, w09_feed_vs_processing_margin: Scale,
  w10_world_exporters: Globe, w11_ecuador_monthly: Ship, w12_reprocessing_hubs: MapPin, w13_kr_import_by_stage: BarChart2,
  w_series_kr_windows: Layers,
  w14_top_import_markets: DollarSign, w15_pinksheet_nominal: TrendingUp, w16_spain_exw_ladder: Scale,
  w_kr_shrimp_origin_price: DollarSign, w_series_kr_unit: DollarSign, w_proc2_kr_import_type: BarChart2,
  w_india_shaphari: ShieldCheck, w_vn_traceability_risk: AlertTriangle, w21_cert_landscape: ShieldCheck,
};

/* ─── 5-Pillar 단일 배열 (Pollock 패턴 — 위젯 배치 + 주입 컴포넌트 일원화) ───
   위젯 id 출처: docs/2026-08-13_shrimp_redesign_p2_component.md 1장 표
   (public/data/shrimp_real_data_v4.json 생성 후에는 JSON의 pillar 필드가 정본) */
type PillarId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
type PillarDef = {
  id: PillarId;
  num: string; label: string; title: string; desc: string; color: string;
  icon: React.FC<any>;
  // readonly string[]로 넓혀둔다. `as const` 튜플이면 PILLARS.find()의 결과가 5개 리터럴
  // 튜플의 유니온이 되어 .includes() 파라미터가 never로 좁혀진다.
  widgets: readonly string[];
  customInject: readonly React.FC[];
};

const PILLARS: readonly PillarDef[] = [
  { id: 'S1', num: '❶', label: '원료 수급', title: '🦐 제1기둥 · 원료 수급',
    desc: '글로벌 양식·어획 동향, 시리즈 6개국 역할, 질병 리스크', color: '#10b981', icon: Anchor,
    widgets: ['w01_paradigm_shift', 'w02_top10_by_source', 'w03_species_concentration', 'w_series_country_roles', 'w04_argentina_landings', 'w50_kfas_bft_pathogen'],
    customInject: [] },
  { id: 'S2', num: '❷', label: '가공·생산', title: '🏭 제2기둥 · 가공·생산',
    desc: '가공 유형별 생산, 가공 전환·마진, 한국 수입 가공품 구조', color: '#14b8a6', icon: Factory,
    widgets: ['w03_processing', 'w_proc1_type_production', 'w08_processing_reversal', 'w09_feed_vs_processing_margin'],
    customInject: [] },
  { id: 'S3', num: '❸', label: '물류·통관', title: '🚢 제3기둥 · 물류·통관',
    desc: '글로벌 수출 경쟁, 에콰도르 동향, 재가공 허브, 한국 수입 단계·시리즈 창구', color: '#0d9488', icon: Ship,
    widgets: ['w10_world_exporters', 'w11_ecuador_monthly', 'w12_reprocessing_hubs', 'w13_kr_import_by_stage', 'w_series_kr_windows'],
    customInject: [ShrimpFTAQuarterly] },
  { id: 'S4', num: '❹', label: '판매·수요', title: '📈 제4기둥 · 판매·수요',
    desc: '수입 시장 단가 트렌드, 원산지별 가격 구조, 시리즈 창구 단가', color: '#5eead4', icon: DollarSign,
    widgets: ['w14_top_import_markets', 'w15_pinksheet_nominal', 'w16_spain_exw_ladder', 'w_kr_shrimp_origin_price', 'w_series_kr_unit', 'w_proc2_kr_import_type'],
    customInject: [] },
  { id: 'S5', num: '❺', label: 'ESG·지속가능성', title: '🌱 제5기둥 · ESG·지속가능성',
    desc: '양식 인증·추적성, 지속가능성 컴플라이언스', color: '#99f6e4', icon: ShieldCheck,
    widgets: ['w_india_shaphari', 'w_vn_traceability_risk', 'w21_cert_landscape'],
    customInject: [] },
];

/* ─── Term Tooltip Parser ─── */
const TERM_DICTIONARY: Record<string, string> = {
  "SECA": "한–에콰도르 전략적경제협력협정. 이 화면 기준일에 발효일과 양허표 원문은 확인하지 못했다.",
  "VKFTA": "한–베트남 자유무역협정. 실행세율은 세번별로 따로 확인한다.",
  "CEPA": "한–인도 포괄적경제동반자협정. 발효 중이지만 실행세율은 이 화면이 다시 읽지 않았다.",
  "EMS": "조기폐사증후군(Early Mortality Syndrome). 새우 양식업의 치명적 질병으로 폐사율이 100%에 달할 수 있음.",
  "FCR": "사료요구율(Feed Conversion Ratio). 생물 1kg을 생산하기 위해 투입되는 사료의 양. 낮을수록 효율적.",
  "바이오플락": "미생물을 활용하여 사육수 내 오염물질을 정화하고, 이를 다시 사료화하는 친환경 양식법.",
  "Biofloc": "미생물을 활용하여 사육수 내 오염물질을 정화하고, 이를 다시 사료화하는 친환경 양식법.",
  "IQF": "개별급속냉동(Individual Quick Freezing). 한 마리씩 영하 40도 이하로 급속 냉동하여 신선도를 유지하는 가공 기술.",
  "CSDDD": "EU 공급망 실사 지침(Corporate Sustainability Due Diligence Directive). 인권 및 환경 리스크 실사를 의무화한 법안.",
  "초분광": "초분광 이미징(Hyperspectral Imaging). 가시광선 외의 수백 개 파장을 분석하여 성분과 신선도를 비파괴적으로 검증하는 기술.",
  "미세조류": "미세조류(Microalgae). 어분(Fishmeal)을 대체할 수 있는 고단백질, 오메가-3 등 풍부한 영양을 가진 지속가능한 사료 원료."
};

const parseTextWithTooltips = (text: string) => {
  if (!text) return text;
  const terms = Object.keys(TERM_DICTIONARY).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${terms.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const termKey = terms.find(t => t.toLowerCase() === part.toLowerCase());
    if (termKey) {
      return <TermTooltip key={i} term={part} description={TERM_DICTIONARY[termKey]} />;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

const formatYAxis = (v: number, unit?: string) => {
  let formatted: string | number = v;
  if (v >= 1000000) formatted = (v / 1000000).toFixed(1) + 'M';
  else if (v >= 1000) formatted = (v / 1000).toFixed(0) + 'k';
  return formatted + (unit ? ` ${unit}` : '');
};

export default function ShrimpDashboard() {
  const [data, setData] = useState<any>(null);
  const [activePart, setActivePart] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5'>('S1');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/data/shrimp_real_data_v4.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Failed to load shrimp data", err));
  }, []);

  // 회귀 감지: v4 위젯은 전부 pillar 필드를 갖고 PILLARS와 1:1 대응해야 함.
  // 미매핑 위젯이 나타나면 조용히 버리지 않고 개발 콘솔에 경고.
  useEffect(() => {
    if (!data?.widgets) return;
    const mapped = new Set<string>(PILLARS.flatMap(p => p.widgets as readonly string[]));
    const unmapped = (data.widgets as any[]).filter(w => !mapped.has(w.id));
    if (unmapped.length > 0) {
      console.warn(
        `[ShrimpDashboard] PILLARS 미매핑 위젯 ${unmapped.length}건: ${unmapped.map(w => w.id).join(', ')} — PILLARS 배열에 추가 필요`
      );
    }
  }, [data]);

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
      <RefreshCcw size={32} style={{ color: '#f97316', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--w-slate-400)', fontSize: '1rem' }}>Loading Intelligence...</p>
    </div>
  );

  const { kpis, widgets } = data;
  const kpiKeys = Object.keys(kpis);

  // v4는 정적 스냅샷이 정본 — API 바인딩 없음. 제목의 영문 괄호만 정리.
  const displayWidgets = widgets?.map((w: any) => {
    const newW = { ...w };
    if (newW.title) {
       newW.title = newW.title.replace(/\s*\([A-Za-z\s]+\)/g, '');
    }
    return newW;
  });

  /* ─── Unified Chart Renderer ───
     NEW FORMAT(xKey/bars/lines/areas)과 OLD FORMAT(xAxis/series)을 공통 중간 표현
     { xKey, series: [{ key, name, color, type, yAxisId }] }로 정규화한 뒤 단일 switch로 렌더.
     포맷 고유의 스타일 차이(축 색·마진·dual-axis 판정·gradient id 규칙)는 isNew 플래그로 보존. */
  const renderChart = (widget: any) => {
    const d = widget.data;
    if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--w-slate-500)'}}>데이터 없음</div>;
    const chartType = (widget.chartType || '').toLowerCase();

    const isNew = !!(widget.xKey || widget.bars || widget.lines || widget.areas);

    type NormSeries = { key: string; name: string; color?: string; type: 'bar' | 'line' | 'area' | 'scatter'; yAxisId: 'left' | 'right' };
    let xKey: string;
    let series: NormSeries[];
    if (isNew) {
      // dual-axis: bars·lines 공존 시 lines가 우축 (기존 hasDualAxis 규칙 그대로)
      const dualAxis = (widget.bars?.length || 0) > 0 && (widget.lines?.length || 0) > 0;
      xKey = widget.xKey;
      if (chartType === 'area') {
        series = (widget.areas || []).map((a: any): NormSeries => ({ key: a.key, name: a.name || a.key, color: a.color, type: 'area', yAxisId: 'left' }));
      } else if (chartType === 'bar' || chartType === 'composed') {
        series = [
          ...(widget.bars || []).map((b: any): NormSeries => ({ key: b.key, name: b.name || b.key, color: b.color, type: 'bar', yAxisId: 'left' })),
          ...(widget.lines || []).map((l: any): NormSeries => ({ key: l.key, name: l.name || l.key, color: l.color, type: 'line', yAxisId: dualAxis ? 'right' : 'left' })),
        ];
      } else {
        series = []; // pie: data의 name/value 직접 사용
      }
    } else {
      xKey = widget.xAxis || '연도';
      series = (widget.series || []).map((s: any): NormSeries => ({
        key: s.dataKey,
        name: s.name || s.dataKey,
        color: s.color,
        type: s.type || (chartType === 'composed' ? 'bar' : chartType),
        yAxisId: s.yAxisId || 'left',
      }));
    }

    const hasRightAxis = series.some(s => s.yAxisId === 'right');
    // 축 라벨 솎기 정책.
    // 범주형 축(국가·사업부·허브)에서 라벨을 솎으면 막대가 어느 항목인지 못 읽는다.
    // 실제로 상위 10개국 차트에서 4위 에콰도르와 9위 방글라데시 이름이 사라졌다.
    // 시계열(연도 75개)은 반대로 전부 그리면 겹치므로 솎는 게 맞다.
    // 데이터 포인트가 적으면 범주형으로 보고 전부 그린다.
    const CATEGORICAL_MAX = 14;
    const isCategorical = d.length <= CATEGORICAL_MAX;
    // 라벨을 다 그리면 좁은 카드에서 겹친다. 항목이 많거나 라벨이 길면 기울인다.
    // 룰북 D-05의 Korean smart rotation(-45° + textAnchor="end" + 하단 여유).
    const longestLabel = isCategorical
      ? Math.max(0, ...d.map((row: any) => String(row?.[xKey] ?? '').length))
      : 0;
    const needsRotation = isCategorical && (d.length >= 7 || longestLabel >= 6);
    const axisTickProps = isCategorical
      ? {
          interval: 0 as const,
          ...(needsRotation
            ? { angle: -45, textAnchor: 'end' as const, height: 90 }
            : {}),
        }
      : { minTickGap: 20 };

    const axisStroke = isNew ? '#64748b' : '#94a3b8';
    const axisTick = isNew ? { fontSize: 10 } : { fill: '#94a3b8', fontSize: 11 };
    const gridStroke = isNew ? 'rgba(140,170,255,0.12)' : 'rgba(140,170,255,0.10)';
    const oldMargin = { top: 20, right: 10, left: -10, bottom: 0 };
    const pieLabel = ({ name, value, percent }: any) => percent > 0.03 ? `${name} ${typeof value === 'number' ? value.toLocaleString() : value}` : '';
    // 부분월(partial) 포인트: 회색 Cell로 구분 — 완월 막대 옆 -93% 붕괴 착시 방지 (spec 3장)
    const hasPartial = (chartType === 'bar' || chartType === 'composed') && d.some((row: any) => row?.partial === true);
    const partialCells = (barFill: string) => hasPartial
      ? d.map((row: any, idx: number) => <Cell key={idx} fill={row?.partial === true ? 'var(--text-secondary)' : barFill} />)
      : null;

    switch (chartType) {
      case "pie":
        return (
          <PieChart>
            <Pie data={d} dataKey="value" nameKey="name" cx="50%" cy="50%"
              outerRadius={isNew ? 85 : 80} innerRadius={isNew ? 35 : 50} paddingAngle={isNew ? 0 : 5}
              label={pieLabel} labelLine={false} fontSize={10}>
              {d.map((_: any, idx: number) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', ...(isNew ? { color: 'var(--w-slate-300)' } : {}) }} iconType={isNew ? undefined : 'circle'} verticalAlign="top" height={36} />
          </PieChart>
        );
      case "area":
        return (
          <AreaChart data={d} margin={isNew ? undefined : oldMargin}>
            {isNew && (
              <defs>
                {series.map((a, i) => (
                  <linearGradient key={i} id={`sArea${widget.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={a.color} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={a.color} stopOpacity={0.05}/>
                  </linearGradient>
                ))}
              </defs>
            )}
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={isNew ? false : undefined} />
            <XAxis dataKey={xKey} stroke={axisStroke} tick={axisTick} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} {...axisTickProps} />
            <YAxis stroke={axisStroke} tick={axisTick} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType={isNew ? undefined : 'circle'} verticalAlign="top" height={36} />
            {series.map((a, i) => (
              <Area key={i} type="monotone" dataKey={a.key} name={a.name} stroke={a.color}
                fill={isNew ? `url(#sArea${widget.id}_${i})` : a.color}
                fillOpacity={isNew ? undefined : 0.5}
                strokeWidth={isNew ? 2.5 : 2} />
            ))}
          </AreaChart>
        );
      case "line":
        return (
          <LineChart data={d} margin={isNew ? undefined : oldMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={isNew ? false : undefined} />
            <XAxis dataKey={xKey} stroke={axisStroke} tick={axisTick} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} {...axisTickProps} />
            <YAxis yAxisId="left" stroke={axisStroke} tick={axisTick} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke={axisStroke} tick={axisTick} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType={isNew ? undefined : 'circle'} verticalAlign="top" height={36} />
            {series.map((s, i) => (
              <Line key={i} yAxisId={s.yAxisId} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        );
      case "bar":
      case "composed": {
        if (!isNew && chartType === 'bar') {
          return (
            <BarChart data={d} margin={oldMargin}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey={xKey} stroke={axisStroke} tick={axisTick} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} {...axisTickProps} />
              <YAxis stroke={axisStroke} tick={axisTick} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(140,170,255,0.10)'}} />
              <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
              {series.map((s, i) => {
                const p = getA11yBarProps(i);
                return (
                  <Bar key={i} dataKey={s.key} name={s.name} fill={p.fill} color={s.color || p.color} radius={[6, 6, 0, 0]}>
                    {partialCells(p.fill)}
                  </Bar>
                );
              })}
            </BarChart>
          );
        }
        if (!isNew) {
          return (
            <ComposedChart data={d} margin={oldMargin}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey={xKey} stroke={axisStroke} tick={axisTick} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} {...axisTickProps} />
              <YAxis yAxisId="left" stroke={axisStroke} tick={axisTick} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
              {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke={axisStroke} tick={axisTick} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />}
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
              {series.map((s, i) => {
                if (s.type === 'line') return <Line key={i} yAxisId={s.yAxisId} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5} dot={{r: 3}} />;
                if (s.type === 'scatter') return <Scatter key={i} yAxisId={s.yAxisId} dataKey={s.key} name={s.name} fill={s.color} />;
                const p = getA11yBarProps(i);
                return (
                  <Bar key={i} yAxisId={s.yAxisId} dataKey={s.key} name={s.name} fill={p.fill} color={s.color || p.color} radius={[6, 6, 0, 0]}>
                    {partialCells(p.fill)}
                  </Bar>
                );
              })}
            </ComposedChart>
          );
        }
        return (
          <ComposedChart data={d}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey={xKey} stroke={axisStroke} tick={axisTick} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} {...axisTickProps} />
            <YAxis yAxisId="left" stroke={axisStroke} tick={axisTick} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke={axisStroke} tick={axisTick} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} verticalAlign="top" height={36} />
            {series.map((s, i) => {
              if (s.type === 'line') return <Line key={i} yAxisId={s.yAxisId} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5} dot={false} activeDot={{r:5}} />;
              const p = getA11yBarProps(i);
              return (
                <Bar key={i} yAxisId="left" dataKey={s.key} name={s.name} fill={p.fill} color={s.color || p.color} radius={[6,6,0,0]} fillOpacity={0.85}>
                  {partialCells(p.fill)}
                </Bar>
              );
            })}
          </ComposedChart>
        );
      }
      default:
        return <div style={{color:'var(--w-slate-500)',textAlign:'center',marginTop:'40px'}}>Unsupported</div>;
    }
  };

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'transparent' }}>
      
      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--w-emerald-500) 0%, #14b8a6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Fish size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                새우 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>6개국 산업 보고서를 5기둥에 재구성. {displayWidgets?.length ?? 0}개 위젯 · {kpiKeys.length}개 핵심지표</p>
            </div>
          </div>
          {/* 데이터 빈티지 배지 — 정적 스냅샷 기준 연도만 정직 표기 (L-09) */}
          <div className="ds-card" style={{fontSize: '0.88rem', padding: '8px 16px', 
            background: '#11182f', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <Database size={14} style={{ color: 'var(--w-emerald-500)', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-primary)' }}>FishStat 2026.1.0 · 2024년 기준</span>
          </div>
        </div>
      </header>

      {/* ═══ 6 KPIs ═══ */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {kpiKeys.map((key) => {
          const kpi = kpis[key];
          const theme = KPI_THEMES[key] ?? KPI_THEME_FALLBACK;
          const IconComp = theme.icon;
          const parsed = parseAnimatedValue(kpi.value);
          return (
            <div key={key} className="ds-card" style={{
              background: 'rgba(24, 24, 24, 0.85)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(140, 170, 255, 0.10)', borderRadius: '8px', padding: '1.2rem',
              display: 'flex', flexDirection: 'column', gap: '6px',
              transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px',
              position: 'relative', overflow: 'hidden'}}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(24, 24, 24, 0.85)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '80%' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                    {kpi.title}
                  </span>
                  {/* P0 정정: kpi3·kpi6은 라우트 응답이 mock/합성 산식이므로 LIVE 위장 금지 —
                      JSON의 정직한 telemetry(static)+기준연도만 표기 (L-09) */}
                  {kpi.telemetry && (
                    <TelemetryBadge status={kpi.telemetry as any} syncDate={kpi.syncDate} />
                  )}
                </div>
                <IconComp size={16} style={{ color: theme.text, flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {/* P0 정정: kpi3 라우트 값은 양쪽 분기 모두 하드코딩 mock($8,113)이고,
                    kpi6의 693×(환율/1385)은 USD 적자를 KRW 환율로 스케일링한 무의미 산식 — 둘 다 제거.
                    JSON 원값(기준연도 명시)만 정직 표기. */}
                {parsed ? (
                  <CountUp end={parsed.numberVal} duration={2} separator="," decimals={parsed.decimals} prefix={parsed.prefix} suffix={parsed.suffix} />
                ) : kpi.value}
              </div>
              <div style={{ fontSize: '0.88rem', color: theme.text, fontWeight: 600 }}>
                <span style={{ background: `${theme.text}20`, padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>{kpi.trend}</span>
                {kpi.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ 5-Pillar 밸류체인 네비게이터 ═══ */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(20, 28, 52, 0.5), rgba(20, 28, 52, 0.2))',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '16px',
        padding: '6px',
        marginBottom: '2rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(140,170,255,0.10)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '4px 0 8px',
          borderBottom: '1px solid rgba(140,170,255,0.10)',
          marginBottom: '6px',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(var(--w-slate-400-rgb), 0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            밸류체인 네비게이터. 아래 단계를 클릭해 탐색하세요
          </span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {PILLARS.map((s, idx) => {
            const isActive = activePart === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActivePart(s.id)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(140,170,255,0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = `${s.color}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
                style={{
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  padding: '12px 8px 14px',
                  background: isActive ? `${s.color}12` : 'transparent',
                  border: `1.5px solid ${isActive ? s.color : 'transparent'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? `0 0 20px ${s.color}25, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
                  overflow: 'hidden',
                }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px',
                    background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
                    borderRadius: '3px 3px 0 0' }} />
                )}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? s.color : 'rgba(140,170,255,0.12)',
                  color: isActive ? '#0a0f1f' : 'rgba(var(--w-slate-400-rgb), 0.6)',
                  fontSize: '0.75rem', fontWeight: 800,
                  transition: 'all 0.25s',
                  boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none',
                }}>{idx + 1}</div>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? s.color : 'var(--text-secondary)',
                  transition: 'all 0.25s',
                  whiteSpace: 'nowrap',
                }}>{s.label}</span>
                {isActive && (
                  <span style={{
                    fontSize: '0.6rem', color: 'rgba(var(--w-slate-400-rgb), 0.7)',
                    textAlign: 'center', lineHeight: 1.3, marginTop: '2px', padding: '0 4px',
                  }}>
                    {s.desc.slice(0, 24)}…
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ 활성 Pillar 위젯 그리드 ═══ */}
      {(() => {
        const pillar = PILLARS.find(p => p.id === activePart)!;
        const PillarIcon = pillar.icon;
        const pillarWidgets = displayWidgets?.filter((w: any) => pillar.widgets.includes(w.id)) || [];

        return (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <PillarIcon size={24} color={pillar.color} />
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pillar.title}</h2>
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: pillar.color, background: `${pillar.color}15`, padding: '3px 10px', borderRadius: '500px', fontWeight: 600 }}>
                {pillarWidgets.length + pillar.customInject.length} 위젯
              </span>
            </div>
            <p style={{ margin: '0 0 1.5rem 34px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{pillar.desc}</p>
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {pillarWidgets.length === 0 && pillar.customInject.length === 0
                ? <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>이 단계에 위젯이 없습니다</div>
                : <>
                    {pillarWidgets.map((w: any) => renderWidgetCard(w))}
                    {pillar.customInject.map((Comp, i) => <Comp key={`inject-${pillar.id}-${i}`} />)}
                  </>}
            </div>
          </section>
        );
      })()}
    </div>
  );

  function renderWidgetCard(w: any) {
    const IconComp = WIDGET_ICONS[w.id] || Fish;
    const accentColor = 'var(--color-success)';
    // v4 위젯은 pillar 필드를 직접 보유 — 섹션 id 주입 방식 폐기
    const pillar: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' = ['S1', 'S2', 'S3', 'S4', 'S5'].includes(w.pillar) ? w.pillar : 'S4';

    const situation = w.sit || w.situation || '';
    const takeaway = w.strat || w.tak || w.takeaway || '';
    // v4는 telemetry를 SYNCED/STATIC으로 직접 제공 — 그대로 신뢰. LIVE 승격 경로 없음 (L-09)
    const rawTelemetry = typeof w.telemetry === 'string' ? w.telemetry.toUpperCase() : '';
    const honestStatus: 'LIVE' | 'SYNCED' | 'STATIC' = rawTelemetry === 'SYNCED' ? 'SYNCED' : 'STATIC';
    // 패턴 E: 일괄 fallback 문자열 금지 — syncDate 부재 시 배지가 날짜를 생략(정직)
    const honestSyncDate = w.syncDate;
    const cardDesc = [w.unit ? `단위: ${w.unit}` : '', w.subtitle || ''].filter(Boolean).join(' · ');

    // chartType 'none': 차트 없이 customBody 배열만 목록으로 렌더 (ShrimpFTAQuarterly와 같은 패턴)
    const isChartless = (w.chartType || '').toLowerCase() === 'none';
    // customBody 항목은 {name, issuer, version, date, scope} 객체다.
    // text/label만 찾으면 전부 빈 불릿으로 렌더된다.
    const isCountryRoles = w.id === 'w_series_country_roles';
    const customBody = isChartless && Array.isArray(w.customBody) ? (
      <div style={{
        display: isCountryRoles ? 'grid' : 'flex',
        gridTemplateColumns: isCountryRoles ? '1fr 1fr' : undefined,
        flexDirection: isCountryRoles ? undefined : 'column',
        gap: '12px',
        fontSize: '0.88rem',
        lineHeight: 1.5,
      }}>
        {w.customBody.map((item: any, i: number) => {
          if (typeof item === 'string') {
            return <div key={i} style={{ color: 'var(--text-secondary)' }}>{item}</div>;
          }
          const role = item?.role || item?.issuer;
          const meta = [item?.version, item?.date].filter(Boolean).join(' · ');
          return (
            <div key={i} style={{ borderLeft: '2px solid var(--color-success)', paddingLeft: '10px' }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {item?.name || item?.text || item?.label || ''}
                {role && item?.role ? (
                  <span style={{ marginLeft: '8px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{role}</span>
                ) : null}
              </div>
              {!item?.role && role && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>{[role, meta].filter(Boolean).join(' · ')}</div>
              )}
              {item?.role && meta && <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>{meta}</div>}
              {item?.korea && <div style={{ color: '#5eead4', fontSize: '0.8rem', marginTop: '2px' }}>{item.korea}</div>}
              {item?.scope && <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{item.scope}</div>}
            </div>
          );
        })}
      </div>
    ) : undefined;

    const card = (
      <WidgetCard
        id={w.id}
        title={w.title}
        icon={IconComp}
        iconColor={accentColor}
        pillar={pillar}
        cardDesc={cardDesc}
        telemetry={{ status: honestStatus, syncDate: honestSyncDate }}
        chartHeight={375}
        {...(isChartless ? {} : { chart: renderChart(w) })}
        customBody={customBody}
        takeaway={{
          situation: parseTextWithTooltips(typeof situation === 'string' ? situation.replace(/^현황:\s*/, '') : situation),
          actionPlan: parseTextWithTooltips(typeof takeaway === 'string' ? takeaway.replace(/^전략:\s*/, '') : takeaway),
          // v4는 모든 위젯에 source를 채운다. 폴백 문자열을 두지 않는다 —
          // 예전 폴백('FAO FishStatJ + data/새우/ …')은 존재하지 않는 경로와
          // 구버전 빈티지를 가리켜, 출처가 비면 거짓을 출력하는 장치였다.
          source: w.source || '',
        }}
      />
    );
    if (isCountryRoles) {
      return <div key={w.id} style={{ gridColumn: '1 / -1' }}>{card}</div>;
    }
    return <React.Fragment key={w.id}>{card}</React.Fragment>;
  }
}

/* ─── Helper ─── */
function parseAnimatedValue(valStr: string) {
  if (!valStr || typeof valStr !== 'string') return null;
  const match = valStr.match(/^([^\d]*)((?:\d|,|\.)+)(.*)$/);
  if (match) {
    const rawNumberStr = match[2];
    const prefix = match[1];
    const suffix = match[3];
    const hasDecimal = rawNumberStr.includes('.');
    const numberVal = parseFloat(rawNumberStr.replace(/,/g, ''));
    if (!isNaN(numberVal)) {
      return { numberVal, prefix, suffix, decimals: hasDecimal ? rawNumberStr.split('.')[1].length : 0 };
    }
  }
  return null;
}
