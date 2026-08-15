'use client';

import React from 'react';
import { Utensils, Store } from 'lucide-react';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import WidgetCard from '../WidgetCard';

/* ── Data: 미국 스시·포케 시장규모 & 채널 ─────────────────────────────────────
   출처: GMInsights(스시급 수산물)·IBISWorld(스시레스토랑 4308/포케 6416) 무료 헤드라인
   sushi-grade 수산물 US $2.1B / 글로벌 $10.1B, 참치 42.1% 비중                  */

// 스시급 수산물 글로벌 채널 분할 ($B)
const channelData = [
  { name: '외식(푸드서비스)', value: 6.0, color: '#10b981' },
  { name: '소매·직판',       value: 4.1, color: '#38bdf8' },
];

const tooltipStyle = {
  backgroundColor: 'rgba(20, 28, 52, 0.95)', border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8, color: 'var(--w-slate-200)', fontSize: '0.78rem', padding: '8px 12px',
};

const ChannelTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const pct = Math.round((d.value / 10.1) * 100);
  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ color: 'var(--w-slate-400)' }}>글로벌 규모</span>
        <span style={{ fontWeight: 700, color: d.color }}>${d.value}B ({pct}%)</span>
      </div>
    </div>
  );
};

const kpis = [
  { label: '美 스시급 수산물', value: '$2.1B', sub: '2024 · CAGR ~5%', color: '#38bdf8' },
  { label: '글로벌 스시급', value: '$10.1B', sub: '→ $16.2B (2034)', color: '#10b981' },
  { label: '참치 비중', value: '42.1%', sub: '단일 어종 최대', color: '#f59e0b' },
];

const stores = [
  { icon: Utensils, label: '스시 레스토랑', value: '$33.2B', sub: '17,301개 점포 (+3.1%)', color: '#a78bfa' },
  { icon: Store, label: '포케 전문점', value: '$2.0B', sub: '3,108개 점포 · 점포수 CAGR 22.3%', color: '#10b981' },
];

export default function SasUsSushiPokeMarket() {
  return (
    <WidgetCard
      id="W-SAS30"
      title="미국 스시·포케 시장규모 & 채널"
      icon={Utensils}
      iconColor="#10b981"
      pillar="S4"
      cardDesc="GMInsights·IBISWorld 무료 헤드라인 — 스시급 수산물 시장·채널 분할·포케 열풍 지표"
      telemetry={{ status: 'STATIC', syncDate: '2024-25' }}
      takeaway={{
        situation: '미국 스시급 수산물 시장은 $2.1B(글로벌 $10.1B), 참치가 단일 어종 1위(42.1%)입니다. 글로벌 채널은 외식 59%($6.0B)·소매직판 41%($4.1B)로 외식 비중이 높고, 포케 전문점은 점포 수가 연 22.3%씩 폭증(3,108개)하며 가정용 DIY 포케로 소매까지 확장 중입니다.',
        actionPlan: '외식이 59%를 차지하므로 B2B 푸드서비스(스시 레스토랑·포케 체인) 공급이 1차 타겟입니다. 동시에 점포 수가 폭증하는 포케 체인에 규격화된 냉동 saku를 공급하면, 가격 협상력이 분산된 신규 점포 확장 국면을 선점할 수 있습니다.',
        source: 'GMInsights(스시급 수산물), IBISWorld 4308/6416 (무료 통계 페이지), 2024-25',
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {/* KPI 3칸 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {kpis.map((k) => (
              <div key={k.label} style={{ background: `${k.color}0f`, border: `1px solid ${k.color}33`, borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--w-slate-400)', marginBottom: '2px' }}>{k.label}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: '0.56rem', color: 'var(--w-slate-500)', marginTop: '1px' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* 채널 분할 바 */}
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--w-slate-400)', marginBottom: '6px', fontWeight: 600 }}>글로벌 스시급 채널 분할 (10억$)</div>
            <div style={{ height: '110px', width: '100%' }}>
              <SafeResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
                  <XAxis type="number" domain={[0, 7]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}B`} />
                  <YAxis type="category" dataKey="name" width={108} tick={{ fill: 'var(--w-slate-300)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChannelTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false} barSize={26}>
                    {channelData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </SafeResponsiveContainer>
            </div>
          </div>

          {/* 점포 KPI 2칸 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {stores.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: `${s.color}0d`, border: `1px solid ${s.color}2b`, borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '8px', background: `${s.color}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={s.color} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--w-slate-400)' }}>{s.label}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--w-slate-500)' }}>{s.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
    />
  );
}
