'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { ShieldCheck } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getSalmonData } from '@/lib/data/salmon';

const rawData = getSalmonData('doubleMateriality');

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="ds-card" style={{display: "flex", flexDirection: "column", minHeight: "80px", background: "#11182f", borderRadius: "8px", boxShadow: "rgba(0,0,0,0.3) 0px 8px 8px", border: "none", padding: "1rem"}} >
        <p style={{ margin: '0 0 5px 0', fontWeight: 700, color: data.color }}>{data.name}</p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--w-slate-300)' }}>환경·사회적 영향 (X): {data.x}</p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--w-slate-300)' }}>재무적 영향 (Y): {data.y}</p>
      </div>
    );
  }
  return null;
};

export default function SalmonInsightDoubleMateriality() {
  return (
    <WidgetCard
      title="[ESG] Double Materiality(이중 중대성) 평가"
      icon={ShieldCheck}
      iconColor="var(--color-success)"
      pillar="S5"
      cardDesc="EU CSRD 이중 중대성 프레임워크 기반 ESG 이슈 배치 — 좌표는 자체 추정/시나리오(illustrative), 1차 공시 수치 아님"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chartHeight={250}
      chart={
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" dataKey="x" name="환경/사회 영향도" domain={[0, 10]} stroke="var(--w-slate-400)" fontSize={11}
            label={{ value: '환경·사회적 영향도 (Impact)', position: 'insideBottom', offset: -15, fill: 'var(--w-slate-400)', fontSize: 10 }} />
          <YAxis type="number" dataKey="y" name="재무적 영향도" domain={[0, 10]} stroke="var(--w-slate-400)" fontSize={11}
            label={{ value: '재무적 영향도 (Financial)', angle: -90, position: 'insideLeft', fill: 'var(--w-slate-400)', fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} />
          <Scatter name="ESG 이슈" data={rawData}>
            {rawData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Scatter>
        </ScatterChart>
      }
      takeaway={{
        situation: `<div>
<p>"이중 중대성(Double Materiality)"이란 EU CSRD가 요구하는 재무적 + 환경적 영향 동시 공시.</p>
<p>현실: <strong>EU CSRD 발효 → 한국 수산 기업 유럽 진출 시 Scope 3(사료·물류) 탄소 배출량 + 공급망 인권 실사 결과 투명 의무 공시</strong>. 이중 중대성 압박.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: ESG 공시는 단순 규제 비용이 아닌 <strong>프리미엄 시장 진입 장벽(해자)</strong>으로 활용.</p>
<p><strong>3단계</strong>: ① 녹색채권(Green Bond) 자금 조달 ② 친환경 사료 개발 + 육상 양식장(RAS) 전환 설비투자 우선 배정 ③ 선제적 규제 대응으로 유럽 고급 시장 진입 우위 확보.</p>
</div>`,
        source: "EU CSRD·TNFD 공시 프레임워크 (이슈 배치는 자체 추정, 1차 공시 출처 아님)"
      }}
    />
  );
}
