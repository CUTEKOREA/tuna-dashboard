'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { Target } from 'lucide-react';
import WidgetCard from './WidgetCard';
import data from '../data/squid_quota_exhaustion.json';

export default function SquidQuotaExhaustion() {
  return (
    <WidgetCard
      title="어획 쿼터(ITQ) 실시간 소진율 마일스톤"
      icon={Target}
      iconColor="#ef4444"
      pillar="S1"
      cardDesc="포클랜드 어업국 ITQ 소진율 월별 집계 기반 추정 / 업계 선단 보고 참고"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chartHeight={400}
      chart={
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Area type="monotone" dataKey="exhausted" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.5} name="누적 쿼터 소진율(%)" />
          <ReferenceLine y={80} stroke="var(--color-warning)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '수급 임계 경보선 (80%)', fill: 'var(--color-warning)', fontSize: 10 }} />
        </AreaChart>
      }
      takeaway={{
        situation: `<div>
<p>"쿼터 조기 고갈(Quota Depletion)"이란 ITQ 어획 한도가 시즌 중반에 100% 소진되어 어업 강제 셧다운되는 현상.</p>
<p>관측 패턴: <strong>남반구 핵심 조업국 ITQ 5~6월 조기 고갈 → 셧다운 → 글로벌 시세 급등 공백 국면 반복 관측</strong>.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 쿼터 80% 임계점은 약 1개월 후 시세 급등 가능성의 선행 경보 지표(업계 추정).</p>
<p><strong>3단계</strong>: ① 타국 선단 쿼터 소진율 정기 모니터링 ② 80% 돌파 즉시 남미·대만 제3국 잔여 해상 선적 물량 선도 매입 검토 ③ 시세 상승 시 마진 회수 — 단, 수익폭은 시장 상황에 따라 유동.</p>
</div>`,
        source: "포클랜드 어업국 보고 기반 / 업계 추정 (illustrative)",
      }}
    />
  );
}
