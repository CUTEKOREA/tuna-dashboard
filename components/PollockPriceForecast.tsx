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

  const products = [
    { key: 'frozen_whole', label: '통명태 H&G', color: '#3b82f6' },
    { key: 'surimi', label: '수리미 FA급', color: '#8b5cf6' },
    { key: 'roe', label: '명란(Roe)', color: '#f59e0b' },
  ];

  return (
    <WidgetCard
      title="W-PF1 · 명태 AI 가격 예측 엔진 (VAR 모형)"
      icon={TrendingUp}
      iconColor="#3b82f6"
      pillar="S1"
      cardDesc="5변수 VAR(러시아FOB·MGO·SST·KRW/USD·중국가동률) 기반 통명태/수리미/명란 분기별 가격 예측 (FRED Live)"
      telemetry={{ status: 'LIVE', syncDate: '/api/pollock-forecast' }}
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
                <div style={{ flex: 1, background: 'rgba(59,130,246,0.08)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>현재 가격</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#60a5fa' }}>${productData?.historical?.at(-1)?.actual?.toLocaleString() || 'N/A'}</div>
                  <div style={{ fontSize: '0.6rem', color: '#93c5fd' }}>{productData?.unit}</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(34,197,94,0.08)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>다음 Q 예측</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e' }}>${productData?.forecast?.[0]?.predicted?.toLocaleString() || 'N/A'}</div>
                  <div style={{ fontSize: '0.6rem', color: '#86efac' }}>95% CI</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(239,68,68,0.08)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>추세</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: productData?.trend === 'UPWARD' || productData?.trend === 'STRUCTURAL_UPWARD' ? '#ef4444' : '#22c55e' }}>
                    {productData?.trend === 'UPWARD' ? '▲ 상승' : productData?.trend === 'STRUCTURAL_UPWARD' ? '▲▲ 구조적 상승' : productData?.trend === 'PREMIUM_GROWTH' ? '⭐ 프리미엄' : '→ 안정'}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#fca5a5' }}>{productData?.risk_alert?.slice(0, 20)}...</div>
                </div>
              </div>
              <SafeResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="period" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.75rem' }} />
                  <Area type="monotone" dataKey="upper" stroke="transparent" fill="#3b82f622" name="상한 밴드" />
                  <Area type="monotone" dataKey="lower" stroke="transparent" fill="#1a1a2e" name="하한 밴드" />
                  <Line type="monotone" dataKey="actual" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 4 }} name="실제 가격" />
                  <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" dot={{ fill: '#f59e0b', r: 3 }} name="예측 가격" />
                </AreaChart>
              </SafeResponsiveContainer>
              <div style={{ display: 'grid', gap: '4px', marginTop: '8px' }}>
                {(productData?.forecast || []).slice(0, 3).map((f: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.68rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', width: '60px' }}>{f.period}</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b', width: '50px' }}>${f.predicted?.toLocaleString()}</span>
                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{f.driver}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      }
      takeaway={{
        situation: '통명태 FOB 상승 추세(2025Q3 $1,580 예측). 수리미는 구조적 상승(아시아 HMR 수요). 명란은 프리미엄 성장(D2C $10,800).',
        actionPlan: '통명태: A-시즌 종료 전 선제 매입. 수리미: 실꼬리돔 블렌딩 최적화. 명란: D2C 프리미엄 전환으로 마진 7배 확보.',
        source: '(기본 2024-08) 수산물 무역 단기 전망모형 · FRED API',
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
      cardDesc="5대 시나리오별(기준·쿼터감축·제재강화·SST 양·동시충격) 명태 FOB/수리미 CIF/마진 영향 + 베링해 SST"
      telemetry={{ status: 'LIVE', syncDate: '/api/pollock-forecast' }}
      customBody={
        <>
          <div style={{ display: 'grid', gap: '6px' }}>
            {scenarios.map((s: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: i === 0 ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `3px solid ${s.margin_pct > 12 ? '#22c55e' : s.margin_pct > 7 ? '#f59e0b' : '#ef4444'}` }}>
                <div style={{ flex: 2 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>확률: {s.probability}%</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa', fontFamily: 'monospace' }}>${s.pollock_fob}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>명태 FOB</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6', fontFamily: 'monospace' }}>${s.surimi_cif}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>수리미 CIF</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: s.margin_pct > 12 ? '#22c55e' : s.margin_pct > 7 ? '#f59e0b' : '#ef4444', fontFamily: 'monospace' }}>{s.margin_pct}%</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>마진</div>
                </div>
              </div>
            ))}
          </div>
          {sst && (
            <div style={{ marginTop: '12px', background: 'rgba(239,68,68,0.06)', borderRadius: '8px', padding: '10px', display: 'flex', gap: '12px', alignItems: 'center' }}>
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
        source: '(기본 2024-08) 전망모형 · NOAA SST 데이터',
      }}
    />
  );
}

export default PollockPriceForecastChart;
