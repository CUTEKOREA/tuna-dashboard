'use client';
import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { PieChart } from 'lucide-react';
import WidgetCard from './WidgetCard';
import data from '../data/squid_demand_destruction.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function SquidDemandDestruction() {
  return (
    <WidgetCard
      title="거시경제 연동 수산물 대체소비(Demand Destruction) 지표"
      icon={PieChart}
      iconColor="#06b6d4"
      pillar="S4"
      cardDesc="소비자 심리 저항선 돌파 시 강성 덤핑 및 전량 가공화 모델"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `₩${val}`} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} domain={[0, 250]} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />

          <Area yAxisId="left" type="monotone" dataKey="squid_price" name="일반 오징어 소매단가" fill="rgba(6, 182, 212, 0.2)" stroke="#06b6d4" />
          <Line yAxisId="right" type="monotone" dataKey="squid_demand" name="오징어 구매 수요 지수" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 4 }} />
          <Line yAxisId="right" type="monotone" dataKey="mackerel_demand" name="대체재(고등어 등) 수요 지수" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} strokeDasharray="5 5" />
          <ReferenceLine yAxisId="left" y={10000} stroke="var(--color-warning)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '소비자 심리 저항선 (1만원)', fill: 'var(--color-warning)', fontSize: 10 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"수요 파괴(Demand Destruction)"란 가격이 심리적 저항선을 넘으면 수요 곡선이 완전히 붕괴하는 임계 현상.</p>
<p>한국 오징어 trigger: <strong>B2C 소매 판가가 KRW 10,000/마리 상향 돌파 시 수요 완전 붕괴 → 고등어·가금류로 수직 이탈(cannibalization)</strong>. 한 번 이탈하면 18~24개월 재진입 안 함.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 매입원가 무한 전가는 환상. <strong>"B2C 청산 + B2B 락인"</strong>이 본질.</p>
<p><strong>3단계</strong>: ① 소비자 가격 저항선 확인 즉시 B2C 원물 유통 포지션 전량 청산 ② 단체급식·외식 프랜차이즈 B2B 1년 장기 선물계약으로 전량 스위칭 ③ 고정 마진 락인.</p>
</div>`,
        source: "통계청 가계동향조사 및 Nielson 소매판매 데이터",
      }}
    />
  );
}
