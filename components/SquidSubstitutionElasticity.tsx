'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { GitCompare } from 'lucide-react';
import WidgetCard from './WidgetCard';
import data from '../data/squid_substitution.json';

export default function SquidSubstitutionElasticity() {
  return (
    <WidgetCard
      title="대왕오징어 대체 탄력성 스위칭(Switch) 지표"
      icon={GitCompare}
      iconColor="#06b6d4"
      pillar="S4"
      cardDesc="가공 공장 원료 투입선 변경 타이밍 (스프레드 한계점)"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `₩${val / 1000}k`} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Line type="monotone" dataKey="sal_price" name="국내산 살오징어" stroke="var(--color-danger)" strokeWidth={3} />
          <Line type="monotone" dataKey="jumbo_price" name="수입산 대왕오징어 (냉동튜브)" stroke="#06b6d4" strokeWidth={3} />
        </LineChart>
      }
      takeaway={{
        situation: `<div>
<p>"대체 탄력성(Substitution Elasticity)"이란 한 어종 가격이 일정선 넘으면 대체재로 강제 전환되는 임계점.</p>
<p>현재 왜곡: <strong>국내산 살오징어 단가 랠리가 펀더멘털 이탈 → 남미 대왕오징어 spread KRW 7,000 한계치 돌파 — 극단적 밸류에이션 왜곡</strong>.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 스프레드 KRW 6,000 임계점은 자동 cost switching trigger.</p>
<p><strong>3단계</strong>: ① 살오징어 B2B 프로모션 전면 중단 ② 임계치 초과 즉시 가공·식자재 원료 100% 남미 대왕오징어로 강제 롤오버 ③ "Cost Switching 매뉴얼" 전 팩토리 하달.</p>
</div>`,
        source: "KMI & 무역통계",
      }}
    />
  );
}
