'use client';
import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CalendarRange } from 'lucide-react';
import WidgetCard from './WidgetCard';
import data from '../data/squid_inventory_release.json';
import { ChartPatternDefs } from './ChartPatterns';

export default function SquidInventoryRelease() {
  return (
    <WidgetCard
      title="명절 및 성수기 재고 출회 윈도우(Window)"
      icon={CalendarRange}
      iconColor="#10b981"
      pillar="S2"
      cardDesc="KMI 5년 시계열 기반 명절·성수기 도매가 패턴 — 자체 추정"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
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
<p>"계절성 차익거래(Seasonality Arbitrage)"란 매년 동일한 시점에 반복되는 가격 패턴을 활용한 체계적 시세 차익 전략.</p>
<p>한국 오징어 패턴: <strong>설 명절 직전 1차 피크 아웃 → 금어기로 W36(추석 2주 전) 연중 최고 마진 스프레드</strong>. 5년간 유사 패턴 관측(KMI 시계열 기준 자체 추정).</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 계절성은 예측 가능한 차익거래 기회.</p>
<p><strong>3단계</strong>: ① W36 윈도우 타겟 선제 재고 선제 비축 ② 1~2주 스윙 윈도우 내 보유 물량 40%+ 고가 일괄 매도 ③ 계절성 차익거래 전담 운용체계 구축 — ML 모델 백테스트 샤프지수 2.0+ 수준 기대(실검증 필요).</p>
</div>`,
        source: "최근 5년 KMI 통합 시계열 (illustrative — 자체 추정치)",
      }}
    />
  );
}
