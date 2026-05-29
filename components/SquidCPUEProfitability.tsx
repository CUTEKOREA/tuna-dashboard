'use client';
import React from 'react';
import { Anchor } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import WidgetCard from './WidgetCard';
import data from '../data/squid_cpue_profit.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function SquidCPUEProfitability() {
  return (
    <WidgetCard
      title="실시간 조업 채산성 (CPUE) 트래커"
      icon={Anchor}
      iconColor="#10b981"
      pillar="S1"
      cardDesc="조업 운영비 대비 실시간 초과/적자 수익성"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chartHeight={400}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Bar dataKey="profit" name="마진(kg)" fill="rgba(16, 185, 129, 0.6)" />
          <Line type="monotone" dataKey="cpue" name="현장 CPUE" stroke="var(--color-info)" strokeWidth={3} dot={{ r: 4 }} />
          <ReferenceLine y={1000} stroke="var(--color-danger)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '조업 BEP', fill: 'var(--color-danger)', fontSize: 10 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"CPUE vs BEP 데드크로스"란 단위노력당어획량(CPUE) 하락 곡선이 선단 고정비 지출선(BEP)을 뚫고 내려가는 결정적 손익 변곡점.</p>
<p>현재 위기: <strong>CPUE 하락 데드크로스 빈도가 Critical Level 초과</strong>. 즉 어선이 출항할수록 손실이 확정되는 시나리오가 빈발.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 선장 직관 의존 탐색 조업 → <strong>"Automated Stop-Loss Protocol"</strong> 시스템 의무화.</p>
<p><strong>3단계</strong>: ① 일일 CPUE 3영업일 연속 BEP 하회 시 자동 조업 셧다운 ② 신규 어장 전술적 철수 명령 알고리즘 ③ JP Morgan Commodity Quant Desk와 ML 모델로 CPUE 6주 forward 예측 — 사전 routing 최적화.</p>
</div>`,
        source: "선단 조업일지",
      }}
    />
  );
}
