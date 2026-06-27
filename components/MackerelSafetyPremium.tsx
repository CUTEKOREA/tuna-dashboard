'use client';
import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ShieldCheck } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';
import rawData from '../data/mackerel_safety_premium.json';
import SafeResponsiveContainer from './SafeResponsiveContainer';

export default function MackerelSafetyPremium() {
  const data = rawData as any[];

  const ChartObj = (
    <div style={{ height: '250px', width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 25, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(140,170,255,0.10)" />
        <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
        <YAxis type="category" dataKey="region" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }} />
        <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)', border: '1px solid rgba(255,255,255,0.2)' }} cursor={{fill: 'rgba(140,170,255,0.10)'}} />
        <Bar dataKey="before" name="안전 사태 이전 (판가 인덱스)" fill={A11Y_PALETTE[7]} radius={[0,4,4,0]} barSize={14} fillOpacity={0.5} />
        <Bar dataKey="after" name="안전 사태 이후 (판가 인덱스)" fill="url(#a11y-stripe-h)" radius={[0,4,4,0]} barSize={14}>
          {data.map((entry: any, index: number) => {
            const color = entry.region.includes('한국') ? A11Y_PALETTE[0] : entry.region === '일본산' ? A11Y_PALETTE[5] : A11Y_PALETTE[7];
            return <Cell key={`cell-${index}`} fill={color} stroke={color} />;
          })}
        </Bar>
      </BarChart>
      </SafeResponsiveContainer>
    </div>
  );

  return (
    <WidgetCard
      title="후쿠시마 지정학적 안전 프리미엄"
      icon={ShieldCheck}
      iconColor="#38bdf8"
      pillar="S4"
      cardDesc="KCS 관세청·KATI 아프리카 시장 보고서 참고, 자체 추정(illustrative) — 후쿠시마 등 대외 안전 악재 이전/이후 아프리카 훈제 시장 내 산지별 판가 인덱스 비교"
      telemetry={{ status: 'STATIC', syncDate: 'KCS 2023-Q4 + KATI 2024' }}
      customBody={ChartObj}
      takeaway={{
        situation: `<div>
<p>"안전 프리미엄"이란 지정학·안전 악재로 경쟁 원산지가 기피되며 대체 원산지에 부여되는 무형의 단가 프리미엄. 후쿠시마 오염수 방류 이슈는 일본산 펠라직 어종에 상당한 신뢰 손상을 부과한 것으로 추정.</p>
<p>추정 인덱스: <strong>아프리카 훈제 시장에서 한국산(가나 향) 판가 인덱스 105→145 상승, 일본산은 98→65로 하락 — 일본산 기피에 따른 반사 수혜 가능성. 클린 라벨 브랜드 구축의 단기 기회로 분석되나, 추세의 지속성은 미확인.</strong></p>
</div>`,
        actionPlan: `<div>
<p><strong>전략 방향</strong>: 후쿠시마 반사 수혜는 시장 상황에 따라 축소될 수 있는 단기 기회이므로, 이 시기를 활용한 <strong>중장기 브랜드 신뢰도 투자</strong>가 핵심.</p>
<p><strong>3단계 제안</strong>: ① 선적 100% 제3자 국가공인 방사능 검사 + 추적 패키징 의무화 ② "한국 청정 수산" 브랜드 인증 검토 — 아프리카 5개국 기업 간 거래 우선 침투 ③ 일본산 신뢰 회복 전 아프리카 시장 거점 조기 확보 — 진입 우위 강화.</p>
</div>`,
        source: "KATI 아프리카 시장 보고서 · 업계 추정 (2023-Q4, illustrative 인덱스)",
      }}
    />
  );
}
