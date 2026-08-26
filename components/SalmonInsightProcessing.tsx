'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Factory } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';
import { getSalmonData } from '@/lib/data/salmon';

const rawData = getSalmonData('processing');

export default function SalmonInsightProcessing() {
  return (
    <WidgetCard
      title="무인화(Lights-out) 공장 & 슈퍼 칠링"
      icon={Factory}
      iconColor="#38bdf8"
      pillar="S2"
      cardDesc="가공 자동화 효과 비교 - 수율·인건비·리콜 대응시간은 자체 추정 시나리오값(illustrative)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chartHeight={250}
      chart={
        <BarChart data={rawData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
          <XAxis type="number" stroke="var(--w-slate-400)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" stroke="var(--w-slate-300)" fontSize={11} tickLine={false} axisLine={false} width={100} />
          <Tooltip 
            contentStyle={{ background: '#11182f', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '0.85rem' }}
            cursor={{ fill: 'rgba(140,170,255,0.10)' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          <Bar dataKey="traditional" name="기존 수작업 공정" fill={A11Y_PALETTE[7]} radius={[0, 4, 4, 0]} barSize={15} fillOpacity={0.6} />
          <Bar dataKey="automated" name="자동화/GenBI 도입 공정" fill={A11Y_PALETTE[0]} radius={[0, 4, 4, 0]} barSize={15} />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>"가공 자동화"는 EU·북미 가공 허브의 lifeline. 인건비 + 규제 압박이 동시 가속.</p>
<p>현 위기: <strong>유럽·북미 가공 허브의 극심한 노동력 부족 + FDA 이력 추적 의무화 압박</strong>. 수작업 의존 vendor는 구조적 마진 방어 불가.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 가공 자동화는 단순 OPEX 절감이 아닌 <strong>"규제 compliance + 마진 방어 dual instrument"</strong>.</p>
<p><strong>3단계</strong>: ① 통합 로보틱스 라인 도입 - 인건비·수율 개선 잠재력 검토(차트는 자체 추정 시나리오) ② AI 기반 재고 이력 관리(GenBI) 신규 capex ③ 슈퍼 칠링 기술 최우선 capex - FDA 이력 추적 의무화 사전 충족.</p>
</div>`,
        source: "자체 추정 시나리오(illustrative) · 가공 자동화 효과는 BAADER/Mowi 공개 자료를 참고한 정성 가정값 (STATIC, 1차 추적 불가)"
      }}
    />
  );
}
