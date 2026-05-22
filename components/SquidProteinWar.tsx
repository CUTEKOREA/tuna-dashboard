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
        situation: "수직 계열화된 양식업(연어) 및 사육 테크(가금류)가 글로벌 단백질 베이스라인을 장악한 반면, 100% 자연 채취에 의존하는 두족류(Cephalopod)의 생물량 펀더멘털은 완전히 붕괴(Structural Collapse)되어 대체 불가능한 희소성을 확보했습니다.",
        actionPlan: "[Asset Class Re-rating] 오징어를 더 이상 일반 수산물(Commodity) 카테고리로 분류하지 마십시오. 극단적 희소성을 띤 'Veblen Good(과시재)' 성격의 럭셔리 단백질로 포지셔닝을 전면 수정해야 합니다. 보유 중인 냉동 재고를 랍스터, 캐비아에 준하는 초프리미엄 자산(Asset Class)으로 장부상 즉각 재평가(Revaluation)하고 판가를 수직 인상.",
        source: "FAO Food Balance Sheets",
      }}
    />
  );
}
