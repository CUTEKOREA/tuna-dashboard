'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';
import { AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import supplyData from '../data/squid_korea_supply.json';

export default function SquidKoreaSupply() {
  // Filter out 2024 (no trade data yet)
  const data = supplyData.filter((d: any) => d.year <= 2023);
  const [viewMode, setViewMode] = useState<'supply' | 'cost'>('supply');
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const measure = () => { const w = el.getBoundingClientRect().width; if (w > 0) setChartWidth(Math.floor(w)); };
    measure();
    const t = setTimeout(measure, 200);
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, []);

  const latest = data[data.length - 1];
  const peak = data.reduce((a: any, b: any) => a.production_t > b.production_t ? a : b);

  const SupplyTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div style={{
        background: 'rgba(0, 15, 30, 0.95)', border: '1px solid rgba(239, 68, 68, 0.4)',
        padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', minWidth: '220px'
      }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '1.05rem', color: '#f87171', borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: '8px' }}>{d.year}년</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-info)' }}>🏭 국내 생산</span>
            <span style={{ fontWeight: 600 }}>{d.production_t?.toLocaleString()}톤</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-danger)' }}>📦 수입량</span>
            <span style={{ fontWeight: 600 }}>{d.import_volume_t?.toLocaleString()}톤</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#ec4899' }}>🔪 가공 수요(국내)</span>
            <span style={{ fontWeight: 600 }}>{d.processed_t?.toLocaleString()}톤</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '5px' }}>
            <span style={{ color: '#fbbf24' }}>📊 자급률</span>
            <span style={{ fontWeight: 700, color: d.self_sufficiency_pct < 50 ? 'var(--color-danger)' : 'var(--color-success)' }}>{d.self_sufficiency_pct}%</span>
          </div>
          {viewMode === 'cost' && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#a78bfa' }}>💰 수입단가</span>
              <span style={{ fontWeight: 600 }}>${d.import_cost_per_ton?.toLocaleString()}/t</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.glassCard} style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', marginBottom: '6px', fontWeight: 700, fontSize: '1.1rem', position: 'relative' }}>
            <AlertTriangle size={20} /> 한국 오징어 수급 위기 모니터
            
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', margin: 0 }}>
            국내 생산 붕괴(-79%)와 수입 의존도 급증을 자급률·수입비용 이중 관점으로 분석
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setViewMode('supply')}
            style={{
              padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
              background: viewMode === 'supply' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)',
              color: viewMode === 'supply' ? '#60a5fa' : 'rgba(255,255,255,0.5)'
            }}
          >
            <TrendingDown size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} /> 자급률
          </button>
          <button
            onClick={() => setViewMode('cost')}
            style={{
              padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
              background: viewMode === 'cost' ? 'rgba(167, 139, 250, 0.3)' : 'rgba(255,255,255,0.05)',
              color: viewMode === 'cost' ? '#a78bfa' : 'rgba(255,255,255,0.5)'
            }}
          >
            <DollarSign size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} /> 수입비용
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>2023 국내 생산</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-info)' }}>{Math.round(latest.production_t).toLocaleString()}톤</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)' }}>▼ {Math.round((1 - latest.production_t / peak.production_t) * 100)}% (vs {peak.year})</div>
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>2023 수입량</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-danger)' }}>{Math.round(latest.import_volume_t).toLocaleString()}톤</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-warning)' }}>세계 4위</div>
        </div>
        <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>2023 가공 수요</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ec4899' }}>{Math.round(latest.processed_t || 0).toLocaleString()}톤</div>
        </div>
        <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>자급률</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: latest.self_sufficiency_pct < 50 ? 'var(--color-danger)' : 'var(--color-success)' }}>{latest.self_sufficiency_pct}%</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)' }}>위험 수준</div>
        </div>
        <div style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>수입단가</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a78bfa' }}>${latest.import_cost_per_ton?.toLocaleString()}</div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>/톤</div>
        </div>
      </div>

      <div ref={chartRef} style={{ width: '100%' }}>
        {chartWidth > 0 && viewMode === 'supply' && (
          <AreaChart width={chartWidth} height={380} data={data} margin={{ top: 10, right: 30, left: 30, bottom: 20 }}>
            <defs>
              <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<SupplyTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="production_t" name="🏭 국내 생산 (톤)" stroke="var(--color-info)" fill="url(#prodGrad)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="import_volume_t" name="📦 수입량 (톤)" stroke="var(--color-danger)" fill="url(#impGrad)" strokeWidth={2.5} />
            <Line type="monotone" dataKey="processed_t" name="🔪 가공 수요 (톤)" stroke="#ec4899" strokeWidth={3} dot={false} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="self_sufficiency_pct" name="📊 자급률 (%)" stroke="#fbbf24" strokeWidth={2} strokeDasharray="3 3" dot={false} yAxisId="right" />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(251, 191, 36, 0.5)" tick={{ fill: '#fbbf24', fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          </AreaChart>
        )}
        {chartWidth > 0 && viewMode === 'cost' && (
          <AreaChart width={chartWidth} height={380} data={data} margin={{ top: 10, right: 30, left: 30, bottom: 20 }}>
            <defs>
              <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} label={{ value: '수입액 (USD 1000)', angle: -90, position: 'insideLeft', style: { fill: 'rgba(255,255,255,0.4)', fontSize: 11 } }} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(167, 139, 250, 0.5)" tick={{ fill: '#a78bfa', fontSize: 11 }} tickFormatter={(v) => `$${v.toLocaleString()}`} label={{ value: '단가 ($/t)', angle: 90, position: 'insideRight', style: { fill: '#a78bfa', fontSize: 11 } }} />
            <Tooltip content={<SupplyTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="import_value_usd_k" name="💰 수입액 (USD 1000)" stroke="var(--color-warning)" fill="url(#valGrad)" strokeWidth={2} />
            <Line type="monotone" dataKey="import_cost_per_ton" name="📈 수입단가 ($/t)" stroke="#a78bfa" strokeWidth={2.5} dot={false} yAxisId="right" />
          </AreaChart>
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox source="FAO FishStatJ - Korea Capture + Trade Statistics (2000-2023)" situation="과거 20만 톤에 달하던 연근해 생산량(자급률)은 기후 변화(동해 수온 급상승)로 2024년 1.3만 톤까지 붕괴되었습니다. 이로 인해 공급의 83.1%를 원양/수입에 의존하게 되며 만성적인 '금(金)징어(소매가 38% 폭등)' 인플레이션이 고착화되었습니다."
          actionPlan="2025년 원양 선복량 한도 폐지에 맞춰 남서대서양(FAO 41 공해상)에 선단을 긴급 투입하여 어획 히스토리를 선점하고, 페루산 대왕오징어 현지 1차 가공(B2B 진미채 등) 밸류체인을 수직 계열화하여 조달 원가(조정관세 22% 회피 등)를 원천 통제해야 합니다."
        />
      </div>
    </div>
  );
}
