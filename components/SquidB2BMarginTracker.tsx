'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Store } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getSquidData } from '@/lib/data/squid';
import { ChartPatternDefs } from './ChartPatterns';

const data = getSquidData('b2bMargin');

export default function SquidB2BMarginTracker() {
  return (
    <WidgetCard
      title="B2B 직납 vs 유통 도매시장 채널수익 비교"
      icon={Store}
      iconColor="#8b5cf6"
      pillar="S4"
      cardDesc="최적의 트럭 배차 및 물량 할당 포트폴리오 산출"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis type="category" dataKey="channel" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 'bold' }} width={80} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Bar dataKey="sales_price" stackId="a" name="판매가 기준" fill="rgba(255, 255, 255, 0.1)" />
          <Bar dataKey="net_margin" name="최종 순마진" fill="#8b5cf6" barSize={30} />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>"B2B 채널 마진 비교"는 같은 원물도 어느 채널로 파느냐로 영업이익률이 결정되는 dashboard.</p>
<p>채널별 내부 추정: <strong>전통 재래 도매(경매 수수료 4% + 다단계 물류비)로 OPM 누수 -5~8%p vs 대형 마트 1차 벤더 직납은 초기 패키징 capex 부담해도 +12~18%p 프리미엄</strong>. 같은 원물도 최대 +20%p 마진 차이 가능.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 도매 vs 직납은 단순 채널이 아닌 <strong>"OPM 결정 trigger"</strong>.</p>
<p><strong>3단계</strong>: ① 전통 도매 의존도 즉시 underweight ② 이마트·코스트코·롯데마트 1차 벤더 직납 비중 확대(목표 70%+) ③ 도매 시장은 잉여 물량 유동성 관리용으로 역할 재정립.</p>
</div>`,
        source: "내부 영업 관리 시스템",
      }}
    />
  );
}
