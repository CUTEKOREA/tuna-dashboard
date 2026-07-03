'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { GitCompare } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getSquidData } from '@/lib/data/squid';

const data = getSquidData('substitution');

export default function SquidSubstitutionElasticity() {
  return (
    <WidgetCard
      title="대왕오징어 대체 탄력성 전환 지표"
      icon={GitCompare}
      iconColor="#06b6d4"
      pillar="S4"
      cardDesc="가공 공장 원료 투입선 변경 타이밍 (스프레드 한계점)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `₩${val / 1000}k`} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Line type="monotone" dataKey="sal_price" name="국내산 살오징어" stroke="var(--color-danger)" strokeWidth={3} />
          <Line type="monotone" dataKey="jumbo_price" name="수입산 대왕오징어 (냉동튜브)" stroke="#06b6d4" strokeWidth={3} />
        </LineChart>
      }
      takeaway={{
        situation: `<div>
<p>"대체 탄력성(Substitution Elasticity)"이란 한 어종 가격이 일정선 넘으면 대체재로 전환 압력이 높아지는 임계점 개념.</p>
<p>국내산 살오징어 단가가 지속 상승하며 남미 대왕오징어와의 가격 스프레드가 KRW 7,000 수준에 근접 — 가공 원료 투입선 재검토 시점으로 판단(업계추정).</p>
</div>`,
        actionPlan: `<div>
<p><strong>전환 기준선 설정</strong>: 스프레드 KRW 6,000 도달 시 원료 투입선 전환 검토를 개시하는 내부 트리거로 운영 권장.</p>
<p><strong>3단계 대응</strong>: ① 살오징어 B2B 프로모션 축소 검토 ② 임계치 초과 시 가공·식자재 원료 비중을 남미 대왕오징어로 단계적 전환 ③ "원료 전환 절차" 현장 공유.</p>
</div>`,
        source: "KMI & 무역통계",
      }}
    />
  );
}
