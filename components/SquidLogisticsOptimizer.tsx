'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { Snowflake } from 'lucide-react';
import WidgetCard from './WidgetCard';
import data from '../data/squid_logistics_cost.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function SquidLogisticsOptimizer() {
  return (
    <WidgetCard
      title="콜드체인 물류·보관료 최적화 데드크로스"
      icon={Snowflake}
      iconColor="#06b6d4"
      pillar="S3"
      cardDesc="누적 보관료 vs 시세 상승분 교차 지점 (강제 출하 트리거)"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Bar dataKey="freight" stackId="a" name="해상 운임" fill="#475569" />
          <Bar dataKey="loading" stackId="a" name="상하차/동결" fill="#64748b" />
          <Bar dataKey="storage" stackId="a" name="누적 보관료" fill="var(--color-danger)" />
          <ReferenceLine y={1200} stroke="var(--color-success)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '단기 기대 시장수익(Gap)', fill: 'var(--color-success)', fontSize: 10 }} />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>"네거티브 롤일드(Negative Roll-Yield)"란 재고 보관 cost가 시세 상승률보다 큰 임계점.</p>
<p>실측: <strong>콜드체인 보관 12주(W12) 시 창고료·기회비용 누적이 단기 시세차익 기대치 완전 초과 — 데드크로스</strong>. 추가 보관할수록 손실 가속.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 투기적 재고 holding 전면 금지. <strong>"Inventory Duration Cap"</strong> 시스템 의무.</p>
<p><strong>3단계</strong>: ① 콜드체인 체류 10주(W10) 강제 청산 상한선 시스템 하드코딩 ② 11주 차 돌입 전 도매 시장 시장가 선도 덤핑 ③ "Aging dashboard" — SKU별 weekly monitoring + CFO 직보.</p>
</div>`,
        source: "국내 냉장창고 단가표 & 물류팀",
      }}
    />
  );
}
