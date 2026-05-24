'use client';
import React from 'react';
import { Factory } from 'lucide-react';
import { Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import data from '../data/squid_valuechain_margin.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function SquidValueChainMargin() {
  return (
    <WidgetCard
      title="페루산 가공 수직계열화 마진 추적기"
      icon={Factory}
      iconColor="#a855f7"
      pillar="S2"
      cardDesc="페루 원물 × 중국 가공 비용 × 한국 소비자가 — 대왕오징어 글로벌 아웃소싱 채산성"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
      chartHeight={400}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `$${val}`} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />

          <Area type="monotone" dataKey="peru_raw" name="페루 원물 단가 ($/t)" stackId="1" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.6} />
          <Area type="monotone" dataKey="china_processing" name="중국 가공 비용 ($/t)" stackId="1" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.6} />
          <Line type="monotone" dataKey="kr_domestic" name="한국 소비자가 격차 ($/t)" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: '한국산 오징어 고갈로 대왕오징어가 대체재로 떠올랐지만, 중국 가공 공장의 인건비 상승(파란 영역)이 원물가(노란 영역) 이상으로 급증하며 최종 수입 단가를 밀어올리고 있습니다. 최근에는 소비자가(붉은 선) 상승이 매입원가 인상을 따라가지 못해 국내 상사들의 채산성이 악화되었습니다.',
        actionPlan: '신라교역은 더 늦기 전에 중국 편중 가공망에서 탈피하여 \'베트남\' 또는 \'인도네시아\'로 직접 가공 공장 합작을 이전해야 합니다. 가공 밸류체인(Area)을 직접 통제해야만 막대한 B2C(진미채 등) 도매 마진을 지켜낼 수 있습니다.',
        source: '페루 IMARPE · 중국 NBSC 인건비 통계 · 한국 KAMIS 도매단가',
      }}
    />
  );
}
