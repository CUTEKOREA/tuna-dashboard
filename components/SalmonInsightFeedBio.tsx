import React from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import { Fish } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';
import { getSalmonData } from '@/lib/data/salmon';

const rawData = getSalmonData('feedBio');

export default function SalmonInsightFeedBio() {
  return (
    <WidgetCard
      title="[원물] 사료 원가 리스크 헷징: 대체 단백질 & FIFO (Fish In-Fish Out)"
      icon={Fish}
      iconColor="var(--color-info)"
      pillar="S1"
      cardDesc="해양 원료(어분/어유) 의존도 감소 및 미세조류/가금류 등 대체 사료 도입을 통한 원가율 통제 (수치는 업계 추세 기반 자체 추정/시나리오 — illustrative)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chartHeight={250}
      chart={
        <ComposedChart data={rawData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="var(--w-slate-400)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="var(--w-slate-300)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-warning)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ background: '#11182f', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '0.85rem' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          
          <Bar yAxisId="left" dataKey="marine" name="해양 원료 비중(%)" stackId="a" fill={A11Y_PALETTE[0]} radius={[0, 0, 4, 4]} />
          <Bar yAxisId="left" dataKey="alt" name="대체 사료 비중(%)" stackId="a" fill={A11Y_PALETTE[2]} radius={[4, 4, 0, 0]} />

          <Bar yAxisId="right" dataKey="fifo" name="FIFO (의존도 비율)" fill={A11Y_PALETTE[1]} barSize={3} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"FIFO(Fish In, Fish Out)"는 양식 1kg 생산에 필요한 자연산 어분 kg. 양식 연어의 가장 큰 sustainability 변수.</p>
<p>현실: <strong>사료 매입원가 50~55% 차지 + 해수온 상승·엘니뇨로 남미(페루) 어분 가격 극심한 변동성</strong>. 글로벌 leader 대체 단백질 가속화.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 어분 의존은 climate beta 100% 노출. <strong>"Alternative protein portfolio"</strong>가 본질.</p>
<p><strong>3단계</strong>: ① MOWI 모델 차용 — 가금류 부산물·곤충 단백질·미세조류 도입 ② 차트상 FIFO 0.77 수준의 의존도 유지·추가 하향 목표 ③ Alternative protein 스타트업 minority equity 인수 — Innovafeed·Protix 등 곤충단백질 + BioMar IP partnership.</p>
</div>`,
        source: "자체 추정/시나리오 (MOWI·BioMar 공개 보고서의 대체 단백질 전환 방향을 참고한 illustrative 시계열 — 개별 수치는 1차 출처 미추적)"
      }}
    />
  );
}
