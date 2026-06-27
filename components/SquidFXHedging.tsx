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
      cardDesc="한국은행 환율 통계 기반 | 강달러 국면 원화 매입 원가 폭증 위험 트래킹 (업계추정 포함)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chartHeight={400}
      chart={
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `₩${val}`} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `₩${(val / 10000).toFixed(0)}만`} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Line yAxisId="left" type="monotone" dataKey="exchange_rate" name="원/달러 환율" stroke="var(--color-info)" strokeWidth={2} strokeDasharray="4 4" />
          <Line yAxisId="right" type="monotone" dataKey="total_krw" name="순 체감 수입 원가 (원/톤)" stroke="#fcd34d" strokeWidth={3} dot={{ r: 4, fill: '#fcd34d' }} activeDot={{ r: 6 }} />
        </LineChart>
      }
      takeaway={{
        situation: `<div>
<p>"FX 헷징"은 환율 변동 위험을 선물환·옵션으로 미리 고정하는 수단. 수입 무역사의 본업 손익 핵심 변수.</p>
<p>현실: <strong>단순 수입 가격(USD)이 고정되더라도 USD/KRW 환율 상승분이 반영되어, 실제 원화 매입 원가가 통제 불가 수준으로 폭증</strong>. 업계 추정상 강달러 충격 시 마진이 수 %p 이상 단기간에 잠식될 수 있음.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: FX 헷징은 리스크 관리가 아닌 <strong>"본업 손익의 핵심 결정 변수"</strong>.</p>
<p><strong>3단계</strong>: ① 환율 1,300원 이하 국면 시 연간 쿼터 50%+ 선물환 사전 고정 ② 주거래 외환은행 FX 운용 데스크와 통화스왑 결합 검토 ③ "FX 헷지 비율 KPI" — 리스크 담당자 매주 모니터링 + CFO 직보.</p>
</div>`,
        source: "한국은행 환율 통계 (자체추정 포함)",
      }}
    />
  );
}
