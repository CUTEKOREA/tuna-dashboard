'use client';
import React from 'react';
import { Fuel } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { getSquidData } from '@/lib/data/squid';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

const data = getSquidData('fuelBep');

export default function SquidFuelBEP() {
  return (
    <WidgetCard
      title="유류비 손익분기점(BEP) 트래커"
      icon={Fuel}
      iconColor="#f59e0b"
      pillar="S2"
      cardDesc="수협 면세유 고시가 × 오징어 수협 위판 단가 — 자체추정 BEP 모델 기반 메탈할라이드/LED 집어등 임계선 추적 (illustrative)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05' }}
      chartHeight={400}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />

          <Bar yAxisId="left" dataKey="mgo_price" name="MGO 면세유 (원/L)" fill="rgba(148, 163, 184, 0.5)" barSize={20} />
          <Line yAxisId="right" type="monotone" dataKey="squid_price" name="오징어 단가 (원/kg)" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-success)' }} activeDot={{ r: 6 }} />

          <ReferenceLine yAxisId="left" y={1100} stroke="var(--color-danger)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '메탈 BEP선', fill: 'var(--color-danger)', fontSize: 10 }} />
          <ReferenceLine yAxisId="left" y={1400} stroke="var(--color-info)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'LED BEP 확장선', fill: 'var(--color-info)', fontSize: 10 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"유류 BEP(손익분기점)"란 어선 출항이 흑자가 되는 최소 어획량. 채낚기 선단(집어등)은 전기·유류비 비중이 매우 큼.</p>
<p>자체 BEP 추정 모델 기준: <strong>면세 경유가 약 1,471원/L 초과 시 메탈할라이드 노후 선단은 BEP 붕괴로 출어 포기 가능성</strong> vs <strong>고효율 LED 선단은 조업 유지 + 차별적 마진 확보 가능</strong>. 단가 결정권(pricing power) 우위.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: LED 집어등은 단순 설비가 아닌 <strong>"고유가 시점 pricing power instrument"</strong>.</p>
<p><strong>3단계</strong>: ① 채낚기 선단 인수·합작 시 "LED 집어등 100% 전환" 필수 계약 조건 명시 ② MGO 단가 자체 BEP 임계선 돌파 시 경쟁사 출항 감소 국면을 활용한 단가 협상력 강화 ③ LED 탑재 선단 비중 단계적 확대 — 업계추정 기준 원가 절감 효과 기대.</p>
</div>`,
        source: '수협 면세유 고시가 · 자체 BEP 추정 모델',
      }}
    />
  );
}
