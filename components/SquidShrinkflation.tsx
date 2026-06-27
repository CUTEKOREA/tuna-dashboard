'use client';
import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import WidgetCard from './WidgetCard';
import data from '../data/squid_shrinkflation.json';
import { ChartPatternDefs } from './ChartPatterns';

const ShrinkflationTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const catchVal = payload.find((p: any) => p.dataKey === 'catch_tonnes')?.value || 0;
  const tradeVal = payload.find((p: any) => p.dataKey === 'trade_usd_million')?.value || 0;

  return (
    <div style={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(239,68,68,0.3)', padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', minWidth: '220px' }}>
      <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '1rem', color: 'var(--color-danger)' }}>{label}년</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: '#60a5fa' }}>총 어획량 (공급)</span>
        <span style={{ fontWeight: 600 }}>{catchVal.toLocaleString()} 톤</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--color-danger)' }}>글로벌 무역액 (가치)</span>
        <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>
          ${tradeVal.toLocaleString()} 백만
        </span>
      </div>
    </div>
  );
};

export default function SquidShrinkflation() {
  return (
    <WidgetCard
      title="슈링크플레이션 — 글로벌 오징어 공급↓ vs 무역액↑"
      icon={TrendingUp}
      iconColor="#ef4444"
      pillar="S4"
      cardDesc="FAO FishStatJ 정적 데이터(illustrative) — 기후 위기·남획으로 어획량은 감소(파란 영역)하지만 단가 상승으로 글로벌 수출액(빨간 선)은 고점 수준 유지 — 프리미엄화 시그널"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={380}
      chart={
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <ChartPatternDefs />
          <defs>
            <linearGradient id="colorCatch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} minTickGap={10} />
          <YAxis yAxisId="left" stroke="rgba(59,130,246,0.3)" tick={{ fill: '#60a5fa', fontSize: 10 }} tickFormatter={v => `${(v / 10000).toFixed(0)}만`} width={45} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(239,68,68,0.3)" tick={{ fill: 'var(--color-danger)', fontSize: 10 }} tickFormatter={v => `$${v.toLocaleString()}`} width={50} />
          <Tooltip content={<ShrinkflationTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Area yAxisId="left" type="monotone" dataKey="catch_tonnes" name="글로벌 어획량 (톤)" fillOpacity={1} fill="url(#colorCatch)" stroke="var(--color-info)" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="trade_usd_million" name="무역액 (백만 USD)" stroke="var(--color-danger)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: 'var(--color-danger)', stroke: 'var(--text-primary)', strokeWidth: 2 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"슈링크플레이션(Shrinkflation)" 글로벌 거시 패턴: 생산량 감소 + 무역액 증가의 역설. (FAO FishStatJ 기반 illustrative 추정)</p>
<p>추정치: <strong>글로벌 생산량 2015 피크 대비 2023 약 -17% 감소 추세 vs 동일 기간 글로벌 수출액 $95억 내외 유지(2021 전후 최고점 추정)</strong>. 즉 단가 상승으로 총 무역액 유지 추세. 오징어가 commodity → 프리미엄 원자재로 위상 변화 가능성.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 박리다매 탈피. <strong>"Value-Adding 체제"</strong>로 전환.</p>
<p><strong>3단계</strong>: ① 소형어 → 내장·먹물 활용 소스·펫푸드 개발 ② 중대형어 → 스시·통구이 하이엔드 유통 ③ 수율(yield) 최적화 공정 도입 — 같은 원물에서 마진 개선 가능(업계 추정, illustrative).</p>
</div>`,
        source: "FAO FishStatJ 글로벌 오징어 생산·무역 (illustrative 정적 데이터)",
      }}
    />
  );
}
