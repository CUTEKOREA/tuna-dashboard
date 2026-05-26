'use client';
import React, { useState } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';
import WidgetCard from './WidgetCard';
import supplyData from '../data/squid_korea_supply.json';

const data = supplyData.filter((d: any) => d.year <= 2023);
const latest = data[data.length - 1];
const peak = data.reduce((a: any, b: any) => a.production_t > b.production_t ? a : b);

const SupplyTooltip = ({ active, payload, viewMode }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{
      background: 'rgba(0, 15, 30, 0.95)', border: '1px solid rgba(239, 68, 68, 0.4)',
      padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', minWidth: '220px',
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

export default function SquidKoreaSupply() {
  const [viewMode, setViewMode] = useState<'supply' | 'cost'>('supply');

  const body = (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setViewMode('supply')}
            style={{
              padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
              background: viewMode === 'supply' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)',
              color: viewMode === 'supply' ? '#60a5fa' : 'rgba(255,255,255,0.5)',
            }}
          >
            <TrendingDown size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} /> 자급률
          </button>
          <button
            onClick={() => setViewMode('cost')}
            style={{
              padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
              background: viewMode === 'cost' ? 'rgba(167, 139, 250, 0.3)' : 'rgba(255,255,255,0.05)',
              color: viewMode === 'cost' ? '#a78bfa' : 'rgba(255,255,255,0.5)',
            }}
          >
            <DollarSign size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} /> 수입비용
          </button>
        </div>
      </div>

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

      <div style={{ width: '100%', height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'supply' ? (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 20 }}>
              <defs>
                <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" stroke="rgba(251, 191, 36, 0.5)" tick={{ fill: '#fbbf24', fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip content={<SupplyTooltip viewMode={viewMode} />} />
              <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="production_t" name="🏭 국내 생산 (톤)" stroke="var(--color-info)" fill="url(#prodGrad)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="import_volume_t" name="📦 수입량 (톤)" stroke="var(--color-danger)" fill="url(#impGrad)" strokeWidth={2.5} />
              <Line type="monotone" dataKey="processed_t" name="🔪 가공 수요 (톤)" stroke="#ec4899" strokeWidth={3} dot={false} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="self_sufficiency_pct" name="📊 자급률 (%)" stroke="#fbbf24" strokeWidth={2} strokeDasharray="3 3" dot={false} yAxisId="right" />
            </AreaChart>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 20 }}>
              <defs>
                <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" stroke="rgba(167, 139, 250, 0.5)" tick={{ fill: '#a78bfa', fontSize: 11 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip content={<SupplyTooltip viewMode={viewMode} />} />
              <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="import_value_usd_k" name="💰 수입액 (USD 1000)" stroke="var(--color-warning)" fill="url(#valGrad)" strokeWidth={2} />
              <Line type="monotone" dataKey="import_cost_per_ton" name="📈 수입단가 ($/t)" stroke="#a78bfa" strokeWidth={2.5} dot={false} yAxisId="right" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="한국 오징어 수급 위기 모니터"
      icon={AlertTriangle}
      iconColor="#f87171"
      pillar="S1"
      cardDesc="국내 생산 붕괴(-79%)와 수입 의존도 급증을 자급률·수입비용 이중 관점으로 분석"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      customBody={body}
      takeaway={{
        situation: `<div>
<p>한국 오징어 자급률 붕괴의 정량 기록.</p>
<p>30년 추이: <strong>과거 20만 톤 → 2024년 1.3만 톤 (-93%) 붕괴</strong>. 공급 83.1%를 원양/수입 의존. 만성적 "금(金)징어" 소매가 +38% 폭등 고착화.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 연안 어획 회복 불가. <strong>"원양 + 수직 계열화 동시 진입"</strong>.</p>
<p><strong>3단계</strong>: ① 2025년 원양 선복량 한도 폐지 맞춰 남서대서양(FAO 41 공해상) 긴급 투입 — 어획 히스토리 선점 ② 페루 대왕오징어 현지 1차 가공(B2B 진미채) 수직 계열화 ③ 조정관세 22% 회피 — 조달 원가 원천 통제.</p>
</div>`,
        source: "FAO FishStatJ - Korea Capture + Trade Statistics (2000-2023)",
      }}
    />
  );
}
