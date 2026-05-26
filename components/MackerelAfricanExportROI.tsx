'use client';
import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Target } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/mackerel_african_export_roi.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function MackerelAfricanExportROI() {
  const data = rawData as any[];

  const ChartObj = (
    <div style={{ height: '250px', width: '100%' }}>
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="m" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
        <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`$${v}`} tick={{ fill: 'var(--color-danger)', fontSize: 10 }} />
        <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`${v}%`} tick={{ fill: 'var(--color-success)', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)' }} />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        <Area yAxisId="left" type="monotone" dataKey="freightRate" name="해운 운임 (SCFI)" fill="var(--color-danger)" opacity={0.15} stroke="none" />
        <Line yAxisId="right" type="step" dataKey="margin" name="가나 수출 ROI" stroke="var(--color-success)" strokeWidth={3} />
      </ComposedChart>
    </div>
  );

  return (
    <WidgetCard
      title="가나 수출 수익률 기반 AI 운송 판별기"
      icon={Target}
      iconColor="#ef4444"
      pillar="S3"
      cardDesc="상해컨테이너운임지수(SCFI) 변동을 변수로 한 서아프리카(가나) 냉동고등어 20ft 컨테이너당 수출 실 마진율 시뮬레이션입니다."
      telemetry={{ status: 'STATIC', syncDate: '2024-03' }}
      customBody={ChartObj}
      takeaway={{
        situation: `<div>
<p>"SCFI(Shanghai Containerized Freight Index)"란 상해→글로벌 컨테이너 해상 운임 변동 벤치마크. 가나/서아프리카 라인은 hub-and-spoke가 아닌 long-leg single line이라 SCFI 변동에 마진이 1:1 종속.</p>
<p>실측: <strong>SCFI 임계치 돌파 시 가나 수출 OPM 즉시 적자 전환 — 원물 cost가 아닌 운임이 마진의 결정 변수. 운임 elasticity 거의 1.0에 가까운 극단 구조</strong>. 일반 commodity 트레이딩 risk model은 적용 불가능 영역.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 운임 변동은 통제 불가 외생변수가 아닌 <strong>"룰베이스 손절 자동화로 working capital을 보존할 시스템 디자인 문제"</strong>.</p>
<p><strong>3단계</strong>: ① SCFI 내부 하한선 모델링 → 임계치 이탈 즉시 선적 force majeure급 보류 ② 보류 물량은 국내 양식장 생사료 체인으로 즉시 dump — working capital 긴급 회수 ③ 손절 rule-based switching 매뉴얼 전사 적용 + AI 자동 트리거 도입.</p>
</div>`,
        source: "상하이해운거래소 SCFI · 자체 운임-마진 elasticity 모델",
      }}
    />
  );
}
