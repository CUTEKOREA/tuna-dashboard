'use client';
import React from 'react';
import { Factory } from 'lucide-react';
import { Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import { getSquidData } from '@/lib/data/squid';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

const data = getSquidData('valueChainMargin');

export default function SquidValueChainMargin() {
  return (
    <WidgetCard
      title="페루산 가공 수직계열화 마진 추적기"
      icon={Factory}
      iconColor="#a855f7"
      pillar="S2"
      cardDesc="페루 원물 × 중국 가공 비용 × 한국 소비자가 — 대왕오징어 글로벌 아웃소싱 채산성 (업계추정 illustrative)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05' }}
      chartHeight={400}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `$${val}`} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />

          <Area type="monotone" dataKey="peru_raw" name="페루 원물 단가 ($/t)" stackId="1" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.6} />
          <Area type="monotone" dataKey="china_processing" name="중국 가공 비용 ($/t)" stackId="1" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.6} />
          <Line type="monotone" dataKey="kr_domestic" name="한국 소비자가 격차 ($/t)" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"밸류체인 마진 분석"이란 원물가·인건비·소비자가 3 변수의 동시 추적.</p>
<p>위기: <strong>중국 가공 공장 인건비 상승이 원물가 이상으로 급증 → 최종 수입 단가 밀어올림</strong>. 동시에 소비자가 상승이 매입원가 인상을 못 따라감 → <strong>국내 상사 채산성 악화</strong>.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 중국 편중 가공망 탈피. <strong>"가공 밸류체인 직접 통제"</strong>가 본질.</p>
<p><strong>3단계</strong>: ① 베트남·인도네시아 직접 가공 공장 합작 이전 ② 한국 부산 자체 가공 라인 capex 확대 ③ B2C 진미채 등 고마진 카테고리 직접 통제 — 마진 회수 가능성이 있으나 실제 효과는 공장·계약 조건에 따라 상이.</p>
</div>`,
        source: '페루 IMARPE · 중국 NBSC 인건비 통계 · 한국 KAMIS 도매단가 (업계추정 기반 illustrative 합성치)',
      }}
    />
  );
}
