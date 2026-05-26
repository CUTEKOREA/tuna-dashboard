'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Route } from 'lucide-react';
import WidgetCard from './WidgetCard';
import data from '../data/squid_origin_diversification.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function SquidOriginDiversification() {
  return (
    <WidgetCard
      title="공급망 리드타임(Lead-Time) 분산 레이더"
      icon={Route}
      iconColor="#3b82f6"
      pillar="S3"
      cardDesc="해상 운송 및 통관 지연 기간에 따른 물류망 분산 타당성"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(val) => `${val}일`} />
          <YAxis type="category" dataKey="route" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} width={120} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Bar dataKey="sea_freight" stackId="a" name="해상 배송 (일)" fill="var(--color-info)" />
          <Bar dataKey="customs" stackId="a" name="통관/검역 (일)" fill="var(--color-warning)" />
          <Bar dataKey="inland" stackId="a" name="내륙 배송 (일)" fill="var(--color-danger)" />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>"원산지 다변화 리드타임"이란 페루→중국→한국 톨링 삼각무역 vs 직항의 리드타임 격차.</p>
<p>위험: <strong>페루→다롄→한국 톨링 라인 최대 80일 지연 — 공급망 마비 리스크</strong>. 수에즈·파나마 운하 병목 시 추가 +30~60일.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 톨링 의존은 dead model. <strong>"FAS 직항 hedging"</strong>이 본질.</p>
<p><strong>3단계</strong>: ① 중국 우회 라인 의존도 40% 이하 통제 ② 단가 +15% 비싸더라도 선상동결(FAS) 30일 직항 라인 우선 장기 가계약 ③ "Blackswan resilience portfolio" — 다항만·다국적 분산으로 단일 SPOF 회피.</p>
</div>`,
        source: "선사 선박스케줄 & SCM 리포트",
      }}
    />
  );
}
