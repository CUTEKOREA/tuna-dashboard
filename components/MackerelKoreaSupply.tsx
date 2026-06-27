'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/mackerel_korea_supply.json';
import { ChartPatternDefs } from './ChartPatterns';

export default function MackerelKoreaSupply() {
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

  const KSTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div style={{
        background: 'rgba(0, 15, 30, 0.95)', border: '1px solid rgba(239, 68, 68, 0.4)',
        padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', minWidth: '220px'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#f87171' }}>{d.year}년</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-info)' }}>🏭 국내 생산</span><span>{d.production_t?.toLocaleString()}톤</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-danger)' }}>📦 수입량</span><span>{d.import_t?.toLocaleString()}톤</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#ec4899' }}>🔪 가공 수요(국내)</span><span>{d.processed_t?.toLocaleString()}톤</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '4px' }}>
            <span style={{ color: '#fbbf24' }}>📊 자급률</span>
            <span style={{ fontWeight: 700, color: d.self_sufficiency_pct < 50 ? 'var(--color-danger)' : 'var(--color-success)' }}>{d.self_sufficiency_pct}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#a78bfa' }}>💰 수입단가</span><span>${d.import_price_usd?.toLocaleString()}/t</span></div>
        </div>
      </div>
    );
  };

  const customBody = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>2023 국내 생산</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-info)' }}>{Math.round(latest.production_t).toLocaleString()}톤</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)' }}>▼ {Math.round((1 - latest.production_t / peak.production_t) * 100)}% (vs {peak.year}년)</div>
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>2023 수입량</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-danger)' }}>{Math.round(latest.import_t).toLocaleString()}톤</div>
        </div>
        <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>2023 가공 수요</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ec4899' }}>{Math.round(latest.processed_t || 0).toLocaleString()}톤</div>
        </div>
        <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>자급률</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: latest.self_sufficiency_pct < 50 ? 'var(--color-danger)' : 'var(--color-success)' }}>{latest.self_sufficiency_pct}%</div>
        </div>
        <div style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>수입 단가</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a78bfa' }}>${latest.import_price_usd.toLocaleString()}</div>
        </div>
      </div>

      <div ref={chartRef} style={{ width: '100%' }}>
        {chartWidth > 0 && (
          <ComposedChart width={chartWidth} height={380} data={data} margin={{ top: 10, right: 50, left: 30, bottom: 20 }}>
            <ChartPatternDefs />
            <defs>
              <linearGradient id="krProdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.6}/><stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="krImpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.6}/><stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `${Math.round(v/1000).toLocaleString()}K`} />
            <YAxis yAxisId="pct" orientation="right" stroke="rgba(251,191,36,0.5)" tick={{ fill: '#fbbf24', fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
            <Tooltip content={<KSTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="production_t" name="🏭 국내 생산 (톤)" stroke="var(--color-info)" fill="url(#krProdGrad)" strokeWidth={2} stackId="1" />
            <Area type="monotone" dataKey="import_t" name="📦 수입량 (톤)" stroke="var(--color-danger)" fill="url(#krImpGrad)" strokeWidth={2} stackId="1" />
            <Line type="monotone" dataKey="processed_t" name="🔪 가공 수요 (톤)" stroke="#ec4899" strokeWidth={3} dot={false} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="self_sufficiency_pct" name="📊 자급률 (%)" stroke="#fbbf24" strokeWidth={2.5} dot={false} yAxisId="pct" strokeDasharray="3 3" />
          </ComposedChart>
        )}
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="🇰🇷 한국 고등어 자급률 하락 모니터"
      icon={AlertTriangle}
      iconColor="#f87171"
      pillar="S4"
      cardDesc="해양수산부 수산물 자급률 통계 + KMI 수산업 전망보고서 + 통계청 어업생산동향 — 국내 생산 정체·수입 의존도 상승 추세 진단(2023년 자급률 70.2%, 자체추정 포함)"
      telemetry={{ status: 'STATIC', syncDate: '해수부 + KMI 2026 + 통계청 2024' }}
      customBody={customBody}
      takeaway={{
        situation: `<div>
<p>"자급률 하락 추세"란 국내 생산이 정체·감소하는 동안 수입 의존도가 점진적으로 상승하는 구조적 변화. 2023년 실측 자급률 70.2%(생산 20.6만 톤 대 수입 8.7만 톤) — 아직 역전은 발생하지 않았으나 2018년 이후 자급률이 70%대 초반으로 낮아진 추세는 유의해야 함.</p>
<p>실측: <strong>해양 고수온으로 연근해 총어업이 감소세, 고등어 대형어(300g+) 비중 축소 → 소매가 급등 "금(金)등어" 현상</strong>. 어획량 감소와 함께 소비자가 원하는 크기 구성 변화가 가격 상승을 주도.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 중소형(200~300g) 원물은 저가 부산물이 아닌 <strong>1인 가구 간편가정식 시장의 미활용 원료</strong>로 재포지셔닝 가능. 자급률 70%대 유지 여부가 향후 가격 협상력 핵심 변수.</p>
<p><strong>3단계</strong>: ① 200~300g 원물 즉시 매집 → 프리미엄 간편가정식(전자레인지 순살구이) 라인 설비투자 ② 대형어 산지 직계약 + 선별 경매 입찰가 정밀 조정 투트랙 ③ 고수온 장기화 대비 수입 다변화 비상계획 — 자급률 추가 하락 시나리오 대비.</p>
</div>`,
        source: "해양수산부 수산정보포털 · 통계청 어업생산동향(자체추정 포함)",
      }}
    />
  );
}
