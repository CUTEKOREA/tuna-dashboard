'use client';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DollarSign, ArrowRight } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

/**
 * 명태 착지원가 실시간 시뮬레이터
 * API: /api/pollock-landed-cost
 */

export function PollockLandedCostWaterfall() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState<string>('route_russia_direct');

  useEffect(() => {
    fetch('/api/pollock-landed-cost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(r => r.json()).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  const routes = [
    { key: 'route_russia_direct', label: '🇷🇺 러시아 직수입', color: '#ef4444' },
    { key: 'route_china_relay', label: '🇨🇳 중국 가공 우회', color: '#f59e0b' },
    { key: 'route_us_msc', label: '🇺🇸 알래스카 MSC', color: '#3b82f6' },
  ];

  const routeData = data?.[activeRoute];
  const waterfall = routeData?.waterfall || [];
  const chartData = waterfall.map((w: any) => ({
    name: w.component.split('(')[0].trim().slice(0, 6),
    cost: w.krw_kg,
    pct: w.pct,
  }));

  return (
    <WidgetCard
      title="W-LC1 · 명태 착지원가 워터폴 분석"
      icon={DollarSign}
      iconColor="#22c55e"
      pillar="S3"
      cardDesc="러시아 직수입 / 중국 우회 / 미국 MSC 3개 경로의 FOB→착지원가 워터폴 + 환율 민감도 시뮬레이션 (국정연 2건·업계추정, FRED 환율 선택적)"
      telemetry={{ status: data ? 'SYNCED' : 'STATIC', syncDate: '자체추정 · FRED 환율(키 설정 시)' }}
      customBody={
        <>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {routes.map(r => (
              <button key={r.key} onClick={() => setActiveRoute(r.key)}
                style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 600,
                  background: activeRoute === r.key ? `${r.color}22` : 'rgba(255,255,255,0.03)',
                  color: activeRoute === r.key ? r.color : 'var(--text-secondary)',
                  outline: activeRoute === r.key ? `1px solid ${r.color}44` : 'none' }}>
                {r.label}
              </button>
            ))}
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>비용 데이터 로드 중...</div> : (
            <>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div style={{ flex: 1, background: 'rgba(34,197,94,0.08)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>총 착지원가</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#22c55e' }}>₩{routeData?.total_krw_kg?.toLocaleString()}</div>
                  <div style={{ fontSize: '0.6rem', color: '#86efac' }}>per kg</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(59,130,246,0.08)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>FOB 원물</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#60a5fa' }}>${routeData?.fob_usd_mt?.toLocaleString()}</div>
                  <div style={{ fontSize: '0.6rem', color: '#93c5fd' }}>/MT</div>
                </div>
                <div style={{ flex: 1, background: routeData?.margin_vs_domestic > 10 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>국산 대비 마진</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: routeData?.margin_vs_domestic > 10 ? '#22c55e' : '#ef4444' }}>{routeData?.margin_vs_domestic}%</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{routeData?.advantage?.slice(0, 15)}</div>
                </div>
              </div>
              <SafeResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} unit="₩" />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.75rem' }} formatter={(v: any) => `₩${v}/kg`} />
                  <Bar dataKey="cost" fill={routes.find(r => r.key === activeRoute)?.color || '#22c55e'} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                </BarChart>
              </SafeResponsiveContainer>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                {(routeData?.risk_factors || []).map((rf: string, i: number) => (
                  <div key={i} style={{ padding: '3px 8px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', fontSize: '0.6rem', color: '#fca5a5' }}>⚠️ {rf}</div>
                ))}
              </div>
            </>
          )}
        </>
      }
      takeaway={{
        situation: '러시아 직수입(₩2,883/kg) 최저가. 중국 우회(₩3,851) +33.6% 프리미엄. 미국 MSC(₩4,582) 최고가이나 관세 0%.',
        actionPlan: '매입원가 최우선: 러시아 직수입. ESG/감사 최우선: 미국 MSC. 경로 갭 15% 미만 시 자동 스위칭 Alert.',
        source: '(일반 2024-06) 신통상규범 · (기본 2025-10) 물가안정화 · FRED 환율(선택적)',
      }}
    />
  );
}

export function PollockRouteComparison() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/pollock-landed-cost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const comparison = data?.route_comparison || [];
  const fxData = data?.fx_sensitivity?.scenarios || [];

  return (
    <WidgetCard
      title="W-LC2 · 조달 경로 비교 + 환율 민감도"
      icon={ArrowRight}
      iconColor="#8b5cf6"
      pillar="S3"
      cardDesc="러시아·중국·미국 경로별 착지원가/마진/리스크/ESG 점수 비교 + FRED 환율 시나리오별 ₩/kg 변동 (업계추정, FRED 환율 선택적)"
      telemetry={{ status: data ? 'SYNCED' : 'STATIC', syncDate: '자체추정 · FRED 환율(키 설정 시)' }}
      customBody={
        <>
          <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
            <table style={{ width: '100%', fontSize: '0.7rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ textAlign: 'left', padding: '6px', color: 'var(--text-secondary)' }}>경로</th>
                  <th style={{ textAlign: 'right', padding: '6px', color: 'var(--text-secondary)' }}>착지원가</th>
                  <th style={{ textAlign: 'right', padding: '6px', color: 'var(--text-secondary)' }}>마진</th>
                  <th style={{ textAlign: 'right', padding: '6px', color: 'var(--text-secondary)' }}>리스크</th>
                  <th style={{ textAlign: 'right', padding: '6px', color: 'var(--text-secondary)' }}>ESG</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((r: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '6px', color: 'var(--text-primary)', fontWeight: 600 }}>{r.route}</td>
                    <td style={{ padding: '6px', textAlign: 'right', fontFamily: 'monospace', color: '#22c55e' }}>₩{r.total_krw_kg?.toLocaleString()}</td>
                    <td style={{ padding: '6px', textAlign: 'right', fontFamily: 'monospace', color: r.margin_pct > 10 ? '#22c55e' : r.margin_pct > 5 ? '#f59e0b' : '#ef4444' }}>{r.margin_pct}%</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>
                      <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', background: r.risk_score > 80 ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', color: r.risk_score > 80 ? '#ef4444' : '#22c55e' }}>{r.risk_score}</span>
                    </td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>
                      <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', background: r.esg_score > 80 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: r.esg_score > 80 ? '#22c55e' : '#ef4444' }}>{r.esg_score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>📊 환율별 착지원가 변동 (₩/kg)</div>
          <SafeResponsiveContainer width="100%" height={150}>
            <BarChart data={fxData} barGap={1}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="fx" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.7rem' }} formatter={(v: any) => `₩${v}`} />
              <Bar dataKey="russia_krw" fill="#ef4444" name="러시아" radius={[3, 3, 0, 0]} fillOpacity={0.7} />
              <Bar dataKey="china_krw" fill="#f59e0b" name="중국" radius={[3, 3, 0, 0]} fillOpacity={0.7} />
              <Bar dataKey="us_krw" fill="#3b82f6" name="미국 MSC" radius={[3, 3, 0, 0]} fillOpacity={0.7} />
            </BarChart>
          </SafeResponsiveContainer>
        </>
      }
      takeaway={{
        situation: '전 환율 구간에서 러시아 직수입이 매입원가 최저. 단, 리스크(85점) + ESG(35점) 최하위.',
        actionPlan: '리스크 가중 매입원가 산정 시 미국 MSC 전환점 존재. ESG 바이어 대응 시 미국 경로 자동 전환.',
        source: '(기본 2025-10) 물가 안정화 연구 · FRED 환율(키 설정 시 실시간)',
      }}
    />
  );
}

export default PollockLandedCostWaterfall;
