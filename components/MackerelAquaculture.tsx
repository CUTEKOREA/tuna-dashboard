'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Droplets, Fish } from 'lucide-react';
import WidgetCard from './WidgetCard';
import aquaData from '../data/mackerel_aquaculture.json';

const COLORS = ['#06b6d4', 'var(--color-success)'];

export default function MackerelAquaculture() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [viewMode, setViewMode] = useState<'trend' | 'price'>('trend');

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

  const data = aquaData as any[];
  const latest = data[data.length - 1];
  const peak = data.reduce((a: any, b: any) => a.aquaculture_t > b.aquaculture_t ? a : b);

  // Pie data for latest year
  const pieData = [
    { name: '자연산 어획', value: latest.capture_t },
    { name: '양식 생산', value: latest.aquaculture_t },
  ];

  const AquaTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div style={{
        background: 'rgba(0, 15, 30, 0.95)', border: '1px solid rgba(16, 185, 129, 0.4)',
        padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', minWidth: '240px'
      }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '1.05rem', color: '#34d399', borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: '8px' }}>{d.year}년</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#06b6d4' }}>🐟 자연산 어획량</span>
            <span style={{ fontWeight: 600 }}>{(d.capture_t / 1000000).toFixed(2)}M톤</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-success)' }}>🏗️ 양식 생산량</span>
            <span style={{ fontWeight: 600 }}>{d.aquaculture_t.toLocaleString()}톤</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '5px' }}>
            <span style={{ color: '#fbbf24' }}>📊 양식 비중</span>
            <span style={{ fontWeight: 700, color: '#fbbf24' }}>{d.aqua_ratio_pct}%</span>
          </div>
          {viewMode === 'price' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#f87171' }}>💰 자연산 단가</span>
                <span style={{ fontWeight: 600 }}>${d.wild_price_usd}/t</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a78bfa' }}>💎 양식 단가</span>
                <span style={{ fontWeight: 600 }}>${d.aqua_price_usd}/t</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const customBody = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setViewMode('trend')} style={{
            padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
            background: viewMode === 'trend' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)',
            color: viewMode === 'trend' ? '#34d399' : 'rgba(255,255,255,0.5)'
          }}>
            <Fish size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} /> 생산량 추이
          </button>
          <button onClick={() => setViewMode('price')} style={{
            padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
            background: viewMode === 'price' ? 'rgba(167, 139, 250, 0.3)' : 'rgba(255,255,255,0.05)',
            color: viewMode === 'price' ? '#a78bfa' : 'rgba(255,255,255,0.5)'
          }}>
            💎 가격 프리미엄
          </button>
        </div>
      </div>

      {/* KPI + Pie Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>2023 자연산</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#06b6d4' }}>{(latest.capture_t / 1000000).toFixed(1)}M톤</div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>2023 양식</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-success)' }}>{latest.aquaculture_t.toLocaleString()}톤</div>
            <div style={{ fontSize: '0.68rem', color: '#fbbf24' }}>비중 {latest.aqua_ratio_pct}%</div>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>자연산 단가</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-danger)' }}>${latest.wild_price_usd}</div>
          </div>
          <div style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>양식 단가</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a78bfa' }}>${latest.aqua_price_usd}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-success)' }}>
              {latest.aqua_price_usd > 0 ? `${((latest.aqua_price_usd / latest.wild_price_usd - 1) * 100).toFixed(0)}% 프리미엄` : 'N/A'}
            </div>
          </div>
        </div>
        {/* Mini Pie Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <PieChart width={150} height={130}>
            <Pie data={pieData} cx={75} cy={60} innerRadius={30} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270}>
              {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i]} stroke="none" />)}
            </Pie>
          </PieChart>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
            <span style={{ color: COLORS[0] }}>■</span> 자연산 <span style={{ color: COLORS[1], marginLeft: '8px' }}>■</span> 양식
          </div>
        </div>
      </div>

      <div ref={chartRef} style={{ width: '100%' }}>
        {chartWidth > 0 && viewMode === 'trend' && (
          <ComposedChart width={chartWidth} height={350} data={data} margin={{ top: 10, right: 50, left: 30, bottom: 20 }}>
            <defs>
              <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
            <YAxis yAxisId="aqua" orientation="right" stroke="rgba(16,185,129,0.5)" tick={{ fill: 'var(--color-success)', fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : `${v}`} />
            <Tooltip content={<AquaTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <Bar dataKey="capture_t" name="🐟 자연산 어획 (톤)" fill="url(#capGrad)" radius={[2, 2, 0, 0]} />
            <Line type="monotone" dataKey="aquaculture_t" name="🏗️ 양식 생산 (톤)" stroke="var(--color-success)" strokeWidth={2.5} dot={false} yAxisId="aqua" />
          </ComposedChart>
        )}
        {chartWidth > 0 && viewMode === 'price' && (
          <ComposedChart width={chartWidth} height={350} data={data} margin={{ top: 10, right: 30, left: 30, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip content={<AquaTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <Line type="monotone" dataKey="wild_price_usd" name="🐟 자연산 단가 ($/t)" stroke="var(--color-danger)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="aqua_price_usd" name="💎 양식 단가 ($/t)" stroke="#a78bfa" strokeWidth={2.5} dot={false} />
          </ComposedChart>
        )}
      </div>

      {/* Insight Text */}
      <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '3px solid rgba(16, 185, 129, 0.4)', borderRadius: '0 8px 8px 0' }}>
        <div style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>🧬 블루오션 인사이트</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', lineHeight: 1.6 }}>
          고등어 양식은 {peak.year}년 {peak.aquaculture_t.toLocaleString()}톤으로 피크 후 현재 {latest.aquaculture_t.toLocaleString()}톤 수준이며,
          전체 생산의 {latest.aqua_ratio_pct}%에 불과합니다. 그러나 양식 단가(${latest.aqua_price_usd}/t)는 자연산(${latest.wild_price_usd}/t) 대비
          {latest.aqua_price_usd > 0 ? ` ${((latest.aqua_price_usd / latest.wild_price_usd - 1) * 100).toFixed(0)}%` : ''} 프리미엄을 형성하며,
          <strong style={{ color: '#a78bfa' }}> 고부가가치 양식 기술 투자의 잠재 수익성</strong>이 존재합니다.
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="양식 고등어의 부상과 블루오션"
      icon={Droplets}
      iconColor="#34d399"
      pillar="S5"
      cardDesc="자연산 vs 양식 생산 비중 추이 및 양식 프리미엄 단가 비교"
      telemetry={{ status: 'STATIC', syncDate: '2023' }}
      customBody={customBody}
    />
  );
}
