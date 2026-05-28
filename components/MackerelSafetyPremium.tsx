'use client';
import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ShieldCheck } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';
import rawData from '../data/mackerel_safety_premium.json';

export default function MackerelSafetyPremium() {
  const data = rawData as any[];

  const ChartObj = (
    <div style={{ height: '250px', width: '100%' }}>
      <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 25, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
        <YAxis type="category" dataKey="region" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }} />
        <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
        <Bar dataKey="before" name="안전 사태 이전 ($ Index)" fill={A11Y_PALETTE[7]} radius={[0,4,4,0]} barSize={14} fillOpacity={0.5} />
        <Bar dataKey="after" name="안전 사태 이후 ($ Index)" fill="url(#a11y-stripe-h)" radius={[0,4,4,0]} barSize={14}>
          {data.map((entry: any, index: number) => {
            const color = entry.region.includes('한국') ? A11Y_PALETTE[0] : entry.region === '일본산' ? A11Y_PALETTE[5] : A11Y_PALETTE[7];
            return <Cell key={`cell-${index}`} fill={color} stroke={color} />;
          })}
        </Bar>
      </BarChart>
    </div>
  );

  return (
    <WidgetCard
      title="후쿠시마 지정학적 안전 프리미엄"
      icon={ShieldCheck}
      iconColor="#38bdf8"
      pillar="S4"
      cardDesc="KCS 관세청 + KATI 아프리카 시장 보고서 — 후쿠시마 등 대외 안전 악재 이전/이후 아프리카 훈제 시장 내 한국산 원물 판가 프리미엄 비교"
      telemetry={{ status: 'STATIC', syncDate: 'KCS 2023-Q4 + KATI 2024' }}
      customBody={ChartObj}
      takeaway={{
        situation: `<div>
<p>"Safety Premium(안전 프리미엄)"이란 지정학·안전 악재로 경쟁 원산지가 기피되며 대체 원산지에 부여되는 무형의 단가 프리미엄. 후쿠시마 오염수 방류 이슈는 일본산 펠라직 어종에 영구적 신뢰 손상 부과.</p>
<p>실측: <strong>아프리카 훈제 시장에서 한국산 원물 볼륨 +38% 팽창 — 일본산 기피로 인한 구조적 반사이익(Windfall). Clean-label 브랜드 구축의 일회성 골든 윈도우 개방</strong>. 단, 무역풍은 영구적이지 않음 — 신뢰는 빠르게 굳어야.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 후쿠시마 반사이익은 일회성 tailwind가 아닌 <strong>"30년 brand moat을 1회 capex로 구축할 골든 윈도우"</strong>.</p>
<p><strong>3단계</strong>: ① 선적 100% 제3자 국가공인 방사능 검사 + QR 트래킹 패키징 의무화 ② "Korea Clean Fish" 브랜드 인증 출시 — 아프리카 5개국 B2B 우선 침투 ③ 일본산 신뢰 회복 전 5년 내 아프리카 시장 점유율 30% 고착 — 진입장벽 영구화.</p>
</div>`,
        source: "FAOSTAT 무역 데이터 · 자체 아프리카 시장 분석 (2023-Q4)",
      }}
    />
  );
}
