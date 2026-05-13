'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import styles from './MackerelStrategy.module.css';
import { TrendingUp, Activity } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import macroData from '../data/mackerel_macro.json';

export default function MackerelMacroCycle() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const measure = () => { const w = el.getBoundingClientRect().width; if (w > 0) setChartWidth(Math.floor(w)); };
    measure();
    const t = setTimeout(measure, 300);
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, []);

  const data = macroData as any[];
  const latest = data[data.length - 1];
  const peak = data.reduce((a: any, b: any) => a.production_t > b.production_t ? a : b);
  const highPrice = data.reduce((a: any, b: any) => a.unit_price_usd > b.unit_price_usd ? a : b);

  // Determine cycle phase
  const recent5 = data.slice(-5);
  const avgPriceRecent = recent5.reduce((s: number, d: any) => s + d.unit_price_usd, 0) / 5;
  const avgPriceAll = data.reduce((s: number, d: any) => s + d.unit_price_usd, 0) / data.length;
  const phase = avgPriceRecent > avgPriceAll * 1.2 ? '호황기' : avgPriceRecent < avgPriceAll * 0.8 ? '불황기' : '안정기';
  const phaseColor = phase === '호황기' ? 'var(--color-success)' : phase === '불황기' ? 'var(--color-danger)' : '#fbbf24';

  const MacroTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div style={{
        background: 'rgba(0, 15, 30, 0.95)', border: '1px solid rgba(6, 182, 212, 0.4)',
        padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', minWidth: '220px'
      }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '1.05rem', color: '#67e8f9', borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: '8px' }}>{d.year}년</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#06b6d4' }}>🐟 글로벌 생산량</span>
            <span style={{ fontWeight: 600 }}>{(d.production_t / 1000000).toFixed(1)}M톤</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-warning)' }}>📦 무역량</span>
            <span style={{ fontWeight: 600 }}>{(d.trade_volume_t / 1000).toFixed(0)}K톤</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '5px' }}>
            <span style={{ color: 'var(--color-danger)' }}>💰 수입 단가</span>
            <span style={{ fontWeight: 700, color: 'var(--color-danger)' }}>${d.unit_price_usd.toLocaleString()}/t</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.glassCard} style={{ borderColor: 'rgba(6, 182, 212, 0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#67e8f9', marginBottom: '6px', fontWeight: 700, fontSize: '1.1rem' }}>
            <TrendingUp size={20} /> 글로벌 고등어 호황/불황 사이클
            
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', margin: 0 }}>
            글로벌 어획량(공급) vs 무역 단가(가격) 48년 추이 — 최적 진입 타이밍 감지
          </p>
        </div>
        <div style={{
          padding: '8px 16px', borderRadius: '8px',
          background: `rgba(${phase === '호황기' ? '16,185,129' : phase === '불황기' ? '239,68,68' : '251,191,36'},0.15)`,
          border: `1px solid ${phaseColor}40`,
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <Activity size={16} style={{ color: phaseColor }} />
          <span style={{ color: phaseColor, fontWeight: 700, fontSize: '0.85rem' }}>현재: {phase}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>2023 글로벌 생산</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#06b6d4' }}>{(latest.production_t / 1000000).toFixed(1)}M톤</div>
        </div>
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>피크 생산 ({peak.year})</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-warning)' }}>{(peak.production_t / 1000000).toFixed(1)}M톤</div>
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>2023 수입 단가</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-danger)' }}>${latest.unit_price_usd.toLocaleString()}</div>
        </div>
        <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>역대 최고가 ({highPrice.year})</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#8b5cf6' }}>${highPrice.unit_price_usd.toLocaleString()}</div>
        </div>
      </div>

      <div ref={chartRef} style={{ width: '100%' }}>
        {chartWidth > 0 && (
          <ComposedChart width={chartWidth} height={380} data={data} margin={{ top: 10, right: 50, left: 30, bottom: 20 }}>
            <defs>
              <linearGradient id="macProdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
            <YAxis yAxisId="price" orientation="right" stroke="rgba(239, 68, 68, 0.5)" tick={{ fill: 'var(--color-danger)', fontSize: 11 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
            <Tooltip content={<MacroTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="production_t" name="🐟 글로벌 어획량 (톤)" stroke="#06b6d4" fill="url(#macProdGrad)" strokeWidth={2} />
            <Line type="monotone" dataKey="unit_price_usd" name="💰 수입 단가 ($/t)" stroke="var(--color-danger)" strokeWidth={2.5} dot={false} yAxisId="price" />
          </ComposedChart>
        )}
      </div>

      {/* Insight Text */}
      <div style={{ marginTop: '16px' }}>
        <TakeawayBox
          source="FAO FishStatJ Global Capture & Trade Statistics (1976-2023)"
          situation={<>
            2000년대 이후 글로벌 어획량은 {(peak.production_t / 1000000).toFixed(0)}M톤(피크)에서 {(latest.production_t / 1000000).toFixed(1)}M톤으로 감소 추세인 반면,
            수입 단가는 ${data[0].unit_price_usd.toLocaleString()}/t(1976)에서 ${latest.unit_price_usd.toLocaleString()}/t(2023)로 {((latest.unit_price_usd / data[0].unit_price_usd - 1) * 100).toFixed(0)}% 상승했습니다.
            현재는 <strong style={{ color: phaseColor }}>{phase}</strong> 국면입니다.
          </>}
          actionPlan="현재 수입 단가 사이클이 뚜렷한 불황기에 진입했으므로 재고 방어적 매입 및 장기 계약 단가를 고정하는 전략을 구사해야 합니다. 노르웨이 TAC 삭감과 한국 연근해 고수온 등 복합적인 공급 제약으로 인해 추가 단가 상승 가능성이 존재합니다. 엘니뇨와 라니냐 전환기에 나타나는 어획량의 급격한 변동 리스크에 대비하여 재고를 적정 수준으로 유지하고 굳건한 헷징 수단을 확보하는 것이 필수적입니다."
        />
      </div>
    </div>
  );
}
