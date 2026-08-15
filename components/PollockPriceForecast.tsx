'use client';
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, Thermometer, AlertTriangle } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import WidgetCard from './WidgetCard';

/**
 * 명태 AI 가격 예측 엔진
 * API: /api/pollock-forecast
 */

export function PollockPriceForecastChart() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState<'frozen_whole' | 'surimi' | 'roe'>('frozen_whole');

  useEffect(() => {
    fetch('/api/pollock-forecast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(r => r.json()).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  const productData = data?.[activeProduct];
  const chartData = [
    ...(productData?.historical || []).map((h: any) => ({ period: h.period, actual: h.actual, predicted: h.predicted })),
    ...(productData?.forecast || []).map((f: any) => ({ period: f.period, predicted: f.predicted, lower: f.lower_95, upper: f.upper_95 })),
  ];
  // 시점 정직화: 데이터는 2025-Q1에 동결된 백테스트 시나리오 — '현재/다음 분기'로 위장 금지
  const lastObservedPeriod = productData?.historical?.at(-1)?.period;
  const firstForecastPeriod = productData?.forecast?.[0]?.period;

  const products = [
    { key: 'frozen_whole', label: '통명태 H&G', color: '#3b82f6' },
    { key: 'surimi', label: '수리미 FA급', color: '#8b5cf6' },
    { key: 'roe', label: '명란(Roe)', color: '#f59e0b' },
  ];

  return (
    <WidgetCard
      title="W-PF1 · 명태 가격 VAR 모형 — 2025-Q1 기준 분석 (과거 백테스트)"
      icon={TrendingUp}
      iconColor="#3b82f6"
      pillar="S1"
      cardDesc="5변수 VAR(러시아FOB·MGO·SST·KRW/USD·중국가동률) 통명태/수리미/명란 분기별 모형 — 2025-Q1 동결 시나리오의 과거 백테스트이며 현재 시점 미래 예측이 아님"
      telemetry={{ status: 'STATIC', syncDate: '2025-Q1 기준 백테스트' }}
      customBody={
        <>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {products.map(p => (
              <button key={p.key} onClick={() => setActiveProduct(p.key as any)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
                  background: activeProduct === p.key ? `${p.color}22` : 'rgba(255,255,255,0.03)',
                  color: activeProduct === p.key ? p.color : 'var(--text-secondary)',
                  outline: activeProduct === p.key ? `1px solid ${p.color}44` : 'none' }}>
                {p.label}
              </button>
            ))}
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading forecast...</div> : (
            <>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div style={{ flex: 1, background: 'rgba(var(--w-blue-500-rgb), 0.08)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>최종 관측치{lastObservedPeriod ? ` (${lastObservedPeriod})` : ''}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#60a5fa' }}>${productData?.historical?.at(-1)?.actual?.toLocaleString() || 'N/A'}</div>
                  <div style={{ fontSize: '0.6rem', color: '#93c5fd' }}>{productData?.unit}</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(34,197,94,0.08)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>모형 예측{firstForecastPeriod ? ` (${firstForecastPeriod} · 백테스트)` : ' (백테스트)'}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e' }}>${productData?.forecast?.[0]?.predicted?.toLocaleString() || 'N/A'}</div>
                  <div style={{ fontSize: '0.6rem', color: '#86efac' }}>95% CI</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(var(--w-red-500-rgb), 0.08)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>추세</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: productData?.trend === 'UPWARD' || productData?.trend === 'STRUCTURAL_UPWARD' ? 'var(--w-red-500)' : '#22c55e' }}>
                    {productData?.trend === 'UPWARD' ? '▲ 상승' : productData?.trend === 'STRUCTURAL_UPWARD' ? '▲▲ 구조적 상승' : productData?.trend === 'PREMIUM_GROWTH' ? '⭐ 프리미엄' : '→ 안정'}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#fca5a5' }}>{productData?.risk_alert?.slice(0, 20)}...</div>
                </div>
              </div>
              <SafeResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" />
                  <XAxis dataKey="period" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.75rem' }} />
                  <Area type="monotone" dataKey="upper" stroke="transparent" fill="#3b82f622" name="상한 밴드" />
                  <Area type="monotone" dataKey="lower" stroke="transparent" fill="#1a1a2e" name="하한 밴드" />
                  <Line type="monotone" dataKey="actual" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 4 }} name="실제 가격" />
                  <Line type="monotone" dataKey="predicted" stroke="var(--w-amber-500)" strokeWidth={2} strokeDasharray="5 3" dot={{ fill: 'var(--w-amber-500)', r: 3 }} name="예측 가격" />
                </AreaChart>
              </SafeResponsiveContainer>
              <div style={{ display: 'grid', gap: '4px', marginTop: '8px' }}>
                {(productData?.forecast || []).slice(0, 3).map((f: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.68rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', width: '60px' }}>{f.period}</span>
                    <span style={{ fontWeight: 700, color: 'var(--w-amber-500)', width: '50px' }}>${f.predicted?.toLocaleString()}</span>
                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{f.driver}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      }
      takeaway={{
        situation: '2025-Q1 시점 동결 백테스트: 당시 모형은 통명태 FOB 상승(2025-Q3 $1,580), 수리미 구조적 상승(아시아 HMR 수요), 명란 프리미엄 성장(2026-Q1 $10,800)을 예측. 이후 분기의 실측 검증(wiring)은 미완 상태.',
        actionPlan: '백테스트 시그널(통명태 선제 매입·수리미 블렌딩 최적화·명란 D2C 전환)은 방향성 참고로만 활용하고, Atuna·NMFS 실측 데이터 연동 후 모형을 재추정해 의사결정에 반영.',
        source: '(기준 2025-Q1 동결 시나리오 · 2024-08 자체추정 모형) 수산물 무역 단기 전망모형',
      }}
    />
  );
}

export function PollockScenarioSimulator() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/pollock-forecast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const scenarios = data?.scenarios || [];
  const sst = data?.sst_correlation;

  return (
    <WidgetCard
      title="W-PF2 · What-If 시나리오 시뮬레이터"
      icon={AlertTriangle}
      iconColor="#f59e0b"
      pillar="S1"
      cardDesc="5대 시나리오별(기준·쿼터감축·제재강화·SST 양·동시충격) 명태 FOB/수리미 CIF/마진 영향 + 베링해 SST — 2024-08 자체추정 시나리오(동결)"
      telemetry={{ status: 'STATIC', syncDate: '2024-08 기준 시나리오' }}
      customBody={
        <>
          <div style={{ display: 'grid', gap: '6px' }}>
            {scenarios.map((s: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: i === 0 ? 'rgba(var(--w-blue-500-rgb), 0.08)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `3px solid ${s.margin_pct > 12 ? '#22c55e' : s.margin_pct > 7 ? 'var(--w-amber-500)' : 'var(--w-red-500)'}` }}>
                <div style={{ flex: 2 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>확률: {s.probability}%</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa', fontFamily: 'monospace' }}>${s.pollock_fob}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>명태 FOB</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--w-violet-500)', fontFamily: 'monospace' }}>${s.surimi_cif}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>수리미 CIF</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: s.margin_pct > 12 ? '#22c55e' : s.margin_pct > 7 ? 'var(--w-amber-500)' : 'var(--w-red-500)', fontFamily: 'monospace' }}>{s.margin_pct}%</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>마진</div>
                </div>
              </div>
            ))}
          </div>
          {sst && (
            <div style={{ marginTop: '12px', background: 'rgba(var(--w-red-500-rgb), 0.06)', borderRadius: '8px', padding: '10px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Thermometer size={20} color="#ef4444" />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>베링해 SST: {sst.current_sst?.anomaly_c > 0 ? '+' : ''}{sst.current_sst?.anomaly_c}°C ({sst.current_sst?.status})</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>{sst.forecast}</div>
              </div>
            </div>
          )}
        </>
      }
      takeaway={{
        situation: '기준 시나리오(45% 확률) 마진 12.5%. 쿼터 감축 시 마진 8.2%로 급락. 러시아 제재 강화 시 5.8%까지 하락 리스크.',
        actionPlan: '쿼터 감축·제재 강화 동시 발생(15%) 시 대체 어종 블렌딩 + 미국 MSC 전환 즉시 실행.',
        source: '(기준 2024-08 자체추정) 전망모형 · 미국해양대기청(NOAA) SST 데이터',
      }}
    />
  );
}

export default PollockPriceForecastChart;
