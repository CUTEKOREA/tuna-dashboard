'use client';
import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CalendarRange } from 'lucide-react';
import WidgetCard from './WidgetCard';
import data from '../data/squid_inventory_release.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function SquidInventoryRelease() {
  return (
    <WidgetCard
      title="명절 및 성수기 재고 출회 윈도우(Window)"
      icon={CalendarRange}
      iconColor="#10b981"
      pillar="S2"
      cardDesc="최적의 고점 방출 시기 매핑"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `₩${val / 1000}k`} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `${val}%`} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Bar yAxisId="right" dataKey="release_target" name="당사 재고 출하 목표비율(%)" fill="rgba(16, 185, 129, 0.4)" barSize={40} />
          <Line yAxisId="left" type="monotone" dataKey="wholesale" name="시장 평균 도매가 (원)" stroke="var(--color-warning)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"계절성 아비트라지(Seasonality Arbitrage)"란 매년 동일한 시점에 반복되는 가격 패턴을 활용한 systematic trading.</p>
<p>한국 오징어 패턴: <strong>설 명절 직전 1차 피크 아웃 → 금어기로 W36(추석 2주 전) 연중 최고 마진 스프레드</strong>. 5년간 동일 패턴 검증.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 계절성은 predictable arbitrage opportunity.</p>
<p><strong>3단계</strong>: ① W36 윈도우 타겟 선제 재고 비축(Hoarding) ② 1~2주 스윙 윈도우 내 보유 물량 40%+ 고가 일괄 매도 ③ "Seasonal arbitrage trading desk" — ML 모델 backtest sharpe 2.0+ 검증.</p>
</div>`,
        source: "최근 5년 KMI 통합 시계열",
      }}
    />
  );
}
