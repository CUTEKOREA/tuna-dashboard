'use client';
import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Target } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/mackerel_african_export_roi.json';
import { ChartPatternDefs } from './ChartPatterns';
import SafeResponsiveContainer from './SafeResponsiveContainer';

export default function MackerelAfricanExportROI() {
  const data = rawData as any[];

  const ChartObj = (
    <div style={{ height: '250px', width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
        <XAxis dataKey="m" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
        <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`$${v}`} tick={{ fill: 'var(--color-danger)', fontSize: 10 }} />
        <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`${v}%`} tick={{ fill: 'var(--color-success)', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(255,255,255,0.2)' }} />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        <Area yAxisId="left" type="monotone" dataKey="freightRate" name="해운 운임 (SCFI)" fill="var(--color-danger)" opacity={0.15} stroke="none" />
        <Line yAxisId="right" type="step" dataKey="margin" name="가나 수출 ROI" stroke="var(--color-success)" strokeWidth={3} />
      </ComposedChart>
      </SafeResponsiveContainer>
    </div>
  );

  return (
    <WidgetCard
      title="가나 수출 수익률 기반 AI 운송 판별기"
      icon={Target}
      iconColor="#ef4444"
      pillar="S3"
      cardDesc="상해컨테이너운임지수(SCFI) 변동 기반 서아프리카(가나) 냉동고등어 20ft 컨테이너당 수출 마진율 시뮬레이션. 자체추정(illustrative) — SCFI 연동 마진 elasticity 추정치이며 실거래 데이터가 아닙니다."
      telemetry={{ status: 'STATIC', syncDate: '2024-03' }}
      customBody={ChartObj}
      takeaway={{
        situation: `<div>
<p>SCFI(상해컨테이너운임지수)는 상해→글로벌 컨테이너 해상 운임 변동 벤치마크. 가나/서아프리카 라인은 환적 없는 단일 직항 구조라 SCFI 변동이 마진에 직접 전가되는 경향이 있음(자체 추정 모델 기반).</p>
<p>추정: <strong>SCFI 임계치 돌파 시 가나 수출 OPM(영업이익률) 적자 전환 가능성 높음 — 원물 원가보다 운임이 마진 변동의 핵심 변수로 작용할 수 있음.</strong> 단, 본 시뮬레이션은 illustrative 추정치이며 elasticity 수치는 실거래 검증이 필요합니다.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 운임 변동은 통제 불가 외생변수가 아닌 <strong>"룰베이스 손절 자동화로 운전자본을 보존할 시스템 디자인 문제"</strong>.</p>
<p><strong>3단계 검토</strong>: ① SCFI 내부 하한선 기준 수립 → 임계치 이탈 시 선적 보류 의사결정 체계화 ② 보류 물량을 국내 생사료 체인으로 전환 — 운전자본 긴급 회수 옵션 ③ 손절 기준 매뉴얼화 + 단계적 자동화 검토. (본 시나리오는 illustrative 모델 기반 방향 제시이며, 실거래 데이터 검증 후 적용 권고.)</p>
</div>`,
        source: "상하이해운거래소 SCFI(참고) · 자체추정(illustrative) 운임-마진 elasticity 모델",
      }}
    />
  );
}
