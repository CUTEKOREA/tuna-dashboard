"use client";

import React, { useState, useEffect } from 'react';
import { Line, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import {
  TrendingUp, Fish, Globe, DollarSign,
  Activity, AlertTriangle, ShieldCheck, AlertCircle,
  RefreshCcw, Crosshair, MapPin, Factory, Truck, Scale, BarChart2,
  Database, Ship, Snowflake, Shield, Workflow, FlaskConical
} from 'lucide-react';
import styles from './MackerelStrategy.module.css';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, getA11yBarProps } from './ChartPatterns';
import { TelemetryBadge } from './TelemetryBadge';

/* ─── 한류 백색어 컬러 (가자미 시그니처: blue-900 → slate-500) ─── */
const FLATFISH_THEME = {
  primary: '#1e3a8a',
  secondary: '#3b82f6',
  tertiary: '#64748b',
  quaternary: '#94a3b8',
  accent: '#0ea5e9',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry: any, index: any) => {
          if (entry.value === undefined || entry.name === undefined || entry.name === '') return null;
          if (isNaN(Number(entry.value))) return null;
          return (
            <div key={index} className={styles.tooltipValue}>
              <span style={{ color: entry.color }}>■ {entry.name}</span>
              <strong>{typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : entry.value}</strong>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = [FLATFISH_THEME.primary, FLATFISH_THEME.secondary, FLATFISH_THEME.accent, FLATFISH_THEME.tertiary, FLATFISH_THEME.quaternary, '#0c4a6e', '#075985', '#0369a1'];

const KPI_THEMES = [
  { border: 'rgba(30,58,138,0.5)', glow: 'rgba(30,58,138,0.25)', text: FLATFISH_THEME.primary, icon: Database },
  { border: 'rgba(59,130,246,0.5)', glow: 'rgba(59,130,246,0.25)', text: FLATFISH_THEME.secondary, icon: Ship },
  { border: 'rgba(100,116,139,0.5)', glow: 'rgba(100,116,139,0.25)', text: FLATFISH_THEME.tertiary, icon: TrendingUp },
  { border: 'rgba(14,165,233,0.5)', glow: 'rgba(14,165,233,0.25)', text: FLATFISH_THEME.accent, icon: ShieldCheck },
  { border: 'rgba(148,163,184,0.5)', glow: 'rgba(148,163,184,0.25)', text: FLATFISH_THEME.quaternary, icon: Factory },
  { border: 'rgba(3,105,161,0.5)', glow: 'rgba(3,105,161,0.25)', text: '#0369a1', icon: Scale },
];

/* ─── 5-Pillar (가자미 — blue-900 → slate-500) ─── */
const PILLARS = [
  {
    id: 'P1', num: '❶', label: '원료 수급',
    title: '🌊 Pillar I — 원료 수급 (Raw Material)',
    desc: '한·러·미 의존 5년 궤적, 어종 분해 (참·돌·물·기름·문치), 양식 vs 어획 이중 트랙, TAC 신규 편입',
    color: '#1e3a8a',
    widgets: ['F01_global_catch', 'F02_korea_dependency', 'F03_aquaculture_vs_wild', 'F04_tac_species']
  },
  {
    id: 'P2', num: '❷', label: '가공·생산',
    title: '🏭 Pillar II — 가공 · 생산 (Processing)',
    desc: '냉동 99.9% 원물 구조, 넙치 양식 FCR·폐사율, 부산물 콜라겐 K-뷰티, 양식·야생 이중 채널',
    color: '#1d4ed8',
    widgets: ['F05_form_structure', 'F06_aqua_kpi', 'F07_collagen_upcycle', 'F08_dual_track']
  },
  {
    id: 'P3', num: '❸', label: '물류·통관',
    title: '🚢 Pillar III — 물류 · 통관 (Logistics & Trade)',
    desc: '한-미 FTA E유형 2026년 0% 도달, 미국 알래스카 사이클, 2026 1Q 세네갈·일본 신규, OFAC 사각지대',
    color: '#3b82f6',
    widgets: ['F09_hsk_fta', 'F10_usa_alaska_cycle', 'F11_newcomers_2026', 'F12_busan_coldchain', 'F13_ofac_loophole']
  },
  {
    id: 'P4', num: '❹', label: '판매·수요',
    title: '📈 Pillar IV — 판매 · 수요 (Sales)',
    desc: '對러시아 단가 +36.4% spike, 액-물량 디커플링, 명태 교차탄력성, 횟감·구이 채널 분리',
    color: '#0ea5e9',
    widgets: ['F14_kamis_price', 'F15_russia_price_spike', 'F16_value_volume_decouple', 'F17_pollock_elasticity', 'F18_channel_split']
  },
  {
    id: 'P5', num: '❺', label: 'ESG·지속가능성',
    title: '🌱 Pillar V — ESG · 지속가능성',
    desc: 'MSC 양극화 (Greenland·Alaska·한국 넙치), OFAC 차등 제재, NAFO IUU 리스크, SG 2026 밸류업',
    color: '#0369a1',
    widgets: ['F19_msc_polarization', 'F20_ofac_differential', 'F21_nafo_iuu', 'F22_sg_valueup']
  }
];

const WIDGET_ICONS: Record<string, any> = {
  F01_global_catch: Globe, F02_korea_dependency: AlertTriangle, F03_aquaculture_vs_wild: Workflow, F04_tac_species: BarChart2,
  F05_form_structure: Snowflake, F06_aqua_kpi: FlaskConical, F07_collagen_upcycle: Activity, F08_dual_track: Crosshair,
  F09_hsk_fta: DollarSign, F10_usa_alaska_cycle: Ship, F11_newcomers_2026: TrendingUp, F12_busan_coldchain: Truck, F13_ofac_loophole: Shield,
  F14_kamis_price: DollarSign, F15_russia_price_spike: AlertCircle, F16_value_volume_decouple: Activity, F17_pollock_elasticity: Scale, F18_channel_split: MapPin,
  F19_msc_polarization: ShieldCheck, F20_ofac_differential: AlertTriangle, F21_nafo_iuu: Globe, F22_sg_valueup: Factory,
};

const WIDGET_UNITS: Record<string, string> = {
  F01_global_catch: '(천 톤)', F02_korea_dependency: '(천 톤 · %)', F03_aquaculture_vs_wild: '(톤 · 백만$)', F04_tac_species: '(톤)',
  F05_form_structure: '(%)', F06_aqua_kpi: '(% · FCR)', F07_collagen_upcycle: '(억$)', F08_dual_track: '(백만$)',
  F09_hsk_fta: '(%)', F10_usa_alaska_cycle: '(천 톤 · %)', F11_newcomers_2026: '(천 톤)', F12_busan_coldchain: '(천 톤)', F13_ofac_loophole: '(어종 매트릭스)',
  F14_kamis_price: '(원/kg)', F15_russia_price_spike: '($/kg)', F16_value_volume_decouple: '(천 톤 · 백만$)', F17_pollock_elasticity: '($/kg)', F18_channel_split: '(채널 비중 %)',
  F19_msc_polarization: '(인증 비율 %)', F20_ofac_differential: '(차등 매트릭스)', F21_nafo_iuu: '(리스크 점수)', F22_sg_valueup: '(% 마진)',
};

const formatYAxis = (v: number) => {
  if (v >= 1000000) return (v / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(v);
};

const formatXAxis = (tickItem: any) => {
  if (typeof tickItem !== 'string') return tickItem;
  let label = tickItem.replace(/\(.*?\)/g, '').trim();
  if (label.length > 7) label = label.substring(0, 7) + '..';
  return label;
};

export default function FlatfishDashboard() {
  const [data, setData] = useState<any>(null);
  const [activePart, setActivePart] = useState<'P1' | 'P2' | 'P3' | 'P4' | 'P5'>('P1');

  useEffect(() => {
    fetch('/data/flatfish_data.json?t=' + Date.now())
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error('Failed to load flatfish data', err));
  }, []);

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCcw size={32} style={{ color: FLATFISH_THEME.primary, animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: '1rem' }}>가자미 전략 인텔리전스 로딩 중...</p>
    </div>
  );

  const widgets = data.widgets || [];
  const kpis = data.kpis || {};
  const kpiKeys = Object.keys(kpis);

  /* ─── Chart Renderer ─── */
  const renderChart = (widget: any) => {
    const d = widget.data;
    if (!d || d.length === 0) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>데이터 없음</div>;

    const chartType = (widget.chartType || '').toLowerCase();
    const hasRight = widget.hasRightAxis || widget.lines?.some((l: any) => l.yAxisId === 'right') || widget.bars?.some((b: any) => b.yAxisId === 'right');

    if (widget.xKey || widget.bars || widget.lines || widget.areas) {
      switch (chartType) {
        case 'pie':
          return (
            <PieChart>
              <Pie data={d} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={35}
                label={({ name, value, percent }: any) => percent > 0.03 ? `${name} ${typeof value === 'number' ? value.toLocaleString() : value}` : ''} labelLine={false} fontSize={10}>
                {d.map((_: any, idx: number) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} verticalAlign="top" height={36} />
            </PieChart>
          );
        case 'area':
          return (
            <AreaChart data={d}>
              <defs>
                {widget.areas?.map((a: any, i: number) => (
                  <linearGradient key={i} id={`fArea${widget.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={a.color} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={a.color} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={formatXAxis} minTickGap={20} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={formatYAxis} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} verticalAlign="top" height={36} />
              {widget.areas?.map((a: any, i: number) => (
                <Area key={i} type="monotone" dataKey={a.key || a.dataKey} stroke={a.color} fill={`url(#fArea${widget.id}_${i})`} strokeWidth={2.5} />
              ))}
            </AreaChart>
          );
        case 'bar':
        case 'composed':
          return (
            <ComposedChart data={d}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={formatXAxis} minTickGap={20} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={formatYAxis} />
              {hasRight && <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={formatYAxis} />}
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} verticalAlign="top" height={36} />
              {widget.bars?.map((b: any, i: number) => {
                const p = getA11yBarProps(i);
                return <Bar key={`b${i}`} yAxisId={b.yAxisId || 'left'} dataKey={b.key || b.dataKey} fill={p.fill} color={b.color || p.color} radius={[6, 6, 0, 0]} fillOpacity={0.85} />;
              })}
              {widget.lines?.map((l: any, i: number) => (
                <Line key={`l${i}`} yAxisId={l.yAxisId || 'left'} type="monotone" dataKey={l.key || l.dataKey} stroke={l.color} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              ))}
            </ComposedChart>
          );
        default:
          return <div style={{ color: '#64748b', textAlign: 'center', marginTop: '40px' }}>지원 안 되는 차트</div>;
      }
    }
    return <div style={{ color: '#64748b', textAlign: 'center', marginTop: '40px' }}>구 포맷 미지원</div>;
  };

  function renderWidgetCard(w: any, pillar: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' = 'S1') {
    const IconComp = WIDGET_ICONS[w.id] || Fish;
    const unit = WIDGET_UNITS[w.id] ? `단위: ${WIDGET_UNITS[w.id]}` : '';
    const subtitle = w.subtitle || '';
    const cardDesc = [unit, subtitle].filter(Boolean).join(' — ');
    const liveStatus: 'LIVE' | 'SYNCED' | 'STATIC' = w.isLive ? 'LIVE' : (w.syncDate ? 'SYNCED' : 'STATIC');
    return (
      <WidgetCard key={w.id}
        title={w.title}
        icon={IconComp}
        iconColor={FLATFISH_THEME.primary}
        pillar={pillar}
        cardDesc={cardDesc}
        telemetry={{ status: liveStatus, syncDate: w.syncDate }}
        chartHeight={375}
        chart={renderChart(w)}
        takeaway={{ situation: w.sit || '', actionPlan: w.strat || '', source: w.source || 'KMI 「FTA체결국 수산물 수입동향」 분기보고서' }}
      />
    );
  }

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'linear-gradient(135deg, #1e3a8a, #64748b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(30,58,138,0.4)' }}>
              <Fish size={24} color="#f8fafc" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #3b82f6, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                가자미 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>가자미 전략 커맨드센터 — 위젯 {widgets.length}개 · KPI {kpiKeys.length}개 · KMI 21Q + KFAS + NAFO</p>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(30,58,138,0.3)', borderRadius: '8px', color: '#94a3b8', fontWeight: 500 }}>
            <span style={{ color: FLATFISH_THEME.accent }}>KMI 21Q + 한-미 FTA E유형 + OFAC 사각지대</span> · Forensic v1
          </div>
        </div>
      </header>

      {/* KPIs */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {kpiKeys.map((key, idx) => {
          const kpi = kpis[key];
          const theme = KPI_THEMES[idx % KPI_THEMES.length];
          const IconComp = theme.icon;
          return (
            <div key={key} style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: `0 0 16px ${theme.glow}`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: `radial-gradient(circle, ${theme.glow}, transparent)`, pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, lineHeight: 1.3 }}>{kpi.title}</span>
                <div style={{ flexShrink: 0 }}>
                  {kpi.telemetry ? <TelemetryBadge status={kpi.telemetry as any} syncDate={kpi.syncDate} /> : <IconComp size={14} style={{ color: theme.text }} />}
                </div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{kpi.value}</div>
              <div style={{ fontSize: '0.7rem', color: theme.text, fontWeight: 600 }}>
                <span style={{ background: `${theme.text}20`, padding: '1px 5px', borderRadius: '3px', marginRight: '4px' }}>{kpi.trend}</span>
                {kpi.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5-Pillar Navigator */}
      <div style={{ background: 'linear-gradient(180deg, rgba(20, 28, 52, 0.5), rgba(20, 28, 52, 0.2))', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '6px', marginBottom: '2rem', boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(140,170,255,0.10)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '4px 0 8px', borderBottom: '1px solid rgba(140,170,255,0.10)', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요
          </span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {PILLARS.map((s, idx) => {
            const isActive = activePart === s.id;
            return (
              <button key={s.id} onClick={() => setActivePart(s.id as any)}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px 8px 14px', background: isActive ? `${s.color}12` : 'transparent', border: `1.5px solid ${isActive ? s.color : 'transparent'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.25s', boxShadow: isActive ? `0 0 20px ${s.color}25, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none', overflow: 'hidden' }}>
                {isActive && <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px', background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`, borderRadius: '3px 3px 0 0' }} />}
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? s.color : 'rgba(140,170,255,0.12)', color: isActive ? '#0a0f1f' : 'rgba(148,163,184,0.6)', fontSize: '0.75rem', fontWeight: 800, boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none' }}>{idx + 1}</div>
                <span style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, color: isActive ? s.color : '#94a3b8', whiteSpace: 'nowrap' }}>{s.label}</span>
                {isActive && <span style={{ fontSize: '0.6rem', color: 'rgba(148,163,184,0.7)', textAlign: 'center', lineHeight: 1.3, marginTop: '2px', padding: '0 4px' }}>{s.desc.slice(0, 24)}…</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Pillar Widget Grid */}
      {(() => {
        const pillar = PILLARS.find(p => p.id === activePart)!;
        const pillarWidgets = widgets.filter((w: any) => pillar.widgets.includes(w.id));
        return (
          <section style={{ marginBottom: '4rem' }}>
            <div style={{ padding: '1.25rem 1.5rem', background: `linear-gradient(90deg, ${pillar.color}20 0%, transparent 100%)`, borderLeft: `4px solid ${pillar.color}`, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>{pillar.title}</h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>{pillar.desc}</p>
              </div>
              <span style={{ fontSize: '0.7rem', color: pillar.color, background: `${pillar.color}20`, padding: '4px 12px', borderRadius: '500px', fontWeight: 600 }}>
                {pillarWidgets.length} 위젯
              </span>
            </div>
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {pillarWidgets.length === 0
                ? <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#64748b', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>이 단계에 위젯이 없습니다</div>
                : pillarWidgets.map((w: any) => renderWidgetCard(w, pillar.id.replace('P', 'S') as 'S1' | 'S2' | 'S3' | 'S4' | 'S5'))}
            </div>
          </section>
        );
      })()}
    </div>
  );
}
