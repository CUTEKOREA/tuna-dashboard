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
import styles from './MackerelStrategy.module.css'; // Reuse the glassmorphism styles

/* ─── Custom Tooltip ─── */
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
  { border: 'none', glow: 'none', text: 'var(--color-warning)', icon: TrendingUp },
  { border: 'none', glow: 'none', text: 'var(--color-danger)', icon: Anchor },
  { border: 'none', glow: 'none', text: '#38bdf8', icon: Factory },
];

/* ─── Widget Icon Mapping ─── */
const WIDGET_ICONS: Record<string, any> = {
  w01: Globe,
  w02: Truck,
  w03: Ship,
};

export default function GalchiDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/data/galchi_data.json?t=' + Date.now())
      .then(res => res.json())
      .then(json => {
        setData(json);
      })
      .catch(err => console.error("Failed to load galchi data", err));
  }, []);

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCcw size={32} style={{ color: '#38bdf8', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Loading Intelligence...</p>
    </div>
  );

  let { kpis, widgets } = data;
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
      case "Composed":
        return (
          <ComposedChart data={d}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} />
            
            {/* Left Axis */}
            <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} domain={[0, 'auto']} />
            {/* Right Axis */}
            {widget.dualAxis && (
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} domain={[0, 'auto']} />
            )}
            
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            
            {widget.bars?.map((b: any, i: number) => (
              <Bar key={i} yAxisId={b.yAxisId || "left"} dataKey={b.key} fill={b.color} radius={[6,6,0,0]} fillOpacity={0.85} />
            ))}
            {widget.lines?.map((l: any, i: number) => (
              <Line key={i} yAxisId={l.yAxisId || "left"} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
            ))}
          </ComposedChart>
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
              <Fish size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                갈치 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Galchi Strategic Command Center — {widgets?.length || 0} Widgets · {kpiKeys.length} KPIs</p>
            </div>
          </div>
          <div className="ds-card" style={{fontSize: '0.88rem', padding: '8px 16px', 
            background: '#181818', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px #1ed760', animation: 'pulse 2s infinite' }} />
            <span><span style={{ color: 'var(--color-success)' }}>NotebookLM AI Analysis</span> · Live Insights</span>
          </div>
        </div>
      </header>

      {/* ═══ KPIs ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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

      {/* ═══ AI Chatbot (NotebookLM Link) ═══ */}
      <div style={{ marginBottom: '2rem' }}>
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
                <Zap size={18} color="var(--color-success)" /> 갈치 지식 AI 챗봇 (NotebookLM)
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                구글 드라이브(Data 폴더)에서 스캔된 최신 수산경제전망 및 유통 현황이 학습된 맞춤형 AI입니다. 전략적 통찰을 즉시 질문하세요.
              </p>
            </div>
          </div>
          <a href="https://notebooklm.google.com/notebook/73bd95c4-e9f8-49f3-aa90-1e907a3e1b00" target="_blank" rel="noreferrer" style={{ 
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

      {/* ═══ Categorized Widgets ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets?.map((w: any) => renderWidgetCard(w))}
          </div>
        </section>
      </div>

    </div>
  );

  function renderWidgetCard(w: any) {
    const IconComp = WIDGET_ICONS[w.id] || Anchor;
    const accentColor = 'var(--color-success)';
    
    let situation = w.sit || '';
    let takeaway = w.strat || '';
    
    return (
      <div key={w.id} className="ds-card" style={{display: 'flex', flexDirection: 'column', minHeight: '480px',
        background: '#181818', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', border: 'none',
        padding: '1.5rem'}}>
        
        {/* Card Header */}
        <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            <IconComp size={20} color={accentColor} />
            {w.title}
          </h3>
          {(w.subtitle) && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {w.subtitle}
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
                </div>
              )}
              {takeaway && (
                <div>
                  <h4 style={{ color: 'var(--color-success)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>실행 전략</h4>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{takeaway}</p>
                </div>
              )}
              {(w.source) && (
                <div style={{ paddingTop: '12px', marginTop: '12px', borderTop: '1px solid #272727' }}>
                  <span style={{ fontSize: '0.75rem', color: '#7c7c7c', display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    🔗 출처: {w.source}
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
