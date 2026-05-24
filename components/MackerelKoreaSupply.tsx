'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/mackerel_korea_supply.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

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
            <Line type="monotone" dataKey="processed_t" name="🔪 가공 수요 데드크로스 (톤)" stroke="#ec4899" strokeWidth={3} dot={false} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="self_sufficiency_pct" name="📊 자급률 (%)" stroke="#fbbf24" strokeWidth={2.5} dot={false} yAxisId="pct" strokeDasharray="3 3" />
          </ComposedChart>
        )}
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="🇰🇷 한국 고등어 자급률 위기 모니터"
      icon={AlertTriangle}
      iconColor="#f87171"
      pillar="S4"
      cardDesc="국내 생산 붕괴와 수입 의존도 급증 — 자급률 데드크로스 진단"
      telemetry={{ status: 'STATIC', syncDate: '2023' }}
      customBody={customBody}
      takeaway={{
        situation: "해양 고수온 현상으로 연근해 총어업 생산량이 53년 만에 최저치(84.1만톤)를 기록했습니다. 특히 고등어는 어획량 자체는 양호하나 소비자가 선호하는 대형어(300g 이상) 비중이 1~4.6%에 불과해 소매가 1만원 돌파 등 '금(金)등어' 현상 및 수요 파괴(Demand Destruction)가 발생 중입니다.",
        actionPlan: "헐값에 거래되는 200~300g 중소형 고등어 원물을 1인 가구 타겟 프리미엄 HMR(전자레인지용 순살구이) 상품으로 적극 전환하여 부가가치를 극대화해야 합니다. 수요가 정체된 대형어(300g 이상) 물량을 안정적으로 확보하기 위해 선별 상장(경매) 입찰 단가를 세밀하게 조정하고 산지 직계약 물량을 선점하는 투트랙 전략이 요구됩니다. 고수온 현상 장기화로 어획량 자체가 크게 감소할 수 있는 리스크가 불가피하므로, 원물의 안정적 수급을 위한 구체적인 수입 다변화 비상계획을 선제적으로 수립해야 합니다.",
        source: "옵시디안 고등어_마스터_인덱스 & 해양수산부 수산정보포털",
      }}
    />
  );
}
