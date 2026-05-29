'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CircleDollarSign } from 'lucide-react';
import WidgetCard from './WidgetCard';
import data from '../data/squid_fx_hedging.json';

export default function SquidFXHedging() {
  return (
    <WidgetCard
      title="원-달러 환율 연동 수입/원가 헷징"
      icon={CircleDollarSign}
      iconColor="#fcd34d"
      pillar="S3"
      cardDesc="강달러 국면에서 원화 결제 대금 폭증 위험성 트래킹"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chartHeight={400}
      chart={
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `₩${val}`} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `₩${(val / 10000).toFixed(0)}만`} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Line yAxisId="left" type="monotone" dataKey="exchange_rate" name="원/달러 환율" stroke="var(--color-info)" strokeWidth={2} strokeDasharray="4 4" />
          <Line yAxisId="right" type="monotone" dataKey="total_krw" name="순 체감 수입 원가 (원/톤)" stroke="#fcd34d" strokeWidth={3} dot={{ r: 4, fill: '#fcd34d' }} activeDot={{ r: 6 }} />
        </LineChart>
      }
      takeaway={{
        situation: `<div>
<p>"FX Hedging"은 환율 변동 위험을 선물환·옵션으로 미리 락업하는 instrument. 수입 무역사의 본업 P&amp;L generator.</p>
<p>현실: <strong>단순 수입 가격(USD)이 고정되더라도 USD/KRW 환율 상승분이 반영되어, 실제 원화 매입 원가가 통제 불가 수준으로 폭증</strong>. 평시 마진 8%가 환율 충격으로 -5%p 이상 일주일 만에 사라짐.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: FX hedge는 risk 관리가 아닌 <strong>"본업 P&amp;L의 핵심 generator"</strong>.</p>
<p><strong>3단계</strong>: ① 환율 1,300원 이하 국면 시 연간 쿼터 50%+ 선물환 사전 고정 ② JP Morgan FX Desk와 cross-currency swap 결합 ③ "FX hedge ratio KPI" — risk desk 매주 monitoring + CFO 직보.</p>
</div>`,
        source: "한국은행 환율 통계 & 내부 결제망",
      }}
    />
  );
}
