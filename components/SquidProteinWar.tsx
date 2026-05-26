'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Skull } from 'lucide-react';
import WidgetCard from './WidgetCard';
import data from '../data/fishstatj_protein.json';

export default function SquidProteinWar() {
  return (
    <WidgetCard
      title="글로벌 단백질 체급 100% 스택 전쟁 (Protein War)"
      icon={Skull}
      iconColor="#8b5cf6"
      pillar="S4"
      cardDesc="대중적 소비재에서 '서민이 접근 불가능한 하이엔드 희소 자원'으로의 격상"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <AreaChart data={data} stackOffset="expand" margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} formatter={(val: any) => `${val}%`} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Area type="monotone" dataKey="beef" name="소고기" stackId="1" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.4} />
          <Area type="monotone" dataKey="chicken" name="닭고기" stackId="1" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.4} />
          <Area type="monotone" dataKey="salmon" name="연어 (양식 급증)" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
          <Area type="monotone" dataKey="squid" name="두족류 (자자연산 100%)" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.8} />
        </AreaChart>
      }
      takeaway={{
        situation: `<div>
<p>"단백질 전쟁(Protein War)"이란 양식·사육 vs 자연 채취 단백질의 글로벌 시장 점유 경쟁.</p>
<p>구조적 격차: <strong>수직 계열화 양식(연어)·사육 테크(가금)는 글로벌 베이스라인 장악 vs 100% 자연 채취 두족류는 생물량 fundamentals 붕괴 → 대체 불가능한 희소성 확보</strong>.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 오징어를 commodity 분류 폐기. <strong>"Veblen Good 럭셔리 단백질"</strong>로 격상.</p>
<p><strong>3단계</strong>: ① 보유 냉동 재고를 랍스터·캐비아급 초프리미엄 자산으로 장부상 재평가 ② 판가 수직 인상 ③ "Premium K-Squid" 자체 brand — 글로벌 luxury food 채널 진출.</p>
</div>`,
        source: "FAO Food Balance Sheets",
      }}
    />
  );
}
