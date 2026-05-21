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
        situation: "국내산 살오징어의 단가 랠리(Rally)가 펀더멘털을 이탈하며, 강한 대체재인 남미산 대왕오징어(Jumbo Flying Squid)와의 톤당 스프레드가 한계치(KRW 7,000 Gap)를 돌파하는 극단적 밸류에이션 왜곡(Valuation Distortion) 상태입니다.",
        actionPlan: "[Raw Material Substitution Execution] 프리미엄(살오징어) 라인업에 대한 B2B 프로모션을 전면 중단하십시오. 두 어종 간 가격 스프레드가 임계치(KRW 6,000)를 초과하는 즉시, 가공 및 식자재 투입 원료 100%를 초저가 남미산 대왕오징어로 강제 롤오버(Rollover)하는 '코스트 스위칭(Cost Switching)' 매뉴얼을 전 팩토리에 즉각 하달해야 합니다.",
        source: "KMI & 무역통계",
      }}
    />
  );
}
