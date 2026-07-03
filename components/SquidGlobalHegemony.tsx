'use client';
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ZAxis } from 'recharts';
import { Globe2 } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getSquidData } from '@/lib/data/squid';

const data = getSquidData('globalHegemony');

export default function SquidGlobalHegemony() {
  const chinaData = data.filter(d => d.country === '중국');
  const koreaData = data.filter(d => d.country.includes('한국'));
  const japanData = data.filter(d => d.country === '일본');

  return (
    <WidgetCard
      title="글로벌 어획 패권 이동"
      icon={Globe2}
      iconColor="#ef4444"
      pillar="S1"
      cardDesc="국가별 원양 선단 어획 비중 추이 | FAO FishStatJ (1990-2025) | STATIC"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
          <XAxis type="number" dataKey="year" name="연도" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} domain={[1988, 2025]} ticks={[1990, 2000, 2010, 2025]} />
          <YAxis type="category" dataKey="area" name="FAO 해역" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} width={120} />
          <ZAxis type="number" dataKey="catch" name="어획 비중" range={[50, 2000]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Scatter name="중국 선단" data={chinaData} fill="var(--color-danger)" fillOpacity={0.7} />
          <Scatter name="한국 선단" data={koreaData} fill="var(--color-info)" fillOpacity={0.7} />
          <Scatter name="일본 선단" data={japanData} fill="var(--color-success)" fillOpacity={0.7} />
        </ScatterChart>
      }
      takeaway={{
        situation: `<div>
<p>FAO FishStatJ 기준 글로벌 어업 산업의 국가별 어획 비중 지정학적 변화.</p>
<p>30년 추이: 1990년대 북태평양 한·일 선단 주도에서 2020년대 중국 원양 선단(국가 보조금 확대)의 비중 급증으로 구조적 전환이 진행 중. 한·일 주요 해역 어획 비중은 지속적 하락세.</p>
</div>`,
        actionPlan: `<div>
<p><strong>전략 방향</strong>: 중국 선단 밀집 해역에서의 소모적 경쟁보다, 중국 선단 진출 비중이 낮은 미개척 FAO 해역(아프리카 서안·인도양 일부)으로 선택적 전환을 검토할 필요.</p>
<p><strong>실행 고려사항</strong>: 어장 전환 시 현지 면허·쿼터 확보 선행 필수. 신규 해역 capex는 수익성 시뮬레이션 기반 단계적 집행 권장.</p>
</div>`,
        source: "FAO FishStatJ (1990-2025)",
      }}
    />
  );
}
