'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { ShieldCheck } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/SalmonInsightDoubleMateriality.json';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="ds-card" style={{display: "flex", flexDirection: "column", minHeight: "80px", background: "#181818", borderRadius: "8px", boxShadow: "rgba(0,0,0,0.3) 0px 8px 8px", border: "none", padding: "1rem"}} >
        <p style={{ margin: '0 0 5px 0', fontWeight: 700, color: data.color }}>{data.name}</p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>환경·사회적 영향 (X): {data.x}</p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>재무적 영향 (Y): {data.y}</p>
      </div>
    );
  }
  return null;
};

export default function SalmonInsightDoubleMateriality() {
  return (
    <WidgetCard
      title="[ESG] 이중 중대성 평가 (Double Materiality)"
      icon={ShieldCheck}
      iconColor="var(--color-success)"
      pillar="S5"
      cardDesc="EU CSDDD/CSRD 규제 대응을 위한 환경적, 재무적 영향 동시 모니터링"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chartHeight={250}
      chart={
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" dataKey="x" name="환경/사회 영향도" domain={[0, 10]} stroke="#94a3b8" fontSize={11} 
            label={{ value: '환경·사회적 영향도 (Impact)', position: 'insideBottom', offset: -15, fill: '#94a3b8', fontSize: 10 }} />
          <YAxis type="number" dataKey="y" name="재무적 영향도" domain={[0, 10]} stroke="#94a3b8" fontSize={11}
            label={{ value: '재무적 영향도 (Financial)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
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
<p><strong>재정의</strong>: ESG 공시는 단순 규제가 아닌 <strong>"프리미엄 시장 진입 장벽(Moat) instrument"</strong>.</p>
<p><strong>3단계</strong>: ① Green Bond 자금 조달 ② 친환경 사료 개발 + 육상 양식장(RAS) 전환 capex 집중 배정 ③ 비규제 경쟁자 유럽 고급 시장 축출 — first-mover regulatory moat 락업.</p>
</div>`,
        source: "EU CSRD & TNFD Disclosure [📡 LIVE API 연동: Scope 3 배출량 및 생물다양성 실사]"
      }}
    />
  );
}