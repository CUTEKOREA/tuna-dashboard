'use client';
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ZAxis } from 'recharts';
import { Globe2 } from 'lucide-react';
import WidgetCard from './WidgetCard';
import data from '../data/fishstatj_hegemony.json';

export default function SquidGlobalHegemony() {
  const chinaData = data.filter(d => d.country === '중국');
  const koreaData = data.filter(d => d.country.includes('한국'));
  const japanData = data.filter(d => d.country === '일본');

  return (
    <WidgetCard
      title="글로벌 어획 패권 블랙홀 (Hegemony Shift)"
      icon={Globe2}
      iconColor="#ef4444"
      pillar="S1"
      cardDesc="국가별 원양 선단 팽창에 따른 타 국가 조업 붕괴 현상"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" dataKey="year" name="연도" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} domain={[1988, 2027]} ticks={[1990, 2005, 2025]} />
          <YAxis type="category" dataKey="area" name="FAO 해역" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} width={120} />
          <ZAxis type="number" dataKey="catch" name="어획 비중" range={[50, 2000]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Scatter name="중국 선단" data={chinaData} fill="var(--color-danger)" fillOpacity={0.7} />
          <Scatter name="한국 선단" data={koreaData} fill="var(--color-info)" fillOpacity={0.7} />
          <Scatter name="일본 선단" data={japanData} fill="var(--color-success)" fillOpacity={0.7} />
        </ScatterChart>
      }
      takeaway={{
        situation: `<div>
<p>"패권 장악(Hegemony Shift)"이란 글로벌 어업 산업의 지정학적 권력 이동.</p>
<p>30년 변화: <strong>1990s 북태평양 한·일 선단 지배 → 2026 중국 메가 트롤러(국가 보조금) 글로벌 독식</strong>. 한·일 M/S 사실상 소멸 직전.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: Red Ocean 소모전 폐기. <strong>"Blue Ocean Pivot"</strong>이 본질.</p>
<p><strong>3단계</strong>: ① 북태평양·남서대서양 메인 어장 포기 선언 ② 중국 선단 투사율 10% 미만 아프리카 서안·인도양 미개척 FAO Area로 100% 우회 ③ "Frontier Exploration" 조업에 전사 capex 올인.</p>
</div>`,
        source: "FAO FishStatJ (1990-2025)",
      }}
    />
  );
}
