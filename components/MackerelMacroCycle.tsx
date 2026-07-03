'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/mackerel_macro.json';
import { ChartPatternDefs } from './ChartPatterns';

function MacroTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{
      background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(6, 182, 212, 0.4)',
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
}

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

  const data = rawData as any[];
  const latest = data[data.length - 1];
  const peak = data.reduce((a: any, b: any) => a.production_t > b.production_t ? a : b);
  const highPrice = data.reduce((a: any, b: any) => a.unit_price_usd > b.unit_price_usd ? a : b);

  // Determine cycle phase
  const recent5 = data.slice(-5);
  const avgPriceRecent = recent5.reduce((s: number, d: any) => s + d.unit_price_usd, 0) / 5;
  const avgPriceAll = data.reduce((s: number, d: any) => s + d.unit_price_usd, 0) / data.length;
  const phase = avgPriceRecent > avgPriceAll * 1.2 ? '호황기' : avgPriceRecent < avgPriceAll * 0.8 ? '불황기' : '안정기';
  const phaseColor = phase === '호황기' ? 'var(--color-success)' : phase === '불황기' ? 'var(--color-danger)' : '#fbbf24';

  const customBody = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
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
            <ChartPatternDefs />
            <defs>
              <linearGradient id="macProdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
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
    </div>
  );

  return (
    <WidgetCard
      title="글로벌 고등어 호황/불황 사이클"
      icon={TrendingUp}
      iconColor="#67e8f9"
      pillar="S4"
      cardDesc="FAO FishStatJ Capture Production + UN Comtrade — 글로벌 어획량(공급) vs 무역 단가(가격) 48년 추이, 최적 진입 타이밍 감지"
      telemetry={{ status: 'STATIC', syncDate: 'FAO FishStatJ 2023 + UN Comtrade' }}
      customBody={customBody}
      takeaway={{
        situation: `<div>
<p>"Commodity Super-Cycle"이란 수년~수십년 단위로 반복되는 호황기·불황기·안정기 사이클 패턴. 어종 commodity는 자원 회복(stock biology) + 기후(엘니뇨/라니냐) + 지정학(TAC·MSC)이 3축 결정 요인.</p>
<p>실측: <strong>역대 피크 ${peak.year}년 ${(peak.production_t / 1000000).toFixed(1)}M톤 → 2023년 ${(latest.production_t / 1000000).toFixed(1)}M톤 감소 추세. 단가 1976년 $${data[0].unit_price_usd.toLocaleString()}/t → 2023년 $${latest.unit_price_usd.toLocaleString()}/t로 ${((latest.unit_price_usd / data[0].unit_price_usd - 1) * 100).toFixed(0)}% 상승 — 현재 ${phase} 국면</strong>. 공급 감소 + 단가 상승의 동반 압박 구조.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: ${phase}는 단기 가격 변동이 아닌 <strong>"북동대서양 자원 장기 축소 + 기후 phase shift의 복합 multi-decade 신호"</strong>로 해석 가능(자원 회복 시나리오 병존).</p>
<p><strong>3단계</strong>: ① 재고 방어적 선매입 + 장기 계약 단가 고정 ② 노르웨이 TAC 삭감·한국 연근해 고수온 복합 리스크 대비 추가 매입 트리거 셋팅 ③ ENSO 전환기 어획 변동에 대비 forward 계약·공급선 다변화(아프리카·남미 어장 비중 확대) 우선 검토.</p>
</div>`,
        source: "FAO FishStatJ Global Capture & Trade Statistics (1976-2023)",
      }}
    />
  );
}
