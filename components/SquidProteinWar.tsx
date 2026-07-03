'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Skull } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getSquidData } from '@/lib/data/squid';

const data = getSquidData('proteinWar');

export default function SquidProteinWar() {
  return (
    <WidgetCard
      title="글로벌 단백질 체급 100% 점유 전쟁"
      icon={Skull}
      iconColor="#8b5cf6"
      pillar="S4"
      cardDesc="FAO FishstatJ · 식품수급표(FBS) 기준 소고기·닭고기·연어·두족류 단백질 공급량 비중, illustrative 합성 추정치"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <AreaChart data={data} stackOffset="expand" margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} formatter={(val: any) => `${val}%`} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Area type="monotone" dataKey="beef" name="소고기" stackId="1" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.4} />
          <Area type="monotone" dataKey="chicken" name="닭고기" stackId="1" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.4} />
          <Area type="monotone" dataKey="salmon" name="연어 (양식 급증)" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
          <Area type="monotone" dataKey="squid" name="두족류 (자연산 100%)" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.8} />
        </AreaChart>
      }
      takeaway={{
        situation: `<div>
<p>양식·사육 단백질(소고기·닭고기·연어)과 자연 채취 두족류의 글로벌 공급 점유율 경쟁 추이를 나타낸 illustrative 합성 추정치.</p>
<p>구조적 격차: <strong>수직 계열화 양식(연어)·사육 테크(가금)가 글로벌 베이스라인을 점진적으로 확대하는 반면, 100% 자연 채취 두족류는 자원량 변동성에 따라 점유 축소 압력을 받는 흐름이 관찰된다.</strong></p>
</div>`,
        actionPlan: `<div>
<p><strong>포지셔닝 전환</strong>: 오징어를 범용 수산물 분류에서 벗어나 자원량 제약이 있는 자연산 프리미엄 단백질로 재포지셔닝 검토.</p>
<p><strong>3단계 접근</strong>: ① 보유 냉동 재고를 희소성 기반 고부가 자산으로 평가 재검토 ② 단계적 판가 인상 가능성 점검 ③ 국내외 프리미엄 수산 채널 진출 타당성 검토(자체추정 기반, 시장 실사 선행 필요).</p>
</div>`,
        source: "FAO FishstatJ · 식품수급표(FBS), illustrative 합성 추정치",
      }}
    />
  );
}
