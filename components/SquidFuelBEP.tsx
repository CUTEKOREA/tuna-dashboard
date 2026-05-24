'use client';
import React from 'react';
import { Fuel } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import data from '../data/squid_fuel_bep.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function SquidFuelBEP() {
  return (
    <WidgetCard
      title="유류비 손익분기점(BEP) 트래커"
      icon={Fuel}
      iconColor="#f59e0b"
      pillar="S2"
      cardDesc="수협 면세유 고시가 × 오징어 수협 위판 단가 — 메탈할라이드/LED 집어등 BEP 임계선 추적"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
      chartHeight={400}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />

          <Bar yAxisId="left" dataKey="mgo_price" name="MGO 면세유 (원/L)" fill="url(#a11y-stripe-h)" color="rgba(148, 163, 184, 0.5)" barSize={20} />
          <Line yAxisId="right" type="monotone" dataKey="squid_price" name="오징어 단가 (원/kg)" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-success)' }} activeDot={{ r: 6 }} />

          <ReferenceLine yAxisId="left" y={1100} stroke="var(--color-danger)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '메탈 BEP선', fill: 'var(--color-danger)', fontSize: 10 }} />
          <ReferenceLine yAxisId="left" y={1400} stroke="var(--color-info)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'LED BEP 확장선', fill: 'var(--color-info)', fontSize: 10 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: '과거 면세 경유가 리터당 1,471원을 돌파하던 시기, 메탈할라이드 등(Lamp) 노후 선단은 BEP 붕괴로 집단 출어 포기 사태를 겪었습니다. 반면 고효율 LED 선단은 조업을 유지하며 독점적 마진을 올렸습니다.',
        actionPlan: '신라교역은 채낚기 선단 인수·합작 시 \'LED 집어등 100% 전환\'을 필수 계약 조건으로 명시. MGO 단가가 1,100원을 돌파할 경우 경쟁사 선단의 출항 포기를 역이용해 단가 결정권(Pricing Power)을 확보합니다.',
        source: '수협 면세유 고시가 · 자체 BEP 추정 모델',
      }}
    />
  );
}
