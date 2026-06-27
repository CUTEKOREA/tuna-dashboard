'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Leaf } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const data = [
  { year: '2020', edible: 75, feed: 25 },
  { year: '2021', edible: 70, feed: 30 },
  { year: '2022', edible: 62, feed: 38 },
  { year: '2023', edible: 55, feed: 45 },
  { year: '2024', edible: 48, feed: 52 },
];

export default function MackerelFeedRatio() {
  return (
    <WidgetCard
      title="물가 착시 통계 (식용 vs 생사료 교차비)"
      icon={Leaf}
      pillar="S2"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="정부 무역/어획 통계에는 모두 고등어로 집계되지만, 실제 우럭이나 광어 등 양식장 사료(비식용)로 쓰이는 미성어 비중을 자체 추정한 교차지표입니다."
      chartHeight={350}
      chart={
        <BarChart data={data} stackOffset="expand" margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis tickFormatter={(val) => `${val * 100}%`} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)', border: '1px solid rgba(255,255,255,0.2)' }} formatter={(value: any) => `${value}%`} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="edible" name="국내 식용 소비" stackId="a" fill={A11Y_PALETTE[0]} />
          <Bar dataKey="feed" name="양식장 사료/어분용" stackId="a" fill={A11Y_PALETTE[1]} />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>"식용·사료 교차비"란 동일 어종이 식탁용(B2C 식용)과 양식장 생사료(어분·어유 원료) 중 어느 비중으로 처분되는지의 분기점. 식용 비중 50% 미만 = 구조적 식량 안보 경고.</p>
<p>추정: <strong>2020년 식용 75% → 2024년 식용 48%로 데드크로스 — 정부 통계상 "총어획량 유지" 착시 속 식용 등급 물량이 27%p 감소. 잔여는 양식 사료로 전용(소형어 비중 확대 추정)</strong>. 정책 통계와 실제 식탁 공급의 괴리 가능성.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 정부 통계의 "공급 안정"은 식용 등급 원물 실수급을 반영하지 못할 수 있음. 식용 등급 원물의 공급 타이트화가 지속되면 <strong>판매자 우위 국면이 강화되어 단가 협상력 상승 가능성이 높아진다</strong>.</p>
<p><strong>3단계</strong>: ① 국내 대형 유통 3사 납품 단가 협상 시 볼륨 디스카운트 축소 협상 ② 식용 등급 원물만 분리 포장하는 "식용 등급 전용" 브랜드 포지셔닝 검토 ③ 양식장 사료 시장은 잉여 부산물 수익화 채널로 후순위 관리.</p>
</div>`,
        source: "자체 추정 (수산정보포털 + 양식협회 데이터)"
      }}
    />
  );
}
