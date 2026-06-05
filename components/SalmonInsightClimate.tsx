'use client';

import React from 'react';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/salmonInsightClimate.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function SalmonInsightClimate() {
  return (
    <WidgetCard
      title="수온 상승의 역설 & 탄소세(Carbon Tax) 폭탄"
      icon={AlertTriangle}
      iconColor="var(--color-warning)"
      pillar="S5"
      cardDesc="성장 가속의 단기 기회와 2030년 탄소 비용 상승의 장기 리스크 (탄소세·폐사율 수치는 자체 추정 시나리오 illustrative)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chartHeight={250}
      chart={
        <ComposedChart data={rawData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="var(--color-danger)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-warning)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
          <Tooltip 
            contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '0.85rem' }}
            formatter={(value: any, name: any) => {
              if (name === 'mortality') return [`${value}%`, '고수온에 따른 해상 폐사율'];
              if (name === 'carbonTax') return [`${value} EUR/톤`, '노르웨이 탄소세 전망(자체 추정)'];
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          
          <Bar yAxisId="left" dataKey="mortality" name="고수온에 따른 해상 폐사율" fill="url(#colorMortality)" radius={[4, 4, 0, 0]} barSize={20} />
          <Line yAxisId="right" type="monotone" dataKey="carbonTax" name="노르웨이 탄소세 전망(자체 추정)" stroke="var(--color-warning)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          
          <defs>
            <linearGradient id="colorMortality" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"기후 임계점 + 탄소세 상승"은 양식 연어의 주요 중기 리스크로 평가된다.</p>
<p>본 차트는 자체 추정 시나리오로, <strong>고수온기 해상 폐사율이 2024년 16%대까지 상승한 것으로 가정</strong>하고 <strong>2030년까지 톤당 탄소세가 단계적으로 인상되는 경로</strong>를 함께 표시했다. (실측 라인아이템 아닌 파생 매핑)</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 기후+탄소세는 단순 ESG 변수가 아닌 <strong>밸류에이션(자본 조달) 결정 변수</strong>로 다룬다.</p>
<p><strong>3단계</strong>: ① 재무 모델에 "수온 리스크 프리미엄 + 잠재 탄소세 부채" 선제 반영 ② 디젤 물류망·사료 바지선 → 전동화·수소 하이브리드 교체 ③ Scope 3 원천 헷징으로 2030년 탄소세 인상 노출 완화.</p>
</div>`,
        source: "자체 추정 시나리오 (IEA NZE·GSI 파생 매핑, 1차 라인아이템 출처 아님)"
      }}
    />
  );
}
